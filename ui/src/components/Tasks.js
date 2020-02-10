import React, { Fragment } from 'react'
import get from 'lodash.get'
import '../styles/Tasks.css'

const punctuation = /\.|,|-|\(|\)|\/|"|;|:|…/g

const allowMinorDifferences = word => {
  return word.toLowerCase().replace(punctuation, '')
}

const deletionSetting = { frequency: 5 }

class Tasks extends React.Component {
  componentDidMount() {
    const words = this.props.item.text.split(' ')
    const allDeletions = []
    words.forEach((word, i) => {
      if ((i + 1) % deletionSetting.frequency === 0) {
        allDeletions.push(word)
      }
    })
    this.props.initializeCloze(allDeletions)
  }

  deleteWord(original, wordIndex) {
    const firstDeletionIndex = deletionSetting.frequency - 1
    const deletionIndex =
      (wordIndex - firstDeletionIndex) / deletionSetting.frequency
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
    const words = this.props.item.text.split(' ')
    return (
      <Fragment>
        <div>Please fill in the gaps:</div>
        <p id="cloze">
          {words.map((word, i) => {
            return (
              <span key={`word-${i}`}>
                {(i + 1) % deletionSetting.frequency === 0
                  ? this.deleteWord(word, i)
                  : word + ' '}
              </span>
            )
          })}
        </p>
      </Fragment>
    )
  }
}

export default Tasks
