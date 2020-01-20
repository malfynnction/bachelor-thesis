import React, { Fragment } from 'react'
import get from 'lodash.get'
import '../styles/Tasks.css'

const punctuation = /\.|,|-|\(|\)|\/|"|;|:|…/g

const allowMinorDifferences = word => {
  return word.toLowerCase().replace(punctuation, '')
}

class Tasks extends React.Component {
  deleteWord(original, i) {
    return (
      <Fragment>
        <input
          type="text"
          name={`deletion-${i}`}
          id={`deletion-${i}`}
          onChange={e => {
            const entered = allowMinorDifferences(e.target.value)
            const isCorrect = entered === allowMinorDifferences(original)
            this.props.onChange(i, { entered: e.target.value, isCorrect })
          }}
          value={get(this.props, ['enteredData', i, 'entered'], '')}
        />{' '}
      </Fragment>
    )
  }

  render() {
    return (
      <Fragment>
        <div>Please fill in the gaps:</div>
        <p id="cloze">
          {this.props.item.split(' ').map((word, i) => {
            return (
              <span key={`word-${i}`}>
                {(i + 1) % 5 === 0 ? this.deleteWord(word, i) : word + ' '}
              </span>
            )
          })}
        </p>
      </Fragment>
    )
  }
}

export default Tasks
