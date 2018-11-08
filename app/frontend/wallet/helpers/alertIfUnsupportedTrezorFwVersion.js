const TrezorConnect = require('trezor-connect').default

/*
* this is a temporary fix untill trezor.io will (hopefully) properly notify about
* wrong firmware version as soon as firmware 2.0.8 is actually released
*/
async function alertIfUnsupportedTrezorFwVersion() {
  try {
    const minSupportedFwVersion = '2.0.8'
    const {model, fwVersion} = await getTrezorInfo()

    if (model === 'T' && versionCompare(fwVersion, minSupportedFwVersion) < 0) {
      // eslint-disable-next-line no-alert
      alert(`
        Please update to firmware version
        ${minSupportedFwVersion} or higher. Your firmware version is ${fwVersion}
      `)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    // this is a hotfix, so we don't want to break the app if anything goes wrong
  }
}

// source: https://gist.github.com/TheDistantSea/8021359
function versionCompare(v1, v2, options) {
  const lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend
  let v1parts = v1.split('.'),
    v2parts = v2.split('.')

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x)
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push('0')
    while (v2parts.length < v1parts.length) v2parts.push('0')
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number)
    v2parts = v2parts.map(Number)
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1
    }

    if (v1parts[i] === v2parts[i]) {
      continue
    } else if (v1parts[i] > v2parts[i]) {
      return 1
    } else {
      return -1
    }
  }

  if (v1parts.length !== v2parts.length) {
    return -1
  }

  return 0
}

async function getTrezorInfo() {
  const {payload: features} = await TrezorConnect.getFeatures()
  const fwVersion = `${features.major_version}.${features.minor_version}.${features.patch_version}`

  return {
    model: features.model,
    fwVersion,
  }
}

module.exports = alertIfUnsupportedTrezorFwVersion
