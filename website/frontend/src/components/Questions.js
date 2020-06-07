import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import '../styles/Questions.css'
import { itemPropType } from '../lib/prop-types'

const getAllQuestions = (questionType, { type, sentences }) => {
  if (questionType === 'general') {
    const questions = [
      {
        key: 'readability',
        label: `How difficult was it for you to read this ${type}?`,
        answers: [
          { label: 'very difficult', value: 7 },
          { label: 'difficult', value: 6 },
          { label: 'somewhat difficult', value: 5 },
          { label: 'neutral', value: 4 },
          { label: 'somewhat easy', value: 3 },
          { label: 'easy', value: 2 },
          { label: 'very easy', value: 1 },
        ],
      },
      {
        key: 'complexity',
        label: `How do you rate the overall complexity of this ${type}?`,
        answers: [
          { label: 'very complex', value: 7 },
          { label: 'complex', value: 6 },
          { label: 'somewhat complex', value: 5 },
          { label: 'neutral', value: 4 },
          { label: 'somewhat easy', value: 3 },
          { label: 'easy', value: 2 },
          { label: 'very easy', value: 1 },
        ],
      },
      {
        key: 'understandability',
        label: `How well did you understand the ${type}?`,
        answers: [
          { label: "didn't understand at all", value: 7 },
          { label: 'understood almost nothing', value: 6 },
          { label: 'understood only a few things', value: 5 },
          { label: 'understood some things', value: 4 },
          { label: 'undestood it relatively well', value: 3 },
          { label: 'understood most of it', value: 2 },
          { label: 'fully understood', value: 1 },
        ],
      },
    ]
    console.log(type)
    if (type === 'sentence') {
      questions.push({
        key: 'paragraphNecessary',
        label:
          'Did you need to read the paragraph in order to understand the sentence?',
        answers: [
          {
            label: "Without it, I wouldn't have understood anything",
            value: 7,
          },
          {
            label:
              'Without it, I would have understood some parts, but not the overall meaning',
            value: 6,
          },
          {
            label: 'It helped me understand the sentence a bit better',
            value: 5,
          },
          {
            label: "It didn't give me any value, but also no disadvantages",
            value: 4,
          },
          { label: "I didn't even read it", value: 3 },
          { label: 'I found it distracting', value: 2 },
          {
            label:
              'I would have understood the sentence better without the paragraph',
            value: 1,
          },
        ],
      })
    }
    return questions
  } else if (questionType === 'hardestSentence') {
    return [
      {
        key: 'hardestSentence',
        label: 'What was the hardest sentence in the paragraph?',
        answers: sentences.map((sentence, i) => {
          return {
            label: sentence,
            value: i,
          }
        }),
      },
    ]
  }
}

const Questions = props => {
  const showScore = props.questionType !== 'hardestSentence'
  return (
    <Fragment>
      <div>
        Please answer some questions about the {props.item.type} you just read:
      </div>
      {getAllQuestions(props.questionType, props.item).map(
        ({ key, label, answers }) => (
          <Fragment key={`question-${key}`}>
            <div className="question-box">
              <div>
                <strong>{label}</strong>
              </div>
              {answers.map(({ label, value }) => {
                return (
                  <div key={`${key}-${value}`} className="questionnaire-item">
                    <input
                      onChange={() => props.onChange(key, value)}
                      type="radio"
                      name={key}
                      id={`${key}-${value}`}
                      value={value}
                      checked={value === props.answers[key]}
                    />
                    <label
                      htmlFor={`${key}-${value}`}
                      className={showScore ? 'label-with-score' : ''}
                    >
                      <span>{label}</span>
                      {showScore ? <span>({value})</span> : null}
                    </label>
                  </div>
                )
              })}
            </div>
          </Fragment>
        )
      )}
    </Fragment>
  )
}

Questions.propTypes = {
  questionType: PropTypes.string,
  item: itemPropType,
  onChange: PropTypes.func,
  answers: PropTypes.object,
}

export default Questions
