import React, { Fragment, useState } from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import './bootstrap/bootstrap.css'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Instructions from './components/Instructions'
import Session from './components/Session'
import Start from './components/Start'
import Demographics from './components/Demographics'
import participantId from './lib/participant-id'

const App = () => {
  const id = participantId.get()
  const [showId, setShowId] = useState(Boolean(id))
  return (
    <Router>
      <header>
        <img src="logo.png" id="header-img" />
        <div id="participant-id">
          {showId ? (
            <Fragment>
              Participant ID: {id}
              <Link
                to="/"
                onClick={() => {
                  participantId.clear()
                  setShowId(false)
                }}
              >
                Log out
              </Link>
            </Fragment>
          ) : null}
        </div>
      </header>
      <div className="layout">
        <Switch>
          <Route path="/instructions">
            <Instructions />
          </Route>
          <Route path="/demographics">
            <Demographics
              createId={() => {
                participantId.create()
                setShowId(true)
              }}
            />
          </Route>
          <Route path="/session">
            <Session />
          </Route>
          <Route path="/">
            <Start />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
