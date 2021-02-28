import { Router } from 'express'
import { findGameIdForInvitationId, findJoinableGameId, getNewInviteOnlyGameId } from '../services/game'

const gameRouter = Router()

gameRouter.get('/ping', (_req, res) => {
    res.send('pong')
})

gameRouter.get('/', async (_req, res) => {
    try {
        const id = await findJoinableGameId()
        if (!id) throw new Error('Failed to create new invitation only game')
        res.send({ id })
    } catch (e) {
        res.status(500).send()
        console.error('shit went down', e)
    }
})

gameRouter.get('/invitation/:invitationId', async (req, res) => {
    try {
        const id = await findGameIdForInvitationId(req.params.invitationId)
        if (!id) return res.status(404).send()
        res.send({ id })
    } catch (e) {
        res.status(500).send()
        console.error('shit went down', e)
    }
})

gameRouter.get('/invitation', async (req, res) => {
    try {
        const id = await getNewInviteOnlyGameId()
        if (!id) throw new Error('Failed to create new invitation only game')

        res.send({ id })
    } catch (e) {
        res.status(500).send()
        console.error('shit went down', e)
    }
})

export default gameRouter
