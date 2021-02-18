import { useEffect } from 'react'
import { TextInstance } from '../../typechase'

const GameText = ({ textInstance }: { textInstance: TextInstance }) => {
    const { words, characters, currentIndex } = textInstance

    let characterIndex = 0
    return (
        <div>
            {words &&
                words.map((word, i) => {
                    return (
                        <span className={word.typed ? 'word typed' : 'word'} key={i}>
                            {word.characters.map((character, j) => {
                                const el = (
                                    <span
                                        className={`character state-${characters[characterIndex].state} ${
                                            characters[j].reached ? ' reached' : ''
                                        } ${currentIndex === characterIndex}`}
                                        key={`${i}-${j}`}
                                    >
                                        {character}
                                    </span>
                                )
                                characterIndex++
                                return el
                            })}
                        </span>
                    )
                })}
        </div>
    )
}

export default GameText
