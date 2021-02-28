import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Game from '../components/game/Game'
import { getGameFromInvite, getNewInviteOnlyGame, getRandomGame } from '../services/games'

const GameView = () => {
    const useQuery = () => {
        return new URLSearchParams(useLocation().search)
    }
    let query = useQuery()

    const [gameId, setGameId] = useState(null)

    useEffect(() => {
        const createInviteOnlyGame = query.get('inviteonly')
        const invitationId = query.get('invitation')

        if (createInviteOnlyGame === 'true') {
            getNewInviteOnlyGame().then((receivedGameId) => {
                if (!receivedGameId) return
                setGameId(receivedGameId)
            })
        } else if (invitationId) {
            getGameFromInvite(invitationId).then((receivedGameId) => {
                if (!receivedGameId) return
                setGameId(receivedGameId)
            })
        } else {
            getRandomGame().then((receivedGameId) => {
                if (!receivedGameId) return
                setGameId(receivedGameId)
            })
        }
    }, [])
    return <div className="typechase">{gameId && <Game gameId={gameId} />}</div>
}

export default GameView
