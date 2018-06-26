import { URL, resolve, URLSearchParams } from 'url'

function engage (parameters) {
  // url, medium, id, user is expected
  // URL._constructUrl = function (url, query, params)
  const params = new URLSearchParams(parameters)
  params.sort()
  const engageUrl = new URL(process.env.ROOT_URL)
  const hparts = engageUrl.hostname.split('.')
  hparts[0] = 'e' // Switch to correct stage of engagement API
  engageUrl.hostname = hparts.join('.')
  engageUrl.search = params
  return engageUrl.toString()
}

function optOutHtml (settingType, notificationId, user, optoutUrl) {
  return `
    <p>
      To opt out of "${settingType}" emails, please visit your notification settings panel at
      <a href='${engage({
    url: `${resolve(process.env.ROOT_URL, `/notification-settings`)}`,
    medium: 'email',
    id: notificationId,
    user: user.id }
  )}'>
        ${resolve(process.env.ROOT_URL, `/notification-settings?type=${settingType}`)}
      </a>
    </p>
  `
}

function optOutText (settingType, notificationId, user, optoutUrl) {
  return `
  To opt out of "${settingType}" emails, please visit your notification settings panel at
  ${resolve(process.env.ROOT_URL, `/notification-settings?type=${settingType}`)}
  `
}

export { engage, optOutHtml, optOutText }
