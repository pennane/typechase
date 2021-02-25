import axios from 'axios'
import processConfig from '../../../config/process'

const baseUrl = `${window.location.protocol}//${window.location.hostname}:${processConfig.ports.server}/api/game`

export const getRandomGame = async (): Promise<string> => {
    const response = await axios.get(`${baseUrl}`)
    return response.data.id
}
