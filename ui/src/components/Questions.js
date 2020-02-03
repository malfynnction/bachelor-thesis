import React, { Fragment } from 'react'
import '../styles/Questions.css'

const Question = props => {
  return (
    <div className="question-box">
      <div>
        <strong>{props.question.label}</strong>
      </div>
      <div className={`${props.horizontal ? 'horizontal-answer-box' : ''}`}>
        {props.answers.map(({ label, value }, i) => {
          return (
            <div
              key={`${props.question.key}-${value}`}
              className={`${props.horizontal ? 'horizontal-answer' : ''}`}
            >
              <input
                onChange={() => props.onChange(value)}
                type="radio"
                name={props.question.key}
                id={`${props.question.key}-${value}`}
                value={value}
                checked={value === props.checkedAnswer}
              />
              {props.horizontal ? <br /> : null}
              <label htmlFor={`${props.question.key}-${value}`}>{label}</label>
            </div>
          )
        })}
      </div>
    </div>
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
      <Question
        question={{
          label: 'Do you know what happens when I add more questions?',
          key: 'q1',
        }}
        answers={[
          { label: 'yes', value: 'y' },
          { label: 'no', value: 'n' },
          { label: "I don't even care", value: 'idc' },
        ]}
        checkedAnswer={props.answers['q1']}
        onChange={value => props.onChange('q1', value)}
      />
      <Question
        question={{
          label: 'Question?',
          key: 'q2',
        }}
        answers={[
          { label: 'answer 1', value: 1 },
          { label: 'answer 2', value: 2 },
          { label: 'answer 3', value: 3 },
          { label: 'answer 4', value: 4 },
          { label: 'answer 5', value: 5 },
          { label: 'answer 6', value: 6 },
        ]}
        checkedAnswer={props.answers['q2']}
        onChange={value => props.onChange('q2', value)}
      />
      <Question
        question={{ label: 'Did you have to scroll to see this?', key: 'q3' }}
        answers={[
          { label: 'Yes', value: 'y' },
          { label: 'No, your site is broken', value: 'damn' },
          { label: 'No, I have a big screen', value: 'big' },
          { label: "I can't see this", value: 'what' },
        ]}
        checkedAnswer={props.answers['q3']}
        onChange={value => props.onChange('q3', value)}
      />
      <Question
        question={{
          label: 'Did you know I can also arrange the answers differently?',
          key: 'q4',
        }}
        answers={[
          { label: 'Yes', value: 'y' },
          { label: '', value: 'y-idk' },
          { label: "I don't know", value: 'idk' },
          { label: '', value: 'idk-n' },
          { label: 'No', value: 'n' },
        ]}
        checkedAnswer={props.answers['q4']}
        onChange={value => props.onChange('q4', value)}
        horizontal={true}
      />
    </Fragment>
  )
}

export default Questions
