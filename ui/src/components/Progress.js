import React from 'react'
import '../styles/Progress.css'

const Progress = ({ progress }) => {
  return (
    <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
  )
}

export default Progress
