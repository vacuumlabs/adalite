import {Address, CertificateType, Lovelace, Token} from '../../../types'
import {decode} from 'borc'
import {parseUnsignedTx} from '../../../helpers/cliParser/txParser'
import {
  TxCertificateKeys,
  _Certificate,
  _Input,
  _MultiAsset,
  _Output,
  _UnsignedTxParsed,
  _Withdrawal,
} from '../../../helpers/cliParser/types'
import {TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../../../frontend/wallet/types'
import NamedError from '../../../helpers/NamedError'
import {ensureIsSafeInt, parseStakepoolRegistrationCertificate} from './poolCertificateUtils'
import * as _ from 'lodash'
import {TxPlan} from '../shelley-transaction-planner'
import {encodeAddress} from './addresses'

const validatePoolRegUnsignedTx = (unsignedTx: _UnsignedTxParsed) => {
  if (
    !unsignedTx ||
    !unsignedTx.certificates ||
    unsignedTx.certificates.length !== 1 ||
    unsignedTx.certificates[0].type !== TxCertificateKeys.STAKEPOOL_REGISTRATION
  ) {
    throw Error(
      'Pool registration transaction must include exactly one pool registration certficate.'
    )
  }
  if (unsignedTx.withdrawals.length > 0) {
    throw Error("Pool registration transaction can't include reward withdrawals.")
  }
  return null
}

const parseCliTokens = (tokenBundle: _MultiAsset[]): Token[] =>
  _(tokenBundle)
    .map((token) =>
      token.assets.map((asset) => ({
        policyId: token.policyId.toString('hex'),
        assetName: asset.assetName.toString('hex'),
        quantity: ensureIsSafeInt(asset.amount, 'Token amount'),
      }))
    )
    .flatten()
    .value()

const parseCliInputs = (inputs: _Input[]): TxInput[] => {
  return inputs.map((input) => {
    return {
      txHash: input.txHash.toString('hex'),
      outputIndex: input.outputIndex,
      coins: null,
      tokenBundle: null,
      address: null,
    }
  })
}

const parseCliOutputs = (outputs: _Output[]): TxOutput[] => {
  return outputs.map((output) => {
    return {
      isChange: false,
      address: encodeAddress(output.address),
      coins: ensureIsSafeInt(output.coins, 'Output coins') as Lovelace,
      tokenBundle: parseCliTokens(output.tokenBundle),
    }
  })
}

const parseCliCertificates = (
  certificates: _Certificate[],
  stakingAddress: Address
): TxCertificate[] => {
  return certificates.map((certificate) => {
    if (certificate.type !== TxCertificateKeys.STAKEPOOL_REGISTRATION) {
      throw NamedError('PoolRegTxParserError') // TODO
    }
    return {
      type: CertificateType.STAKEPOOL_REGISTRATION,
      stakingAddress,
      poolRegistrationParams: parseStakepoolRegistrationCertificate(certificate),
    }
  })
}

const parseCliWithdrawals = (
  withdrawals: _Withdrawal[],
  stakingAddress: Address
): TxWithdrawal[] => {
  if (withdrawals.length > 0) throw NamedError('PoolRegTxParserError')
  return [] // pool reg tx cant have withdrawals
}

const parseCliTtl = (ttl: BigInt | undefined): number | null =>
  ttl !== undefined ? ensureIsSafeInt(ttl, 'Ttl') : null

const parseCliFee = (fee: BigInt): number => ensureIsSafeInt(fee, 'Fee')

const parseCliValidityIntervalStart = (validityIntervalStart: BigInt | undefined): number | null =>
  validityIntervalStart !== undefined
    ? ensureIsSafeInt(validityIntervalStart, 'Validity interval start')
    : null

const unsignedPoolTxToTxPlan = (unsignedTx: _UnsignedTxParsed, stakingAddress: Address): TxPlan => {
  return {
    inputs: parseCliInputs(unsignedTx.inputs),
    outputs: parseCliOutputs(unsignedTx.outputs),
    change: null,
    certificates: parseCliCertificates(unsignedTx.certificates, stakingAddress),
    deposit: 0 as Lovelace,
    additionalLovelaceAmount: 0 as Lovelace,
    fee: parseCliFee(unsignedTx.fee) as Lovelace,
    withdrawals: parseCliWithdrawals(unsignedTx.withdrawals, stakingAddress),
  }
}

const parseCliUnsignedTx = (fileContentStr: string) => {
  const {cborHex, type: txBodyType} = JSON.parse(fileContentStr)
  const unsignedTxDecoded = decode(cborHex)
  const unsignedTxParsed = parseUnsignedTx(unsignedTxDecoded)
  const deserializedTxValidationError = validatePoolRegUnsignedTx(unsignedTxParsed)
  if (deserializedTxValidationError) {
    throw deserializedTxValidationError
  }
  return {
    txBodyType: txBodyType as string,
    unsignedTxParsed,
    ttl: parseCliTtl(unsignedTxParsed.ttl),
    validityIntervalStart: parseCliValidityIntervalStart(unsignedTxParsed.validityIntervalStart),
  }
}

export {
  parseCliUnsignedTx,
  parseCliTtl,
  parseCliValidityIntervalStart,
  parseCliFee,
  unsignedPoolTxToTxPlan,
}
