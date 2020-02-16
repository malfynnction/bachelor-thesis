import React, { Fragment } from 'react'
import { get, shuffle } from 'lodash'
import '../styles/Tasks.css'

const punctuation = /\.|,|-|\(|\)|\/|"|;|:|…/g

class Tasks extends React.Component {
  getSuggestions(original, alternatives) {
    const suggestions = [...alternatives, original]
    return shuffle(suggestions.map(word => word.replace(punctuation, '')))
  }

  deleteWord({ original, wordIndex, alternativeSuggestions }, clozeIndex) {
    return (
      <Fragment>
        <select
          onChange={e => {
            const entered = e.target.value
            const isCorrect = entered === original
            this.props.onChange(clozeIndex, { entered, original, isCorrect })
          }}
          value={get(this.props, ['enteredData', clozeIndex, 'entered'], '')}
          name={`deletion-${wordIndex}`}
          id={`deletion-${wordIndex}`}
        >
          <option value={''} disabled>
            Please Select
          </option>
          {/* TODO: keep punctuation before and after word*/}
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
    clozes.forEach((cloze, i) => {
      words[cloze.wordIndex] = this.deleteWord(cloze, i)
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
