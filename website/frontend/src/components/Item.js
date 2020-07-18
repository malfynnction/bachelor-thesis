import React from 'react'
import PropTypes from 'prop-types'
import { itemPropType } from '../lib/prop-types'
import StepWizard from 'react-step-wizard'
import Read from './Read'
import Questions from './Questions'
import Tasks from './Tasks'
import '../styles/Item.css'
import get from 'lodash.get'

class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasMissingFields: false }
  }
  render() {
    const isLastStep = this.props.currentStep === this.props.totalSteps
    const isLastItem = this.props.isLastItem
    let buttonText = 'Next step'
    if (isLastStep) {
      buttonText = 'Next item'
      if (isLastItem) {
        buttonText = 'Finish'
      }
    }

    const steps = new Array(this.props.totalSteps).fill()
    return (
      <div className="centered-content">
        <div>
          {steps.map((_, i) => {
            const active = this.props.currentStep - 1 === i
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
          disabled={!!this.props.preventNext}
          onClick={() => {
            const stepIndex = this.props.currentStep - 1
            const hasMissingFields = this.props.hasMissingFields(stepIndex)
            this.setState({ hasMissingFields })
            if (hasMissingFields) {
              return false
            } else if (isLastStep) {
              this.props.onNextItem()
              this.props.firstStep()
              this.props.onScrollToTop()
            } else {
              this.props.nextStep()
              this.props.onScrollToTop()
            }
          }}
        >
          {buttonText}
        </button>
        {this.props.preventNext || this.state.hasMissingFields ? (
          <span className="note">
            {this.props.preventNext ||
              'Please answer all questions before proceeding to the next step.'}
          </span>
        ) : null}
      </div>
    )
  }
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
    const requiredQuestions = [
      'questions.readability',
      'questions.complexity',
      'questions.understandability',
    ]
    if (item.type === 'sentence') {
      requiredQuestions.push('questions.paragraphNecessary')
    }
    const steps = [
      {
        component: (
          <Read
            key="Read"
            item={item}
            onTimeUpdate={time => {
              const readingTime = time
              let preventNext = this.state.preventNext
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
          />
        ),
        requiredFields: [],
      },
      {
        component: (
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
          />
        ),
        requiredFields: requiredQuestions,
      },
    ]
    if (item.clozes.length > 0) {
      steps.push({
        component: (
          <Tasks
            key="Tasks"
            item={item}
            onChange={(index, value) => {
              const newState = [...this.state.cloze]
              newState[index] = value
              this.setState({ cloze: newState })
            }}
            enteredData={this.state.cloze}
          />
        ),
        requiredFields: item.clozes.map((_, i) => {
          return `cloze[${i}].entered`
        }),
      })
    }
    if (item.type === 'paragraph') {
      steps.push({
        component: (
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
        ),
        requiredFields: ['questions.hardestSentence'],
      })
    }
    return steps
  }

  render() {
    const { index, isLastItem } = this.props
    const steps = this.getWizardSteps()
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
              hasMissingFields={index => {
                const { requiredFields } = steps[index]
                for (const field of requiredFields) {
                  const enteredValue = get(this.state, field)
                  if (!enteredValue) {
                    return true
                  }
                }
              }}
            />
          }
          transitions={{}}
          className="wizard"
        >
          {steps.map(step => step.component)}
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
  hasMissingFields: PropTypes.func,
}

export default Item
