import {isOpera} from 'react-device-detect'

import LedgerTransportWebHid from '@ledgerhq/hw-transport-webhid'
import {LedgerTransportType, LedgerTransportChoice} from '../../../types'

const isWebHidSupported = async (): Promise<boolean> => {
  // On Opera the device-selection pop-up appears but there's no apparent way to
  // select the device, resulting in an "Operation rejected by user" error
  const isSupported = await LedgerTransportWebHid.isSupported()
  return isSupported && !isOpera
}

const getDefaultLedgerTransportType = async (): Promise<LedgerTransportType> => {
  const supportWebHid = await isWebHidSupported()

  if (supportWebHid) {
    return LedgerTransportChoice.WEB_HID
  }

  return LedgerTransportChoice.WEB_USB
}

export {getDefaultLedgerTransportType}
