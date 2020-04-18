import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { databasePropType } from '../lib/prop-types'
import createStore from '../lib/create-store'
import { Link, withRouter } from 'react-router-dom'
import '../styles/Instructions.css'

const participantId = createStore('participantId')

const Instructions = props => {
  const doesIdExist = id => {
    return pouchParticipants
      .get(id)
      .then(() => {
        return { exists: true }
      })
      .catch(response => {
        return { exists: false, status: response.status }
      })
  }

  const { pouchParticipants } = props

  const [error, setError] = useState('')
  const [isNewParticipantFromParams, setIsNewParticipantFromParams] = useState(
    false
  )
  const loggedInId = participantId.get()

  useEffect(() => {
    if (loggedInId) {
      doesIdExist(loggedInId).then(({ exists }) =>
        setIsNewParticipantFromParams(!exists)
      )
    }
  }, [])

  return (
    <Fragment>
      <div className="tu-border tu-glow center-box ">
        <div className="centered-content">
          <h2>Instructions</h2>
        </div>
        <p>
          Please read this page carefully and make sure you understand what
          you're supposed to do.
        </p>
        <p>
          This study is part of my Bachelor's thesis, in which I'm composing a
          data set of German sentences and paragraphs and a rating of their
          complexity and understandability. This data set can then be used as a
          base to identify the most complex parts of a text and later
          automatically "translate" them to simpler language.
        </p>
        <p>
          In this study, you will have to read sentences and paragraphs and
          answer questions about their complexity and understandability. All the
          texts from the data set are grouped in "sessions" of TODO texts. TODO:
          Your answers will only be saved after rating an entire group of items,
          not after each individual text. Each rating process is divided in
          three steps:
        </p>
        <h5>1. Reading</h5>
        <p>
          In the first step you can read the text that you will be rating. This
          page will look slightly different, depending on whether the text is an
          entire paragraph or a single sentence. For sentences, you will see the
          sentence at the top of the page, in a grey box. Please read it
          carefully to make sure you understand it as well as possible.
          Underneath the sentence you will find the paragraph that the sentence
          was taken from. You don't <em>have</em> to read it, but it can help
          you understand the sentence.
          <br />
          For paragraphs, we will measure how long it takes to read them, so the
          text will be hidden unless you hold a button below the text. Please
          make sure you read the entire paragraph and understand it as well as
          you can.
          <span className="img-wrap">
            <img
              src="instructions-read.gif"
              alt="GIF of the page where you can read the text. The heading says 'TODO' but the text is hidden by a light blue block. A cursor appears, presses a button labeled 'TODO' and the block disappears, making the text readable as long as the button is held, the the block appears again."
              className="instruction-img"
            />
          </span>
          Once you're done, you can click on "Next Step". After that, you won't
          be able to go back to read the text.
        </p>
        <h5>2. Questions</h5>
        <p>
          In the second step, you will be asked questions about the text, for
          example how complex you think it is or how well you understood it.
          TODO: image / gif
        </p>
        <h5>3. Cloze Test</h5>
        <p>
          In the last step, you will see the text again, with one or more words
          missing. Please select the word that was deleted from the original
          text in the dropdown menu. TODO: image/gif
        </p>
        <h5>Finish</h5>
        <p>
          After you completed the rating for one text, you will get a new
          sentence or paragraph of the same session (group of texts) and can
          start the rating of that text. After completing all texts of a
          session, your answers will be saved and you will be redirected to the
          homepage. TODO: image?
        </p>
        {loggedInId !== null ? (
          <Link
            className="btn"
            to={isNewParticipantFromParams ? '/demographics' : '/start-session'}
          >
            Start
          </Link>
        ) : (
          <Fragment>
            <p>
              If this is your first time participating in this study and you
              don't have an ID yet, please click here:
            </p>
            <Link className="btn" to="/demographics">
              New Participant
            </Link>
            <p>
              If you have already done a session in the past, please enter your
              participant ID and click "Start"
            </p>
            <form
              onSubmit={e => {
                e.preventDefault()
                const id = e.target.participantId.value
                doesIdExist(id).then(result => {
                  if (result.exists) {
                    props.login(id)
                    props.history.push('/start-session')
                  } else if (result.status === 404) {
                    setError(
                      'This ID does not exist. Please make sure you entered the correct ID.'
                    )
                  } else {
                    setError('An unknown error occurred. Please try again.')
                  }
                })
              }}
            >
              <input
                type="text"
                name="participantId"
                placeholder="Participant ID"
                className="login-input"
              />
              <button type="submit" className="btn">
                Start
              </button>
            </form>
            {error.length > 0 ? (
              <div className="tu-border error-box background-pink">{error}</div>
            ) : null}
          </Fragment>
        )}
      </div>
    </Fragment>
  )
}

Instructions.propTypes = {
  pouchParticipants: databasePropType,
  login: PropTypes.func,
  history: PropTypes.shape({ push: PropTypes.func }),
}

export default withRouter(Instructions)
