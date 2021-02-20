import gateway from './gateway/index'

import express from 'express'
import cors from 'cors'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import textRouter from './controllers/texts'
import middleware from './utils/middleware'

const store = connectRedis(session)

const redisClient = redis.createClient({ host: 'redis', port: 6379 })

gateway()

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(
    session({
        store: new store({ client: redisClient }),
        secret: 'aterrifyinglyspookysecret',
        resave: false,
        saveUninitialized: true
    })
)
app.use('/api/text', textRouter)
app.use(middleware.unknownEndpoint)

export default app
