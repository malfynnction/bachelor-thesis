import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { databasePropType } from '../lib/prop-types'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'
import getFromUrlParams from '../lib/get-from-url-params'
import '../styles/StartSession.css'
import allRequiredEnvVars from '../lib/all-required-env-vars'

allRequiredEnvVars(['REACT_APP_CONTACT_MAIL'])

const participantStore = createStore('participantId')
const sessionStore = createStore('session')
const ratingStore = createStore('ratings')
const seedStore = createStore('seed')

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
    }
  }

  renderThankYou() {
    const { previousSession } = this.state

    if (!previousSession) {
      return null
    }

    const previouslyTraining = previousSession === 'Training'
    const previouslyFeedback = previousSession === 'Feedback'
    const previouslyRating =
      previousSession && !previouslyTraining && !previouslyFeedback
    const allowAnotherSession = !this.state.seed

    return (
      <Fragment>
        {previouslyRating ? (
          <div className="centered-content centered-text">Thank you!</div>
        ) : null}
        <div>
          {previouslyTraining ? (
            <Fragment>
              <span>
                You have successfully submitted your test rating. You can now
                start an actual survey below.{' '}
              </span>
              <span>
                If you have any questions, you can read the{' '}
                <a href="/instructions">Instructions</a> again or contact us at{' '}
                <a
                  href={`mailto:${process.env.REACT_APP_CONTACT_MAIL}`}
                  target="blank"
                >
                  {process.env.REACT_APP_CONTACT_MAIL}
                </a>
                .{' '}
              </span>
            </Fragment>
          ) : previouslyFeedback ? (
            <span>
              Thank you for your feedback, this helps us improve the study in
              the future!
            </span>
          ) : previousSession ? (
            <Fragment>
              <div>
                Your answers have been saved.{' '}
                {this.state.token ? (
                  <Fragment>
                    Your confirmation code is{' '}
                    <strong>{this.state.token}</strong>.{' '}
                    {this.state.seed
                      ? 'Please copy it and paste it in the corresponding box on the TODO website. '
                      : 'Please [TODO: remember and then send us mail]'}
                  </Fragment>
                ) : null}
              </div>
              <span>
                {allowAnotherSession
                  ? 'You can now close this window or start another survey below. '
                  : 'You can now close this window.'}
              </span>
            </Fragment>
          ) : null}
          {previouslyRating || previouslyTraining ? (
            <span>
              We would appreciate some <a href="/feedback">feedback</a> on the
              study, so that we can improve it in the future.
            </span>
          ) : null}
        </div>
      </Fragment>
    )
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
            <div>
              {this.state.completedTrainingSession
                ? `You can start ${
                    previouslyRating ? 'another' : 'an'
                  } actual survey or do ${
                    previouslyTraining ? 'another' : 'a short'
                  } test survey. `
                : 'Please go through a test survey before you start with actual ratings. '}
              A test survey is just like a real survey, except your answers
              won't be recorded and you will get a pre-defined set of one very
              one very easy, one medium, and one very difficult text.
            </div>

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
                  Start{this.state.hasActiveSession ? ' new' : ''} Survey
                </Link>
              ) : null}
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
            </div>
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
