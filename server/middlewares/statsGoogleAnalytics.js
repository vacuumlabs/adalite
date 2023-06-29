const device = require('device')
const mung = require('express-mung')
const {parseTxBodyOutAmount, parseTxBodyTotalAmount} = require('../helpers/parseTxBody')
const ua = require('universal-analytics')
const {backendConfig} = require('../helpers/loadConfig')
const {captureException} = require('@sentry/node')
const {isSameOrigin, tokenMatches} = require('../helpers/checkOrigin')
const getRequestIp = require('../helpers/getRequestIp')

const knownIps = new Set()

const initVisitor = (trackingID) => {
  return ua({
    tid: trackingID,
    cid: 555, //google analytics anonymous visitor
    strictCidFormat: false, //to accept cid integer instead of UUID v4 format
  })
}

// GA4 solution inspired by https://developers.google.com/analytics/devguides/collection/ga4/views?client_type=gtag
// and https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#required_parameters
const ga4MeasurementId = backendConfig.ADALITE_GA4_MEASUREMENT_ID
const ga4ApiSecret = backendConfig.ADALITE_GA4_API_SECRET

const trackPageView = async ({path, title, hostname}) => {
  // GA4
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4ApiSecret}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: '555.0', // anonymous user
        events: [
          {
            name: 'page_view',
            params: {
              page_title: title,
              page_location: `${hostname}${path}`,
            },
          },
        ],
      }),
    }
  )

  // UA - deprecated by July 1st 2023!
  const visitor = initVisitor(backendConfig.ADALITE_GA_TRACKING_ID)
  await visitor
    .pageview({
      dp: path,
      dt: title,
      dh: hostname,
    })
    .send()
}

const trackEvent = async ({category, action, label, value, path, originTestSuccess}) => {
  // GA4
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4ApiSecret}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: '555.0', // anonymous user
        events: [
          {
            name: label.toLowerCase().replaceAll(' ', '_'),
            params: {
              cd1: originTestSuccess.toString(), // cd1 stands for Custom Dimension #1
              ec: category,
              ea: action,
              el: label,
              ev: value,
              dh: path,
            },
          },
        ],
      }),
    }
  )

  // UA - deprecated by July 1st 2023!
  const visitor = initVisitor(backendConfig.ADALITE_GA_TRACKING_ID)
  visitor.set('cd1', originTestSuccess.toString()) // cd1 stands for Custom Dimension #1

  await visitor
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
  const ip = getRequestIp(req)
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

const trackTxSubmissions = mung.jsonAsync(async (body, req) => {
  if (req.originalUrl === '/api/txs/submit' && req.method === 'POST') {
    const tokenMatched = tokenMatches(req.get('token'))
    const txSubmissionType =
      tokenMatched && isSameOrigin(req.get('origin'), backendConfig.ADALITE_SERVER_URL)
        ? 'txSubmissions'
        : 'otherTxSubmissions'
    const txSubmissionSuccess = body.Right ? 'successful' : 'unsuccessful'
    const txWalletType = req.get('walletType')
    const txWalletVersion = req.get('walletVersion')
    const txWalletDerivationScheme = req.get('walletDerivationScheme')

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

      if (txWalletType === 'Mnemonic') {
        await trackEvent({
          ...baseEventData,
          action: txWalletDerivationScheme,
          label: 'Wallet derivation scheme',
          value: undefined,
        })
      }

      await trackEvent({
        ...baseEventData,
        action: txWalletVersion,
        label: `${txWalletType} version`,
        value: undefined,
      })

      const txType = req.get('txType')
      await trackEvent({
        ...baseEventData,
        action: `${txSubmissionType}:${txType}`,
        label: 'Transaction type',
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
