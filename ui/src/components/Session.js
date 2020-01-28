import React from 'react'
import Item from './Item'
import newPouchDB from '../lib/new-pouch-db'
import createStore from '../lib/create-store'
import getNewSession from '../lib/get-new-session'

const participantId = createStore('participantId')
const sessionStore = createStore('session')

const pouchRatings = newPouchDB('ratings')

class Session extends React.Component {
  constructor(props) {
    super(props)
    // const session = sessionStore.get()
    // this.state = { ...session }
    this.state = {}
  }

  async componentDidMount() {
    if (typeof this.state.items === 'undefined') {
      const newSession = await getNewSession()
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
    const items = this.state.items || []
    const index = this.state.index || 0

    const isLastItem = index + 1 === items.length
    const item = items[index]

    return (
      <div className="tu-border tu-glow center-box">
        {item ? (
          <Item
            index={index}
            item={item}
            isLastItem={isLastItem}
            onNextItem={result => {
              pouchRatings.post({
                ...result,
                participantId: participantId.get(),
                itemId: item._id,
              })
              if (isLastItem) {
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
