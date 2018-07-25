import React from 'react'

export class UnverifiedWarning extends React.Component {
  render () {
    return (
      <main>
        <h1 className='f-1'>Verify your email address</h1>
        <p>Your email address .. has not been verified yet.
      Confirm your email to receive updates on your cases.</p>
      </main>
    )
  }
}
