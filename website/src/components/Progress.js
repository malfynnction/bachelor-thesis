import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import '../styles/Progress.css'

const Progress = ({ progress, surveyCount }) => {
  return (
    <Fragment>
      <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
      {surveyCount ? (
        <div className="survey-count">Completed surveys: {surveyCount}</div>
      ) : null}
    </Fragment>
  )
}

Progress.propTypes = {
  progress: PropTypes.number,
  surveyCount: PropTypes.number,
}

export default Progress
