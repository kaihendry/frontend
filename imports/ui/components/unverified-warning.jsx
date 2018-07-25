import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'

class UnverifiedWarning extends React.Component {
  render () {
    const { isUserVerified, email } = this.props
    return !isUserVerified ? (
      <main>
        <h1 className='f-1'>Verify your email address</h1>
        <p>
          Your email address {email} has not been verified yet.
          Confirm your email to receive updates on your cases.
        </p>
      </main>
    ) : null
  }
}

UnverifiedWarning.propTypes = {
  isUserVerified: PropTypes.bool.isRequired,
  email: PropTypes.string.isRequired

}

export default connect(
  () => ({}) // Redux store to props
)(createContainer(
  () => {
    console.log('emails', Meteor.user() && Meteor.user().emails)
    return {
      isUserVerified: Meteor.user() ? Meteor.user().emails[0].verified : true,
      email: Meteor.user() ? Meteor.user().emails[0].address : ''
    }
  }, // Meteor data to props
  UnverifiedWarning
))
