import {ADALITE_CONFIG} from '../config'
import {ADA_DONATION_ADDRESS, ADA_DONATION_ADDRESS_BYRON} from '../wallet/constants'

function getDonationAddress() {
  switch (ADALITE_CONFIG.ADALITE_CARDANO_VERSION) {
    case 'byron':
      return ADA_DONATION_ADDRESS_BYRON
    case 'shelley':
      return ADA_DONATION_ADDRESS
    default:
      throw Error('bad cardano version')
  }
}

export default getDonationAddress
