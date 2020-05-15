import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Logout = props => {
  const { isLoggedIn, onLogOut } = props
  if (isLoggedIn) {
    onLogOut()
  }
  return (
    <div className="tu-border tu-glow center-box centered-content">
      <h2>Thank you!</h2>
      <div>
        You have been logged out. Thank you for your participation in this
        study.
      </div>
      <Link className="btn" to="/">
        Home
      </Link>
    </div>
  )
}

Logout.propTypes = {
  isLoggedIn: PropTypes.bool,
  onLogOut: PropTypes.func,
}

export default Logout
