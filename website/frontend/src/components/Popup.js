import React from 'react'
import PropTypes from 'prop-types'
import ClickOutHandler from 'react-onclickout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons'
import '../styles/Popup.css'

const Popup = props => {
  return (
    <div className="popup">
      <ClickOutHandler onClickOut={() => props.onClose()}>
        <div className="popup-inner">
          <div className="popup-close">
            <span onClick={() => props.onClose()}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </span>
          </div>
          <div className="popup-content">{props.children}</div>
        </div>
      </ClickOutHandler>
    </div>
  )
}

Popup.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
    PropTypes.string,
  ]),
  onClose: PropTypes.func.isRequired,
}

export default Popup
