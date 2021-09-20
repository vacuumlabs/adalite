function getRequestIp(req) {
  // 'x-forwarded-for' due to internal heroku routing
  const forwardedFor = req.headers['x-forwarded-for']

  // the "x-forwarded-for" header can contain multiple IPs
  // see https://serverfault.com/questions/846489/can-x-forwarded-for-contain-multiple-ips
  const forwardedForClientIp = forwardedFor ? forwardedFor.split(',')[0] : null

  // eslint-disable-next-line no-console
  console.log(forwardedForClientIp) // temporary logging for the sake of testing in prod

  return forwardedForClientIp || req.connection.remoteAddress
}

module.exports = getRequestIp
