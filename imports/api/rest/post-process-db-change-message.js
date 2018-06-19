import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import MessagePayloads from '../message-payloads'
import caseUserInvitedTemplate from '../../email-templates/user-invited-to-case'
import caseAssigneeUpdateTemplate from '../../email-templates/case-assignee-updated'
import caseNewTemplate from '../../email-templates/case-new'

export default (req, res) => {
  if (req.query.accessToken !== process.env.API_ACCESS_TOKEN) {
    res.send(401)
    return
  }

  const message = req.body
  console.log('Incoming to /api/db-change-message/process', message)

  MessagePayloads.insert(message)

  const {
    notification_type: type,
    case_title: caseTitle,
    case_id: caseId
  } = message

  var emailAddr, emailContent, assigneeId, assignee

  switch (type) {
    case 'case_new':
      // https://github.com/unee-t/sns2email/issues/1
      // When a new case is created, we need to inform the person who is assigned to that case.

      assigneeId = message.assignee_user_id
      assignee = Meteor.users.findOne({'bugzillaCreds.id': parseInt(assigneeId)})
      if (!assignee) {
        console.error('Could deliver message to missing user of BZ ID: ' + assigneeId)
        return
      }
      emailAddr = assignee.emails[0].address
      emailContent = caseNewTemplate(assignee, caseTitle, caseId)
      try {
        Email.send(Object.assign({
          to: emailAddr,
          from: process.env.FROM_EMAIL
        }, emailContent))
        console.log('Sent', emailAddr, 'notification type:', type)
      } catch (e) {
        console.error(`An error ${e} occurred while sending an email to ${emailAddr}`)
      }

      break

    case 'case_assignee_updated':
      // https://github.com/unee-t/sns2email/issues/2
      // When the user assigned to a case change, we need to inform the person who is the new assignee to that case.

      assigneeId = message.assignee_user_id
      assignee = Meteor.users.findOne({'bugzillaCreds.id': parseInt(assigneeId)})
      if (!assignee) {
        console.error('Could deliver message to missing user of BZ ID: ' + assigneeId)
        return
      }
      emailAddr = assignee.emails[0].address
      emailContent = caseAssigneeUpdateTemplate(assignee, caseTitle, caseId)
      try {
        Email.send(Object.assign({
          to: emailAddr,
          from: process.env.FROM_EMAIL
        }, emailContent))
        console.log('Sent', emailAddr, 'notification type:', type)
      } catch (e) {
        console.error(`An error ${e} occurred while sending an email to ${emailAddr}`)
      }

      break

    case 'case_user_invited':

      const {
        invitee_user_id: inviteeId
      } = message

      const invitee = Meteor.users.findOne({'bugzillaCreds.id': parseInt(inviteeId)})
      if (!invitee) {
        console.error('Could deliver message to missing user of BZ ID: ' + inviteeId)
        return
      }
      emailAddr = invitee.emails[0].address
      emailContent = caseUserInvitedTemplate(invitee, caseTitle, caseId)
      try {
        Email.send(Object.assign({
          to: emailAddr,
          from: process.env.FROM_EMAIL
        }, emailContent))
        console.log('Sent', emailAddr, 'notification type:', type)
      } catch (e) {
        console.error(`An error ${e} occurred while sending an email to ${emailAddr}`)
      }
      break
    default:
      console.log('Unimplemented type:', type)
  }
  res.send(200)
}
