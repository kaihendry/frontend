import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import MessagePayloads from '../message-payloads'
import caseUserInvitedTemplate from '../../email-templates/case-user-invited'
import caseAssigneeUpdateTemplate from '../../email-templates/case-assignee-updated'
import caseUpdatedTemplate from '../../email-templates/case-updated'
import caseNewMessageTemplate from '../../email-templates/case-new-message'
import caseNewTemplate from '../../email-templates/case-new'

export default (req, res) => {
  if (req.query.accessToken !== process.env.API_ACCESS_TOKEN) {
    res.send(401)
    return
  }

  const message = req.body

  if (MessagePayloads.findOne({notification_id: message.notification_id})) {
    console.log(`Duplicate message ${message.notification_id}`)
    res.send(400, `Duplicate message ${message.notification_id}`)
    return
  }

  console.log('Incoming to /api/db-change-message/process', message)
  MessagePayloads.insert(message)

  const {
    notification_type: type,
    case_title: caseTitle,
    case_id: caseId,
    notification_id: notificationId
  } = message

  let recipients = []

  switch (type) {
    case 'case_new':
      // https://github.com/unee-t/sns2email/issues/1
      // When a new case is created, we need to inform the person who is assigned to that case.
      recipients.concat(lookup(message.assignee_user_id))
      recipients.forEach(to => {
        sendEmail(to, 'assignedNewCase', caseNewTemplate(to, caseTitle, caseId))
      })
      break

    case 'case_assignee_updated':
      // https://github.com/unee-t/sns2email/issues/2
      // When the user assigned to a case change, we need to inform the person who is the new assignee to that case.
      recipients.concat(lookup(message.assignee_user_id))
      recipients.forEach(to => {
        sendEmail(to, 'assignedExistingCase', caseAssigneeUpdateTemplate(to, caseTitle, caseId))
      })
      break

    case 'case_new_message':
      // https://github.com/unee-t/lambda2sns/issues/5
      recipients.concat(lookup(message.assignee_user_id))
      recipients.forEach(to => {
        sendEmail(to, 'caseNewMessage', caseNewMessageTemplate(to, caseTitle, caseId))
      })
      break

    case 'case_updated':
      // https://github.com/unee-t/lambda2sns/issues/4
      recipients.concat(lookup(message.assignee_user_id))
      recipients.forEach(to => {
        sendEmail(to, 'caseUpdated', caseUpdatedTemplate(to, caseTitle, caseId))
      })
      break

    case 'case_user_invited':
      // https://github.com/unee-t/sns2email/issues/3
      recipients.concat(lookup(message.invitee_user_id))
      recipients.forEach(to => {
        sendEmail(to, 'invitedToCase', caseUserInvitedTemplate(to, caseTitle, caseId))
      })
      break

    default:
      console.log('Unimplemented type:', type)
      res.send(400)
      return
  }

  function lookup (userId) {
    const assignee = Meteor.users.findOne({'bugzillaCreds.id': parseInt(userId)})
    if (!assignee) {
      console.error('Could deliver message to missing user of BZ ID: ' + userId)
      return
    }
    return assignee
  }

  function sendEmail (assignee, settingType, emailContent) {
    if (!assignee.notificationSettings[settingType]) {
      console.log(
      `${assignee.bugzillaCreds.login} has previously opted out from '${settingType}' notifications. ` +
       `Skipping email for notification ${notificationId}.`
    )
    } else {
      const emailAddr = assignee.emails[0].address
      try {
        Email.send(Object.assign({
          to: emailAddr,
          from: process.env.FROM_EMAIL
        }, emailContent))
        console.log('Sent', emailAddr, 'notification type:', type)
      } catch (e) {
        console.error(`An error ${e} occurred while sending an email to ${emailAddr}`)
      }
    }
  }

  res.send(200)
}
