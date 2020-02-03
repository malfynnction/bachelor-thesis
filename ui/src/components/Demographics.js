import React from 'react'
import '../styles/demographics.css'

const defaultState = {
  age: '',
  nativeLang: '',
  gender: '',
  gerLevel: '',
}

class Demographics extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...defaultState }
  }

  renderQuestion(label, key, type) {
    return (
      <div>
        <label htmlFor={key} className="block">
          {label}
        </label>
        {type === 'dropdown' ? (
          <select
            onChange={e => {
              this.setState({ [key]: e.target.value })
            }}
            value={this.state[key]}
            required
          >
            <option value={''} disabled>
              Please Select
            </option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
              return (
                <option value={level} key={level}>
                  {level}
                </option>
              )
            })}
          </select>
        ) : (
          <input
            onChange={e => {
              this.setState({ [key]: e.target.value })
            }}
            id={key}
            name={key}
            type={type}
            value={this.state[key]}
            required
          />
        )}
      </div>
    )
  }

  render() {
    return (
      <div className="tu-border tu-glow center-box centered-content">
        <h3>Demographic Questions</h3>
        <div>Please fill out the questions below for statistical reasons:</div>
        <form
          onSubmit={() => {
            this.props.createUser(this.state)
          }}
          action="/session"
          className="centered-content demographics-form"
        >
          {this.renderQuestion('Age: ', 'age', 'number')}
          {this.renderQuestion('Gender: ', 'gender', 'text')}
          {this.renderQuestion('Native Language: ', 'nativeLang', 'text')}
          {this.renderQuestion(
            'German Language Level: ',
            'gerLevel',
            'dropdown',
            []
          )}
          <button type="submit">Start</button>
          <div className="start-label">
            By clicking on "Start", you will be assigned a participant ID.
            Please remember it so you can skip this step if you do another
            session in the future.
          </div>
        </form>
      </div>
    )
  }
}

export default Demographics
