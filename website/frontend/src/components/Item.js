import React from 'react'
import PropTypes from 'prop-types'
import { itemPropType } from '../lib/prop-types'
import StepWizard from 'react-step-wizard'
import Read from './Read'
import Questions from './Questions'
import Tasks from './Tasks'
import '../styles/Item.css'
import get from 'lodash.get'
import createStore from '../lib/create-store'

const itemDataStore = createStore('itemData', {
  deleteAfterSession: true,
})

const minReadingTime = 5000

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
              this.props.onNextStep(stepIndex + 1) // +1 because of index offset
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

    const previousSessionData = itemDataStore.get()
    if (previousSessionData) {
      this.state = {
        ...initialState,
        ...previousSessionData,
      }
    } else {
      this.state = { ...this.initializeState() }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.index !== this.props.index) {
      // reset state for new item
      this.setState({ ...this.initializeState() })
    }
  }

  initializeState() {
    const initialCloze = this.props.item.clozes.map(cloze => {
      return { original: cloze.original, entered: '', isCorrect: false }
    })
    itemDataStore.set({ random: this.props.random })
    const newState = {
      ...initialState,
      cloze: initialCloze,
      random: this.props.random,
    }
    return newState
  }

  updateData(key, value) {
    this.setState({ [key]: value })
    const prevData = itemDataStore.get()
    itemDataStore.set({ ...prevData, [key]: value })
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
            initialTime={this.state.readingTime}
            onTimeUpdate={time => {
              const readingTime = time
              let preventNext = this.state.preventNext
              if (time >= minReadingTime && preventNext) {
                preventNext = ''
              }
              this.updateData('readingTime', readingTime)
              this.setState({ preventNext })
            }}
          />
        ),
        requiredFields: [],
      },
    ]

    const questionStep = {
      component: (
        <Questions
          key="Questions-general"
          onChange={(key, value) =>
            this.updateData('questions', {
              ...this.state.questions,
              [key]: value,
            })
          }
          answers={this.state.questions}
          item={item}
          questionType="general"
        />
      ),
      requiredFields: requiredQuestions,
    }

    const clozeStep = {
      component: (
        <Tasks
          key="Tasks"
          item={item}
          onChange={(index, value) => {
            const newState = [...this.state.cloze]
            newState[index] = value
            this.updateData('cloze', newState)
          }}
          enteredData={this.state.cloze}
        />
      ),
      requiredFields: item.clozes.map((_, i) => {
        return `cloze[${i}].entered`
      }),
    }

    // randomize order of questions and cloze test
    if (item.clozes.length > 0) {
      if (this.state.random < 0.5) {
        steps.push(questionStep, clozeStep)
      } else {
        steps.push(clozeStep, questionStep)
      }
    } else {
      steps.push(questionStep)
    }

    if (item.type === 'paragraph') {
      steps.push({
        component: (
          <Questions
            key="Questions-hardestSentence"
            onChange={(key, value) =>
              this.updateData('questions', {
                ...this.state.questions,
                [key]: value,
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
    let stepIndex = this.state.stepIndex
    if (!stepIndex) {
      const restored = itemDataStore.get()
      if (restored) {
        stepIndex = restored.stepIndex
      } else {
        stepIndex = 1
      }
    }

    if (
      this.props.item.type === 'paragraph' &&
      !this.state.preventNext &&
      this.state.readingTime < minReadingTime
    ) {
      this.setState({
        preventNext: 'Please take your time to read the text carefully.',
      })
    }

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
              onNextStep={oldStepIndex => {
                this.updateData('stepIndex', oldStepIndex + 1)
              }}
              onNextItem={() => {
                const { readingTime, questions, cloze } = this.state
                this.props.onScrollToTop()
                this.props.onNextItem({ readingTime, questions, cloze })
                this.updateData('stepIndex', 1)
              }}
              isLastItem={isLastItem}
              onScrollToTop={() => this.props.onScrollToTop()}
              hasMissingFields={index => {
                const { requiredFields } = steps[index]
                for (const field of requiredFields) {
                  const enteredValue = get(this.state, field)
                  if (
                    typeof enteredValue === 'undefined' ||
                    enteredValue === ''
                  ) {
                    return true
                  }
                }
              }}
            />
          }
          initialStep={stepIndex}
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
  random: PropTypes.number,
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
  onNextStep: PropTypes.func,
}

export default Item
