import React, { Fragment } from 'react'
import Item from './Item'
import createStore from '../lib/create-store'
import getNewSession from '../lib/get-new-session'
import Progress from './Progress'

const participantStore = createStore('participantId')
const sessionStore = createStore('session')

class Session extends React.Component {
  constructor(props) {
    super(props)
    const session = sessionStore.get()
    this.state = { session: { ...session }, ratings: [] }
  }

  async componentDidMount() {
    if (typeof this.state.session.item === 'undefined') {
      const newSession = await getNewSession(
        this.props.pouchParticipants,
        this.props.pouchSessions,
        this.props.pouchItems,
        this.props.isTraining
      )
      sessionStore.set(newSession)
      this.setState({ session: { ...newSession } })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.session.index !== prevState.index) {
      sessionStore.set(this.state.session)
    }
  }

  render() {
    const { pouchParticipants, pouchRatings } = this.props

    const { session } = this.state || {}

    const participantId = (participantStore.get() || '').toString()
    const items = session.items || []
    const index = session.index || 0

    const progress = (index + 1) / items.length
    const isLastItem = progress === 1

    const item = items[index]

    pouchParticipants.get(participantId).then(participant => {
      const completedSessionCount = participant.completedSessions.length
      if (this.state.completedSessionCount !== completedSessionCount) {
        this.setState({ completedSessionCount })
      }
    })

    return (
      <Fragment>
        {session.finishedAllSessions ? null : (
          <Progress
            progress={progress}
            sessionCount={this.state.completedSessionCount}
          />
        )}
        <div
          className={`tu-border tu-glow center-box flexbox ${
            session.finishedAllSessions ? 'centered-content' : ''
          }`}
        >
          {session.finishedAllSessions ? (
            <div className="centered-content">
              You have rated all available items in the data set.
              <br />
              <strong> Thank you for your participation.</strong>
            </div>
          ) : item ? (
            <Item
              index={index}
              item={item}
              isLastItem={isLastItem}
              onScrollToTop={() => {
                this.props.onScrollToTop()
              }}
              onNextItem={async result => {
                const ratings = [
                  ...this.state.ratings,
                  { ...result, itemId: item._id, participantId },
                ]
                this.setState({ ratings })
                if (isLastItem) {
                  const participant = await pouchParticipants.get(participantId)

                  if (this.props.isTraining) {
                    this.props.onEndTraining()
                    pouchParticipants.put({
                      ...participant,
                      completedTrainingSession: true,
                    })
                  } else {
                    // post ratings to DB
                    await pouchRatings.bulkDocs(ratings)

                    // store completed session ID
                    const sessionId = session.id
                    const completedSessions = [
                      ...participant.completedSessions,
                      sessionId,
                    ]
                    await pouchParticipants.put({
                      ...participant,
                      completedSessions: completedSessions,
                    })
                  }
                  sessionStore.clear()
                  window.location.href = 'http://localhost:3000/start-session'
                } else {
                  this.setState({
                    session: { ...this.state.session, index: index + 1 },
                  })
                }
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </Fragment>
    )
  }
}

export default Session
