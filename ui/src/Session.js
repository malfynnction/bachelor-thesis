import React, { Fragment } from 'react'
import shuffle from 'lodash.shuffle'
import StepWizard from 'react-step-wizard'
import { Read, Questions, Tasks } from './Steps'

const getItemsToRate = () => {
  return [
    'First Sentence',
    'Second Sentence',
    "Now here's a paragraph",
    'And another paragraph',
  ]
}

const Nav = props => {
  const isLastStep = props.currentStep === props.totalSteps
  return (
    <Fragment>
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
        {isLastStep ? 'Next item' : 'Next step'}
      </button>
    </Fragment>
  )
}

class Session extends React.Component {
  constructor(props) {
    super(props)
    const items = getItemsToRate()
    this.state = { index: 0, items: shuffle(items) }
  }
  render() {
    return (
      <Fragment>
        <h3>Item {this.state.index}</h3>
        <StepWizard
          nav={
            <Nav
              onNextItem={() => {
                if (this.state.index + 1 < this.state.items.length) {
                  this.setState({ index: this.state.index + 1 })
                } else {
                  window.location.href = 'http://localhost:3000'
                }
              }}
            />
          }
        >
          <Read item={this.state.items[this.state.index]} />
          <Questions />
          <Tasks />
        </StepWizard>
      </Fragment>
    )
  }
}

export default Session
