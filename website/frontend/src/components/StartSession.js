import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { databasePropType } from '../lib/prop-types'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'
import getFromUrlParams from '../lib/get-from-url-params'
import '../styles/StartSession.css'
import {
  COMPENSATION,
  CONTACT_MAIL,
  SESSIONS_PER_COMPENSATION,
} from '../config.js'

const participantStore = createStore('participantId')
const sessionStore = createStore('session')
const ratingStore = createStore('ratings')
const seedStore = createStore('seed')
const itemDataStore = createStore('itemData', {
  deleteAfterSession: true,
})

class startSession extends React.Component {
  constructor(props) {
    super(props)
    this.state = { completedTrainingSession: false, seed: seedStore.get() }
  }

  async componentDidMount() {
    let newState = {}

    newState.previousSession = getFromUrlParams('prev', this.props)
    newState.token = getFromUrlParams('token', this.props)

    const activeSession = sessionStore.get()
    newState.hasActiveSession = activeSession && activeSession.id !== 'Training'

    const { pouchParticipants } = this.props
    const participantId = participantStore.get()
    const participant = await pouchParticipants.get(participantId)
    this.setState({
      ...newState,
      completedTrainingSession:
        Boolean(participant.completedTrainingSession) ||
        newState.previousSession === 'Training',
    })
  }

  deleteActiveSession() {
    if (this.state.hasActiveSession) {
      sessionStore.clear()
      ratingStore.clear()
      itemDataStore.clear()
    }
  }

  renderThankYou() {
    const { previousSession } = this.state

    const previouslyTraining = previousSession === 'Training'
    const previouslyFeedback = previousSession === 'Feedback'
    const previouslyRating =
      previousSession && !previouslyTraining && !previouslyFeedback
    const allowAnotherSession = !this.state.seed

    if (previouslyTraining) {
      return (
        <Fragment>
          <div>
            <span>
              You have successfully submitted your test rating.{' '}
              <strong>You can now start an actual survey below.</strong>{' '}
            </span>
            <span>
              If you have any questions, you can read the{' '}
              <a href="/instructions">Instructions</a> again or contact us at{' '}
              <a href={`mailto:${CONTACT_MAIL}`} target="blank">
                {CONTACT_MAIL}
              </a>
              .{' '}
            </span>
          </div>
          <div>
            We would also appreciate some <a href="/feedback">feedback</a> on
            the study, so that we can improve it in the future.
          </div>
        </Fragment>
      )
    }

    if (previouslyFeedback) {
      return (
        <span>
          Thank you for your feedback, this helps us improve the study in the
          future!
        </span>
      )
    }

    if (previouslyRating) {
      return (
        <Fragment>
          {this.state.token ? (
            <Fragment>
              <p>
                Thank you! Your answers have been saved. Your confirmation code
                is
              </p>
              <div className="tu-border confirmation-token">
                <strong>{this.state.token}</strong>
              </div>
              <div>
                Please copy and paste the code to a safe place,{' '}
                <strong>
                  you won't be able to see it again after leaving this page.
                </strong>
              </div>
              {this.state.seed ? null : (
                <Fragment>
                  <div
                    onClick={() => {
                      this.setState({
                        showCompensationExplanation: !this.state
                          .showCompensationExplanation,
                      })
                    }}
                    className="link"
                  >
                    What am I supposed to do with the code?
                  </div>
                  {this.state.showCompensationExplanation ? (
                    <div className="toggled-text">
                      In order to receive your compensation ({COMPENSATION} per{' '}
                      {SESSIONS_PER_COMPENSATION} completed surveys), please
                      send a mail to{' '}
                      <a href={`mailto:${CONTACT_MAIL}`} target="blank">
                        {CONTACT_MAIL}
                      </a>
                      , including your participant ID (can be found in the upper
                      right corner) and the confirmation codes of all the
                      surverys you completed.
                    </div>
                  ) : null}
                </Fragment>
              )}
            </Fragment>
          ) : null}
          <p>
            {allowAnotherSession ? (
              <Fragment>
                You can now close this window or start another survey below.
              </Fragment>
            ) : (
              'You can now close this window.'
            )}{' '}
            We would also appreciate some <a href="/feedback">feedback</a> on
            the study, so that we can improve it in the future.
          </p>
        </Fragment>
      )
    }

    return null
  }

  render() {
    const { previousSession } = this.state
    const previouslyTraining = previousSession === 'Training'
    const previouslyFeedback = previousSession === 'Feedback'
    const previouslyRating =
      previousSession && !previouslyTraining && !previouslyFeedback
    const allowAnotherSession = !this.state.seed
    return (
      <div className="tu-border tu-glow center-box centered-content">
        <h2>Start {previouslyRating ? 'another' : 'a'} survey</h2>
        {this.renderThankYou()}
        {allowAnotherSession ? (
          <Fragment>
            {this.state.hasActiveSession ? (
              <div>
                You have unsaved ratings. You can continue where you left off
                and complete your survey, or start a new one and delete the
                unsaved changes.
              </div>
            ) : null}
            <div className="start-session">
              {this.state.hasActiveSession ? (
                <Link className="btn" to="/session">
                  Continue Survey
                </Link>
              ) : null}
              {this.state.completedTrainingSession ? (
                <Link
                  className="btn"
                  to="/session"
                  onClick={() => {
                    this.deleteActiveSession()
                  }}
                >
                  Start
                  {this.state.hasActiveSession
                    ? ' new'
                    : previouslyRating
                    ? ' another'
                    : ''}{' '}
                  Survey
                </Link>
              ) : null}
              {previouslyRating || previouslyTraining ? null : (
                <Link
                  className="btn"
                  to="/session"
                  onClick={() => {
                    this.deleteActiveSession()
                    this.props.onStartTraining()
                  }}
                >
                  Start Test Survey
                </Link>
              )}
            </div>
            {previouslyRating || previouslyTraining ? null : (
              <div className="centered-content">
                <div
                  className="link"
                  onClick={() => {
                    this.setState({
                      showTrainingExplanation: !this.state
                        .showTrainingExplanation,
                    })
                  }}
                >
                  What is a Test Survey?
                </div>
                <br />
                {this.state.showTrainingExplanation ? (
                  <div className="toggled-text">
                    A test survey is just like a real survey, except your
                    answers won't be recorded and you will get a pre-defined set
                    of one very one very easy, one medium, and one very
                    difficult text. This can help you familiarize yourself with
                    the process of the study and give you a feeling of the
                    different levels of texts.
                  </div>
                ) : null}
              </div>
            )}
          </Fragment>
        ) : null}
      </div>
    )
  }
}

startSession.propTypes = {
  pouchParticipants: databasePropType,
  onStartTraining: PropTypes.func,
}

export default startSession
