import React, { Fragment } from 'react'
import '../styles/Progress.css'

const Progress = ({ progress, sessionCount }) => {
  return (
    <Fragment>
      <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
      {sessionCount ? (
        <div className="session-count">Completed sessions: {sessionCount}</div>
      ) : null}
    </Fragment>
  )
}

export default Progress
