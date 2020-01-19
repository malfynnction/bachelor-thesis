import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

class Demographics extends React.Component {
  render() {
    return (
      <Fragment>
        <div>Here be demographic questions</div>
        <Link
          onClick={() => {
            this.props.createUser({ foo: 'bar', test: true })
          }}
          to="/session"
        >
          Start
        </Link>
      </Fragment>
    )
  }
}

export default Demographics
