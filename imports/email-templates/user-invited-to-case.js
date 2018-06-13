import url from 'url'

export default (invitee, caseTitle, caseId) => ({
  subject: `You've been invited to collaborate on "${caseTitle}"`,
  html: `<img src="cid:logo@unee-t.com"/>

<p>Hi ${invitee.profile.name || invitee.emails[0].address.split('@')[0]},</p>
<p>
You've been invited to collaborate on a case in Unee-T. <br />
Click <a href='${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}'>here</a> to go to the case ${caseTitle} and
participate in solving this case .
</p>
<p>
If the above link does not work, copy paste this in your browser: ${url.resolve(process.env.ROOT_URL, `/case/${caseId}`)}
</p>
<p><a href=https://unee-t.com>Unee-T</a>, managing and sharing 'To Do's for your properties has never been easier.</p>
`,
  attachments: [{
    filename: 'unee-t_logo_email.png',
    path: `/home/meteor/www/bundle/programs/web.browser/app/unee-t_logo_email.png`,
    cid: 'logo@unee-t.com'
  }]
})
