import {Address} from '../types'
import {ADA_DONATION_ADDRESS} from '../wallet/constants'

function getDonationAddress(): Address {
  return ADA_DONATION_ADDRESS as Address
}

export default getDonationAddress
