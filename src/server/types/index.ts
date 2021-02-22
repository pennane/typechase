export interface GameText {
    id: string
    content: string
    words: number
    description: string
    added: Date | number

    likes: number
    stats: {
        totalChases: number
        averageWpm: number | null
        highestWpm: number | null
    }
}

export interface Player {
    uuid: string
    wpm: null | number
    wordIndex: null | number
    finished: boolean
    disconnected: boolean
    spectator: boolean
    theme: [number, number, number]
    guest: boolean
    name: string | null
}

export type GameState = 'waiting' | 'running' | 'completed' | 'cancelled' | 'starting' | 'finishing'

export interface Game {
    id: string
    state: GameState
    players: {
        [uuid: string]: Player
    }
    textId: string
    words: number
    next: null | string
    startedAt: null | number
}

export interface TypechaseRedisState {
    games: {
        [id: string]: Game
    }
}
