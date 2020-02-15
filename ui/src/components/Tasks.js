import React, { Fragment } from 'react'
import { get, shuffle } from 'lodash'
import '../styles/Tasks.css'

const deletionSetting = { frequency: 5, alternativeSuggestions: 4 }
const punctuation = /\.|,|-|\(|\)|\/|"|;|:|…/g

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

  getSuggestions(original) {
    const suggestions = [original.replace(punctuation, '')]
    for (let i = 0; i < deletionSetting.alternativeSuggestions; i++) {
      suggestions.push(`wrong alternative ${i}`.replace(punctuation, ''))
    }
    return shuffle(suggestions)
  }

  deleteWord(original, wordIndex) {
    const firstDeletionIndex = deletionSetting.frequency - 1
    const deletionIndex =
      (wordIndex - firstDeletionIndex) / deletionSetting.frequency
    return (
      <Fragment>
        <select
          onChange={e => {
            const entered = e.target.value
            const isCorrect = entered === original
            this.props.onChange(deletionIndex, { entered, original, isCorrect })
          }}
          value={get(this.props, ['enteredData', deletionIndex, 'entered'], '')}
          name={`deletion-${deletionIndex}`}
          id={`deletion-${deletionIndex}`}
        >
          <option value={''} disabled>
            Please Select
          </option>
          {this.getSuggestions(original).map(word => {
            return (
              <option
                value={word}
                key={`deletion-${deletionIndex}-suggestion-${word}`}
              >
                {word}
              </option>
            )
          })}
        </select>{' '}
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
