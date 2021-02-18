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
    characters: string[]
    typed: boolean
    wpm: number | null
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
    characters: TextInstanceCharacter[]
    currentIndex: number
}

export interface GameUser {
    id: string
    username: string
    name: string
    currentWpm: number | null
    currentIndex: number | null
}

export enum GameType {
    Practice = 0,
    Chase = 1
}

export interface Game {
    type: GameType
    text: Text
    textInstance: TextInstance
    users: GameUser[]
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
