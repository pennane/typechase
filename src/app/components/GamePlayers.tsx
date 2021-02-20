import React from 'react'
import { GameInstance, GamePlayer } from '../typechase'

const Player = ({ player, me, words }: { player: GamePlayer; me: boolean; words: number }) => {
    let left
    if (player.finished) {
        left = '100%'
    } else if (!player.wordIndex) {
        left = '0%'
    } else {
        left = Math.floor((player.wordIndex / words) * 100) + '%'
    }

    return (
        <div className={me ? 'player me' : 'player'}>
            <span className="player-name">{player.uuid} </span>
            <span className="player-wpm"> {player.wpm | 0} wpm</span>
            <div className="player-performance">
                <div
                    className="player-icon"
                    style={{
                        left: left
                    }}
                />
            </div>
        </div>
    )
}

const GamePlayers = ({ gameInstance }: { gameInstance: GameInstance; me?: boolean }) => {
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
