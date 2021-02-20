import React, { useState } from 'react'
import { GameInstance, GamePlayer, randomFromRange } from '../typechase'

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
        <div className={me ? 'player you' : 'player'}>
            <div className="player-info">
                <div className="player-name-container">
                    <span className="player-name">
                        {player.guest ? `Guest-${player.uuid.slice(0, 3)}` : player.name || 'unknown'}{' '}
                    </span>
                    {me && <span className="player-you">(you)</span>}
                </div>

                <span className="player-wpm"> {player.wpm | 0} wpm</span>
            </div>

            <div className="player-performance">
                <div
                    className="player-icon"
                    style={{
                        left: left,
                        background: `linear-gradient(${player.theme[0]}deg, hsl(${player.theme[0]}, 100%, 44%), hsl(${player.theme[0]}, 100%, 44%))`
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
