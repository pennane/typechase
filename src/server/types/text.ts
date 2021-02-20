export interface GameText {
    id: string
    content: string
    words: number
    description: string
    added: Date | number

    likes: number
    stats: {
        totalChases: number
        averageWpm: number | null
        highestWpm: number | null
    }
}
