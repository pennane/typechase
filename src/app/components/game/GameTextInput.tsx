import React from 'react'
import { useEffect, useRef } from 'react'
import { GameState, TextInstance } from '../../typechase'

const GameTextInput = ({
    textInstance,
    inputChange,
    state,
    spectator,
    practice
}: {
    textInstance: TextInstance
    inputChange: any
    state?: GameState
    spectator?: boolean
    practice?: boolean
}) => {
    let textInput = useRef(null)

    useEffect(() => {
        if (practice) return
        window.addEventListener('focus', forceFocusState)
        return () => {
            window.removeEventListener('focus', forceFocusState)
        }
    })

    useEffect(() => {
        if (practice) return
        if (textInput && textInput.current) {
            forceFocusState()
        }
    }, [state])

    const forceFocusState = () => {
        const isFocusableState = state === 'running' || state === 'finishing' || state === 'starting'
        if (!spectator && isFocusableState) {
            ;(textInput.current as any).focus()
        } else {
            ;(textInput.current as any).blur()
        }
    }

    return <input className="text-input" ref={textInput} value={textInstance.inputContent} onChange={inputChange} />
}

export default GameTextInput
