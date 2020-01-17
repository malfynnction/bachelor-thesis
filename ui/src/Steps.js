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
            <Fragment>
              <button
                onTouchStart={() => this.revealItem(timerControl)}
                onTouchEnd={() => this.hideItem(timerControl, Timer)}
                onMouseDown={() => this.revealItem(timerControl)}
                onMouseUp={() => this.hideItem(timerControl, Timer)}
                onMouseLeave={() => this.hideItem(timerControl, Timer)}
              >
                Show me
              </button>
            </Fragment>
          )}
        </Timer>
        {this.state.showItem ? <p>{this.props.item}</p> : null}
      </Fragment>
    )
  }
}
export const Questions = () => {
  return <div>Now answer some questions about what you just read</div>
}
export const Tasks = () => {
  return <div>And now do some task(s)</div>
}
