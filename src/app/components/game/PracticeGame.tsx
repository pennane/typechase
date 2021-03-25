import React, { useEffect, useState } from 'react'
import { getRandom } from '../../services/texts'
import { TextInstance, textToTextInstance } from '../../typechase'
import { updateTextInstanceThroughEvent } from '../../typechase'
import GameText from './GameText'
import GameTextInput from './GameTextInput'
import GameStats from './GameStats'

const PracticeGame = () => {
    let [textInstance, setTextInstance]: [TextInstance | null, any] = useState(null)

    const newPracticeGame = () => {
        getRandom().then((text) => {
            setTextInstance(textToTextInstance(text))
        })
    }

    useEffect(() => {
        newPracticeGame()
    }, [])

    if (!textInstance) return null

    const handleInputChange = (e: any) => {
        let newTextInstance = {
            ...textInstance,
            inputContent: e.target.value
        }

        let update = updateTextInstanceThroughEvent(newTextInstance, null, true)
        if (!update.currentWord) {
            if (!update.words.every((word) => word.typed)) return
        }

        if (update) {
            setTextInstance(update)
        } else {
            setTextInstance(newTextInstance)
        }
    }

    return (
        <div className={`game practice`}>
            <GameStats practice textInstance={textInstance} ping={null} gameInstance={null} />
            <GameText textInstance={textInstance} />
            <GameTextInput practice inputChange={handleInputChange} textInstance={textInstance} />
            {textInstance.words[textInstance.words.length - 1].finsihedAt && (
                <button className="next-game" onClick={() => newPracticeGame()}>
                    next
                </button>
            )}
        </div>
    )
}

export default PracticeGame
