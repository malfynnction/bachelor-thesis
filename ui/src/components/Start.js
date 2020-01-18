import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div className="tu-border center-box">
      <h2>Welcome to this session!</h2>
      <div>Thank you for helping us.</div>
      <Link to="/Instructions">Start</Link>
    </div>
  )
}

export default Start
