import {Lovelace} from '../../../types'
import {TxAuxiliaryData, TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../types'

export type TxPlanDraft = {
  outputs: TxOutput[]
  certificates: TxCertificate[]
  withdrawals: TxWithdrawal[]
  auxiliaryData: TxAuxiliaryData | null
}

export type TxPlanResultSuccess = {
  success: true
  txPlan: TxPlan
}

type TxPlanResultError = {
  success: false
  error: any
  estimatedFee: Lovelace
  deposit: Lovelace
  minimalLovelaceAmount: Lovelace
}

export type TxPlanResult = TxPlanResultSuccess | TxPlanResultError

export function isTxPlanResultSuccess(
  txPlanResult: TxPlanResult | null | undefined
): txPlanResult is TxPlanResultSuccess {
  return txPlanResult?.success === true
}

export interface TxPlan {
  inputs: Array<TxInput>
  outputs: Array<TxOutput>
  change: Array<TxOutput>
  certificates: Array<TxCertificate>
  deposit: Lovelace
  additionalLovelaceAmount: Lovelace
  fee: Lovelace
  baseFee: Lovelace
  withdrawals: Array<TxWithdrawal>
  auxiliaryData: TxAuxiliaryData | null
}
