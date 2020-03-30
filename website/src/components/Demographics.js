import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import '../styles/Demographics.css'

const defaultState = {
  age: '',
  nativeLang: '',
  gender: '',
  genderText: '',
  gerLevel: '',
}

const consentForm = (
  <Fragment>
    <h5>Consent Form</h5>
    <p>
      Your participation in this research study is voluntary. You may choose not
      to participate. If you decide to participate in this research survey, you
      may withdraw at any time without giving any reason. If you decide not to
      participate in this study or if you withdraw from participating at any
      time, you will not be penalized.
    </p>

    <p>
      Your responses will be confidential and we do not collect identifying
      information such as your name, email address or IP address. Your answers
      will be saved anonymously, using only an automatically generated
      participant ID to identify you. No personal data other than the
      demographic TODO above will be saved or published.
    </p>

    <p>Clicking on the "I Agree" button below indicates that:</p>
    <ul>
      <li>you have read the above information</li>
      <li>
        you have been informed about the content and procedure of the study
      </li>
      <li>you voluntarily agree to participate</li>
      <li>you are at least 18 years of age</li>
    </ul>
    <p>
      If you do not wish to participate in the research study, you can simply
      close this website.
    </p>
  </Fragment>
)

class Demographics extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: { ...defaultState },
      dataConsent: false,
      showConsentForm: false,
    }
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
              this.setState({
                data: { ...this.state.data, [key]: e.target.value },
              })
            }}
            value={this.state.data[key]}
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
              this.setState({
                data: { ...this.state.data, [key]: e.target.value },
              })
            }}
            id={key}
            name={key}
            type={type}
            value={this.state.data[key]}
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
          {this.renderQuestion('Age: ', 'age', 'dropdown', [
            '18-26',
            '27-32',
            '33-40',
            '41-55',
            '56+',
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
                  checked={this.state.data.gender === key}
                  onChange={() =>
                    this.setState({ data: { ...this.state.data, gender: key } })
                  }
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
                checked={this.state.data.gender === 'text'}
                onChange={() =>
                  this.setState({
                    data: { ...this.state.data, gender: 'text' },
                  })
                }
              />
              <label htmlFor="gender-other" className="screenreader-only">
                Other (please write your answer in the text field)
              </label>
              <input
                type="text"
                name="gender-text"
                id="gender-text"
                value={this.state.data.genderText}
                onChange={e =>
                  this.setState({
                    data: {
                      ...this.state.data,
                      gender: 'text',
                      genderText: e.target.value,
                    },
                  })
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
              'Native',
              { label: "I don't know", value: 'notDisclosed' },
            ]
          )}
          <div className="note">*separate multiple entries by commas</div>

          <div className="start-label centered-text">
            After clicking on "Start" you can find your participant ID in the
            top right corner. Please remember it so you can skip this step if
            you come back in the future.
          </div>

          <Link
            className={`btn ${this.state.dataConsent ? '' : 'btn-disabled'}`}
            type="submit"
            to="/start-survey"
            onClick={e => {
              if (!this.state.dataConsent) {
                e.preventDefault()
              } else {
                const data = { ...this.state.data }
                if (data.gender === 'text') {
                  data.gender = data.genderText
                }
                delete data.genderText
                this.props.createUser(data)
              }
            }}
          >
            Start
          </Link>
          <div>
            <input
              type="checkbox"
              checked={this.state.dataConsent}
              onChange={e => {
                this.setState({ dataConsent: e.target.checked })
              }}
            />
            <label className="checkbox-label">
              I have read the{' '}
              <span
                onClick={() => {
                  this.setState({ showConsentForm: true })
                }}
                className="clickable"
              >
                consent notification {/* TODO */}
              </span>
              and want to participate in this study.
            </label>
          </div>
          {this.state.showConsentForm ? (
            <div className="consent-form">
              {consentForm}
              <br />
              <button
                className="btn"
                onClick={e => {
                  e.preventDefault()
                  this.setState({ showConsentForm: false, dataConsent: true })
                }}
              >
                I Agree
              </button>
            </div>
          ) : null}
        </form>
      </div>
    )
  }
}

Demographics.propTypes = {
  createUser: PropTypes.func,
}

export default Demographics
