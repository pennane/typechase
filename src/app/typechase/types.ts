export interface CurrentUser {
    id: string
    username: string
    name: string
    image: string
    averageWPM: number
}

export interface Text {
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

export interface TextInstanceWord {
    word: string
    characters: TextInstanceCharacter[]
    typed: boolean
    startedAt: number | null
    finsihedAt: number | null
    wpm: number | null
    index: number
}

export enum TextInstanceCharacterState {
    UNTOUCHED = 0,
    CORRECT = 1,
    INCORRECT = 2,
    CORRECTED = 3
}

export interface TextInstanceCharacter {
    index: number
    key: string
    reached: boolean
    state: TextInstanceCharacterState
}

export interface TextInstance {
    words: TextInstanceWord[]
    currentWord: TextInstanceWord | null
    inputContent: string
    highestWpm: number | null
    averageWpm: number | null
    accuracy: number | null
}

export type GameState = 'waiting' | 'running' | 'completed' | 'cancelled' | 'starting' | 'finishing'

export interface GamePlayer {
    [x: string]: any
    uuid: string
    wpm: null | number
    wordIndex: null | number
    finished: boolean
    disconnected: boolean
    spectator: boolean
    theme: [number, number, number]
    guest: boolean
}

export interface GameInstance {
    id: string
    uuid: string
    state: GameState
    players: {
        [uuid: string]: GamePlayer
    }
    textId: string
    words: number
    spectator: boolean
    next: null | string
    startedAt: null | number
    invitationId: string | null
}
