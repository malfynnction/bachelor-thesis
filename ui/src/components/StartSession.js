import React from 'react'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'

const participantStore = createStore('participantId')

class startSession extends React.Component {
  constructor(props) {
    super(props)
    this.state = { completedTrainingSession: false }
  }
  async componentDidMount() {
    const { pouchParticipants } = this.props
    const participantId = participantStore.get()
    const participant = await pouchParticipants.get(participantId)
    this.setState({
      completedTrainingSession: Boolean(participant.completedTrainingSession),
    })
  }

  render() {
    return (
      <div className="tu-border tu-glow center-box centered-content">
        <h2>Start a session</h2>
        <div>
          {this.state.completedTrainingSession
            ? 'You can start a rating session or do a little training session before. '
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
