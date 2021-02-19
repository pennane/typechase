import { Router } from 'express'
import textService from '../services/text'

const textRouter = Router()

textRouter.get('/ping', (_req, res) => {
    res.send('pong')
})

textRouter.get('/:id', async (req, res) => {
    try {
        const text = await textService.getById(req.params.id)
        res.send(text)
    } catch {
        res.status(400).send()
        console.error('shit went down')
    }
})

textRouter.get('/', async (_req, res) => {
    try {
        const text = await textService.getRandom()
        res.send(text)
    } catch {
        res.status(400).send()
        console.error('shit went down')
    }
})

export default textRouter
