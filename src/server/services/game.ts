import ws from 'ws'
import Redis from 'ioredis'
import config from '../../../config/process'
import { v4 } from 'uuid'
import textService from './text'
import { randomFromArray } from '../utils/utils'
import { TypechaseRedisState, Player, Game } from '../types'
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
import { GameState } from 'src/app/typechase'

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

    const game: Game = {
        id: id,
        state: 'waiting',
        textId: randomText.id,
        words: randomText.words,
        next: null,
        startedAt: null,
        players: {}
    }

    state.games[id] = game

    setTimeout(() => {
        const game = state.games[id]
        if (game && Object.keys(game.players).length === 0) {
            delete state.games[id]
        }
    }, 600000)

    return id
}

const wss = new ws.Server({ port: config.ports.gateway })
const rpub = new Redis(6379, 'redis')

const publishGameChange = (gameId: string, code: string, payload: any): void => {
    rpub.publish(
        `game-${gameId}`,
        JSON.stringify({
            code,
            payload
        })
    )
}

const setGameState = (game: Game, gameState: GameState): void => {
    game.state = gameState
    publishGameChange(game.id, 'game_state', { state: gameState })
}

const setNextGame = (game: Game, nextGameId: string): void => {
    game.next = nextGameId
    publishGameChange(game.id, 'next_game', { next: nextGameId })
}

const setStarted = (game: Game, startedAt: number): void => {
    game.startedAt = startedAt
    publishGameChange(game.id, 'game_started', { startedAt: startedAt })
}

// Game checks for updates 2,5 times per second and publishes them
setInterval(() => {
    const gameIds = getGameIDS(state)
    gameIds.forEach((id) => {
        const game = state.games[id]
        publishGameChange(id, 'players_state', { players: game.players, state: game.state })
    })
}, 400)

// Websocket server on a new connection
wss.on('connection', (socket, req) => {
    const params = new URLSearchParams(req.url.slice(2))
    const gameId = params.get('gameid')
    const predefinedName = params.get('name')
    console.log(predefinedName)
    const socketUUID = v4()
    const game = state.games[gameId]

    if (!game) return //socket.terminate()

    const rsub = new Redis(6379, 'redis')

    let socketAlive: boolean = true
    let pingStart: number | null = null

    const player: Player = createNewGuestPlayer(socketUUID, predefinedName)
    player.spectator = !isGameJoinable(game)
    game.players[socketUUID] = player

    if (shouldGameStart(game)) {
        setGameState(game, 'starting')
        setTimeout(() => {
            // Check that players have not left in the starting face
            if (getPlayerIDs(game).length < 2 && game.state === 'starting') {
                setGameState(game, 'waiting')
                return
            }

            setGameState(game, 'running')
            if (!game.startedAt) {
                setStarted(game, Date.now())
            }
        }, 8000)
    }

    socket.on('message', (message: string) => {
        // if invalid message type
        if (typeof message !== 'string') return
        const { code, payload } = JSON.parse(message)
        // if invalid message content
        if (!code || !payload) return

        switch (code) {
            case 'set_name': {
                console.log('in set name')
                const newName = payload.name
                if (!newName || typeof newName !== 'string' || newName.length > 20) return
                console.log('valid, setting')
                game.players[socketUUID].name = newName
                return
            }
            case 'player_update': {
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
                    setGameState(game, 'finishing')
                }

                if (allPlayersFinished(game)) {
                    createNewGame().then((nextId) => {
                        setGameState(game, 'completed')
                        game.next = nextId
                        setTimeout(() => {
                            delete state.games[game.id]
                        }, 20000)
                    })
                } else {
                    setTimeout(async () => {
                        if (game.state === 'completed') return

                        const nextGame = await createNewGame()
                        setGameState(game, 'completed')
                        setNextGame(game, nextGame)
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
            setGameState(game, 'waiting')
        }

        delete game.players[socketUUID]

        const noPlayers = hasNoPlayers(game)

        if (notWaitingOrStarting && noPlayers) {
            delete state.games[game.id]
        }
    })

    // Sending the player a package containing game related user information
    socket.send(
        JSON.stringify({
            code: 'game_register',
            payload: { ...game, uuid: player.uuid, spectator: player.spectator }
        })
    )

    // subscribe to game updates
    rsub.subscribe(`game-${game.id}`)
    rsub.on('message', (_channel, message) => {
        socket.send(message)
    })
})
