import React from 'react'
import { Link } from 'react-router-dom'

const Topbar = () => {
    return (
        <div className="topbar">
            <h4>Typechase</h4>
            <Link to="/">home</Link>
        </div>
    )
}

export default Topbar
