import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

const Consent = props => {
  const { prev } = props
  return (
    <div className="tu-border tu-glow center-box centered-content">
      <h3>Consent Form</h3>
      <p>
        Your participation in this research study is voluntary. You may choose
        not to participate. If you decide to participate in this research
        survey, you may withdraw at any time without giving any reason. If you
        decide not to participate in this study or if you withdraw from
        participating at any time, you will not be penalized.
      </p>

      <p>
        Your responses will be confidential and we do not collect identifying
        information such as your name, email address or IP address. Your answers
        will be saved anonymously, using only an automatically generated
        participant ID to identify you. No personal data other than the
        demographic information above will be saved or published.
      </p>
      {prev === 'demographics' ? (
        <Fragment>
          <p>Clicking on the "I Agree" button below indicates that:</p>
          <ul>
            <li>you have read the above information</li>
            <li>
              you have been informed about the content and procedure of the
              study
            </li>
            <li>you voluntarily agree to participate</li>
            <li>you are at least 18 years of age</li>
          </ul>
        </Fragment>
      ) : null}

      <p>
        If you do not wish to participate in the research study, you can simply
        close this website.
      </p>
      <br />
      <a className="btn" href="/demographics?consent=true">
        I Agree
      </a>
    </div>
  )
}

export default Consent

Consent.propTypes = {
  prev: PropTypes.string,
}
