export interface GameText {
    id: string
    content: string
    description: string
    added: Date | number
    likes: number
    stats: {
        totalChases: number
        averageWpm: number | null
        highestWpm: number | null
    }
}
