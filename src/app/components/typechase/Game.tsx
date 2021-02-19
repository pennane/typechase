import React, { useEffect, useState } from 'react'
import { updateTextInstanceThroughEvent } from '../../typechase'
import testTextInstance from '../../typechase/testTextInstance'
import GameText from './GameText'
import GameTextInput from './GameTextInput'

const Game = () => {
    let initialInstance = testTextInstance()
    let [textInstance, setTextInstance] = useState(initialInstance)

    const handleInputChange = (e: any) => {
        let newTextInstance = {
            ...textInstance,
            inputContent: e.target.value
        }
        let update = updateTextInstanceThroughEvent(newTextInstance)

        if (update) {
            setTextInstance(update)
        } else {
            setTextInstance(newTextInstance)
        }
    }

    return (
        <div>
            <div>
                <p>Wpm: {textInstance.averageWpm || 0}</p>
                <p>Accuracy: {textInstance.accuracy ? Math.floor(textInstance.accuracy * 100) : 100}%</p>
            </div>
            <GameText textInstance={textInstance} />
            <GameTextInput inputChange={handleInputChange} textInstance={textInstance} />
        </div>
    )
}

export default Game
