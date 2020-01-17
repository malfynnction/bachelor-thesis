import React, { Fragment } from 'react'
import StepWizard from 'react-step-wizard'
import { Read, Questions, Tasks } from './Steps'

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

class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      readingTime: 0, // in milliseconds
    }
  }

  render() {
    const { item, index } = this.props
    return (
      <Fragment>
        <h3>Item {index}</h3>
        <StepWizard nav={<Nav onNextItem={() => this.props.onNextItem()} />}>
          <Read
            item={item}
            onTimeUpdate={time => this.setState({ readingTime: time })}
          />
          <Questions />
          <Tasks />
        </StepWizard>
      </Fragment>
    )
  }
}

export default Item