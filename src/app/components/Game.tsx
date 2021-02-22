import React, { useEffect, useState } from 'react'
import { getById } from '../services/texts'
import { GameInstance, getGateway, TextInstance, textToTextInstance } from '../typechase'
import { updateTextInstanceThroughEvent } from '../typechase'
import GameText from './GameText'
import GameTextInput from './GameTextInput'
import GamePlayers from './GamePlayers'

const Game = ({ gameId }: { gameId: string }) => {
    let gateway = getGateway(gameId)
    let [textInstance, setTextInstance]: [TextInstance | null, any] = useState(null)
    let [gameInstance, setGameInstance]: [GameInstance | null, any] = useState(null)
    let [ping, setPing] = useState(null)

    useEffect(() => {
        gateway.start()

        return () => {
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
                case 'game_register': {
                    getById(payload.textId).then((text) => {
                        setTextInstance(textToTextInstance(text))
                        const newGameInstance = { ...gameInstance, ...payload }
                        updateGameInstance(newGameInstance)
                    })
                    return
                }
                case 'ping': {
                    setPing(payload.ping)
                    return
                }
                case 'next_game': {
                    const updated: GameInstance = { ...gameInstance, next: payload.next }
                    updateGameInstance(updated)
                    return
                }
                case 'game_started': {
                    const updated: GameInstance = { ...gameInstance, startedAt: payload.startedAt }
                    updateGameInstance(updated)
                    return
                }
                case 'game_state': {
                    const updated: GameInstance = { ...gameInstance, state: payload.state }
                    updateGameInstance(updated)
                    return
                }
                case 'players_state': {
                    const updated: GameInstance = { ...gameInstance, players: payload.players }
                    updateGameInstance(updated)
                    return
                }
                default: {
                    return
                }
            }
        })
    }

    if (!textInstance || !gameInstance) return null

    const newGame = (id: string) => {
        gateway.stop()
        gateway.setGameId(id)
        gateway.start()
        setTextInstance(null)
        setGameInstance(null)
    }

    const handleInputChange = (e: any) => {
        const isRunning = gameInstance.state === 'running' || gameInstance.state === 'finishing'
        if (!isRunning || gameInstance.spectator) return
        let newTextInstance = {
            ...textInstance,
            inputContent: e.target.value
        }

        let update = updateTextInstanceThroughEvent(newTextInstance, gameInstance)
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
        <div className={`game ${gameInstance.state}`}>
            <div className="game-stats">
                <p>Ping: {ping >= 0 ? ping : 'undefined'} ms</p>
                <p>Wpm: {textInstance.averageWpm || 0}</p>
                <p>Accuracy: {textInstance.accuracy ? Math.floor(textInstance.accuracy * 100) : 100}%</p>
                <p>Game state: '{gameInstance.state}'</p>
            </div>
            <GamePlayers gameInstance={gameInstance} />
            <GameText textInstance={textInstance} />
            <GameTextInput
                state={gameInstance.state}
                spectator={gameInstance.spectator}
                inputChange={handleInputChange}
                textInstance={textInstance}
            />
            {gameInstance.next && (
                <button className="next-game" onClick={() => newGame(gameInstance.next)}>
                    continue to new game
                </button>
            )}
        </div>
    )
}

export default Game
