import React from 'react'
import './App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import HomeView from './views/Home'
import GameView from './views/Game'

const App = () => {
    return (
        <Router>
            <h1>Typechase</h1>
            <Switch>
                <Route exact path="/">
                    <HomeView />
                </Route>
                <Route path="/game">
                    <GameView />
                </Route>
            </Switch>
        </Router>
    )
}

export default App
