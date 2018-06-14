import { Email } from 'meteor/email'
import url from 'url'
import bugzillaApi from '../util/bugzilla-api'
const { callAPI } = bugzillaApi

export const invite = (user, invitedBy) => {
  try {
    const { accessToken, caseId, unitId, role: inviteeRole } = user.invitedToCases[0]
    const caseData = callAPI('get', `/rest/bug/${caseId}`, {}, true, true)
    const unitData = callAPI('get', `/rest/product/${unitId}`, {}, true, true)
    const caseTitle = caseData.data.bugs[0].summary
    const unitName = unitData.data.products[0].name.trim()
    const unitDesc = unitData.data.products[0].description.replace(/[\n\r]+/g, ' ').trim()
    const invitorUsername = invitedBy.profile.name
    const invitorEmailAddress = invitedBy.emails[0].address
    const invitorRole = unitData.data.products[0].components.find(
      ({default_assigned_to: defAssigned}) => defAssigned === invitedBy.emails[0].address
    )
    const roleStr = invitorRole ? invitorRole.name : 'Administrator'

    Email.send({
      to: user.emails[0].address,
      from: process.env.FROM_EMAIL,
      replyTo: `${invitorUsername} <${invitorEmailAddress}>`,
      subject: `New Case: ${caseTitle}`,
      text: `Hi,

${invitorUsername || invitorEmailAddress},
the ${roleStr} for the unit ${unitName}
${unitDesc}
has invited you to collaborate on the case [${caseTitle}]
as the ${inviteeRole} for that unit.

Please click on the link to get more information about the case and reply to ${invitorUsername || 'him'}:
${url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)}

Unee-t: Managing and sharing 'To Do's for your properties has never been easier.
https://unee-t.com

`,
      html: `<img src="cid:logo@unee-t.com"/>

<p>Hi,</p>

<p>
<br>${invitorUsername || invitorEmailAddress},
<br>the ${roleStr} for the unit
<br><b>${unitName}</b>
<br>${unitDesc}
<br>has invited you to collaborate on the case <b>${caseTitle}</b>
<br>as the <b>${inviteeRole}</b> for that unit.
</p>
<p>
<br>Please click on <a href=${url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)}>this link</a> to get more information about the case and reply to ${invitorUsername || 'him'}.
<br>If the above link does not work, copy paste this in your browser: ${url.resolve(process.env.ROOT_URL, `/invitation?code=${accessToken}`)}
</p>
<p><a href=https://unee-t.com>Unee-T</a>, managing and sharing 'To Do's for your properties has never been easier.</p>

`,
      attachments: [{
        path: 'data:image/png;base64,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',
        cid: 'logo@unee-t.com'
      }]
    })
  } catch (e) {
    console.log(e)
  }
}
