import { randomFromRange } from './utils'
import { Game, Player, TypechaseRedisState } from '../types'

export const getGamePlayerAmount = (game: Game): number => {
    return Object.keys(game.players).length
}

export const isGameJoinable = (game: Game): boolean => {
    const inviableState = game.state === 'running' || game.state === 'finishing' || game.state === 'completed'
    return !inviableState
}

export const isGameCompleted = (game: Game): boolean => {
    return game.state === 'completed'
}

export const isGameStarting = (game: Game): boolean => {
    return game.state === 'starting'
}

export const isGameRunning = (game: Game): boolean => {
    return game.state === 'running' || game.state === 'finishing'
}

export const isGameInviteGame = (game: Game): boolean => {
    return !!game.invitationId
}

export const isGameRunningOrCompleted = (game: Game): boolean => {
    return isGameCompleted(game) || isGameRunning(game)
}

export const shouldGameStart = (game: Game): boolean => {
    const playerIds = getPlayerIDs(game)

    const applicableGameState = !isGameCompleted(game) && !isGameRunning(game) && !isGameStarting(game)
    return playerIds.length >= 2 && applicableGameState
}

export const createGuestPlayer = (uuid: string, name?: string, theme?: number[]): Player => {
    return {
        uuid: uuid,
        wpm: null,
        wordIndex: 0,
        finished: false,
        disconnected: false,
        spectator: false,
        theme: theme
            ? [
                  theme[0] || randomFromRange(0, 360),
                  theme[1] || randomFromRange(0, 360),
                  theme[2] || randomFromRange(0, 360)
              ]
            : [randomFromRange(0, 360), randomFromRange(0, 360), randomFromRange(0, 360)],
        guest: true,
        name: name || `Guest-${uuid.slice(0, 7)}`
    }
}

export const getGameIDS = (state: TypechaseRedisState): string[] => {
    return Object.keys(state.games)
}

export const getGames = (state: TypechaseRedisState): Game[] => {
    return Object.values(state.games)
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
