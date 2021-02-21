import ws from 'ws'
import Redis from 'ioredis'
import config from '../../../config/process'
import { v4 } from 'uuid'
import textService from './text'
import { randomFromArray } from '../utils/utils'
import { TypechaseRedisState, Player } from '../types'
import {
    isGameRunningOrCompleted,
    getGameIDS,
    createNewGuestPlayer,
    isGameJoinable,
    shouldGameStart,
    getPlayerIDs,
    isGameRunning,
    allPlayersFinished,
    hasNoPlayers
} from '../utils/gameserviceutils'

const state: TypechaseRedisState = {
    games: {}
}

export const findJoinableGameId = async (): Promise<string> => {
    let gameIds = getGameIDS(state)
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
    const wss = new ws.Server({ port: config.ports.gateway })
    const rpub = new Redis(6379, 'redis')

    // Game checks for updates 2,5 times per second
    setInterval(() => {
        const gameIds = getGameIDS(state)
        gameIds.forEach((id) => {
            const game = state.games[id]
            rpub.publish(
                `game-${id}`,
                JSON.stringify({
                    code: 'game_state',
                    payload: { players: game.players, state: game.state, next: game.next }
                })
            )
        })
    }, 400)

    // Websocket server on a new connection
    wss.on('connection', (socket, req) => {
        const params = new URLSearchParams(req.url.slice(2))
        const gameId = params.get('gameid')
        const socketUUID = v4()
        const game = state.games[gameId]

        if (!game) return socket.terminate()

        const rsub = new Redis(6379, 'redis')

        let socketAlive: boolean = true
        let pingStart: number | null = null

        const player: Player = createNewGuestPlayer(socketUUID)
        player.spectator = !isGameJoinable(game)
        game.players[socketUUID] = player

        // Sending the player a package containing game related user information
        socket.send(
            JSON.stringify({
                code: 'game_register',
                payload: { ...game, uuid: player.uuid, spectator: player.spectator }
            })
        )

        if (shouldGameStart(game)) {
            game.state = 'starting'
            setTimeout(() => {
                // Check that players have not left in the starting face
                if (getPlayerIDs(game).length < 2) {
                    game.state = 'waiting'
                    return
                }

                console.log(`starting game ${game.id}`)
                game.state = 'running'
            }, 8000)
        }

        socket.on('message', (message: string) => {
            // if invalid message type
            if (typeof message !== 'string') return
            const { code, payload } = JSON.parse(message)
            // if invalid message content
            if (!code || !payload) return

            switch (code) {
                case 'PLAYER_UPDATE': {
                    if (!isGameRunning(game)) return

                    const player = game.players[socketUUID]

                    if (player.spectator) return

                    // This is what will be uploaded to redis, modify this instead of 'player'
                    const playerUpdate: Player = { ...player, ...payload }

                    game.players[socketUUID] = playerUpdate

                    // TODO: I do not want to depend on the old state of the player
                    const playerFinished = player.wordIndex === game.words - 1 && playerUpdate.wordIndex === null

                    if (!playerFinished) return

                    game.players[socketUUID].finished = true

                    if (game.state !== 'finishing') {
                        game.state = 'finishing'
                    }

                    if (allPlayersFinished(game)) {
                        createNewGame().then((nextId) => {
                            game.state = 'completed'
                            game.next = nextId
                            setTimeout(() => {
                                delete state.games[game.id]
                            }, 20000)
                        })
                    } else {
                        setTimeout(async () => {
                            if (game.state === 'completed') return

                            const nextGame = await createNewGame()
                            game.state = 'completed'
                            game.next = nextGame
                            setTimeout(() => {
                                delete state.games[game.id]
                            }, 8000)
                        }, 15000)
                    }

                    return
                }
                default:
                    return
            }
        })

        // Handle pinging from the socket
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

        // Terminate socket if ping is more than six seconds
        setInterval(() => {
            if (!socketAlive) {
                return socket.terminate()
            }

            pingStart = Date.now()
            socket.ping()

            socketAlive = false
        }, 6000)

        socket.on('close', () => {
            rsub.disconnect()
            if (!game) return

            const runningOrCompleted = isGameRunningOrCompleted(game)

            if (runningOrCompleted) {
                return (game.players[socketUUID].disconnected = true)
            }

            const notWaitingOrStarting = game.state !== 'starting' && game.state !== 'waiting'
            const playerIds = getPlayerIDs(game)

            if (game.state === 'starting' && playerIds.length < 2) {
                game.state = 'waiting'
            }

            delete game.players[socketUUID]

            const noPlayers = hasNoPlayers(game)

            if (notWaitingOrStarting && noPlayers) {
                delete state.games[game.id]
            }
        })

        // subscribe to game updates
        rsub.subscribe(`game-${game.id}`)
        rsub.on('message', (_channel, message) => {
            socket.send(message)
        })
    })
}

export default init
