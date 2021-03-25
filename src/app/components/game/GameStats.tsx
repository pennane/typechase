import React from 'react'
import { GameInstance, GameState, PracticeInstance, TextInstance } from '../../typechase'

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

interface OnlineGameStats {
    ping: any
    gameInstance: GameInstance | null
    textInstance: TextInstance
    practice?: boolean
}

const GameStats = ({ ping, gameInstance, textInstance, practice }: OnlineGameStats) => {
    return (
        <div className="game-stats">
            {!practice && (
                <>
                    <p>Ping: {ping >= 0 ? ping : 'undefined'} ms</p>
                </>
            )}

            <p>Wpm: {textInstance.averageWpm || 0}</p>
            <p>Accuracy: {textInstance.accuracy ? Math.floor(textInstance.accuracy * 100) : 100}%</p>
            {!practice && (
                <>
                    <GameStateDisplay state={gameInstance.state} />
                </>
            )}
        </div>
    )
}

export default GameStats
