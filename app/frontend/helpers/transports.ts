import {isWindows, isOpera} from 'react-device-detect'

import LedgerTransportWebUsb from '@ledgerhq/hw-transport-webusb'
import LedgerTransportWebHid from '@ledgerhq/hw-transport-webhid'
import {LedgerTransportType} from '../types'

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

const getDefaultTransport = async (): Promise<LedgerTransportType> => {
  const supportWebHid = await isWebHidSupported()
  const supportWebUsb = await isWebUsbSupported()

  if (supportWebHid) {
    return LedgerTransportType.WEB_HID
  } else if (supportWebUsb) {
    return LedgerTransportType.WEB_USB
  } else {
    return LedgerTransportType.U2F
  }
}

export {getDefaultTransport}
