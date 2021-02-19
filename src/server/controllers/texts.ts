import { Router } from 'express'
import { getById, getRandom } from '../../app/services/texts'

const textRouter = Router()

textRouter.get('/ping', (_req, res) => {
    res.send('pong')
})

textRouter.get('/:id', async (req, res) => {
    try {
        const text = await getById(req.params.id)
        res.send(text)
    } catch (e) {
        console.error(e)
    }
})

textRouter.get('/', async (_req, res) => {
    try {
        const text = await getRandom()
        res.send(text)
    } catch (e) {
        console.error(e)
    }
})

export default textRouter
