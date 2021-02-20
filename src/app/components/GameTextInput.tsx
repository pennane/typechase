import React from 'react'
import { useEffect, useRef } from 'react'
import { GameState, TextInstance } from '../typechase'

const GameTextInput = ({
    textInstance,
    inputChange,
    state,
    spectator
}: {
    textInstance: TextInstance
    inputChange: any
    state: GameState
    spectator: boolean
}) => {
    let textInput = useRef(null)

    useEffect(() => {
        if (textInput && textInput.current) {
            forceFocusState()
        }
    }, [state])

    const forceFocusState = () => {
        if (state === 'running' || state === 'finishing' || state === 'starting' || spectator) {
            ;(textInput.current as any).focus()
        } else {
            ;(textInput.current as any).blur()
        }
    }

    return (
        <input
            ref={textInput}
            value={textInstance.inputContent}
            onChange={inputChange}
            onFocus={forceFocusState}
            onBlur={forceFocusState}
        />
    )
}

export default GameTextInput
