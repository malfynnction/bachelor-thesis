import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'

const audioAnswers = createStore('audio', { deleteAfterSession: true })

const correctAnswers = { q1: [1, 3], q2: [0, 1, 2], q3: [0, 2] } // TODO

const AudioQuestion = props => {
  const { key, label, answers } = props.question
  return (
    <div className="question-box">
      <audio controls>
        <source src={props.fileName} type="audio/wav" />
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
          fileName: 'q1.wav',
          question: {
            key: 'q1',
            label: 'Please check all the statements that are TRUE:',
            answers: [
              'An dem Test nahmen 80 Supermärkte teil.',
              'Für die Kund*innen ist der Preis am wichtigsten.',
              'Der Handel folgte der Präferenz der Gesetze.',
              'Mehr als 70% der Kund*innen kaufen das billigste Produkt.',
            ],
          },
        },
        {
          fileName: 'q2.wav',
          question: {
            key: 'q2',
            label: 'Please check all the statements that are FALSE:',
            answers: [
              'Kotelett sollte aus dem Menü entfernt werden.',
              'Verbraucher*innen sind nicht offen, mehr für die Fleischprodukte zu bezahlen.',
              'Schweinefleisch ist wichtiger als Geflügelfleisch für Verbraucher*innen.',
              'Weitere Räume in den Supermärkten wurden im Gespräch nicht besprochen.',
            ],
          },
        },
        {
          fileName: 'q3.wav',
          question: {
            key: 'q3',
            label: 'Please check all the statements that are TRUE:',
            answers: [
              'Die Lobby ist mächtiger als die Verbraucher*innen.',
              'Der Renteneintritt sollte bei 17 Jahren liegen.',
              'Eine Person, die eine de Fragen am besten beantworten könnte, war nicht in dem Gespräch.',
              'Die Bauorganistationen sind wichtiger für die Gesetze als die Politiker*innen.',
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
