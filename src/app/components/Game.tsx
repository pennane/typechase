import React, { useEffect, useState } from 'react'
import { getById } from '../services/texts'
import { GameInstance, getGateway, TextInstance, textToTextInstance } from '../typechase'
import { updateTextInstanceThroughEvent } from '../typechase'
import GameText from './GameText'
import GameTextInput from './GameTextInput'
import GamePlayers from './GamePlayers'

const Game = () => {
    const gateway = getGateway('1')
    let [textInstance, setTextInstance]: [TextInstance | null, any] = useState(null)
    let [gameInstance, setGameInstance]: [GameInstance | null, any] = useState(null)
    let [ping, setPing] = useState(null)

    useEffect(() => {
        gateway.start()

        return () => {
            console.log('stopping')
            gateway.stop()
        }
    }, [])

    useEffect(() => {
        processFeed()
    }, [gameInstance])

    const updateGameInstance = (payload) => {
        setGameInstance((oldInstance) => ({ ...oldInstance, ...payload }))
    }

    const processFeed = () => {
        gateway.feed((msg) => {
            let data = JSON.parse(msg)
            let { code, payload } = data
            switch (code) {
                case 'game_register':
                    console.log('register')
                    getById(payload.textId).then((text) => {
                        setTextInstance(textToTextInstance(text))
                        const newGameInstance = { ...gameInstance, ...payload }
                        updateGameInstance(newGameInstance)
                    })

                    break
                case 'ping':
                    setPing(payload.ping)
                    break
                case 'player_state':
                    const updated = { ...gameInstance, players: payload }
                    updateGameInstance(updated)
                    break
                default:
                    break
            }
        })
    }

    if (!textInstance || !gameInstance) return null

    const handleInputChange = (e: any) => {
        let newTextInstance = {
            ...textInstance,
            inputContent: e.target.value
        }

        let update = updateTextInstanceThroughEvent(newTextInstance)
        if (!update.currentWord) {
            if (!update.words.every((word) => word.typed)) return
            gateway.send({
                code: 'PLAYER_UPDATE',
                payload: {
                    wpm: update.averageWpm,
                    wordIndex: null,
                    finished: true
                }
            })
        } else if (update.currentWord.index !== textInstance.currentWord.index) {
            gateway.send({
                code: 'PLAYER_UPDATE',
                payload: {
                    wpm: update.averageWpm,
                    wordIndex: update.currentWord.index,
                    finished: false
                }
            })
        }

        if (update) {
            setTextInstance(update)
        } else {
            setTextInstance(newTextInstance)
        }
    }

    return (
        <div>
            <div>
                <p>Ping: {ping >= 0 ? ping : 'undefined'} ms</p>
                <p>Wpm: {textInstance.averageWpm || 0}</p>
                <p>Accuracy: {textInstance.accuracy ? Math.floor(textInstance.accuracy * 100) : 100}%</p>
            </div>
            <GamePlayers gameInstance={gameInstance} />
            <GameText textInstance={textInstance} />
            <GameTextInput inputChange={handleInputChange} textInstance={textInstance} />
        </div>
    )
}

export default Game
