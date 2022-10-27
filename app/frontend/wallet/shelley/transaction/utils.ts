import BigNumber from 'bignumber.js'
import {Address, CertificateType, Lovelace, TokenBundle} from '../../../types'
import {encodeCbor} from '../../helpers/cbor'
import {TxCertificate, TxPlanAuxiliaryData, TxInput, TxOutput, TxWithdrawal} from '../../types'
import {cborizeSingleTxOutput} from '../shelley-transaction'
import {estimateTxSize} from './estimateTxSize'

export const computeMinUtxoLovelaceAmount = (
  address: Address,
  tokenBundle: TokenBundle
): Lovelace => {
  // Reference:
  // - https://cips.cardano.org/cips/cip55/#thenewminimumlovelacecalculation
  // - https://hydra.iohk.io/build/15339994/download/1/babbage-changes.pdf page 9
  const OVERHEAD = 160

  // taken from https://cexplorer.io/params
  const COINS_PER_UTXO_WORD = 34482
  const COINS_PER_UTXO_BYTE = Math.floor(COINS_PER_UTXO_WORD / 8)

  const MAX_COINS = new BigNumber(2).pow(64).minus(1) as Lovelace

  const txOutput: TxOutput = {
    isChange: false,
    address,
    coins: MAX_COINS,
    tokenBundle,
  }

  const serializedTxOutputSize = encodeCbor(cborizeSingleTxOutput(txOutput)).length + 1

  return new BigNumber((serializedTxOutputSize + OVERHEAD) * COINS_PER_UTXO_BYTE) as Lovelace
}

export function txFeeFunction(txSizeInBytes: number): Lovelace {
  const a = new BigNumber(155381)
  const b = new BigNumber(43.946)

  return a
    .plus(new BigNumber(txSizeInBytes).times(b))
    .integerValue(BigNumber.ROUND_CEIL) as Lovelace
}

export function computeRequiredTxFee(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  certificates: Array<TxCertificate> = [],
  withdrawals: Array<TxWithdrawal> = [],
  auxiliaryData: TxPlanAuxiliaryData | null = null
): Lovelace {
  const fee = txFeeFunction(
    estimateTxSize(inputs, outputs, certificates, withdrawals, auxiliaryData)
  )
  return fee
}

export function computeRequiredDeposit(certificates: Array<TxCertificate>): Lovelace {
  // TODO: this to network config
  const CertificateDeposit: {[key in CertificateType]: number} = {
    [CertificateType.DELEGATION]: 0,
    [CertificateType.STAKEPOOL_REGISTRATION]: 500000000,
    [CertificateType.STAKING_KEY_REGISTRATION]: 2000000,
    [CertificateType.STAKING_KEY_DEREGISTRATION]: -2000000,
  }
  return certificates.reduce(
    (acc, {type}) => acc.plus(CertificateDeposit[type]),
    new BigNumber(0)
  ) as Lovelace
}

export const createTokenChangeOutputs = (
  changeAddress: Address,
  changeTokenBundle: TokenBundle,
  maxOutputTokens: number
): TxOutput[] => {
  const nOutputs = Math.ceil(changeTokenBundle.length / maxOutputTokens)
  const outputs: TxOutput[] = []
  for (let i = 0; i < nOutputs; i++) {
    const tokenBundle = changeTokenBundle.slice(i * maxOutputTokens, (i + 1) * maxOutputTokens)
    outputs.push({
      isChange: false,
      address: changeAddress,
      coins: computeMinUtxoLovelaceAmount(changeAddress, tokenBundle),
      tokenBundle,
    })
  }
  return outputs
}
