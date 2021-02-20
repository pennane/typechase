import { Router } from 'express'
import { findJoinableGameId } from '../services/game'

const gameRouter = Router()

gameRouter.get('/ping', (_req, res) => {
    res.send('pong')
})

gameRouter.get('/', async (_req, res) => {
    try {
        const id = await findJoinableGameId()
        res.send({ id })
    } catch {
        res.status(400).send()
        console.error('shit went down')
    }
})

export default gameRouter
