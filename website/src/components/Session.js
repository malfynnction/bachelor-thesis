import React, { Fragment } from 'react'
import Item from './Item'
import createStore from '../lib/create-store'
import getNewSession from '../lib/get-new-session'
import Progress from './Progress'
import { withRouter } from 'react-router-dom'

const participantStore = createStore('participantId')
const sessionStore = createStore('session')
const ratingStore = createStore('ratings')
const seedStore = createStore('seed')

const emptySession = { items: [], index: 0 }

class Session extends React.Component {
  constructor(props) {
    super(props)

    this.state = { session: emptySession }
  }

  async componentDidMount() {
    const session = sessionStore.get()
    if (session) {
      this.setState({ session })
    } else {
      const newSession = await getNewSession(
        this.props.pouchParticipants,
        this.props.pouchSessions,
        this.props.pouchItems,
        this.props.isTraining
      )
      sessionStore.set(newSession)
      this.setState({ session: newSession })
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

    const progress = index / items.length
    const isLastItem = index + 1 === items.length

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
                const ratings = ratingStore.get() || []
                ratings.push({ ...result, itemId: item._id, participantId })
                ratingStore.set(ratings)
                let tokenQueryString = ''
                if (isLastItem) {
                  const participant = await pouchParticipants.get(participantId)

                  if (this.props.isTraining) {
                    this.props.onEndTraining()
                    pouchParticipants.put({
                      ...participant,
                      completedTrainingSession: true,
                    })
                  } else {
                    const seed = seedStore.get()
                    // post ratings to DB
                    const options = { session: session.id }
                    if (seed) {
                      options.seed = seed
                    }
                    const response = await pouchRatings.putBulk(
                      ratings,
                      options
                    )
                    const { token } = response
                    if (token) {
                      tokenQueryString = `&token=${token}`
                    }

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
                  ratingStore.clear()

                  this.props.history.push(
                    `/start-session?prev=${session.id}${tokenQueryString}`
                  )
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

export default withRouter(Session)
