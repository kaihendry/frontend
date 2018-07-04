import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import MessagePayloads from '../message-payloads'
import caseAssigneeUpdateTemplate from '../../email-templates/case-assignee-updated'
import caseUpdatedTemplate from '../../email-templates/case-updated'
import caseNewMessageTemplate from '../../email-templates/case-new-message'
import caseUserInvitedTemplate from '../../email-templates/case-user-invited'

export default (req, res) => {
  if (req.headers['authorization'] !== `Bearer ${process.env.API_ACCESS_TOKEN}`) {
    res.send(401)
    return
  }

  const message = req.body
  
  switch(message.bounce.bounceType) {
    case "Permanent":
    console.log("Mark invalid", message.bounce.bouncedRecipients[0].emailAddress)
    break
    default:
    console.log("Ignored", message)
  }



  res.send(200)
}
