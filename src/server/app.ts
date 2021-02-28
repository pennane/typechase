// Start the weboscket server
import './services/game'

import path from 'path'
import express from 'express'
import cors from 'cors'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import textRouter from './controllers/texts'
import gameRouter from './controllers/games'
import middleware from './utils/middleware'

const store = connectRedis(session)

const redisClient = redis.createClient({ host: 'redis', port: 6379 })

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
app.use('/api/game', gameRouter)
app.use(express.static('dist'))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../dist/index.html')))

export default app
