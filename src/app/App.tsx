import React from 'react'
import './App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import HomeView from './views/Home'
import GameView from './views/Game'
import PracticeView from './views/Practice'
import Topbar from './components/layout/Topbar'

const App = () => {
    return (
        <Router>
            <Topbar />
            <Switch>
                <Route exact path="/">
                    <HomeView />
                </Route>
                <Route path="/game">
                    <GameView />
                </Route>
                <Route path="/practice">
                    <PracticeView />
                </Route>
            </Switch>
        </Router>
    )
}

export default App
