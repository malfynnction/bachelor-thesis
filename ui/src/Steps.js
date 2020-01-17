import React, { Fragment } from 'react'
import Timer from 'react-compound-timer'

export class Read extends React.Component {
  constructor(props) {
    super(props)
    this.state = { showItem: false }
  }

  revealItem(timerControl) {
    timerControl.start()
    this.setState({ showItem: true }, () => {})
  }

  hideItem(timerControl) {
    timerControl.pause()
    this.setState({ showItem: false })
    this.props.onTimeUpdate(timerControl.getTime())
  }

  render() {
    return (
      <Fragment>
        <div>Here is a sentence/paragraph that you should read: </div>
        <Timer startImmediately={false} timeToUpdate={100}>
          {timerControl => (
            <button
              onTouchStart={() => this.revealItem(timerControl)}
              onTouchEnd={() => this.hideItem(timerControl, Timer)}
              onMouseDown={() => this.revealItem(timerControl)}
              onMouseUp={() => this.hideItem(timerControl, Timer)}
              onMouseLeave={() => this.hideItem(timerControl, Timer)}
            >
              Show me
            </button>
          )}
        </Timer>
        {this.state.showItem ? <p>{this.props.item}</p> : null}
      </Fragment>
    )
  }
}
export class Questions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  renderAnswers(answers, questionIndex) {
    const key = `question-${questionIndex}`
    return answers.map(({ label, value }, i) => {
      return (
        <div key={`${key}-answer-${i}`}>
          <input
            onChange={() => {
              const newState = { ...this.state, [questionIndex]: value }
              this.setState(newState)
              this.props.onChange('questions', newState)
            }}
            type="radio"
            name={key}
            id={`${key}-answer-${i}`}
            value={value}
            checked={value === this.state[questionIndex]}
          />
          <label htmlFor={`${key}-answer-${i}`}>{label}</label>
        </div>
      )
    })
  }

  render() {
    return (
      <Fragment>
        <div>Now answer some questions about what you just read</div>
        Is this the first question?
        {this.renderAnswers(
          [
            { label: 'yes', value: 'y' },
            { label: 'no', value: 'n' },
            { label: 'why do you need three possible answers?', value: 'why' },
            { label: "fuck the binary, that's why", value: 'nb' },
          ],
          0
        )}
      </Fragment>
    )
  }
}
export const Tasks = () => {
  return <div>And now do some task(s)</div>
}
