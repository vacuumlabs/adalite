import {Lovelace} from '../../../types'
import {TxCertificate, TxInput, TxOutput, TxWithdrawal, TxPlanAuxiliaryData} from '../../types'

export type TxPlanDraft = {
  outputs: TxOutput[]
  certificates: TxCertificate[]
  withdrawals: TxWithdrawal[]
  auxiliaryData: TxPlanAuxiliaryData | null
}

export type TxPlanResult =
  | {
      success: true
      txPlan: TxPlan
    }
  | {
      success: false
      error: any
      estimatedFee: Lovelace
      deposit: Lovelace
      minimalLovelaceAmount: Lovelace
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
  auxiliaryData: TxPlanAuxiliaryData | null
}
