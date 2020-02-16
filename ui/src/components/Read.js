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

  splitParagraphOnSentence(paragraph, sentence) {
    return
  }

  renderParagraph({ text }) {
    return (
      <Timer startImmediately={false} timeToUpdate={100}>
        {timerControl => (
          <Fragment>
            <p className={`item-text centered-content`}>
              <span>
                <span className={`${this.state.showItem ? '' : 'hidden'}`}>
                  <span
                    className="hidden-content"
                    dangerouslySetInnerHTML={{ __html: text }}
                  ></span>
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
      </Fragment>
    )
  }

  render() {
    const { item } = this.props
    const isSentence = item.type === 'sentence'

    return (
      <Fragment>
        <div>Here is a {item.type} that you should read: </div>
        {isSentence ? this.renderSentence(item) : this.renderParagraph(item)}
      </Fragment>
    )
  }
}

export default Read
