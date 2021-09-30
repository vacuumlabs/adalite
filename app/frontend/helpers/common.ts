import {ADALITE_CONFIG} from '../config'
import {TxSummaryEntry, WalletOperationStatusType} from '../types'
import {CaTxEntry} from '../wallet/backend-types'

export const stripNonNumericCharacters = (text: string): string => text.replace(/[^0-9]/gi, '')

export const isVotingRegistrationOpen = () => {
  const now = Date.now()
  return (
    now > ADALITE_CONFIG.ADALITE_NEXT_VOTING_START && now < ADALITE_CONFIG.ADALITE_NEXT_VOTING_END
  )
}

export const shouldDisableSendingButton = (
  walletOperationStatusType: WalletOperationStatusType
): boolean =>
  walletOperationStatusType &&
  (walletOperationStatusType === 'reloading' ||
    walletOperationStatusType === 'txPending' ||
    walletOperationStatusType === 'txSubmitting')

export function filterValidTransactions<T extends CaTxEntry | TxSummaryEntry>(txs: T[]): T[] {
  // filters txs that did not pass alonzo block script validation
  return txs.filter((tx) => tx.isValid)
}

export function getDateDiffInSeconds(date1: Date, date2: Date) {
  return Math.abs((date1.getTime() - date2.getTime()) / 1000)
}
