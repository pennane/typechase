import React from 'react'
import { Link } from 'react-router-dom'

const HomeView = () => {
    return (
        <div className="home">
            <Link to="/game">Find random game</Link>
            <Link to="/game?inviteonly=true">Play with friends</Link>
            <Link to="/practice">Practice</Link>
        </div>
    )
}

export default HomeView
