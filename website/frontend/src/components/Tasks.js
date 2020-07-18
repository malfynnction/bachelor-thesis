import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import shuffle from 'lodash.shuffle'
import '../styles/Tasks.css'
import { itemPropType } from '../lib/prop-types'

const punctuation = /(\.|!|\?|,|-|\(|\)|\/|"|;|:|…)+/g
const punctuationInBeginning = new RegExp(`^${punctuation.source}`, 'g')
const punctuationInEnd = new RegExp(`${punctuation.source}$`, 'g')

class Tasks extends React.Component {
  getSuggestions(original, alternatives) {
    const suggestions = [...alternatives, original]
    return shuffle(suggestions.map(word => word.replace(punctuation, '')))
  }

  deleteWord(
    { original, wordIndex, alternativeSuggestions },
    originalWithPunctuation,
    clozeIndex
  ) {
    const punctuationBefore = originalWithPunctuation.match(
      punctuationInBeginning
    )
    const punctuationAfter = originalWithPunctuation.match(punctuationInEnd)
    return (
      <Fragment>
        {punctuationBefore ? punctuationBefore[0] : null}
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
          <option value="idk">(I don't know)</option>
        </select>
        {punctuationAfter ? punctuationAfter[0] : null}{' '}
      </Fragment>
    )
  }

  render() {
    const { text, clozes, type, enclosingParagraph } = this.props.item
    const words = text.split(' ')
    clozes.forEach((cloze, i) => {
      // the actual index could be different than the wordIndex saved in the cloze object because punctuation is not counted when creating clozes
      let actualIndex = words.indexOf(cloze.original, cloze.wordIndex)
      if (actualIndex === -1) {
        actualIndex = cloze.wordIndex
      }
      words[actualIndex] = this.deleteWord(cloze, words[actualIndex], i)
    })
    const isSentence = type === 'sentence'
    const splitText = isSentence && enclosingParagraph.split(text)

    return (
      <Fragment>
        <div>
          <strong>Please select the missing word for each gap:</strong>
          {isSentence ? (
            <Fragment>
              <br /> (The enclosing paragraph is shown for more context
              information)
            </Fragment>
          ) : null}
        </div>
        <p id="cloze">
          {isSentence ? splitText[0] : null}
          {words.map((word, i) => {
            return (
              <span
                key={`word-${i}`}
                className={isSentence ? 'actual-sentence' : null}
              >
                {word}{' '}
              </span>
            )
          })}
          {isSentence ? splitText[1] : null}
        </p>
      </Fragment>
    )
  }
}

Tasks.propTypes = {
  item: itemPropType,
  onChange: PropTypes.func,
  enteredData: PropTypes.arrayOf(
    PropTypes.shape({
      original: PropTypes.string,
      entered: PropTypes.string,
      isCorrect: PropTypes.bool,
    })
  ),
}

export default Tasks
