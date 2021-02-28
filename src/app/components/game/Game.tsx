import React, { useEffect, useState } from 'react'
import { getById } from '../../services/texts'
import { GameInstance, getGateway, TextInstance, textToTextInstance } from '../../typechase'
import { updateTextInstanceThroughEvent } from '../../typechase'
import GameText from './GameText'
import GameTextInput from './GameTextInput'
import GamePlayers from './GamePlayers'
import GameStats from './GameStats'
import PlayerIcon from './PlayerIcon'

const Game = ({ gameId }: { gameId: string }) => {
    let gateway = getGateway({
        gameId,
        name: localStorage.getItem('typechase.guestname'),
        theme: JSON.parse(localStorage.getItem('typechase.guesttheme'))
    })
    let [guestName, setGuestname] = useState(null)
    let [guestTheme, setGuestTheme] = useState(null)
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

    const updateGuestName = (guestname: string) => {
        setGuestname(guestname)
        localStorage.setItem('typechase.guestname', guestname)
    }

    const updateGuestTheme = (theme) => {
        setGuestTheme(theme)
        localStorage.setItem('typechase.guesttheme', JSON.stringify(theme))
    }

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
                        payload.name ? updateGuestName(payload.name) : null
                        payload.theme ? updateGuestTheme(payload.theme) : null
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
                    const updated: GameInstance = { ...gameInstance, players: payload.players, state: payload.state }
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

    const handleSetName = (e: any) => {
        e.preventDefault()
        const newName = e.target.newname.value
        if (!newName || typeof newName !== 'string' || newName.length > 20) {
            return
        }
        gateway.send({
            code: 'set_name',
            payload: {
                name: newName
            }
        })
        updateGuestName(newName)
    }

    const newGame = (id: string) => {
        gateway.stop()
        gateway.setGameId(id)
        gateway.setGuestData(guestName, guestTheme)
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
                code: 'player_update',
                payload: {
                    wpm: update.averageWpm,
                    wordIndex: null,
                    finished: true
                }
            })
        } else if (update.currentWord.index !== textInstance.currentWord.index) {
            gateway.send({
                code: 'player_update',
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
        <div className={`game ${gameInstance.state} ${gameInstance.spectator ? 'spectator' : ''}`}>
            <div className="set-name">
                <form className="set-name-form" onSubmit={(e) => handleSetName(e)}>
                    <input className="set-name-input" placeholder="playername" id="newname" type="text"></input>
                    <input className="set-name-submit" type="submit" value="set player name" />
                </form>
                {guestName && (
                    <div className="current-name">
                        <span className="current-name-value">{guestName}</span>
                        {guestTheme && <PlayerIcon theme={guestTheme} />}
                    </div>
                )}
            </div>
            <GameStats ping={ping} gameInstance={gameInstance} textInstance={textInstance} />
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
            {gameInstance.invitationId && (
                <div className="game-invite">
                    <p>Invite chasers to play with you with this link</p>
                    <input
                        className="game-invite-link"
                        type="text"
                        readOnly={true}
                        value={
                            window.location.protocol +
                            '//' +
                            window.location.host +
                            '/game?invitation=' +
                            gameInstance.invitationId
                        }
                    />
                </div>
            )}
        </div>
    )
}

export default Game
