import fs from 'fs'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.development.local' })
} else if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production.local' })
}

const sslFilePaths = {
    privateKey: '/letsencrypt/privkey.pem',
    certificate: '/letsencrypt/cert.pem',
    ca: '/letsencrypt/chain.pem'
}

let ssl = {
    privateKey: fs.existsSync(sslFilePaths.privateKey) ? fs.readFileSync(sslFilePaths.privateKey, 'utf8') : null,
    certificate: fs.existsSync(sslFilePaths.certificate) ? fs.readFileSync(sslFilePaths.certificate, 'utf8') : null,
    ca: fs.existsSync(sslFilePaths.ca) ? fs.readFileSync(sslFilePaths.ca, 'utf8') : null
}
Object.keys(ssl).forEach((val) => {
    console.log(val, ssl[val])
})

let session = {
    secret: process.env.SESSION_SECRET
}

const config = {
    ssl,
    session
}

export default config
