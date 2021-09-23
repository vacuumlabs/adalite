import distinct from '../../../helpers/distinct'
import {Address, CertificateType, Lovelace, TokenBundle} from '../../../types'
import {aggregateTokenBundles} from '../../helpers/tokenFormater'
import {TxAuxiliaryData, TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../types'
import {MIN_UTXO_VALUE} from './constants'
import {estimateTxSize} from './estimateTxSize'

export const computeMinUTxOLovelaceAmount = (tokenBundle: TokenBundle): Lovelace => {
  // based on https://github.com/input-output-hk/cardano-ledger-specs/blob/master/doc/explanations/min-utxo.rst
  const quot = (x: number, y: number) => Math.floor(x / y)
  const roundupBytesToWords = (x: number) => quot(x + 7, 8)
  // TODO: this to network config or constants
  const minUTxOValue = MIN_UTXO_VALUE
  // NOTE: should be 2, but a bug in Haskell set this to 0
  const coinSize = 0
  const txOutLenNoVal = 14
  const txInLen = 7
  const utxoEntrySizeWithoutVal = 6 + txOutLenNoVal + txInLen // 27

  // NOTE: should be 29 but a bug in Haskell set this to 27
  const adaOnlyUtxoSize = utxoEntrySizeWithoutVal + coinSize

  // this ensures there are only distinct (policyId, assetName) pairs
  const aggregatedTokenBundle = aggregateTokenBundles([tokenBundle])

  const distinctAssets = aggregatedTokenBundle.map(({assetName}) => assetName)

  const numAssets = distinctAssets.length
  // number of unique policyIds
  const numPIDs = distinct(aggregatedTokenBundle.map(({policyId}) => policyId)).length

  const sumAssetNameLengths = distinctAssets.reduce(
    (acc, assetName) => acc + Math.max(Buffer.from(assetName, 'hex').byteLength, 1),
    0
  )

  const policyIdSize = 28 // pidSize in specs

  const size =
    6 + roundupBytesToWords(numAssets * 12 + sumAssetNameLengths + numPIDs * policyIdSize)

  if (aggregatedTokenBundle.length === 0) {
    return minUTxOValue as Lovelace
  } else {
    return Math.max(
      minUTxOValue,
      quot(minUTxOValue, adaOnlyUtxoSize) * (utxoEntrySizeWithoutVal + size)
    ) as Lovelace
  }
}

export function txFeeFunction(txSizeInBytes: number): Lovelace {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b) as Lovelace
}

export function computeRequiredTxFee(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  certificates: Array<TxCertificate> = [],
  withdrawals: Array<TxWithdrawal> = [],
  auxiliaryData: TxAuxiliaryData = null
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
  return certificates.reduce((acc, {type}) => acc + CertificateDeposit[type], 0) as Lovelace
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
      coins: computeMinUTxOLovelaceAmount(tokenBundle),
      tokenBundle,
    })
  }
  return outputs
}
