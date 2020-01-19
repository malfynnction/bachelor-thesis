import React, { Fragment } from 'react'
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
    <Fragment>
      <div>
        {steps.map((_, i) => {
          return props.currentStep - 1 === i ? 'x' : 'o'
        })}
      </div>
      <button
        onClick={() => {
          if (isLastStep) {
            props.onNextItem()
            props.firstStep()
          } else {
            props.nextStep()
          }
        }}
      >
        {buttonText}
      </button>
    </Fragment>
  )
}

const initialState = {
  readingTime: 0, // in milliseconds
  questions: {},
  tasks: {},
}

class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ...initialState,
    }
  }

  render() {
    const { item, index, isLastItem } = this.props
    return (
      <form onSubmit={e => e.preventDefault()}>
        <h3>Item {index}</h3>
        <StepWizard
          nav={
            <Nav
              onNextItem={() => {
                this.props.onNextItem(this.state)
                this.setState({ ...initialState })
              }}
              isLastItem={isLastItem}
            />
          }
          className="wizard"
        >
          <Read
            item={item}
            onTimeUpdate={time => this.setState({ readingTime: time })}
          />

          <Questions
            onChange={(key, value) =>
              this.setState({
                questions: { ...this.state.questions, [key]: value },
              })
            }
            answers={this.state.questions}
          />
          <Tasks />
        </StepWizard>
      </form>
    )
  }
}

export default Item
