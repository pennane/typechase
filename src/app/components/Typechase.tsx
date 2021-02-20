import React, { useEffect, useState } from 'react'
import Game from './Game'
import { getRandomGame } from '../services/games'

const Typechase = () => {
    const [gameId, setGameId] = useState(null)

    useEffect(() => {
        getRandomGame().then((id) => {
            if (!id) return
            setGameId(id)
        })
    }, [])
    return <div className="typechase">{gameId && <Game gameId={gameId} />}</div>
}

export default Typechase
