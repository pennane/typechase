import fs from 'fs'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.development.local' })
} else if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production.local' })
}

const sslFilePaths = {
    privateKey: '/etc/letsencrypt/live/typechase.pennanen.dev/privkey.pem',
    certificate: '/etc/letsencrypt/live/typechase.pennanen.dev/cert.pem',
    ca: '/etc/letsencrypt/live/typechase.pennanen.dev/chain.pem'
}

let ssl = {
    privateKey: fs.existsSync(sslFilePaths.privateKey)
        ? fs.readFileSync('/etc/letsencrypt/live/typechase.pennanen.dev/privkey.pem', 'utf8')
        : null,
    certificate: fs.existsSync(sslFilePaths.certificate)
        ? fs.readFileSync('/etc/letsencrypt/live/typechase.pennanen.dev/cert.pem', 'utf8')
        : null,
    ca: fs.existsSync(sslFilePaths.ca)
        ? fs.readFileSync('/etc/letsencrypt/live/typechase.pennanen.dev/chain.pem', 'utf8')
        : null
}

let session = {
    secret: process.env.SESSION_SECRET
}

const config = {
    ssl,
    session
}

export default config
