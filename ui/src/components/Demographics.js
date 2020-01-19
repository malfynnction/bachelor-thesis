import React from 'react'

class Demographics extends React.Component {
  render() {
    return (
      <div className="tu-border center-box">
        <h3>Demographic Questions</h3>
        <form
          onSubmit={() => {
            this.props.createUser({ foo: 'bar', test: true })
          }}
          action="/session"
        >
          <div>
            <label htmlFor={'id'}>Question?</label>
            <input onChange={() => {}} type="text" />
          </div>
          <button type="submit">Start</button>
        </form>
      </div>
    )
  }
}

export default Demographics
