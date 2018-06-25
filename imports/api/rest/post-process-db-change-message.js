import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import MessagePayloads from '../message-payloads'
import caseAssigneeUpdateTemplate from '../../email-templates/case-assignee-updated'
import caseUpdatedTemplate from '../../email-templates/case-updated'
import caseNewMessageTemplate from '../../email-templates/case-new-message'
import caseNewTemplate from '../../email-templates/case-new'
import caseUserInvitedTemplate from '../../email-templates/case-user-invited'

export default (req, res) => {
  if (req.query.accessToken !== process.env.API_ACCESS_TOKEN) {
    res.send(401)
    return
  }

  const message = req.body

  if (MessagePayloads.findOne({ notification_id: message.notification_id })) {
    console.log(`Duplicate message ${message.notification_id}`)
    res.send(400, `Duplicate message ${message.notification_id}`)
    return
  }

  console.log('Incoming to /api/db-change-message/process', message)
  MessagePayloads.insert(message)

  // Common between https://github.com/unee-t/lambda2sns/tree/master/tests/events
  const {
    notification_type: type,
    case_title: caseTitle,
    case_id: caseId,
    notification_id: notificationId
  } = message

  let recipients = []

  switch (type) {
    case 'case_assignee_updated':
      // https://github.com/unee-t/sns2email/issues/2
      // When the user assigned to a case change, we need to inform the person who is the new assignee to that case.
      recipients = lookup(message.new_case_assignee_user_id)
      recipients.forEach(to => {
        sendEmail(to, 'assignedExistingCase', caseAssigneeUpdateTemplate(to, caseTitle, caseId))
      })
      break

    case 'case_new_message':
      // https://github.com/unee-t/lambda2sns/issues/5
      recipients = lookup([message.new_case_assignee_user_id, message.current_list_of_invitees].join(','))
      recipients.forEach(to => {
        sendEmail(to, 'caseNewMessage', caseNewMessageTemplate(to, caseTitle, caseId, lookup(message.created_by_user_id)[0], message.message_truncated))
      })
      break

    case 'case_updated':
      // https://github.com/unee-t/lambda2sns/issues/4
      // More are notified: https://github.com/unee-t/lambda2sns/issues/4#issuecomment-399339075
      recipients = lookup([message.new_case_assignee_user_id, message.case_reporter_user_id, message.current_list_of_invitees].join(','))
      recipients.forEach(to => {
        sendEmail(to, 'caseUpdate', caseUpdatedTemplate(to, caseTitle, caseId, message.update_what, lookup(message.user_id)[0]))
      })
      break

    case 'case_user_invited':
      // https://github.com/unee-t/sns2email/issues/3
      recipients = lookup(message.invitee_user_id)
      recipients.forEach(to => {
        sendEmail(to, 'invitedToCase', caseUserInvitedTemplate(to, caseTitle, caseId))
      })
      break

    default:
      console.log('Unimplemented type:', type)
      res.send(400)
      return
  }

  function lookup (userIdstring) {
    // userIdstring could be: "13, 15, 23"  or just "19"
    const userIds = userIdstring.split(',').filter((val) => val)
    let assignees = []
    for (var i = 0; i < userIds.length; i++) {
      const assignee = Meteor.users.findOne({ 'bugzillaCreds.id': parseInt(userIds[i]) })
      if (!assignee) {
        console.error('Failed to lookup BZ ID: ' + userIds[i])
      } else {
        assignees.push(assignee)
      }
    }
    return assignees
  }

  function sendEmail (assignee, settingType, emailContent) {
    if (!assignee.notificationSettings[settingType]) {
      console.log(
        `Skipping ${assignee.bugzillaCreds.login} as opted out from '${settingType}' notifications.`
      )
    } else {
      const emailAddr = assignee.emails[0].address
      try {
        Email.send(Object.assign({
          to: emailAddr,
          from: process.env.FROM_EMAIL
        }, emailContent))
        console.log('Sent', emailAddr, 'notification:', notificationId)
      } catch (e) {
        console.error(`An error ${e} occurred while sending an email to ${emailAddr}`)
      }
    }
  }

  res.send(200)
}
