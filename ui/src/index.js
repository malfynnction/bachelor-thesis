import React, { Fragment, useState } from 'react'
import ReactDOM from 'react-dom'
import './bootstrap/bootstrap.css'
import './styles/index.css'
import * as serviceWorker from './serviceWorker'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom'
import Instructions from './components/Instructions'
import Session from './components/Session'
import Start from './components/Start'
import Demographics from './components/Demographics'
import participantId from './lib/participant-id'
import PouchDB from 'pouchdb'

const userDb = new PouchDB('users')
userDb.sync('http://localhost:5984/users', { live: true, retry: true })

const App = () => {
  const id = participantId.get()
  const [showId, setShowId] = useState(Boolean(id))
  return (
    <Router>
      <header>
        <Link to="/">
          <img
            src="logo.png"
            id="header-img"
            alt="Logo of the Technische Universität Berlin"
          />
        </Link>
        <div id="participant-id">
          {showId ? (
            <Fragment>
              <span id="participant-id-label">Participant ID: {id}</span>
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
      <div className="layout centered-content">
        <Switch>
          <Route path="/instructions">
            <Instructions />
          </Route>
          <Route path="/demographics">
            <Demographics
              createUser={data => {
                const id = participantId.create()
                setShowId(true)
                userDb.post({ ...data, id: id })
              }}
            />
          </Route>
          <Route path="/session">
            {showId ? <Session /> : <Redirect to="/" />}
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
