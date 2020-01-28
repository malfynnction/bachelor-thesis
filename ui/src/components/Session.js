import React from 'react'
import shuffle from 'lodash.shuffle'
import Item from './Item'
import PouchDB from 'pouchdb'
import createStore from '../lib/create-store'

const participantId = createStore('participantId')
const sessionStore = createStore('session')

const pouchRatings = new PouchDB('ratings')
pouchRatings.sync('http://localhost:5984/ratings', {
  live: true,
  retry: true,
})

const pouchItems = new PouchDB('items')
pouchItems.sync('http://localhost:5984/items', {
  live: true,
  retry: true,
})

const getNewSession = async () => {
  const allItems = await pouchItems.allDocs({ include_docs: true })
  const items = allItems.rows.map(row => row.doc)
  const session = { items: shuffle(items), index: 0 }
  sessionStore.set(session)
  return session
}

class Session extends React.Component {
  constructor(props) {
    super(props)
    const session = sessionStore.get()
    this.state = { ...session }
  }

  async componentDidMount() {
    if (typeof this.state.items === 'undefined') {
      const newSession = await getNewSession()
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
