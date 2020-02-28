import React from 'react'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'
import getFromUrlParams from '../lib/get-from-url-params'

const participantStore = createStore('participantId')

class startSession extends React.Component {
  constructor(props) {
    super(props)
    this.state = { completedTrainingSession: false }
  }

  async componentDidMount() {
    let newState = {}

    newState.previousSession = getFromUrlParams('prev', this.props)
    newState.token = getFromUrlParams('token', this.props)

    const { pouchParticipants } = this.props
    const participantId = participantStore.get()
    const participant = await pouchParticipants.get(participantId)
    this.setState({
      ...newState,
      completedTrainingSession: Boolean(participant.completedTrainingSession),
    })
  }

  render() {
    const { previousSession } = this.state
    return (
      <div className="tu-border tu-glow center-box centered-content">
        <h2>Start {previousSession ? 'another' : 'a'} session</h2>
        {previousSession ? (
          <div>
            Thank you! Your answers have been saved.{' '}
            {this.state.token
              ? `Your confirmation code is ${this.state.token}. `
              : null}
            You can now close this window or start another session below:
          </div>
        ) : null}
        <div>
          {this.state.completedTrainingSession
            ? `You can start ${
                previousSession ? 'another' : 'a'
              } rating session or do a little training session before. `
            : 'Please go through a training session before you start with the actual ratings. '}
          A training session is just like a real session, except your answers
          won't be recorded and you will get a pre-defined set of one very easy,
          one medium, and one very difficult paragraph or sentence.
        </div>
        <div>
          {this.state.completedTrainingSession ? (
            <Link className="btn" to="/session">
              Normal Session
            </Link>
          ) : null}
          <Link
            className="btn"
            to="/session"
            onClick={() => this.props.onStartTraining()}
          >
            Training Session
          </Link>
        </div>
      </div>
    )
  }
}

export default startSession
