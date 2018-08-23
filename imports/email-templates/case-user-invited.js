import url from 'url'
import { optOutHtml, optOutText } from './components/helpers'

export default (invitee, notificationId, settingType, caseTitle, caseId) => ({
  subject: `Collaborate on "${caseTitle}"`,
  html: `<img src="cid:logo@unee-t.com"/><pre>##- This is a notification message - Please use this link ${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)} to reply -##</pre>

<p>Hi ${invitee.profile.name || invitee.emails[0].address.split('@')[0]},</p>

<p>You've been invited to collaborate on a case <strong>${caseTitle}</strong> in Unee-T.</p>

<p>Please follow <a href='${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}'>${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}</a> to participate.</p>

` + optOutHtml(settingType, notificationId, invitee),
  text: `##- This is a notification message - Please use this link ${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)} to reply -##

Hi ${invitee.profile.name || invitee.emails[0].address.split('@')[0]},

You've been invited to collaborate on a case ${caseTitle} in Unee-T.

Please follow ${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)} to participate.

` + optOutText(settingType, notificationId, invitee),
  attachments: [{
    path: 'https://s3-ap-southeast-1.amazonaws.com/prod-media-unee-t/2018-06-14/unee-t_logo_email.png',
    cid: 'logo@unee-t.com'
  }]
})
