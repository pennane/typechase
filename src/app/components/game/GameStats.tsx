import React from 'react'
import { GameInstance, GameState, TextInstance } from '../../typechase'

const GameStateDisplay = ({ state }: { state: GameState }) => {
    const mapStateToText = (state: GameState) => {
        switch (state) {
            case 'waiting': {
                return 'Waiting for players...'
            }
            case 'running': {
                return 'Game running'
            }
            case 'completed': {
                return 'Game finished'
            }
            case 'cancelled': {
                return 'Game cancelled. Refresh the page.'
            }
            case 'starting': {
                return 'Game starting, ready up!'
            }
            case 'finishing': {
                return 'Game finishing...'
            }
            default: {
                return ''
            }
        }
    }

    return <p className={'game-state ' + state}>{mapStateToText(state)}</p>
}

const GameStats = ({
    ping,
    gameInstance,
    textInstance
}: {
    ping: any
    gameInstance: GameInstance
    textInstance: TextInstance
}) => {
    return (
        <div className="game-stats">
            <p>Ping: {ping >= 0 ? ping : 'undefined'} ms</p>
            <p>Wpm: {textInstance.averageWpm || 0}</p>
            <p>Accuracy: {textInstance.accuracy ? Math.floor(textInstance.accuracy * 100) : 100}%</p>
            <GameStateDisplay state={gameInstance.state} />
        </div>
    )
}

export default GameStats
