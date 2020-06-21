import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const AudioQuestion = props => {
  const { key, label, answers } = props.question
  return (
    <div>
      <audio controls>
        <source src={props.fileName} type="TODO" />
        Your browser does not support playing audio. Here is a{' '}
        <a href="TODO">link to download the audio</a> instead.
      </audio>

      <div className="question-box">
        <div>
          <strong>{label}</strong>
        </div>
        {answers.map((answer, i) => (
          <div key={`${key}-${i}`}>
            <input
              type="checkbox"
              id={`${key}-${i}`}
              name={key}
              value={`${key}-${i}`}
              checked={props.checkedAnswers.includes(i)}
              onChange={e => {
                props.onChange(i, e.target.checked)
              }}
            />
            <label htmlFor={`${key}-${i}`}>{answer}</label>
          </div>
        ))}
      </div>
    </div>
  )
}

const ListeningExercise = () => {
  const [checkedAnswers, setCheckedAnswers] = useState({})

  return (
    <div className="tu-border tu-glow center-box centered-content">
      <h3>Listening Comprehension</h3>
      <div>
        Please listen to the audio and answer the questions to help us better
        estimate your German level (TODO: this won't have an influence on
        quality and compensation and stuff)
      </div>
      {[
        {
          fileName: '',
          question: {
            key: 'audio-1',
            label: 'Please check all the statements that are TRUE:',
            answers: [
              'This statement is false',
              'This statement is true.',
              'This statement is false.',
            ],
          },
        },
        {
          fileName: '',
          question: {
            key: 'audio-2',
            label: 'Please check all the statements that are FALSE:',
            answers: [
              'This statement is false',
              'This statement is true.',
              'This statement is false.',
            ],
          },
        },
      ].map(({ fileName, question }, i) => (
        <AudioQuestion
          key={`audio-question-${i}`}
          fileName={fileName}
          question={question}
          checkedAnswers={checkedAnswers[question.key] || []}
          onChange={(answer, shouldBeChecked) => {
            const prevAnswers = checkedAnswers[question.key] || []
            let newAnswers = prevAnswers
            if (shouldBeChecked) {
              // check answer
              newAnswers.push(answer)
            } else {
              // uncheck answer
              const index = newAnswers.indexOf(answer)
              if (index > -1) {
                newAnswers.splice(index, 1)
              }
            }
            setCheckedAnswers({
              ...checkedAnswers,
              [question.key]: newAnswers,
            })
          }}
        />
      ))}
      <Link className="btn" type="submit" to="/start-session" onClick={e => {}}>
        Submit
      </Link>
    </div>
  )
}

export default ListeningExercise

AudioQuestion.propTypes = {
  fileName: PropTypes.string,
  question: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    answers: PropTypes.arrayOf(PropTypes.string),
  }),
  checkedAnswers: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
}
