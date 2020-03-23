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
    <p>I will tell you a lot of things here</p> {/* TODO */}
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi convallis
      diam odio, ut iaculis neque feugiat a. Maecenas vitae ligula orci. Fusce
      arcu lacus, sagittis eget leo eget, condimentum tempor sapien. Duis eu
      orci mi. Etiam sit amet nibh eu neque aliquam sagittis. Aliquam erat
      volutpat. Vestibulum efficitur lectus et sapien varius dapibus eu eu dui.
      Aenean dictum, odio eget malesuada tempor, justo justo feugiat nisl, id
      pellentesque augue lectus egestas metus. Quisque tincidunt tortor neque,
      eu facilisis ligula placerat a. Vestibulum ante ipsum primis in faucibus
      orci luctus et ultrices posuere cubilia Curae; In semper a tellus vitae
      consequat. Nulla sodales dolor et aliquet bibendum. Morbi eget nisl non
      felis venenatis dictum. Nam faucibus condimentum enim, ac tempus sapien
      vulputate nec. Vivamus dapibus lectus quis arcu venenatis convallis. Nulla
      quis ultrices est. Pellentesque tempor libero ut porttitor ornare. Sed
      nulla nisl, tempus eu ultricies eget, egestas vitae erat. Vestibulum
      ultricies, lorem ut ullamcorper tincidunt, massa dui commodo tellus, non
      aliquet mi tellus ac leo. In commodo ante sem, vitae lacinia diam mattis
      ac. Cras convallis sem tempus auctor tempor. Suspendisse id facilisis
      turpis, eu dapibus est. Praesent suscipit odio et sapien laoreet, quis
      egestas dolor sagittis. Maecenas accumsan venenatis quam sed blandit.
      Mauris pellentesque enim sed dignissim eleifend. Curabitur massa eros,
      condimentum semper nisl non, volutpat feugiat nulla. Phasellus faucibus
      massa at lectus interdum aliquam. Cras libero dolor, pharetra ac odio eu,
      bibendum dictum nulla. In hac habitasse platea dictumst. Vestibulum
      sodales, diam sed pulvinar finibus, justo elit venenatis dui, egestas
      vestibulum mi nisl ut justo. Suspendisse ut purus enim. Pellentesque at
      tincidunt nunc, eleifend scelerisque lacus. Duis facilisis imperdiet
      faucibus. Mauris accumsan augue ac quam pellentesque vehicula. Donec
      dictum leo et aliquet tincidunt. Nulla lobortis nibh congue augue
      efficitur, ut tincidunt mi elementum. Proin non pretium velit. Praesent
      imperdiet ultrices pulvinar. Pellentesque placerat sit amet tellus sed
      bibendum. Cras placerat dolor mauris, nec fermentum risus viverra ut.
      Suspendisse in metus lacinia, laoreet leo ultrices, pulvinar felis.
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames
      ac turpis egestas. Nullam dignissim tellus eu ex ultricies, vel posuere
      justo facilisis. Phasellus viverra congue nisi, id maximus dolor vulputate
      non. Nullam mollis vestibulum dolor vitae venenatis. Nullam nunc felis,
      gravida et finibus id, interdum vel felis. Proin mattis elit vitae
      pellentesque euismod. Aliquam volutpat, lorem ut facilisis condimentum,
      mauris neque placerat orci, vitae eleifend ligula mi a turpis. Mauris
      interdum diam non est congue dapibus. Sed sit amet blandit mi, vel feugiat
      turpis. Nunc pharetra feugiat odio in tincidunt. Vestibulum id consectetur
      justo. Quisque vitae est erat. Vestibulum ante ipsum primis in faucibus
      orci luctus et ultrices posuere cubilia Curae; Aenean a feugiat arcu.
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

          <input
            type="checkbox"
            checked={this.state.dataConsent}
            onChange={e => {
              this.setState({ dataConsent: e.target.checked })
            }}
          />
          <label>
            I have read the{' '}
            <span
              onClick={() => {
                this.setState({ showConsentForm: true })
              }}
              className="clickable"
            >
              consent notification {/* TODO */}
            </span>
            and agree to participate in this study.
          </label>
          {this.state.showConsentForm ? (
            <div className="consent-form">
              {consentForm}
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
          <Link
            className={`btn ${this.state.dataConsent ? '' : 'btn-disabled'}`}
            type="submit"
            to="/start-session"
            onClick={e => {
              if (!this.state.dataConsent) {
                e.preventDefault()
              }
              const data = { ...this.state.data }
              if (data.gender === 'text') {
                data.gender = data.genderText
              }
              delete data.genderText
              this.props.createUser(data)
            }}
          >
            Start
          </Link>
        </form>
      </div>
    )
  }
}

Demographics.propTypes = {
  createUser: PropTypes.func,
}

export default Demographics
