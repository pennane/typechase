import ws from 'ws'
import Redis from 'ioredis'
import config from '../../../config/process'
import { v4 } from 'uuid'
import textService from './text'
import { randomFromArray, randomFromRange } from '../utils/index'
import { TypechaseRedisState, Player } from '../types'

const isGameCompleted = (game): boolean => {
    return game.state === 'completed'
}

const isGameStarting = (game): boolean => {
    return game.state === 'starting'
}

const isGameRunning = (game): boolean => {
    return game.state === 'running' || game.state === 'finishing'
}

const isGameRunningOrCompleted = (game): boolean => {
    return isGameCompleted(game) || isGameRunning(game)
}

const isGameRunningOrCompletedOrStarting = (game): boolean => {
    return isGameCompleted(game) || isGameRunning(game) || isGameStarting(game)
}

const shouldBeSpectator = (game): boolean => {
    return game.state === 'running' || game.state === 'finishing'
}

const state: TypechaseRedisState = {
    games: {}
}

export const findJoinableGameId = async (): Promise<string> => {
    let gameIds = Object.keys(state.games)
    if (gameIds.length === 0 || gameIds.every((id) => isGameRunningOrCompleted(state.games[id]))) {
        const newGameId = await createNewGame()
        return newGameId
    } else {
        const possibleGameIds = gameIds.filter((id) => !isGameRunningOrCompleted(state.games[id]))
        const gameId = randomFromArray(possibleGameIds)
        return gameId
    }
}

const createNewGame = async (): Promise<string> => {
    const randomText = await textService.getRandom()
    const id = v4()
    state.games[id] = {
        id: id,
        state: 'waiting',
        players: {},
        textId: randomText.id,
        words: randomText.words,
        next: null
    }
    setTimeout(() => {
        const game = state.games[id]
        if (game && Object.keys(game.players).length === 0) {
            delete state.games[id]
        }
    }, 600000)
    return id
}

const init = async () => {
    console.log('Initializing gateway')

    const wss = new ws.Server({ port: config.ports.gateway })
    const rpub = new Redis(6379, 'redis')

    setInterval(() => {
        Object.keys(state.games).forEach((gameid) => {
            const game = state.games[gameid]
            rpub.publish(
                `game-${gameid}`,
                JSON.stringify({
                    code: 'game_state',
                    payload: { players: game.players, state: game.state, next: game.next }
                })
            )
        })
    }, 400)

    wss.on('connection', (socket, req) => {
        const rsub = new Redis(6379, 'redis')

        const params = new URLSearchParams(req.url.slice(2))
        const gameId = params.get('gameid')

        const socketUUID = v4()

        const game = state.games[gameId]

        let socketAlive: boolean = true
        let pingStart: number | null = null

        if (!game) return

        const player: Player = {
            uuid: socketUUID,
            wpm: null,
            wordIndex: 0,
            finished: false,
            disconnected: false,
            spectator: shouldBeSpectator(game),
            theme: [randomFromRange(0, 360), randomFromRange(0, 360), randomFromRange(0, 360)],
            guest: true
        }

        game.players[socketUUID] = player

        const players = Object.keys(game.players)
        if (players.length >= 2 && !isGameRunningOrCompletedOrStarting(game)) {
            game.state = 'starting'
            setTimeout(() => {
                console.log(`starting game ${game.id}`)
                if (Object.keys(game.players).length >= 2) {
                    game.state = 'running'
                } else {
                    game.state = 'waiting'
                }
            }, 8000)
        }

        socket.send(
            JSON.stringify({
                code: 'game_register',
                payload: { ...game, uuid: player.uuid, spectator: player.spectator }
            })
        )

        socket.on('close', () => {
            rsub.disconnect()
            const playerIds = Object.keys(game.players)
            const noPlayers = playerIds.length === 0 ? true : playerIds.every((id) => game.players[id].disconnected)
            const runningOrCompleted = isGameRunningOrCompleted(game)
            const notWaitingOrStarting = game.state !== 'starting' && game.state !== 'waiting'
            if (game && !runningOrCompleted) {
                if (game.state === 'starting' && playerIds.length >= 2) {
                    game.state = 'waiting'
                } else if (notWaitingOrStarting && noPlayers) {
                    delete state.games[game.id]
                }
                delete game.players[socketUUID]
            } else if (game && runningOrCompleted) {
                game.players[socketUUID].disconnected = true
            }
        })

        // subscribe to game updates
        rsub.subscribe(`game-${game.id}`)
        rsub.on('message', (channel, message) => {
            socket.send(message)
        })

        socket.on('message', (message: string) => {
            if (typeof message !== 'string') return
            const { code, payload } = JSON.parse(message)

            if (!code || !payload) return

            switch (code) {
                case 'PLAYER_UPDATE': {
                    if (!isGameRunning(game)) return
                    const player = game.players[socketUUID]
                    if (player.spectator) return
                    const updatedPlayer: Player = { ...player, ...payload }

                    const cheater = !!(updatedPlayer.wordIndex > player.wordIndex + 1)
                    if (cheater) {
                        return socket.terminate()
                    }

                    if (player.wordIndex === game.words - 1 && updatedPlayer.wordIndex === null) {
                        game.state = 'finishing'
                        game.players[socketUUID].finished = true

                        const playerIds = Object.keys(game.players)
                        if (
                            playerIds.every((id) => {
                                let finished = game.players[id].finished
                                console.log('finished:', finished)
                                return finished
                            })
                        ) {
                            createNewGame().then((nextId) => {
                                game.state = 'completed'
                                game.next = nextId
                            })
                        } else {
                            setTimeout(async () => {
                                if (game.state !== 'finishing') return
                                const nextGame = await createNewGame()
                                game.state = 'completed'
                                game.next = nextGame
                                setTimeout(() => {
                                    delete state.games[game.id]
                                }, 20000)
                            }, 15000)
                        }
                    }

                    game.players[socketUUID] = updatedPlayer

                    // console.log(
                    //     'user',
                    //     socketUUID.slice(0, 8),
                    //     'wpm',
                    //     updatedPlayer.wpm,
                    //     'words typed',
                    //     updatedPlayer.wordIndex
                    // )
                    return
                }
                default:
                    return
            }
        })

        socket.on('pong', () => {
            socketAlive = true
            let latency = Math.ceil(Date.now() - pingStart)
            socket.send(
                JSON.stringify({
                    code: 'ping',
                    payload: {
                        ping: latency
                    }
                })
            )
        })

        setInterval(() => {
            if (!socketAlive) {
                return socket.terminate()
            }

            pingStart = Date.now()
            socket.ping()

            socketAlive = false
        }, 6000)
    })
}

export default init
