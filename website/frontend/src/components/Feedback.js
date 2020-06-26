import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import createDatabase from '../lib/create-database'
import '../styles/Feedback.css'

class Feedback extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      participantId: props.participantId,
      hadTechnicalProblems: undefined,
      technicalProblemsDetails: '',
      notes: '',
    }
    this.database = createDatabase('feedback')
  }

  onChange(key, value) {
    this.setState({ [key]: value })
  }

  renderTextArea(key) {
    return (
      <div>
        <textarea
          id={key}
          name={key}
          value={this.state[key]}
          onChange={e => this.onChange(key, e.target.value)}
          className="feedback-textarea"
        />
      </div>
    )
  }

  renderRadioButtons(key, buttons) {
    return (
      <div>
        {buttons.map(({ label, value }) => {
          const id = `${key}-${value}`
          return (
            <div key={id}>
              <input
                type="radio"
                onChange={() => this.onChange(key, value)}
                checked={this.state[key] === value}
                id={id}
              />
              <label htmlFor={id}>{label}</label>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div className="tu-border tu-glow center-box">
        <div className="centered-content">
          <h2>Feedback</h2>
          <div>
            Thank you for giving us feedback about the study so we can improve
            it in the future!
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          <div>
            <label>
              <strong>
                How well did you understand what you were supposed to do?
              </strong>
            </label>
            {this.renderRadioButtons('didUnderstandInstructions', [
              { label: 'completely', value: 1 },
              { label: 'more or less', value: 2 },
              { label: 'TODO', value: 3 },
              { label: 'a little bit', value: 4 },
              { label: 'not at all', value: 5 },
            ])}
          </div>
          <div>
            <label htmlFor="unclearInstructions">
              <strong>
                What was unclear? For what (if anything) would you have liked a
                better / different explanation?
              </strong>
            </label>
            {this.renderTextArea('unclearInstructions')}
          </div>
          <div>
            <label>
              <strong>
                Was there a moment where you wanted to give a specific answer
                but weren't able to?{' '}
              </strong>
              <span className="note">
                (e.g. because of a pre-defined set of answers where your option
                was missing)
              </span>
            </label>
            {this.renderRadioButtons('unableToAnswerCorrectly', [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ])}
          </div>
          {this.state.unableToAnswerCorrectly ? (
            <div>
              <label htmlFor="unableToAnswerCorrectlyDetails">
                <strong>
                  When did that happen and what did you want to answer?
                </strong>
              </label>
              {this.renderTextArea('unableToAnswerCorrectlyDetails')}
            </div>
          ) : null}
          <div>
            <label>
              <strong>
                Were there any technical problems during the survey?
              </strong>
            </label>
            {this.renderRadioButtons('hadTechnicalProblems', [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ])}
          </div>
          {this.state.hadTechnicalProblems ? (
            <div>
              <label htmlFor="technicalProblemsDetails">
                <strong>Please describe the problems in a few words:</strong>
              </label>
              {this.renderTextArea('technicalProblemsDetails')}
            </div>
          ) : null}
          <div>
            <label htmlFor="notes">
              <strong>Is there anything else you want to say?</strong>
            </label>
            {this.renderTextArea('notes')}
          </div>
          <Link
            className="btn"
            to="/start-session?prev=Feedback"
            onClick={() => {
              this.database.post(this.state)
            }}
          >
            Submit
          </Link>
        </form>
      </div>
    )
  }
}
Feedback.propTypes = {
  participantId: PropTypes.string,
}

export default Feedback
