import React, { Fragment } from 'react'
import participantId from '../lib/participant-id'

const Demographics = () => (
  <Fragment>
    <div>Here be demographic questions</div>
    <button
      onClick={() => {
        participantId.create()
      }}
    >
      <a href="http://localhost:3000/session">Start</a>
    </button>
  </Fragment>
)

export default Demographics
