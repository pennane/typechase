import React, { useEffect, useState } from 'react'
import { updateTextInstanceThroughEvent } from '../../typechase'
import testTextInstance from '../../typechase/testTextInstance'
import GameText from './GameText'

const Game = () => {
    let initialInstance = testTextInstance()
    let [textInstance, setTextInstance] = useState(initialInstance)

    useEffect(() => {
        let listener = (event: KeyboardEvent) => {
            let update = updateTextInstanceThroughEvent(event, textInstance)
            if (update) {
                console.log(update)
                setTextInstance(update)
            }
        }
        window.addEventListener('keydown', listener)

        return () => window.removeEventListener('keydown', listener)
    }, [textInstance])

    return (
        <div>
            <GameText textInstance={textInstance} />
        </div>
    )
}

export default Game
