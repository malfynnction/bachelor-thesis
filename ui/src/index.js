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
import createStore from './lib/create-store'
import newPouchDB from './lib/new-pouch-db'

const participantId = createStore('participantId')
const sessionStore = createStore('session')

const pouchParticipants = newPouchDB('participants')
const pouchRatings = newPouchDB('ratings')
const pouchSessions = newPouchDB('sessions')
const pouchItems = newPouchDB('items')

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
                  sessionStore.clear()
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
          <Route
            path="/instructions"
            render={props => (
              <Instructions pouchParticipants={pouchParticipants} {...props} />
            )}
          />
          <Route path="/demographics">
            <Demographics
              createUser={async data => {
                pouchParticipants.allDocs().then(docs => {
                  const usedIds = docs.rows.map(participant => participant.id)
                  const newId = Math.max(...usedIds, 0) + 1
                  participantId.set(newId)
                  setShowId(true)
                  pouchParticipants.put({
                    ...data,
                    _id: newId.toString(),
                    completedSessions: [],
                  })
                })
              }}
            />
          </Route>
          <Route path="/session">
            {showId ? (
              <Session
                pouchRatings={pouchRatings}
                pouchParticipants={pouchParticipants}
                pouchSessions={pouchSessions}
                pouchItems={pouchItems}
              />
            ) : (
              <Redirect to="/" />
            )}
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
