import React from 'react'
import PropTypes from 'prop-types'
import { itemPropType } from '../lib/prop-types'
import StepWizard from 'react-step-wizard'
import Read from './Read'
import Questions from './Questions'
import Tasks from './Tasks'
import '../styles/Item.css'

const Nav = props => {
  const isLastStep = props.currentStep === props.totalSteps
  const isLastItem = props.isLastItem
  let buttonText = 'Next step'
  if (isLastStep) {
    buttonText = 'Next item'
    if (isLastItem) {
      buttonText = 'Finish'
    }
  }

  const steps = new Array(props.totalSteps).fill()
  return (
    <div className="centered-content">
      <div>
        {steps.map((_, i) => {
          const active = props.currentStep - 1 === i
          const red = '#c50e1f'
          return (
            <svg height="14" width="14" key={`nav-circle-${i}`}>
              <circle
                cx="7"
                cy="7"
                r="6"
                fill={active ? red : 'none'}
                stroke={red}
              />
            </svg>
          )
        })}
      </div>
      <button
        className="btn"
        disabled={!!props.preventNext}
        onClick={() => {
          if (isLastStep) {
            props.onNextItem()
            props.firstStep()
          } else {
            props.nextStep()
          }
          props.onScrollToTop()
        }}
      >
        {buttonText}
      </button>
      {props.preventNext ? (
        <span className="note">{props.preventNext}</span>
      ) : null}
    </div>
  )
}

const initialState = {
  readingTime: 0, // in milliseconds
  questions: {},
  cloze: [],
}

class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...initialState }
  }

  componentDidMount() {
    this.initializeState()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.index !== this.props.index) {
      this.initializeState()
    }
  }

  initializeState() {
    const initialCloze = this.props.item.clozes.map(cloze => {
      return { original: cloze.original, entered: '', isCorrect: false }
    })
    this.setState({ ...initialState, cloze: initialCloze })
  }

  getWizardSteps() {
    const { item } = this.props
    const steps = [
      <Read
        key="Read"
        item={item}
        onTimeUpdate={time => {
          const readingTime = time
          let preventNext = this.state.preventNext
          console.log(time)
          if (time < 5000 && !preventNext) {
            preventNext =
              'Please hold "Show Paragraph" and read the text carefully.'
          } else if (time >= 5000 && preventNext) {
            preventNext = ''
          }
          this.setState({ readingTime, preventNext })
        }}
        onPreventNext={reason => this.setState({ preventNext: reason })}
        onAllowNext={() => this.setState({ preventNext: '' })}
        preventNext={!!this.state.preventNext}
      />,

      <Questions
        key="Questions-general"
        onChange={(key, value) =>
          this.setState({
            questions: { ...this.state.questions, [key]: value },
          })
        }
        answers={this.state.questions}
        item={item}
        questionType="general"
        onPreventNext={reason => this.setState({ preventNext: reason })}
        onAllowNext={() => this.setState({ preventNext: '' })}
        preventNext={!!this.state.preventNext}
      />,
      <Tasks
        key="Tasks"
        item={item}
        onChange={(index, value) => {
          const newState = [...this.state.cloze]
          newState[index] = value
          this.setState({ cloze: newState })
        }}
        enteredData={this.state.cloze}
        onPreventNext={reason => this.setState({ preventNext: reason })}
        onAllowNext={() => this.setState({ preventNext: '' })}
        preventNext={!!this.state.preventNext}
      />,
    ]
    if (item.type === 'paragraph') {
      steps.push(
        <Questions
          key="Questions-hardestSentence"
          onChange={(key, value) =>
            this.setState({
              questions: { ...this.state.questions, [key]: value },
            })
          }
          answers={this.state.questions}
          item={item}
          questionType="hardestSentence"
          onPreventNext={reason => this.setState({ preventNext: reason })}
          onAllowNext={() => this.setState({ preventNext: '' })}
          preventNext={!!this.state.preventNext}
        />
      )
    }
    return steps
  }

  render() {
    const { index, isLastItem } = this.props
    return (
      <form
        onSubmit={e => e.preventDefault()}
        autoComplete="off"
        className="item-form"
      >
        <div className="centered-content">
          <h3>Text {index + 1}</h3>
        </div>
        <StepWizard
          nav={
            <Nav
              preventNext={this.state.preventNext}
              onNextItem={() => {
                const { readingTime, questions, cloze } = this.state
                this.props.onScrollToTop()
                this.props.onNextItem({ readingTime, questions, cloze })
              }}
              isLastItem={isLastItem}
              onScrollToTop={() => this.props.onScrollToTop()}
            />
          }
          transitions={{}}
          className="wizard"
        >
          {this.getWizardSteps()}
        </StepWizard>
      </form>
    )
  }
}

Item.propTypes = {
  index: PropTypes.number,
  item: itemPropType,
  isLastItem: PropTypes.bool,
  onScrollToTop: PropTypes.func,
  onNextItem: PropTypes.func,
}

Nav.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
  isLastItem: PropTypes.bool,
  onNextItem: PropTypes.func,
  firstStep: PropTypes.func,
  nextStep: PropTypes.func,
  onScrollToTop: PropTypes.func,
  preventNext: PropTypes.string,
}

export default Item
