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
    getGames,
    createGuestPlayer,
    isGameJoinable,
    shouldGameStart,
    getPlayerIDs,
    isGameRunning,
    allPlayersFinished,
    hasNoPlayers,
    isGameInviteGame,
    getGamePlayerAmount
} from '../utils/gameserviceutils'
import { GameState } from 'src/app/typechase'

const state: TypechaseRedisState = {
    games: {},
    invitationIDs: []
}

export const findJoinableGameId = async (): Promise<string> => {
    const games = getGames(state)

    const joinableGames = games.filter(
        (game) => !isGameInviteGame(game) && getGamePlayerAmount(game) < 6 && !isGameRunningOrCompleted(game)
    )

    if (joinableGames.length > 0) {
        const game: Game = randomFromArray(joinableGames)
        return game.id
    } else {
        const newGameId = await getNewGameId()
        return newGameId
    }
}

export const findGameIdForInvitationId = async (invitationId: string): Promise<string> => {
    if (!state.invitationIDs.includes(invitationId)) return null
    const games = getGames(state)
    const game = games.find((game) => game.invitationId === invitationId)
    return game ? game.id : await getNewGameId(invitationId)
}

export const getNewInviteOnlyGameId = async (): Promise<string> => {
    const invitationId = v4()
    const gameId = await getNewGameId(invitationId)
    state.invitationIDs.push(invitationId)
    return gameId
}

const finishGame = async (game: Game) => {
    setGameState(game, 'completed')
    let nextGameId
    if (game.invitationId) {
        const invitationId = game.invitationId
        game.invitationId = null
        nextGameId = await findGameIdForInvitationId(invitationId)
    } else {
        nextGameId = await getNewGameId()
    }

    setNextGame(game, nextGameId)
    setTimeout(() => {
        delete state.games[game.id]
    }, 8000)
}

const getNewGameId = async (invitationId?: string): Promise<string> => {
    const randomText = await textService.getRandom()
    const id = v4()

    const game: Game = {
        id: id,
        state: 'waiting',
        textId: randomText.id,
        words: randomText.words,
        next: null,
        startedAt: null,
        players: {},
        invitationId: invitationId || null
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
    const rawPredefinedTheme = params.get('theme')
    let predefinedTheme
    rawPredefinedTheme ? (predefinedTheme = rawPredefinedTheme.split(',').map((v) => Number(v))) : null
    const socketUUID = v4()
    const game = state.games[gameId]

    if (!game) return //socket.terminate()

    const rsub = new Redis(6379, 'redis')

    let socketAlive: boolean = true
    let pingStart: number | null = null

    const player: Player = createGuestPlayer(socketUUID, predefinedName, predefinedTheme)
    player.spectator = !isGameJoinable(game)

    if (!player.spectator) {
        game.players[socketUUID] = player
    }

    if (shouldGameStart(game)) {
        setGameState(game, 'starting')
        setTimeout(() => {
            let playerIDs = getPlayerIDs(game)

            // Check that players have not left in the starting face
            const hasPossibleRejectState = game.state === 'starting' || game.state === 'waiting'
            if (playerIDs.length < 2 && hasPossibleRejectState) {
                setGameState(game, 'waiting')
                return
            }

            setGameState(game, 'running')
            if (!game.startedAt) {
                setStarted(game, Date.now())
            }
        }, 10000)
    }

    socket.on('message', (message: string) => {
        // if invalid message type
        if (typeof message !== 'string') return
        const { code, payload } = JSON.parse(message)
        // if invalid message content
        if (!code || !payload) return

        switch (code) {
            case 'set_name': {
                const newName = payload.name
                if (!newName || typeof newName !== 'string' || newName.length > 20) return
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
                    if (game.state === 'completed') return
                    finishGame(game)
                } else {
                    setTimeout(async () => {
                        if (game.state === 'completed') return
                        finishGame(game)
                    }, 20000)
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
        if (!game || !game.players[socketUUID]) return
        const runningOrCompleted = isGameRunningOrCompleted(game)
        const notWaitingOrStarting = game.state !== 'starting' && game.state !== 'waiting'

        if (runningOrCompleted) {
            game.players[socketUUID].disconnected = true
        } else {
            delete game.players[socketUUID]
        }

        const playerIds = getPlayerIDs(game)

        if (notWaitingOrStarting && hasNoPlayers(game)) {
            finishGame(game)
        } else if (game.state === 'starting' && playerIds.length < 2) {
            setGameState(game, 'waiting')
        }
    })

    // Sending the player a package containing game related user information
    socket.send(
        JSON.stringify({
            code: 'game_register',
            payload: { ...game, uuid: player.uuid, name: player.name, spectator: player.spectator, theme: player.theme }
        })
    )

    // subscribe to game updates
    rsub.subscribe(`game-${game.id}`)
    rsub.on('message', (_channel, message) => {
        socket.send(message)
    })
})
