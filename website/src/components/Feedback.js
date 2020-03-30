import React from 'react'
import PropTypes from 'prop-types'
import createDatabase from '../lib/create-database'

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
        />
      </div>
    )
  }

  renderRadioButtons(buttons) {
    return (
      <div>
        {buttons.map(({ key, label, value }) => {
          const id = `${key}-${value}`
          return (
            <div key={id}>
              <input
                type="radio"
                onChange={e => this.onChange(key, value)}
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
            this.database.post(this.state)
          }}
        >
          <div>
            <label>
              <strong>
                How well did you understand what you were supposed to do?
              </strong>
            </label>
            {this.renderRadioButtons([
              { key: '', label: 'completely', value: 1 },
              { key: '', label: 'more or less', value: 2 },
              { key: '', label: 'TODO', value: 3 },
              { key: '', label: 'a little bit', value: 4 },
              { key: '', label: 'not at all', value: 5 },
            ])}
          </div>
          <div>
            <label>
              <strong>
                For what (if anything) would you have liked a better / different
                explanation? What was unclear?
              </strong>
            </label>
            {this.renderTextArea('unclearInstructions')}
          </div>
          <div>
            <label>
              <strong>
                Were there any technical problems during the survey?
              </strong>
            </label>
            {this.renderRadioButtons([
              { key: 'hadTechnicalProblems', label: 'Yes', value: true },
              { key: 'hadTechnicalProblems', label: 'No', value: false },
            ])}
          </div>
          {this.state.hadTechnicalProblems ? (
            <div>
              <label>
                <strong>Please describe them in a few words:</strong>
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
          <button className="btn">Submit</button>
        </form>
      </div>
    )
  }
}
Feedback.propTypes = {
  participantId: PropTypes.string,
}

export default Feedback
