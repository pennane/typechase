import ws from 'ws'
import Redis from 'ioredis'
import config from '../../../config/process/config'
import { v4 } from 'uuid'
import textService from '../services/text'

const init = async () => {
    console.log('Initializing gateway')

    const wss = new ws.Server({ port: config.ports.gateway })
    const rpub = new Redis(6379, 'redis')

    interface Player {
        uuid: string
        wpm: null | number
        wordIndex: null | number
        finished: boolean
    }

    interface TypechaseRedisState {
        games: {
            [id: string]: {
                id: string
                state: 'waiting' | 'running' | 'completed' | 'cancelled'
                players: {
                    [uuid: string]: Player
                }
                textId: string
                words: number
            }
        }
    }

    const randomText = await textService.getRandom()

    const state: TypechaseRedisState = {
        games: {
            ['1']: {
                id: '1',
                state: 'waiting',
                players: {},
                textId: randomText.id,
                words: randomText.words
            }
        }
    }

    setInterval(() => {
        Object.keys(state.games).forEach((gameid) => {
            const game = state.games[gameid]

            rpub.publish(
                `game-${gameid}`,
                JSON.stringify({
                    code: 'player_state',
                    payload: game.players
                })
            )
        })
    }, 400)

    wss.on('connection', (socket, req) => {
        const rsub = new Redis(6379, 'redis')

        const params = new URLSearchParams(req.url.slice(2))
        const gameId = params.get('gameid')

        const socketUUID = v4()

        const game = state.games[gameId]

        let socketAlive: boolean = true
        let pingStart: number | null = null

        if (game) {
            const player: Player = {
                uuid: socketUUID,
                wpm: null,
                wordIndex: 0,
                finished: false
            }
            game.players[socketUUID] = player

            socket.send(
                JSON.stringify({
                    code: 'game_register',
                    payload: game
                })
            )
        }

        socket.on('close', () => {
            rsub.disconnect()
            if (game) {
                delete game.players[socketUUID]
            }
        })

        // subscribe to game updates
        rsub.subscribe(`game-${game.id}`)
        rsub.on('message', (channel, message) => {
            socket.send(message)
        })

        socket.on('message', (message: string) => {
            if (typeof message !== 'string') return
            const { code, payload } = JSON.parse(message)

            if (!code || !payload) return

            switch (code) {
                case 'PLAYER_UPDATE': {
                    const player = game.players[socketUUID]
                    const updatedPlayer: Player = { ...player, ...payload }

                    const cheater = !!(updatedPlayer.wordIndex > player.wordIndex + 1)
                    if (cheater) {
                        return socket.terminate()
                    }

                    if (player.wordIndex === game.words - 1 && updatedPlayer.wordIndex === null) {
                        console.log('game finished')
                        game.state = 'completed'
                    }

                    game.players[socketUUID] = updatedPlayer

                    console.log(socketUUID, 'wpm', updatedPlayer.wpm, 'words typed', updatedPlayer.wordIndex)
                    return
                }
                default:
                    return
            }
        })

        socket.on('pong', () => {
            socketAlive = true
            let latency = Math.ceil(Date.now() - pingStart)
            socket.send(
                JSON.stringify({
                    code: 'ping',
                    payload: {
                        ping: latency
                    }
                })
            )
        })

        setInterval(() => {
            if (!socketAlive) {
                return socket.terminate()
            }

            pingStart = Date.now()
            socket.ping()

            socketAlive = false
        }, 6000)
    })
}

export default init
