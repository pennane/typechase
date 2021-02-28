import React from 'react'
import { GameInstance, GamePlayer } from '../../Typechase'
import PlayerIcon from './PlayerIcon'

const Player = ({ player, me, words }: { player: GamePlayer; me: boolean; words: number }) => {
    if (player.spectator) return null

    let left
    if (player.finished) {
        left = '100%'
    } else if (!player.wordIndex) {
        left = '0%'
    } else {
        left = Math.floor((player.wordIndex / words) * 100) + '%'
    }

    return (
        <div className={`player ${me ? 'you' : ''} ${player.disconnected ? 'disconnected' : ''}`}>
            <div className="player-info">
                <div className="player-name-container">
                    <span className={player.finished ? 'player-name finished' : 'player-name'}>
                        {player.name || 'unknown'}{' '}
                    </span>
                    {me && <span className="player-you">(you)</span>}
                    {player.disconnected && <span className="player-left">(left)</span>}
                </div>

                <span className="player-wpm"> {player.wpm | 0} wpm</span>
            </div>

            <div className="player-performance">
                <PlayerIcon
                    theme={player.theme}
                    style={{
                        left: left
                    }}
                />
            </div>
        </div>
    )
}

const GamePlayers = ({ gameInstance }: { gameInstance: GameInstance }) => {
    const { players } = gameInstance
    return (
        <div className="players">
            {players &&
                Object.keys(players).map((uuid, i) => {
                    return (
                        <Player
                            key={uuid}
                            player={players[uuid]}
                            me={gameInstance.uuid === uuid}
                            words={gameInstance.words}
                        />
                    )
                })}
        </div>
    )
}

export default GamePlayers
