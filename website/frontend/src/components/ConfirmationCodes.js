import React from 'react'
import PropTypes from 'prop-types'

const ConfirmationCodes = props => {
  return (
    <div className="center-box tu-border tu-glow">
      TODO: explain what to do with this (see Instructions.js)
      <ul>
        {props.tokens.map(token => (
          <li key={token}>{token}</li>
        ))}
      </ul>
    </div>
  )
}

ConfirmationCodes.propTypes = {
  tokens: PropTypes.arrayOf(PropTypes.string),
}

export default ConfirmationCodes
