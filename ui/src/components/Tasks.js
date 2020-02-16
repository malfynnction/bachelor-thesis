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
    // TODO: this can be done in parent
    this.props.initializeCloze(allDeletions)
  }

  getSuggestions(original, alternatives) {
    const suggestions = [...alternatives, original]
    return shuffle(suggestions.map(word => word.replace(punctuation, '')))
  }

  deleteWord({ original, wordIndex, alternativeSuggestions }) {
    return (
      <Fragment>
        <select
          onChange={e => {
            const entered = e.target.value
            const isCorrect = entered === original
            this.props.onChange(wordIndex, { entered, original, isCorrect })
          }}
          value={get(this.props, ['enteredData', wordIndex, 'entered'], '')}
          name={`deletion-${wordIndex}`}
          id={`deletion-${wordIndex}`}
        >
          <option value={''} disabled>
            Please Select
          </option>
          {this.getSuggestions(original, alternativeSuggestions).map(
            (word, i) => {
              return (
                <option
                  value={word}
                  key={`deletion-${wordIndex}-suggestion-${i}`}
                >
                  {word}
                </option>
              )
            }
          )}
        </select>{' '}
      </Fragment>
    )
  }

  render() {
    const words = this.props.item.text.split(' ')
    const clozes = this.props.item.clozes
    clozes.forEach(cloze => {
      console.log(cloze.wordIndex)
      console.log(words[cloze.wordIndex])
      console.log(cloze.original)
      words[cloze.wordIndex] = this.deleteWord(cloze)
    })

    return (
      <Fragment>
        <div>Please fill in the gaps:</div>
        <p id="cloze">
          {words.map((word, i) => {
            return <span key={`word-${i}`}>{word} </span>
          })}
        </p>
      </Fragment>
    )
  }
}

export default Tasks
