const TrezorConnect = require('trezor-connect').default

/*
* this is a temporary fix untill trezor.io will (hopefully) properly notify about
* wrong firmware version as soon as firmware 2.0.8 is actually released
*/
async function alertIfUnsupportedTrezorFwVersion() {
  try {
    const minSupportedFwVersion = '2.0.8'
    const {model, fwVersion} = await getTrezorInfo()

    if (model === 'T' && fwVersion < minSupportedFwVersion) {
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

async function getTrezorInfo() {
  const {payload: features} = await TrezorConnect.getFeatures()
  const fwVersion = `${features.major_version}.${features.minor_version}.${features.patch_version}`

  return {
    model: features.model,
    fwVersion,
  }
}

module.exports = alertIfUnsupportedTrezorFwVersion
