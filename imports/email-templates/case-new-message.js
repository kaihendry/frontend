import url from 'url'
import { optOutHtml, optOutText } from './components/helpers'
import { matchWidth } from '../util/cloudinary-transformations'

function linkAttachment (message) {
  const msgParts = message.split(' ')
  if (msgParts.length > 1 && msgParts[0] === '[!attachment]') {
    const attachmentUrl = msgParts[1]
    if (attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/) != null) {
      const thumbUrl = matchWidth(attachmentUrl, 500)
      return `<a href=${thumbUrl}><img alt="Attachment image" src=${thumbUrl}></a>`
    }
  }
  return message
}

export default (assignee, notificationId, settingType, caseTitle, caseId, userId, message) => ({
  subject: `New message on case "${caseTitle}"`,
  html: `<img src="cid:logo@unee-t.com"/>

<p>Hi ${assignee.profile.name || assignee.emails[0].address.split('@')[0]},</p>

<p>New message by ${userId.profile.name}:</p>

<p>${linkAttachment(message)}</p>

<p>Please follow <a href='${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}'>${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}</a> to participate.</p>

` + optOutHtml(settingType, notificationId, assignee),
  text: `Hi ${assignee.profile.name || assignee.emails[0].address.split('@')[0]},

New message by ${userId}:

${message}

Please follow ${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)} to participate.

` + optOutText(settingType, notificationId, assignee),
  attachments: [{
    path: 'https://s3-ap-southeast-1.amazonaws.com/prod-media-unee-t/2018-06-14/unee-t_logo_email.png',
    cid: 'logo@unee-t.com'
  }]
})
