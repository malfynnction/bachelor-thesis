import React from 'react'
import Item from './Item'
import createStore from '../lib/create-store'
import getNewSession from '../lib/get-new-session'

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

    const isLastItem = index + 1 === items.length
    const item = items[index]

    return (
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
    )
  }
}

export default Session
