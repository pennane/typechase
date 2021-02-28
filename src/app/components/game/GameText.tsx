import React from 'react'
import { TextInstance } from '../../Typechase'

const GameText = ({ textInstance }: { textInstance: TextInstance }) => {
    const { words } = textInstance

    return (
        <div className="text">
            {words &&
                words.map((word, i) => {
                    return (
                        <span className={word.typed ? 'word typed' : 'word'} key={i}>
                            {word.characters.map((character, j) => {
                                const el = (
                                    <span
                                        className={`character state-${character.state} ${
                                            character.reached ? ' reached' : ''
                                        }`}
                                        key={`${i}-${j}`}
                                    >
                                        {character.key}
                                    </span>
                                )
                                return el
                            })}
                        </span>
                    )
                })}
        </div>
    )
}

export default GameText
