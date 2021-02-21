import processConfig from '../../../config/process'

const GATEWAY_URL = `ws://${window.location.hostname}:${processConfig.publicPorts.gateway}`

class Gateway {
    connected: boolean
    restartAuto: boolean
    callback: any
    connection: WebSocket
    gameId: string

    constructor() {
        this.connected = false
        this.restartAuto = true
        this.gameId = null
    }

    setGameId(gameId: string) {
        this.gameId = gameId
    }

    start() {
        if (!this.gameId) throw new Error('Trying to start the gateway without provided game id')
        this.connection = new WebSocket(encodeURI(`${GATEWAY_URL}?gameid=${this.gameId}`))

        this.connection.onopen = this.onOpen.bind(this)
        this.connection.onmessage = this.onMessage.bind(this)
        this.connection.onclose = this.onClose.bind(this)
        this.connection.onerror = this.onError.bind(this)
    }

    stop() {
        this.restartAuto = false
        this.connection.close()
    }

    onOpen() {
        this.connected = true

        console.log('gateway ready')
    }

    onMessage(message) {
        this.callback(message.data)
    }

    onClose() {
        this.connected = false

        console.log('gateway closed')

        if (!this.restartAuto) {
            this.restartAuto = true
            return
        }

        setTimeout(() => {
            console.log('gateway reconnecting')
            this.start()
        }, 3000)
    }

    onError(error) {
        throw new Error(error)
    }

    send(data: { code: string; payload: any }) {
        if (!this.connected) {
            return
        }
        console.log('gateway sending data...')
        this.connection.send(JSON.stringify(data))
    }

    feed(callback) {
        this.callback = callback
    }
}

const gateway = new Gateway()

export const getGateway = (gameId) => {
    gateway.setGameId(gameId)
    return gateway
}
