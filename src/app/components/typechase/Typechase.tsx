import React, { useEffect, useState } from 'react'
import Game from './Game'
import { getAll } from '../../services/texts'
import { Text } from '../../typechase'

const Typechase = () => {
    let [texts, setTexts] = useState<Text[]>([])
    useEffect(() => {
        const fetchTexts = async () => {
            try {
                const response = await getAll()
                setTexts(response)
            } catch (e) {
                console.log(e)
            }
        }
        fetchTexts()
    })
    if (!texts[0]) return null
    return (
        <div>
            <Game />
        </div>
    )
}

export default Typechase
