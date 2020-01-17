import React from 'react'
import shuffle from 'lodash.shuffle'
import Item from './Item'

const getItemsToRate = () => {
  return [
    'First Sentence',
    'Second Sentence',
    "Now here's a paragraph",
    'And another paragraph',
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
    return (
      <Item
        index={this.state.index}
        item={this.state.items[this.state.index]}
        onNextItem={() => {
          if (this.state.index + 1 < this.state.items.length) {
            this.setState({ index: this.state.index + 1 })
          } else {
            window.location.href = 'http://localhost:3000'
          }
        }}
      />
    )
  }
}

export default Session
