import React, { Fragment } from 'react'
import get from 'lodash.get'
import '../styles/Tasks.css'

const punctuation = /\.|,|-|\(|\)|\/|"|;|:|…/g

const allowMinorDifferences = word => {
  return word.toLowerCase().replace(punctuation, '')
}

class Tasks extends React.Component {
  deleteWord(original, wordIndex) {
    const deletionIndex = (wordIndex - 4) / 5
    return (
      <Fragment>
        <input
          type="text"
          name={`deletion-${deletionIndex}`}
          id={`deletion-${deletionIndex}`}
          onChange={e => {
            const entered = allowMinorDifferences(e.target.value)
            const isCorrect = entered === allowMinorDifferences(original)
            this.props.onChange(deletionIndex, {
              entered: e.target.value,
              original,
              isCorrect,
            })
          }}
          value={get(this.props, ['enteredData', deletionIndex, 'entered'], '')}
        />{' '}
      </Fragment>
    )
  }

  render() {
    return (
      <Fragment>
        <div>Please fill in the gaps:</div>
        <p id="cloze">
          {this.props.item.text.split(' ').map((word, i) => {
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
