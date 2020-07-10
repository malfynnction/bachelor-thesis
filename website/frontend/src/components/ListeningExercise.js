import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import createStore from '../lib/create-store'

const audioAnswers = createStore('audio', { deleteAfterSession: true })

const questions = [
  {
    fileName: 'q1.wav',
    question: {
      key: 'q1',
      target: 'alle richtigen',
      answers: [
        { label: 'An dem Test nahmen 80 Supermärkte teil.', isCorrect: false },
        {
          label: 'Für die Kund*innen ist der Preis am wichtigsten.',
          isCorrect: true,
        },
        {
          label: 'Der Handel folgte der Präferenz der Gesetze.',
          isCorrect: false,
        },
        {
          label: 'Mehr als 70% der Kund*innen kaufen das billigste Produkt.',
          isCorrect: true,
        },
      ],
    },
  },
  {
    fileName: 'q2.wav',
    question: {
      key: 'q2',
      target: 'alle falschen',
      answers: [
        {
          label: 'Kotelett sollte aus dem Menü entfernt werden.',
          isCorrect: true,
        },
        {
          label:
            'Verbraucher*innen sind nicht offen, mehr für die Fleischprodukte zu bezahlen.',
          isCorrect: true,
        },
        {
          label:
            'Schweinefleisch ist wichtiger als Geflügelfleisch für Verbraucher*innen.',
          isCorrect: true,
        },
        {
          label:
            'Weitere Räume in den Supermärkten wurden im Gespräch nicht besprochen.',
          isCorrect: false,
        },
      ],
    },
  },
  {
    fileName: 'q3.wav',
    question: {
      key: 'q3',
      target: 'alle richtigen',
      answers: [
        {
          label: 'Die Lobby ist mächtiger als die Verbraucher*innen.',
          isCorrect: true,
        },
        {
          label: 'Der Renteneintritt sollte bei 17 Jahren liegen.',
          isCorrect: false,
        },
        {
          label:
            'Eine Person, die eine der Fragen am besten beantworten könnte, war nicht in dem Gespräch.',
          isCorrect: true,
        },
        {
          label:
            'Die Bauorganisationen sind wichtiger für die Gesetze als die Politiker*innen.',
          isCorrect: false,
        },
      ],
    },
  },
]

const AudioQuestion = props => {
  const { key, target, answers } = props.question
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
        <strong>
          Bitte hören Sie sich den Audioclip an und wählen Sie{' '}
          <u>
            <em>{target}</em>
          </u>{' '}
          Aussagen aus:
        </strong>
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
          <label htmlFor={`${key}-${i}`}>{answer.label}</label>
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
        estimate your German level.
      </div>
      {questions.map(({ fileName, question }, i) => (
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
          id="consent"
        />
        <label className="checkbox-label" htmlFor="consent">
          I have read the{' '}
          <a href="/privacy?prev=listening-exercise">consent notification </a>
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
            const score = questions.reduce((sum, { question }) => {
              return (
                sum +
                question.answers.reduce((questionScore, answer, i) => {
                  return (
                    questionScore +
                    (answer.isCorrect ===
                      checkedAnswers[question.key].includes(i))
                  )
                }, 0)
              )
            }, 0)
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
    target: PropTypes.string,
    answers: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.string, isCorrect: PropTypes.bool })
    ),
  }),
  checkedAnswers: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
}
