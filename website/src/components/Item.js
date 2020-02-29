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
        onTimeUpdate={time => this.setState({ readingTime: time })}
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
        <h3>Item {index + 1}</h3>
        <StepWizard
          nav={
            <Nav
              onNextItem={() => {
                this.props.onScrollToTop()
                this.props.onNextItem(this.state)
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
}

export default Item
