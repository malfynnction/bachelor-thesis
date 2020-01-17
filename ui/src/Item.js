import React, { Fragment } from 'react'
import StepWizard from 'react-step-wizard'
import { Read, Questions, Tasks } from './Steps'

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
        {buttonText}
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
    const { item, index, isLastItem } = this.props
    return (
      <form onSubmit={e => e.preventDefault()}>
        <h3>Item {index}</h3>
        <StepWizard
          nav={
            <Nav
              onNextItem={() => this.props.onNextItem(this.state)}
              isLastItem={isLastItem}
            />
          }
        >
          <Read
            item={item}
            onTimeUpdate={time => this.setState({ readingTime: time })}
          />

          <Questions />
          <Tasks />
        </StepWizard>
      </form>
    )
  }
}

export default Item
