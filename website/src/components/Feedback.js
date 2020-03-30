import React, { Fragment } from 'react'

class Feedback extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      technicalProblems: undefined,
      technicalProblemsDetails: '',
      notes: '',
    }
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
        <form>
          <div>
            <label>
              <strong>
                How well did you understand what you were supposed to do and how
                to do it?
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
              { key: 'technicalProblems', label: 'Yes', value: true },
              { key: 'technicalProblems', label: 'No', value: false },
            ])}
          </div>
          {this.state.technicalProblems ? (
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
        </form>
      </div>
    )
  }
}

export default Feedback
