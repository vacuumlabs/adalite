import {InternalError, InternalErrorReason} from '../../../errors'
import assertUnreachable from '../../../helpers/assertUnreachable'
import {Lovelace} from '../../../types'
import {
  CATALYST_SIGNATURE_BYTE_LENGTH,
  MAX_TX_SIZE,
  METADATA_HASH_BYTE_LENGTH,
  TX_WITNESS_SIZES,
} from '../../constants'
import {TxAuxiliaryData, TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../types'
import {isShelleyFormat, isV1Address} from '../helpers/addresses'
import {
  cborizeTxAuxiliaryVotingData,
  cborizeTxCertificates,
  cborizeTxInputs,
  cborizeTxOutputs,
  cborizeTxWithdrawals,
} from '../shelley-transaction'
import {encode} from 'borc'

function estimateAuxiliaryDataSize(auxiliaryData: TxAuxiliaryData) {
  switch (auxiliaryData.type) {
    case 'CATALYST_VOTING': {
      const placeholderMetaSignature = 'x'.repeat(CATALYST_SIGNATURE_BYTE_LENGTH * 2)
      return encode(cborizeTxAuxiliaryVotingData(auxiliaryData, placeholderMetaSignature)).length
    }
    default:
      return assertUnreachable(auxiliaryData.type)
  }
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
export function estimateTxSize(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  certificates: Array<TxCertificate>,
  withdrawals: Array<TxWithdrawal>,
  auxiliaryData: TxAuxiliaryData
): Lovelace {
  // the 1 is there for the key in the tx map
  const txInputsSize = encode(cborizeTxInputs(inputs)).length + 1
  /*
   * we have to estimate size of tx outputs since we are calculating
   * fee also in cases we dont know the amount of coins in advance
   */
  const txOutputs: TxOutput[] = outputs.map((output) => ({
    isChange: false,
    address: output.address,
    coins: Number.MAX_SAFE_INTEGER as Lovelace,
    tokenBundle: output.tokenBundle,
  }))
  // TODO: max output size
  const txOutputsSize = encode(cborizeTxOutputs(txOutputs)).length + 1

  const txCertificatesSize = encode(cborizeTxCertificates(certificates)).length + 1
  const txWithdrawalsSize = encode(cborizeTxWithdrawals(withdrawals)).length + 1
  const txTllSize = encode(Number.MAX_SAFE_INTEGER).length + 1
  const txFeeSize = encode(Number.MAX_SAFE_INTEGER).length + 1
  const txAuxiliaryDataHashSize = auxiliaryData
    ? encode('x'.repeat(METADATA_HASH_BYTE_LENGTH * 2)).length + 1
    : 0
  const txAuxSize =
    txInputsSize +
    txOutputsSize +
    txCertificatesSize +
    txWithdrawalsSize +
    txFeeSize +
    txTllSize +
    txAuxiliaryDataHashSize

  const shelleyInputs = inputs.filter(({address}) => isShelleyFormat(address))
  const byronInputs = inputs.filter(({address}) => !isShelleyFormat(address))

  const shelleyWitnessesSize =
    (withdrawals.length + certificates.length + shelleyInputs.length) * TX_WITNESS_SIZES.shelley

  const byronWitnessesSize = byronInputs.reduce((acc, {address}) => {
    const witnessSize = isV1Address(address) ? TX_WITNESS_SIZES.byronV1 : TX_WITNESS_SIZES.byronv2
    return acc + witnessSize
  }, 0)

  const txWitnessesSize = shelleyWitnessesSize + byronWitnessesSize

  const txAuxiliaryDataEstimate = auxiliaryData ? estimateAuxiliaryDataSize(auxiliaryData) + 1 : 0
  const txAuxiliaryDataSize = txAuxiliaryDataEstimate + 1

  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize + txAuxiliaryDataSize

  if (txSizeInBytes > MAX_TX_SIZE) throw new InternalError(InternalErrorReason.TxTooBig)
  /*
   * the slack is there for the array of tx witnesses
   * because it may have more than 1 byte of overhead
   * if more than 16 elements are present
   */
  const slack = 1 // TODO

  return txSizeInBytes + slack
}
