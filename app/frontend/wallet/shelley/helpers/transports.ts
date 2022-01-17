import {isWindows, isOpera} from 'react-device-detect'

import LedgerTransportWebUsb from '@ledgerhq/hw-transport-webusb'
import LedgerTransportWebHid from '@ledgerhq/hw-transport-webhid'
import LedgerTransportU2F from '@ledgerhq/hw-transport-u2f'
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

const isU2FSupported = async (): Promise<boolean> => {
  return await LedgerTransportU2F.isSupported()
}

const getDefaultLedgerTransportType = async (): Promise<LedgerTransportType> => {
  const supportWebHid = await isWebHidSupported()
  const supportWebUsb = await isWebUsbSupported()
  const supportU2F = await isU2FSupported()

  if (supportWebHid) {
    return LedgerTransportChoice.WEB_HID
  } else if (supportWebUsb) {
    return LedgerTransportChoice.WEB_USB
  } else if (supportU2F) {
    return LedgerTransportChoice.U2F
  } else {
    return LedgerTransportChoice.WEB_HID
  }
}

export {getDefaultLedgerTransportType}
