import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { databasePropType } from '../lib/prop-types'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'
import getFromUrlParams from '../lib/get-from-url-params'

const participantStore = createStore('participantId')
const surveyStore = createStore('survey')
const ratingStore = createStore('ratings')

class startSurvey extends React.Component {
  constructor(props) {
    super(props)
    this.state = { completedTrainingSession: false }
  }

  async componentDidMount() {
    let newState = {}

    newState.previousSurvey = getFromUrlParams('prev', this.props)
    newState.token = getFromUrlParams('token', this.props)

    const activeSurvey = surveyStore.get()
    newState.hasActiveSurvey = activeSurvey && activeSurvey.id !== 'Training'

    const { pouchParticipants } = this.props
    const participantId = participantStore.get()
    const participant = await pouchParticipants.get(participantId)
    this.setState({
      ...newState,
      completedTrainingSession:
        Boolean(participant.completedTrainingSession) ||
        newState.previousSurvey === 'Training',
    })
  }

  deleteActiveSurvey() {
    if (this.state.hasActiveSurvey) {
      surveyStore.clear()
      ratingStore.clear()
    }
  }

  render() {
    const { previousSurvey } = this.state
    const previouslyTraining = previousSurvey === 'Training'
    const previouslyRating = previousSurvey && !previouslyTraining
    const allowAnotherSurvey = !this.state.token

    let thankYou = ''
    if (previouslyTraining) {
      thankYou = `
        <span>You have successfully submitted your test rating.
        You can now start an actual survey below.
        If you have any questions, you can read the
        <a href='/instructions'>Instructions</a>
        again or contact us at TODO</span>
      `
    } else if (previousSurvey) {
      thankYou += '<span>Thank you!</span> <span>Your answers have been saved. '
      if (this.state.token) {
        thankYou += `Your confirmation code is <strong>${this.state.token}</strong>, please copy it and paste it in the corresponding box on the TODO website. `
      }
      if (allowAnotherSurvey) {
        thankYou +=
          'You can now close this window or start another survey below:'
      } else {
        thankYou += 'You can now close this window.'
      }
      thankYou += '</span>'
    }
    return (
      <div className="tu-border tu-glow center-box centered-content">
        <h2>Start {previouslyRating ? 'another' : 'a'} survey</h2>
        {thankYou ? (
          <div
            className="centered-content centered-text"
            dangerouslySetInnerHTML={{ __html: thankYou }}
          />
        ) : null}
        {allowAnotherSurvey ? (
          <Fragment>
            <div>
              {this.state.completedTrainingSession
                ? `You can start ${
                    previouslyRating ? 'another' : 'a'
                  } rating survey or do ${
                    previouslyTraining ? 'another' : 'a little'
                  } test survey before. `
                : 'Please go through a test survey before you start with actual ratings. '}
              A test survey is just like a real survey, except your won't be
              recorded and you will get a pre-defined set of one very one very
              easy, one medium, and one very difficult text.
            </div>

            {this.state.hasActiveSurvey ? (
              <div>
                You have unsaved ratings. You can continue where you left off
                and complete your survey, or start a new one and delete the
                unsaved changes.
              </div>
            ) : null}
            <div>
              {this.state.hasActiveSurvey ? (
                <Link className="btn" to="/session">
                  Continue Survey
                </Link>
              ) : null}

              {this.state.completedTrainingSession ? (
                <Link
                  className="btn"
                  to="/session"
                  onClick={() => {
                    this.deleteActiveSurvey()
                  }}
                >
                  {this.state.hasActiveSurvey ? 'Start new' : 'Normal'} Survey
                </Link>
              ) : null}
              <Link
                className="btn"
                to="/session"
                onClick={() => {
                  this.deleteActiveSurvey()
                  this.props.onStartTraining()
                }}
              >
                Test Survey
              </Link>
            </div>
          </Fragment>
        ) : null}
      </div>
    )
  }
}

startSurvey.propTypes = {
  pouchParticipants: databasePropType,
  onStartTraining: PropTypes.func,
}

export default startSurvey
