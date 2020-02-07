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
    this.state = { ...session }
  }

  async componentDidMount() {
    if (typeof this.state.items === 'undefined') {
      const newSession = await getNewSession(
        this.props.pouchParticipants,
        this.props.pouchSessions,
        this.props.pouchItems
      )
      sessionStore.set(newSession)
      this.setState({ ...newSession })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.index !== prevState.index) {
      sessionStore.set(this.state)
    }
  }

  render() {
    const { pouchParticipants, pouchRatings } = this.props

    const participantId = (participantStore.get() || '').toString()
    const items = this.state.items || []
    const index = this.state.index || 0

    const progress = (index + 1) / items.length
    const isLastItem = progress === 1

    const item = items[index]

    return (
      <Fragment>
        {this.state.finishedAllSessions ? null : (
          <Progress progress={progress} />
        )}
        <div
          className={`tu-border tu-glow center-box ${
            this.state.finishedAllSessions ? 'centered-content' : ''
          }`}
        >
          {this.state.finishedAllSessions ? (
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
              onNextItem={async result => {
                pouchRatings.post({
                  ...result,
                  participantId: participantId,
                  itemId: item._id,
                })
                if (isLastItem) {
                  const sessionId = this.state.id
                  const participant = await pouchParticipants.get(participantId)
                  const completedSessions = [
                    ...participant.completedSessions,
                    sessionId,
                  ]
                  pouchParticipants.put({
                    ...participant,
                    completedSessions: completedSessions,
                  })
                  sessionStore.clear()
                  window.location.href = 'http://localhost:3000'
                } else {
                  this.setState({ index: index + 1 })
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
