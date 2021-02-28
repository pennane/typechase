import React from 'react'

const PlayerIcon = ({ theme, style = {} }: { theme: [number, number, number]; style? }) => {
    return (
        <div
            className="player-icon"
            style={{
                ...style,
                background: `linear-gradient(${theme[0]}deg, hsl(${theme[1]}, 100%, 44%), hsl(${theme[2]}, 100%, 44%))`
            }}
        />
    )
}

export default PlayerIcon
