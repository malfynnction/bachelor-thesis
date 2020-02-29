import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Timer from 'react-compound-timer'
import '../styles/Read.css'
import { itemPropType } from '../lib/prop-types'

const spaceKeyCode = 32

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

  renderParagraph({ text }) {
    return (
      <Timer startImmediately={false} timeToUpdate={100}>
        {timerControl => (
          <Fragment>
            <p className={`item-text centered-content`}>
              <span>
                <span className={`${this.state.showItem ? '' : 'hidden'}`}>
                  <span className="hidden-content">{text}</span>
                </span>
              </span>
            </p>
            <button
              className="btn button-secondary"
              onTouchStart={() => this.revealItem(timerControl)}
              onTouchEnd={() => this.hideItem(timerControl, Timer)}
              onMouseDown={() => this.revealItem(timerControl)}
              onMouseUp={() => this.hideItem(timerControl, Timer)}
              onMouseLeave={() => this.hideItem(timerControl, Timer)}
              onKeyDown={e => {
                if (e.keyCode === spaceKeyCode) {
                  this.revealItem(timerControl)
                }
              }}
              onKeyUp={e => {
                if (e.keyCode === spaceKeyCode) {
                  this.hideItem(timerControl, Timer)
                }
              }}
            >
              Show Paragraph
            </button>
          </Fragment>
        )}
      </Timer>
    )
  }

  renderSentence({ text, enclosingParagraph }) {
    const splitText = enclosingParagraph.split(text)
    return (
      <Fragment>
        <div className="item-text centered-content">{text}</div>
        <div className="enclosing-paragraph">
          If you need more context, here is the paragraph the sentence was taken
          from: <br />
          (You don't have to read this, but it can help you understand the
          sentence above.)
          <div className="item-text">
            {splitText[0]}
            <strong>{text}</strong>
            {splitText[1]}
          </div>
        </div>
      </Fragment>
    )
  }

  render() {
    const { item } = this.props
    const isSentence = item.type === 'sentence'

    return (
      <Fragment>
        <div>This is the {item.type} you will be rating: </div>
        {isSentence ? this.renderSentence(item) : this.renderParagraph(item)}
      </Fragment>
    )
  }
}

Read.propTypes = { onTimeUpdate: PropTypes.func, item: itemPropType }

export default Read
