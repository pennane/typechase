import http from 'http'
import app from './app'
import config from '../../config/process/config'

const server = http.createServer(app)

server.listen(config.ports.server, () => {
    console.log(`Server running on port ${config.ports.server}`)
})
