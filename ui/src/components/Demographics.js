import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const Demographics = props => (
  <Fragment>
    <div>Here be demographic questions</div>
    <Link
      onClick={() => {
        props.createId()
      }}
      to="/session"
    >
      Start
    </Link>
  </Fragment>
)

export default Demographics
