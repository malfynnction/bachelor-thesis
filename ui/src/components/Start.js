import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <Fragment>
      <h2>Welcome to this session!</h2>
      <div>Thank you for helping us.</div>
      <Link to="/Instructions">Start</Link>
    </Fragment>
  )
}

export default Start
