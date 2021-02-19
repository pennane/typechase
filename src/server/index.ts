import express from 'express'
import cors from 'cors'
import textRouter from './controllers/texts'
import http from 'http'

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(cors())
app.use('/api/text', textRouter)

server.listen(3003, () => {
    console.log(`Server running on port ${3003}`)
})
