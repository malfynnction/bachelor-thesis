import React from 'react'
import shuffle from 'lodash.shuffle'
import Item from './Item'
import PouchDB from 'pouchdb'
import participantId from '../lib/participant-id'

const pouchRatings = new PouchDB('ratings')
pouchRatings.sync('http://localhost:5984/ratings', {
  live: true,
  retry: true,
})

const getItemsToRate = () => {
  return [
    {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      type: 'sentence',
      id: 1,
    },
    {
      text:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tincidunt enim ac turpis laoreet sagittis. Mauris et placerat enim, sit amet mollis mi. In rhoncus sit amet dui vel vulputate. Nunc pellentesque, augue et semper eleifend, mi augue fermentum lectus, sit amet fringilla est odio sit amet leo. Phasellus efficitur tortor sit amet purus luctus dignissim. Sed quis felis id est finibus ultrices. In dolor sapien, efficitur at pretium id, vestibulum ut elit. Sed dui lectus, commodo ac ipsum euismod, tincidunt vehicula eros. Suspendisse tristique posuere semper. Integer eu nibh pulvinar, commodo nisl pellentesque, tincidunt nibh. Donec elementum nisi in turpis finibus tincidunt vitae vel ligula. Ut tempor tellus ut dolor sollicitudin, non fermentum dui ullamcorper. Donec volutpat erat ex, eget sollicitudin nunc gravida ut. Curabitur placerat dignissim placerat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      type: 'paragraph',
      id: 2,
    },
  ]
}

class Session extends React.Component {
  constructor(props) {
    super(props)
    const items = getItemsToRate()
    this.state = {
      index: 0,
      items: shuffle(items),
    }
  }
  render() {
    const isLastItem = this.state.index + 1 === this.state.items.length
    const item = this.state.items[this.state.index]
    return (
      <div className="tu-border tu-glow center-box">
        <Item
          index={this.state.index}
          item={item}
          isLastItem={isLastItem}
          onNextItem={result => {
            pouchRatings.post({
              ...result,
              participantId: participantId.get(),
              itemId: item.id,
            })
            if (isLastItem) {
              window.location.href = 'http://localhost:3000'
            } else {
              this.setState({ index: this.state.index + 1 })
            }
          }}
        />
      </div>
    )
  }
}

export default Session
