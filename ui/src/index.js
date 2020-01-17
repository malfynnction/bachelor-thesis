import React, { Fragment, useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
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
      <div>
        {showId ? (
          <Fragment>
            <div>Participant ID: {id}</div>
            <button
              onClick={() => {
                participantId.clear()
                setShowId(false)
              }}
            >
              <a href="http://localhost:3000">Log out</a>
            </button>
          </Fragment>
        ) : null}

        <Switch>
          <Route path="/instructions">
            <Instructions />
          </Route>
          <Route path="/demographics">
            <Demographics />
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
