import http from 'http'
import app from './app'

if (process.env.NODE_ENV === 'production') {
    app.listen(8080, '10.114.0.2', () => {
        console.log(`Local express server running on port ${8080}`)
        console.log(`Sockets should talk on port ${8010}`)
    })
} else {
    const server = http.createServer(app)

    server.listen(80, () => {
        console.log(`Server running on port ${80}`)
        console.log(`Sockets should talk on port ${8010}`)
        if (process.env.NODE_ENV === 'development') {
            console.log(`Webpack dev server will running on port ${8080}`)
        }
    })
}
