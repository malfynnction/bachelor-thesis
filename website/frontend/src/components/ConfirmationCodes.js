import React from 'react'
import PropTypes from 'prop-types'
import '../styles/ConfirmationCodes.css'

const ConfirmationCodes = ({ tokens }) => {
  return (
    <div className="center-box centered-content tu-border tu-glow">
      <h3>Confirmation codes for your completed surveys</h3>
      <div>[TODO: explanation]</div>
      <ul className="token-list">
        {tokens.map(token => (
          <li className="token" key={token}>
            {token}
          </li>
        ))}
      </ul>
    </div>
  )
}

ConfirmationCodes.propTypes = {
  tokens: PropTypes.arrayOf(PropTypes.string),
}

export default ConfirmationCodes
