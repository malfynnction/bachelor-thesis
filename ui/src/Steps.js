import React, { Fragment } from 'react'

export const Read = props => {
  return (
    <Fragment>
      <div>Here is a sentence/paragraph that you should read: </div>
      <p>{props.item}</p>
    </Fragment>
  )
}
export const Questions = () => {
  return <div>Now answer some questions about what you just read</div>
}
export const Tasks = () => {
  return <div>And now do some task(s)</div>
}
