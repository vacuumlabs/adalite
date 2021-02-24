import {ADALITE_CONFIG} from '../config'
import {_Address} from '../types'
import {ADA_DONATION_ADDRESS, ADA_DONATION_ADDRESS_BYRON} from '../wallet/constants'

function getDonationAddress(): _Address {
  switch (ADALITE_CONFIG.ADALITE_CARDANO_VERSION) {
    case 'byron':
      return ADA_DONATION_ADDRESS_BYRON as _Address
    case 'shelley':
      return ADA_DONATION_ADDRESS as _Address
    default:
      throw Error('bad cardano version')
  }
}

export default getDonationAddress
