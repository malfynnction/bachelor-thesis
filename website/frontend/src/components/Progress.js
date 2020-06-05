import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import '../styles/Progress.css'

const Progress = ({ progress }) => {
  return (
    <Fragment>
      <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
    </Fragment>
  )
}

Progress.propTypes = {
  progress: PropTypes.number,
}

export default Progress
