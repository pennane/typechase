import { randomFromRange } from './utils'
import { Game, Player, TypechaseRedisState } from '../types'

export const isGameJoinable = (game: Game): boolean => {
    const inviableState = game.state === 'running' || game.state === 'finishing' || game.state === 'completed'
    return !inviableState
}

export const isGameCompleted = (game): boolean => {
    return game.state === 'completed'
}

export const isGameStarting = (game): boolean => {
    return game.state === 'starting'
}

export const isGameRunning = (game): boolean => {
    return game.state === 'running' || game.state === 'finishing'
}

export const isGameRunningOrCompleted = (game): boolean => {
    return isGameCompleted(game) || isGameRunning(game)
}

export const shouldGameStart = (game): boolean => {
    const playerIds = getPlayerIDs(game)

    const applicableGameState = !isGameCompleted(game) && !isGameRunning(game) && !isGameStarting(game)
    return playerIds.length >= 2 && applicableGameState
}

export const createNewGuestPlayer = (uuid): Player => {
    return {
        uuid: uuid,
        wpm: null,
        wordIndex: 0,
        finished: false,
        disconnected: false,
        spectator: false,
        theme: [randomFromRange(0, 360), randomFromRange(0, 360), randomFromRange(0, 360)],
        guest: true
    }
}

export const getGameIDS = (state: TypechaseRedisState): string[] => {
    return Object.keys(state.games)
}

export const getPlayerIDs = (game: Game): string[] => {
    return Object.keys(game.players)
}

export const hasNoPlayers = (game: Game): boolean => {
    const playerIds = getPlayerIDs(game)
    return playerIds.length === 0 ? true : playerIds.every((id) => game.players[id].disconnected)
}

export const allPlayersFinished = (game: Game): boolean => {
    const playerIds = getPlayerIDs(game)
    return playerIds.every((id) => game.players[id].finished)
}
