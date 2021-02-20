import texts from '../data/parsedTexts'
import { GameText } from '../types/text'
import { randomFromArray } from '../utils'

const getById = (id: string): GameText | null => {
    const text = texts.find((gameText) => gameText.id === id)
    if (!text) return null
    return text
}

const getRandom = (): GameText => {
    const text = randomFromArray(texts)
    return text
}

export default {
    getById,
    getRandom
}
