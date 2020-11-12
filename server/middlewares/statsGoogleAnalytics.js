const device = require('device')
const mung = require('express-mung')
const normalizeUrl = require('normalize-url')
const {parseTxBodyOutAmount, parseTxBodyTotalAmount} = require('../helpers/parseTxBody')
const ua = require('universal-analytics')
const {backendConfig} = require('../helpers/loadConfig')
const {captureException} = require('@sentry/node')

const knownIps = new Set()

const isSameOrigin = (urlString1, urlString2) => {
  return (
    normalizeUrl(urlString1, {stripProtocol: true}) ===
    normalizeUrl(urlString2, {stripProtocol: true})
  )
}

const tokenMatches = (token) => token === process.env.ADALITE_BACKEND_TOKEN

const initVisitor = (trackingID) => {
  return ua({
    tid: trackingID,
    cid: 555, //google analytics anonymous visitor
    strictCidFormat: false, //to accept cid integer instead of UUID v4 format
  })
}

const trackPageView = async ({path, title, hostname}) => {
  const visitor = initVisitor(backendConfig.ADALITE_GA_TRACKING_ID)

  return await visitor
    .pageview({
      dp: path,
      dt: title,
      dh: hostname,
    })
    .send()
}

const trackEvent = async ({category, action, label, value, path, originTestSuccess}) => {
  const visitor = initVisitor(backendConfig.ADALITE_GA_TRACKING_ID)
  visitor.set('cd1', originTestSuccess.toString()) // cd1 stands for Custom Dimension #1

  return await visitor
    .event({
      ec: category,
      ea: action,
      el: label,
      ev: value,
      dh: path,
    })
    .send()
}

const trackVisits = async (req, res, next) => {
  // 'x-forwarded-for' due to internal heroku routing
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const mydevice = device(req.headers['user-agent'])

  if (!knownIps.has(ip) && !mydevice.is('bot')) {
    await trackPageView({
      path: req.path,
      title: '',
      hostname: req.hostname,
    })
    knownIps.add(ip)
  }

  next()
}

const trackTxSubmissions = mung.jsonAsync(async (body, req, res) => {
  if (req.originalUrl === '/api/txs/submit' && req.method === 'POST') {
    const tokenMatched = tokenMatches(req.get('token'))
    const txSubmissionType =
      tokenMatched && isSameOrigin(req.get('origin'), process.env.ADALITE_SERVER_URL)
        ? 'txSubmissions'
        : 'otherTxSubmissions'
    const txSubmissionSuccess = body.Right ? 'successful' : 'unsuccessful'
    const txWalletType = req.get('walletType')

    try {
      const baseEventData = {
        category: 'Payments',
        path: req.hostname,
        originTestSuccess: tokenMatched,
      }

      await trackEvent({
        ...baseEventData,
        action: `${txSubmissionType}:${txWalletType}`,
        label: 'Wallet type',
        value: undefined,
      })

      if (txSubmissionSuccess === 'successful') {
        const {txBody} = req.body

        const txSentAmount = parseTxBodyOutAmount(txBody)
        await trackEvent({
          ...baseEventData,
          action: `${txSubmissionType}:sentOut`,
          label: 'successful payment',
          value: Math.floor(txSentAmount / 1000000),
        })

        const txTotalAmount = parseTxBodyTotalAmount(txBody)
        await trackEvent({
          ...baseEventData,
          action: `${txSubmissionType}:sentTotal`,
          label: 'total amount',
          value: Math.floor(txTotalAmount / 1000000),
        })
      } else {
        await trackEvent({
          ...baseEventData,
          action: `${txSubmissionType}:sentFail`,
          label: 'unsuccessful payment',
          value: undefined,
        })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Tracking event failed - ${err}`)
      captureException(err)
    }
  }

  return body
})

module.exports = {
  trackVisits,
  trackTxSubmissions,
}
