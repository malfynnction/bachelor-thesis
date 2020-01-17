import React, { Fragment } from 'react'

const Question = props => {
  const questionKey = `question-${props.index}`
  return (
    <Fragment>
      <div>{props.question.label}</div>
      {props.answers.map(({ label, value }, i) => {
        return (
          <div key={`${questionKey}-answer-${i}`}>
            <input
              onChange={() => props.onChange(value)}
              type="radio"
              name={questionKey}
              id={`${questionKey}-answer-${i}`}
              value={value}
              checked={value === props.checkedAnswer}
            />
            <label htmlFor={`${questionKey}-answer-${i}`}>{label}</label>
          </div>
        )
      })}
    </Fragment>
  )
}

const Questions = props => {
  return (
    <Fragment>
      <div>Now answer some questions about what you just read</div>
      <Question
        question={{ label: 'Is this the first question?', key: 'q0' }}
        answers={[
          { label: 'yes', value: 'y' },
          { label: 'no', value: 'n' },
          { label: 'why do you need three possible answers?', value: 'why' },
          { label: "fuck the binary, that's why", value: 'nb' },
        ]}
        checkedAnswer={props.answers['q0']}
        onChange={value => {
          props.onChange('q0', value)
        }}
      />
    </Fragment>
  )
}

export default Questions
