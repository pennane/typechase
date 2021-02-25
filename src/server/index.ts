import http from 'http'
import app from './app'
import config from '../../config/process'

const server = http.createServer(app)

server.listen(config.ports.server, () => {
    console.log(`Server running on port ${config.ports.server}`)
    console.log(`Sockets should talk on port ${config.ports.gateway}`)
    if (process.env.NODE_ENV === 'development') {
        console.log(`Webpack dev server will running on port ${config.ports.app}`)
    }
})
