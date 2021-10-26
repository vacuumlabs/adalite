import {isWindows, isOpera} from 'react-device-detect'

import LedgerTransportWebUsb from '@ledgerhq/hw-transport-webusb'
import LedgerTransportWebHid from '@ledgerhq/hw-transport-webhid'
import {LedgerTransportType, LedgerTransportChoice} from '../../../types'

const isWebUsbSupported = async (): Promise<boolean> => {
  const isSupported = await LedgerTransportWebUsb.isSupported()
  return isSupported && !isWindows && !isOpera
}

const isWebHidSupported = async (): Promise<boolean> => {
  // On Opera the device-selection pop-up appears but there's no apparent way to
  // select the device, resulting in an "Operation rejected by user" error
  const isSupported = await LedgerTransportWebHid.isSupported()
  return isSupported && !isOpera
}

const getDefaultLedgerTransportType = async (): Promise<LedgerTransportType> => {
  const supportWebHid = await isWebHidSupported()
  const supportWebUsb = await isWebUsbSupported()

  if (supportWebHid) {
    return LedgerTransportChoice.WEB_HID
  } else if (supportWebUsb) {
    return LedgerTransportChoice.WEB_USB
  } else {
    return LedgerTransportChoice.U2F
  }
}

export {getDefaultLedgerTransportType}
