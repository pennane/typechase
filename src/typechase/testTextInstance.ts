import { getById } from '../services/texts'
import { TextInstance, TextInstanceCharacter, TextInstanceWord } from './types'
import { textToTextInstance } from './utils'

const testTextInstance = (): TextInstance => {
    const text = getById('1')
    if (!text) throw new Error('no text fam')
    return textToTextInstance(text)
}

export default testTextInstance
