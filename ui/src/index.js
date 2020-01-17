import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Instructions from './Instructions'
import Session from './Session'
import Start from './Start'

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Start</Link>
            </li>
            <li>
              <Link to="/instructions">Instructions</Link>
            </li>
            <li>
              <Link to="/session">Session</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/instructions">
            <Instructions />
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
