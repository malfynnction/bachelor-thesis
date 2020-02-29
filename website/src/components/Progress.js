import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
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

Progress.propTypes = {
  progress: PropTypes.number,
  sessionCount: PropTypes.number,
}

export default Progress
