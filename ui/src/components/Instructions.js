import React, { useState } from 'react'
import participantId from '../lib/participant-id'
import { Link } from 'react-router-dom'

const Instructions = () => {
  const [idCorrect, setIdCorrect] = useState(true)
  const loggedInId = participantId.get()
  return (
    <div className="tu-border center-box background-pink">
      <h2>Instructions</h2>
      <p>
        Hello! This study is part of my Bachelor's thesis, in which I'm
        composing a data set of German sentences and paragraphs and a rating of
        their complexity and understandability. This data set can then be used
        to evaluate the complexity and understandability for other texts, as
        well as identifying the most complex parts of a text, which can be a
        target for text simplification. This is just a blind text so I'm just
        going to stop trying to write anything here.
      </p>
      <p>
        During this session, you will read sentences and paragraphs and answer
        questions about their complexity and understandability. You will also
        get small tasks and questions about the content of the text to further
        evaluate how easy it is to understand it. Each rating process is divided
        in three steps:
      </p>
      <h5>1. Reading</h5>
      <p>
        In the first step, you can read the sentence/paragraph that you will be
        evaluating. <br />
        <em>Include Screenshots</em>
      </p>
      <h5>And then some more stuff</h5>
      <p>
        If you have already done a session in the past, please enter your
        participant ID and click "Start"
      </p>
      <form
        action="http://localhost:3000/session"
        onSubmit={e => {
          const id = e.target.participantId.value
          if (loggedInId !== null && loggedInId !== id) {
            e.preventDefault()
            setIdCorrect(false)
          } else {
            participantId.set(id)
          }
        }}
      >
        <input type="text" name="participantId" /> TODO: accessibility
        <button>Start</button>
        {idCorrect ? null : (
          <div>
            You are currently logged in as participant {loggedInId}. Please make
            sure you typed the correct ID. If you are logged in as the wrong
            participant, please log out and back in using your correct ID.
          </div>
        )}
      </form>
      <p>If you don't have an ID yet, please click here:</p>
      <Link to="/demographics">Start</Link>
    </div>
  )
}

export default Instructions
