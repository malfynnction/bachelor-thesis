import React from 'react'
import '../styles/demographics.css'

const defaultState = {
  yearOfBirth: '',
  nativeLang: '',
  gender: '',
  genderText: '',
  gerLevel: '',
}

class Demographics extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...defaultState }
  }

  renderQuestion(label, key, type, options = []) {
    return (
      <div>
        <label htmlFor={key} className="block">
          <strong>{label}</strong>
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
            {options.map(level => {
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
            const data = { ...this.state }
            if (data.gender === 'text') {
              data.gender = data.genderText
            }
            this.props.createUser(data)
          }}
          action="/session"
          className="centered-content demographics-form"
        >
          {this.renderQuestion('Year of birth: ', 'yearOfBirth', 'dropdown', [
            '1920-1930',
            '1930-1940',
            '1940-1950',
            '1950-1960',
            '1960-1970',
            '1970-1980',
            '1980-1990',
            '1990-2000',
            '2000-2010',
          ])}
          <strong>Gender:</strong>
          <div>
            {[
              { key: 'female', label: 'Female' },
              { key: 'male', label: 'Male' },
              { key: 'nonbinary', label: 'Non-Binary' },
            ].map(({ key, label }) => (
              <div key={`gender-${key}`}>
                <input
                  type="radio"
                  name="gender"
                  id={`gender-${key}`}
                  value={key}
                  checked={this.state.gender === key}
                  onChange={e => this.setState({ gender: key })}
                />
                <label htmlFor={`gender-${key}`}>{label}</label>
              </div>
            ))}
            <div>
              <input
                type="radio"
                name="gender"
                id="gender-other"
                value="other"
                checked={this.state.gender === 'text'}
                onChange={e => this.setState({ gender: 'text' })}
              />
              <label htmlFor="gender-other" className="screenreader-only">
                Other (please write your answer in the text field)
              </label>
              <input
                type="text"
                name="gender-text"
                id="gender-text"
                value={this.state.genderText}
                placeholder="Other"
                onChange={e =>
                  this.setState({ gender: 'text', genderText: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="radio"
                name="gender"
                id="gender-notDisclosed"
                value="notDisclosed"
                checked={this.state.gender === 'notDisclosed'}
                onChange={e => this.setState({ gender: 'notDisclosed' })}
              />
              <label htmlFor="gendernotDisclosed">Prefer not to say</label>
            </div>
          </div>
          {this.renderQuestion('Native Language: ', 'nativeLang', 'text')}
          {this.renderQuestion(
            'German Language Level: ',
            'gerLevel',
            'dropdown',
            ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
          )}
          <button type="submit">Start</button>
          <div className="start-label">
            By clicking on "Start" you will be assigned a participant ID. Please
            remember it so you can skip this step if you do another session in
            the future.
          </div>
        </form>
      </div>
    )
  }
}

export default Demographics
