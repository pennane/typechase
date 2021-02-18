import * as Typechase from './types'

export function updateTextInstanceThroughEvent(
    event: KeyboardEvent,
    textInstance: Typechase.TextInstance
): Typechase.TextInstance | null {
    event.preventDefault()
    let { key } = event
    if (key.length > 1) return null

    let characterToUpdate = textInstance.characters[textInstance.currentIndex]
    if (key === characterToUpdate.key) {
        // console.log('yes')
        const updatedCharacter = { ...characterToUpdate, reached: true, state: 1 }
        return {
            ...textInstance,
            characters: textInstance.characters.map((c) => (c.index !== updatedCharacter.index ? c : updatedCharacter)),
            currentIndex: textInstance.currentIndex + 1
        }
    } else {
        // console.log('no')

        const updatedCharacter = { ...characterToUpdate, reached: true, state: 2 }
        return {
            ...textInstance,
            characters: textInstance.characters.map((c) => (c.index !== updatedCharacter.index ? c : updatedCharacter)),
            currentIndex: textInstance.currentIndex + 1
        }
    }
}

export function textToTextInstance(text: Typechase.Text): Typechase.TextInstance {
    let rawWords = text.content.split(' ')
    let words: Typechase.TextInstanceWord[] = rawWords.map((word, i) => {
        return {
            content: word,
            characters: rawWords[i + 1] ? word.split('').concat(' ') : word.split(''),
            typed: false,
            wpm: null
        }
    })
    let rawCharacters = text.content.split('')
    let characters: Typechase.TextInstanceCharacter[] = rawCharacters.map((c, i) => {
        return {
            index: i,
            key: c,
            reached: false,
            state: 0
        }
    })

    return {
        words,
        characters,
        currentIndex: 0
    }
}
