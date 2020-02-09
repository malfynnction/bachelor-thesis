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
    return paragraph.split(sentence)
  }

  render() {
    const { item } = this.props
    const isSentence = item.type === 'sentence'
    const text =
      isSentence &&
      this.splitParagraphOnSentence(item.enclosingParagraph, item.text)
    return (
      <Fragment>
        <div>Here is a {item.type} that you should read: </div>
        <Timer startImmediately={false} timeToUpdate={100}>
          {timerControl => (
            <Fragment>
              <p className={`item-text centered-content text-box`}>
                <span>
                  {isSentence ? text[0] : null}
                  <span
                    className={`hidden-wrapper ${
                      this.state.showItem ? '' : 'hidden'
                    }`}
                  >
                    <span
                      className="hidden-content"
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    ></span>
                  </span>
                  {isSentence ? text[1] : null}
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
