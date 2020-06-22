import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'

const audioAnswers = createStore('audio', { deleteAfterSession: true })

const correctAnswers = { 'audio-1': [1], 'audio-2': [0, 2] }

const AudioQuestion = props => {
  const { key, label, answers } = props.question
  return (
    <div className="question-box">
      <audio controls>
        <source src={props.fileName} type="audio/mpeg" />
        Your browser does not support playing audio. Here is a{' '}
        <a href={props.fileName} download>
          link to download the audio
        </a>{' '}
        instead.
      </audio>

      <div>
        <strong>{label}</strong>
      </div>
      {answers.map((answer, i) => (
        <div key={`${key}-${i}`} className="questionnaire-item">
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
  )
}

const ListeningExercise = props => {
  const [checkedAnswers, setCheckedAnswers] = useState(audioAnswers.get() || {})
  const [dataConsent, setDataConsent] = useState(props.consent)

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
          fileName: 'honk.mp3',
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
          fileName: 'honk.mp3',
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
            const newState = {
              ...checkedAnswers,
              [question.key]: newAnswers,
            }
            setCheckedAnswers(newState)
            audioAnswers.set(newState)
          }}
        />
      ))}

      <div>
        <input
          type="checkbox"
          checked={!!dataConsent}
          onChange={e => {
            setDataConsent(e.target.checked)
          }}
        />
        <label className="checkbox-label">
          I have read the{' '}
          <a href="/consent?prev=listening-exercise">consent notification </a>
          and want to participate in this study.
        </label>
      </div>

      <div className="start-label centered-text">
        After clicking on "Start" you can find your participant ID in the top
        right corner. Please remember it so you can skip this step if you come
        back in the future.
      </div>

      <Link
        className={`btn ${dataConsent ? '' : 'btn-disabled'}`}
        type="submit"
        to="/start-session"
        disabled={!dataConsent}
        onClick={e => {
          if (!dataConsent) {
            e.preventDefault()
          } else {
            const score = Object.keys(correctAnswers).reduce(
              (prevScore, question) => {
                const checked = checkedAnswers[question]
                const correct = correctAnswers[question]
                const correctlyChecked = checked.reduce((sum, answer) => {
                  return sum + correct.includes(answer)
                }, 0)
                const incorrectlyChecked = checked.reduce((sum, answer) => {
                  return sum + !correct.includes(answer)
                }, 0)
                return prevScore + correctlyChecked - incorrectlyChecked
              },
              0
            )
            props.createUser({ answers: checkedAnswers, score })
          }
        }}
      >
        Start
      </Link>
    </div>
  )
}

export default ListeningExercise

ListeningExercise.propTypes = {
  createUser: PropTypes.func,
  consent: PropTypes.bool,
}

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
