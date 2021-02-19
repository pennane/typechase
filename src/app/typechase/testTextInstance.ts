import { getRandom } from '../services/texts'
import { TextInstance } from './types'
import { textToTextInstance } from './utils'

const testTextInstance = async (): Promise<TextInstance> => {
    const text = await getRandom()
    if (!text) throw new Error('no text fam')
    return textToTextInstance(text)
}

export default testTextInstance
