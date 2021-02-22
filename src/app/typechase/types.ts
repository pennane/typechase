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
}

/*
FRONT-END

TYPECHASE
    CURRENT-USER
        ID
            STRING
        USERNAME
            STRING
        NAME
            STRING
        IMAGE
            IMAGE
        STATS
            AVERAGE WPM
                NUMBER    
    TEXT[]
        TEXT-CONTENT
            STRING VAI PARSITTU KOKONAISUUS ???
        DESCRIPTION
            STRING
        DATE-ADDED
            DATE
        LIKES
            NUMBER
        STATS
            TOTAL
                NUMBER
            AVERAGE WPM
                NUMBER
            HIGHEST WPM
                NUMBER
        ID
            STRING

    GAMES / ROOMS[]
        GAME
            TYPE 
                STRING
            TEXT
                TEXT
            TEXT-INSTANCE
                WORD[]
                    CHARACTERS
                    TYPED
                        BOOLEAN
                    WPM
                        NUMBER
                CHARACTER[]
                    INDEX
                    CHARACTER
                        STRING
                    REACHED
                    STATE
                        UNTOUCHED = 0
                        CORRECT = 1
                        INCORRECT = 2
                        CORRECTED = 3
                CURRENT-INDEX
                USER[]
                    CURRENT-WPM
                    CURRENT-INDEX
                    ?DISTANCE
                    NAME




BACKEND
WHAT DOES SERVER HAVE AS DYNAMIC OBJECTS


GAMES
    GAME
        ID
            STRING
        TEXT
            TEXT
        USER[]
            ID
            NAME
            CURRENT-WPM
            CURRENT-INDEX
USERS[]
    USER
        ID
            STRING
        USERNAME
            STRING
        NAME
            STRING
        PASSWORDHASH
            STRING
        DATE-CREATED
            DATE
        IMAGE
            IMAGE
        STATS
            WINS
            TOTAL
                NUMBER
            AVERAGE WPM
                NUMBER
            TOTAL-AVERAGE WPM
                NUMBER
            HIGHEST WPM
                NUMBER
        CHASE[]
            POSTION
            DATE
            WPM
            ACCURACY

TEXT[]
    TEXT
*/
