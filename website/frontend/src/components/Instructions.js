import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { databasePropType } from '../lib/prop-types'
import createStore from '../lib/create-store'
import { Link, withRouter } from 'react-router-dom'
import '../styles/Instructions.css'
import {
  CONTACT_MAIL,
  COMPENSATION,
  SESSIONS_PER_COMPENSATION,
  SESSION_DURATION,
} from '../config.js'

const participantId = createStore('participantId')

const Instructions = props => {
  const doesIdExist = id => {
    return pouchParticipants
      .get(id)
      .then(() => {
        return { exists: true }
      })
      .catch(response => {
        return { exists: false, status: response.status }
      })
  }

  const { pouchParticipants } = props

  const [error, setError] = useState('')
  const [isNewParticipantFromParams, setIsNewParticipantFromParams] = useState(
    false
  )
  const loggedInId = participantId.get()

  useEffect(() => {
    if (loggedInId) {
      doesIdExist(loggedInId).then(({ exists }) =>
        setIsNewParticipantFromParams(!exists)
      )
    }
  }, [])

  return (
    <Fragment>
      <div className="tu-border tu-glow center-box ">
        <div className="centered-content">
          <h2>Instructions</h2>
        </div>
        <p>
          Please read this page carefully and make sure you understand what
          you're supposed to do.
        </p>
        <p>
          This study is part of my Bachelor's thesis, in which I'm composing a
          data set of German texts and a{' '}
          <strong>rating of their complexity and understandability. </strong>
          This data set can then be used as a basis for identifying the most
          complex parts of texts and automatically "translate" them to simpler
          language.
        </p>
        <p>
          In this study, you will read texts and answer questions about their
          complexity and understandability. You can complete as many surveys as
          you like. Each survey will take about {SESSION_DURATION} minutes to
          complete and consists of multiple texts, for each of which you will be
          led through the following three steps:
        </p>
        <h5>1. Reading</h5>
        <p>
          In the first step you can <strong>read the text</strong> that you will
          be rating. This page will look slightly different depending on whether
          the text is an entire paragraph or a single sentence.
        </p>
        <p>
          For sentences you will see the sentence at the top of the page in a
          grey box. Please read it carefully to make sure you understand it as
          well as possible. Below the sentence you will find the paragraph that
          the sentence was taken from. You don't <em>have</em> to read it, but
          it can help you understand the sentence.
        </p>
        <p>
          For paragraphs we will measure how long it takes to read them, so the
          text will be hidden unless you hold a button below the text. Please
          make sure you read the entire paragraph and understand it as well as
          you can.
        </p>
        <p>
          Once you're done, click on "Next Step".{' '}
          <strong>
            After that, you won't be able to go back to read the text.
          </strong>
        </p>
        <h5>2. Questions</h5>
        <p>
          In the second step you will be asked{' '}
          <strong>questions about the text</strong>, for example how complex you
          think it is or how well you understood it.
        </p>
        <h5>3. Cloze Test</h5>
        <p>
          In the last step you will see the text again, but with several words
          left out. Please <strong>select the missing words</strong> from the
          dropdown menus.
        </p>
        <h5>Finish</h5>
        <p>
          After you complete the rating for one text, you will get the next
          sentence or paragraph and can start the rating of that text. After
          completing all texts of a survey, your answers will be saved and you
          will be redirected to the homepage. You can then start another survey
          if you want to.{' '}
          <strong>You can complete as many surveys as you like.</strong>
        </p>
        <h5>Compensation</h5>
        <p>
          You will receive a compensation of {COMPENSATION} per{' '}
          {SESSIONS_PER_COMPENSATION} completed surveys. In order to receive the
          compensation, please send a mail to{' '}
          <a href={`mailto:${CONTACT_MAIL}`} target="blank">
            {CONTACT_MAIL}
          </a>{' '}
          after completing at least 10 surveys, including your participant ID
          (can be found in the upper right corner after signing up) and the
          confirmation codes of all the surverys you completed (will be shown at
          the end of each survey).
        </p>
        <p>
          <strong>Remember:</strong> There are{' '}
          <strong>no right or wrong answers</strong> as long as you read the
          text carefully, follow the instructions and give your honest opinion.
          In case you get tired or cannot focus for any reason, take a break and
          come back later.
        </p>
        {loggedInId !== null ? (
          <Link
            className="btn"
            to={isNewParticipantFromParams ? '/demographics' : '/start-session'}
          >
            Start
          </Link>
        ) : (
          <Fragment>
            <p>
              If you have already done a session in the past, please enter your
              participant ID and click "Start"
            </p>
            <form
              onSubmit={e => {
                e.preventDefault()
                const id = e.target.participantId.value
                doesIdExist(id).then(result => {
                  if (result.exists) {
                    props.login(id)
                    props.history.push('/start-session')
                  } else if (result.status === 404) {
                    setError(
                      'This ID does not exist. Please make sure you entered the correct ID.'
                    )
                  } else {
                    setError('An unknown error occurred. Please try again.')
                  }
                })
              }}
            >
              <input
                type="text"
                name="participantId"
                placeholder="Participant ID"
                className="login-input"
              />
              <button type="submit" className="btn">
                Start
              </button>
            </form>
            <p>
              If you haven't participated before, you can no longer sign up,
              since we already have enough participants. Thank you!
            </p>
            {error.length > 0 ? (
              <div className="tu-border error-box background-pink">{error}</div>
            ) : null}
          </Fragment>
        )}
      </div>
    </Fragment>
  )
}

Instructions.propTypes = {
  pouchParticipants: databasePropType,
  login: PropTypes.func,
  history: PropTypes.shape({ push: PropTypes.func }),
}

export default withRouter(Instructions)
