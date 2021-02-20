import http from 'http'
import app from './app'
import config from '../../config/process'

const server = http.createServer(app)

server.listen(config.ports.server, () => {
    console.log(`Server running on port ${config.ports.server}`)
})
