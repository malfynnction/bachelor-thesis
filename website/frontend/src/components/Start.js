import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div className="tu-border tu-glow center-box centered-content">
      <h2>Welcome!</h2>
      <div>Thank you for participating in this study.</div>
      <Link className="btn" to="/Instructions">
        Start
      </Link>
    </div>
  )
}

export default Start
