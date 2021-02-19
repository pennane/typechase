import { Text } from '../typechase'

import axios from 'axios'

const baseUrl = 'http://localhost:3003/api/text'

export const getById = async (id: string): Promise<Text | null> => {
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

export const getRandom = async (): Promise<Text> => {
    const response = await axios.get(`${baseUrl}`)
    return response.data
}
