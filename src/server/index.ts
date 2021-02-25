import http from 'http'
import https from 'https'
import app from './app'
import config from '../../config/process'

if (process.env.NODE_ENV === 'development') {
    const server: http.Server = http.createServer(app)

    server.listen(80, () => {
        console.log(`Developing server running on port ${80}`)
        console.log(`Sockets should talk on port ${8000}`)
        if (process.env.NODE_ENV === 'development') {
            console.log(`Webpack dev server will be running on port ${8080}`)
        }
    })
} else {
    const credentials = {
        key: config.ssl.privateKey,
        cert: config.ssl.certificate,
        ca: config.ssl.ca
    }

    const server: https.Server = https.createServer(credentials, app)

    server.listen(443, () => {
        console.log('HTTPS Server running on port 443')
    })

    http.createServer((req, res) => {
        res.writeHead(301, { Location: 'https://' + req.headers['host'] + req.url })
        res.end()
    }).listen(80)
}
