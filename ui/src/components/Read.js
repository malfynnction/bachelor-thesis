import React, { Fragment } from 'react'
import Timer from 'react-compound-timer'
import '../styles/Read.css'

class Read extends React.Component {
  constructor(props) {
    super(props)
    this.state = { showItem: false }
  }

  revealItem(timerControl) {
    timerControl.start()
    this.setState({ showItem: true })
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
              <div
                className={`item-text centered-content ${
                  this.state.showItem ? 'display' : 'hidden'
                }`}
              >
                <p>{this.props.item}</p>
              </div>
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
      </Fragment>
    )
  }
}

export default Read
