import * as Typechase from './types'

export function randomFromRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function mapCharacterToFalsy(s: Typechase.TextInstanceCharacter): Typechase.TextInstanceCharacter {
    if (s.reached || s.state !== 0) {
        return { ...s, state: 2 }
    } else {
        return s
    }
}

function mapCharacterToTruthy(s: Typechase.TextInstanceCharacter): Typechase.TextInstanceCharacter {
    if (s.state === 2 || s.state === 3) {
        return { ...s, state: 3, reached: true }
    } else {
        return { ...s, state: 1, reached: true }
    }
}

function calculateWpm(started: number | null, ended: number | null, characters: number): number | null {
    if (!started || !ended || !characters) return null
    const takenTimeInMinutes = (ended - started) * 0.0000166666
    const words = characters / 5
    const wpm = Math.round(words / takenTimeInMinutes)
    return wpm
}

function calculateWpmForWord(word: Typechase.TextInstanceWord): number | null {
    return calculateWpm(word.startedAt, word.finsihedAt, word.characters.length)
}

function calculateAverageWpmForWords(words: Typechase.TextInstanceWord[]): number | null {
    const characters = words.reduce((p, word) => {
        return p + word.characters.length
    }, 0)
    const startedAt = words[0].startedAt
    const finishedAt = words[words.length - 1].finsihedAt
    return calculateWpm(startedAt, finishedAt, characters)
}

function calculateAccuracyForWords(words: Typechase.TextInstanceWord[]): number | null {
    const characters = words.flatMap((word) => word.characters)
    const missed = characters.reduce((previous, c) => (c.state === 3 ? previous + 1 : previous), 0)
    return (characters.length - missed) / characters.length
}

export function matchInputToWord(input: string, word: Typechase.TextInstanceWord): Typechase.TextInstanceWord {
    let typed = true
    let startedAt
    let finishedAt

    if (!word.startedAt) {
        startedAt = Date.now()
    }

    const matched = word.characters.map((c, i) => {
        let updated
        if (input.charAt(i) === c.key) {
            updated = mapCharacterToTruthy(c)
        } else if (input.charAt(i)) {
            updated = mapCharacterToFalsy({ ...c, reached: true })
            typed = false
        } else {
            updated = mapCharacterToFalsy({ ...c, reached: false })
            typed = false
        }
        return updated
    })

    if (typed) {
        finishedAt = Date.now()
    }

    return {
        ...word,
        characters: matched,
        typed,
        startedAt: startedAt || word.startedAt,
        finsihedAt: finishedAt || word.finsihedAt
    }
}

export function updateTextInstanceThroughEvent(
    textInstance: Typechase.TextInstance,
    gameInstance: Typechase.GameInstance
): Typechase.TextInstance | null {
    if (textInstance.words[0].startedAt !== gameInstance.startedAt) {
        textInstance.words[0].startedAt = gameInstance.startedAt
    }
    let currentWord = matchInputToWord(textInstance.inputContent, textInstance.currentWord)
    let accuracy
    let highestWpm
    let averageWpm

    if (currentWord.typed) {
        currentWord = {
            ...currentWord,
            wpm: calculateWpmForWord(currentWord)
        }
        const completedWords = [...textInstance.words.slice(0, currentWord.index), currentWord]
        accuracy = calculateAccuracyForWords(completedWords)
        averageWpm = calculateAverageWpmForWords(completedWords)
    }

    return {
        ...textInstance,
        words: textInstance.words.map((word) => (word.index !== textInstance.currentWord.index ? word : currentWord)),
        currentWord: currentWord.typed ? textInstance.words[currentWord.index + 1] || null : currentWord,
        inputContent: currentWord.typed ? '' : textInstance.inputContent.slice(0, currentWord.characters.length),
        accuracy: accuracy || textInstance.accuracy,
        highestWpm: highestWpm || textInstance.highestWpm,
        averageWpm: averageWpm || textInstance.averageWpm
    }
}

export function textToTextInstance(text: Typechase.Text): Typechase.TextInstance {
    let rawWords = text.content.split(' ')
    let words: Typechase.TextInstanceWord[] = rawWords.map((word, i) => {
        let rawCharacters = rawWords[i + 1] ? word.split('').concat(' ') : word.split('')
        let characters: Typechase.TextInstanceCharacter[] = rawCharacters.map((c, i) => {
            return {
                index: i,
                key: c,
                reached: false,
                state: 0
            }
        })
        return {
            index: i,
            word: word,
            characters: characters,
            typed: false,
            startedAt: null,
            finsihedAt: null,
            wpm: null
        }
    })
    let rawCharacters = text.content.split('')

    return {
        words,
        currentWord: words[0],
        inputContent: '',
        accuracy: null,
        highestWpm: null,
        averageWpm: null
    }
}
