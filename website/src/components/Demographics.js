import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import '../styles/Demographics.css'

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
      <div className="centered-content">
        <label htmlFor={key} className="block question-label">
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
            {options.map(option => {
              return (
                <option value={option.value || option} key={option}>
                  {option.label || option}
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
          onSubmit={e => {
            e.preventDefault()
          }}
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
            { label: 'Prefer not to say', value: 'notDisclosed' },
          ])}
          <strong>Gender(s)*:</strong>
          <div>
            {[
              { key: 'female', label: 'Female' },
              { key: 'male', label: 'Male' },
              { key: 'nonbinary', label: 'Non-Binary' },
              { key: 'notDisclosed', label: 'Prefer not to say' },
            ].map(({ key, label }) => (
              <div key={`gender-${key}`}>
                <input
                  type="radio"
                  name="gender"
                  id={`gender-${key}`}
                  value={key}
                  checked={this.state.gender === key}
                  onChange={() => this.setState({ gender: key })}
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
                onChange={() => this.setState({ gender: 'text' })}
              />
              <label htmlFor="gender-other" className="screenreader-only">
                Other (please write your answer in the text field)
              </label>
              <input
                type="text"
                name="gender-text"
                id="gender-text"
                value={this.state.genderText}
                onChange={e =>
                  this.setState({ gender: 'text', genderText: e.target.value })
                }
              />
            </div>
          </div>
          {this.renderQuestion('Native Language(s)*: ', 'nativeLang', 'text')}
          {this.renderQuestion(
            'German Language Level: ',
            'gerLevel',
            'dropdown',
            [
              'A1',
              'A2',
              'B1',
              'B2',
              'C1',
              'C2',
              { label: "I don't know", value: 'notDisclosed' },
            ]
          )}
          <div className="note">*separate multiple entries by commas</div>
          <Link
            className="btn"
            type="submit"
            to="/start-session"
            onClick={() => {
              const data = { ...this.state }
              if (data.gender === 'text') {
                data.gender = data.genderText
              }
              this.props.createUser(data)
            }}
          >
            Start
          </Link>
          <div className="start-label">
            After clicking on "Start" you can find your participant ID in the
            top right corner. Please remember it so you can skip this step if
            you come back in the future.
          </div>
        </form>
      </div>
    )
  }
}

Demographics.propTypes = {
  createUser: PropTypes.func,
}

export default Demographics
