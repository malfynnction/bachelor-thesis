import React from 'react'
import { Link } from 'react-router-dom'

const startSession = props => {
  return (
    <div className="tu-border tu-glow center-box centered-content">
      <h2>Start a session</h2>
      <div>
        You can start a rating session or do a little training session before.
        The training session is just like a real session, except your answers
        won't be recorded and you will get a pre-defined set of one very easy,
        one medium, and one very difficult paragraph or sentence.
      </div>
      <div>
        <Link className="btn" to="/session">
          Normal Session
        </Link>
        <Link
          className="btn"
          to="/session"
          onClick={() => props.onStartTraining()}
        >
          Training Session
        </Link>
      </div>
    </div>
  )
}

export default startSession
