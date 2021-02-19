import { getRandom } from '../services/texts'
import { TextInstance } from './types'
import { textToTextInstance } from './utils'

const testTextInstance = (): TextInstance => {
    const text = getRandom()
    if (!text) throw new Error('no text fam')
    return textToTextInstance(text)
}

export default testTextInstance
