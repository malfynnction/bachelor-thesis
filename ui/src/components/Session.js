import React from 'react'
import shuffle from 'lodash.shuffle'
import Item from './Item'

const getItemsToRate = () => {
  return [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tincidunt enim ac turpis laoreet sagittis. Mauris et placerat enim, sit amet mollis mi. In rhoncus sit amet dui vel vulputate. Nunc pellentesque, augue et semper eleifend, mi augue fermentum lectus, sit amet fringilla est odio sit amet leo. Phasellus efficitur tortor sit amet purus luctus dignissim. Sed quis felis id est finibus ultrices. In dolor sapien, efficitur at pretium id, vestibulum ut elit. Sed dui lectus, commodo ac ipsum euismod, tincidunt vehicula eros. Suspendisse tristique posuere semper. Integer eu nibh pulvinar, commodo nisl pellentesque, tincidunt nibh. Donec elementum nisi in turpis finibus tincidunt vitae vel ligula. Ut tempor tellus ut dolor sollicitudin, non fermentum dui ullamcorper. Donec volutpat erat ex, eget sollicitudin nunc gravida ut. Curabitur placerat dignissim placerat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
    return (
      <div className="tu-border tu-glow center-box">
        <Item
          index={this.state.index}
          item={this.state.items[this.state.index]}
          isLastItem={isLastItem}
          onNextItem={result => {
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
