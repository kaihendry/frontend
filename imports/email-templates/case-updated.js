import url from 'url'
import { address, optOutHtml, optOutText } from './components/helpers'

export default (assignee, notificationId, settingType, caseTitle, caseId, updateWhat, userId) => ({
  subject: `Case updated "${caseTitle}"`,
  html: `<img src="cid:logo@unee-t.com"/>

<p>Hi ${address(assignee)},</p>

<p>The case <strong>${caseTitle}</strong> has had a ${updateWhat} made by ${address(userId)}.</p>

<p>Please follow <a href='${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}'>${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}</a> to participate.</p>

` + optOutHtml(settingType, notificationId, assignee),
  text: `

Hi ${address(assignee)},

${caseTitle} has has a ${updateWhat} made by ${address(userId)}.

Please follow ${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)} to participate.

` + optOutText(settingType, notificationId, assignee),
  attachments: [{
    path: 'https://s3-ap-southeast-1.amazonaws.com/prod-media-unee-t/2018-06-14/unee-t_logo_email.png',
    cid: 'logo@unee-t.com'
  }]
})
