import React from 'react'
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
    this.state = {
      ...initialState,
    }
  }

  render() {
    const { item, index, isLastItem } = this.props
    return (
      <form
        onSubmit={e => e.preventDefault()}
        autoComplete="off"
        className="item-form"
      >
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
          transitions={{}}
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
          <Tasks
            item={item}
            onChange={(index, value) => {
              const newState = [...this.state.cloze]
              newState[index] = value
              this.setState({ cloze: newState })
            }}
            enteredData={this.state.cloze}
          />
        </StepWizard>
      </form>
    )
  }
}

export default Item
