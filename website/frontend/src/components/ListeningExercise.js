import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const AudioQuestion = props => {
  return (
    <div>
      <audio controls>
        <source src={props.fileName} type="TODO" />
        Your browser does not support playing audio. Here is a{' '}
        <a href="TODO">link to download the audio</a> instead.
      </audio>
    </div>
  )
}

const ListeningExercise = () => {
  return (
    <div className="tu-border tu-glow center-box centered-content">
      <h3>Listening Comprehension</h3>
      <div>
        Please listen to the audio and answer the questions to helo us better
        estimate your German level (TODO: this won't have an influence on
        quality and compensation and stuff)
      </div>
      {[{ fileName: '', questions: [] }].map(({ fileName, questions }, i) => (
        <AudioQuestion
          key={`audio-question-${i}`}
          fileName={fileName}
          questions={questions}
        />
      ))}
      <Link className="btn" type="submit" to="/start-session" onClick={e => {}}>
        Submit
      </Link>
    </div>
  )
}

export default ListeningExercise

AudioQuestion.propTypes = {
  fileName: PropTypes.string,
  questions: PropTypes.arrayOf(PropTypes.string),
}
