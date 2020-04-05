import React, { Fragment, useState, useRef } from 'react'
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
import StartSession from './components/StartSession'
import createStore from './lib/create-store'
import createDatabase from './lib/create-database'
import getFromUrlParams from './lib/get-from-url-params'
import Feedback from './components/Feedback'

const participantId = createStore('participantId')
const trainingStore = createStore('trainingState')
const seedStore = createStore('seed')

const pouchParticipants = createDatabase('participants')
const pouchRatings = createDatabase('ratings')
const pouchSessions = createDatabase('sessions')
const pouchItems = createDatabase('items')

const App = () => {
  const id = participantId.get()
  const [isLoggedIn, setLoggedIn] = useState(Boolean(id))
  const [trainingState, setTrainingState] = useState(trainingStore.get())

  const topRef = useRef(null)

  if (id && !trainingState) {
    pouchParticipants.get(id).then(participant => {
      const { completedTrainingSession } = participant
      const trainingStateFromDb = completedTrainingSession
        ? 'completed'
        : 'not started'
      setTrainingState(trainingStateFromDb)
      trainingStore.set(trainingStateFromDb)
    })
  }

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Router>
      {/* Wrap everything in an additional "fake" Route to have access to location props*/}
      <Route
        render={props => {
          const idFromParams = getFromUrlParams('participant-id', props)
          if (idFromParams) {
            participantId.set(idFromParams)
            setLoggedIn(true)
          }

          const seed = getFromUrlParams('seed', props)
          if (seed) {
            seedStore.set(seed)
          }
          return (
            <Fragment>
              <header ref={topRef}>
                <Link to="/">
                  <img
                    src="logo.png"
                    id="header-img"
                    alt="Logo of the Technische Universität Berlin"
                  />
                </Link>
                <div id="participant-id">
                  {isLoggedIn ? (
                    <Fragment>
                      <span id="participant-id-label">
                        Participant ID: {id}
                      </span>
                      <Link
                        to="/"
                        onClick={() => {
                          sessionStorage.clear()
                          setLoggedIn(false)
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
                    <Instructions
                      pouchParticipants={pouchParticipants}
                      login={id => {
                        participantId.set(id)
                        setLoggedIn(true)
                      }}
                    />
                  </Route>

                  <Route path="/demographics">
                    <Demographics
                      createUser={async data => {
                        const loggedInId = participantId.get()
                        if (loggedInId) {
                          try {
                            await pouchParticipants.get(loggedInId)
                            return
                          } catch (e) {
                            // this error is expected: id does not exist => create a new participant
                          }
                        }
                        pouchParticipants.getAll().then(async docs => {
                          const usedIds = docs.map(participant =>
                            parseInt(participant._id)
                          )

                          let lowestUnused = 1
                          while (usedIds.includes(lowestUnused)) {
                            lowestUnused++
                          }
                          const newId = loggedInId || lowestUnused
                          await pouchParticipants.put({
                            ...data,
                            _id: newId.toString(),
                            completedSessions: [],
                          })

                          participantId.set(newId)
                          setLoggedIn(true)
                        })
                      }}
                    />
                  </Route>
                  <Route path="/start-session">
                    <StartSession
                      {...props}
                      onStartTraining={() => {
                        trainingStore.set('in progress')
                        setTrainingState('in progress')
                      }}
                      pouchParticipants={pouchParticipants}
                    />
                  </Route>
                  <Route path="/session">
                    {isLoggedIn ? (
                      trainingState === 'not started' ? (
                        <Redirect to="/start-session" />
                      ) : (
                        <Session
                          pouchRatings={pouchRatings}
                          pouchParticipants={pouchParticipants}
                          pouchSessions={pouchSessions}
                          pouchItems={pouchItems}
                          isTraining={trainingState === 'in progress'}
                          onEndTraining={() => {
                            trainingStore.set('completed')
                            setTrainingState('completed')
                          }}
                          onScrollToTop={() => scrollToTop()}
                        />
                      )
                    ) : (
                      <Redirect to="/" />
                    )}
                  </Route>
                  <Route path="/feedback">
                    {participantId.get() ? (
                      <Feedback participantId={participantId.get()} />
                    ) : (
                      <Redirect to="/start" />
                    )}
                  </Route>
                  <Route path="/">
                    <Start />
                  </Route>
                </Switch>
              </div>
            </Fragment>
          )
        }}
      ></Route>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
