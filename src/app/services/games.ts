import axios from 'axios'

const baseUrl = `${window.location.protocol}//${window.location.hostname}:${80}/api/game`

export const getRandomGame = async (): Promise<string> => {
    const response = await axios.get(`${baseUrl}`)
    return response.data.id
}
