import {Address, CertificateType, Lovelace, Token, TokenBundle} from '../../../types'
import {encode, decode} from 'borc'
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
import {InternalError, InternalErrorReason} from '../../../errors'
import {ensureIsSafeInt, parseStakepoolRegistrationCertificate} from './poolCertificateUtils'
import * as _ from 'lodash'
import {TxPlan} from '../transaction/types'
import {encodeAddress} from './addresses'
import {CborizedCliWitness} from '../types'

type CliTxBodyType = 'TxUnsignedShelley' | 'TxBodyAllegra' | 'TxBodyMary'
type CliTxWitnessType = 'TxWitnessShelley' | 'TxWitness AllegraEra' | 'TxWitness MaryEra'
const preferredCliTxBodyType: CliTxBodyType = 'TxBodyMary'
const cliTxBodyTypeToWitnessType: {[K in CliTxBodyType]: CliTxWitnessType} = {
  TxUnsignedShelley: 'TxWitnessShelley',
  TxBodyAllegra: 'TxWitness AllegraEra',
  TxBodyMary: 'TxWitness MaryEra',
}

const validatePoolRegUnsignedTx = (unsignedTx: _UnsignedTxParsed) => {
  if (
    !unsignedTx ||
    !unsignedTx.certificates ||
    unsignedTx.certificates.length !== 1 ||
    unsignedTx.certificates[0].type !== TxCertificateKeys.STAKEPOOL_REGISTRATION
  ) {
    throw new Error(
      'Pool registration transaction must include exactly one pool registration certficate.'
    )
  }
  if (unsignedTx.withdrawals.length > 0) {
    throw new Error("Pool registration transaction can't include reward withdrawals.")
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
    // TODO refactor to not override the types
    return {
      txHash: input.txHash.toString('hex'),
      outputIndex: input.outputIndex,
      coins: 0 as Lovelace,
      tokenBundle: [] as TokenBundle,
      address: '' as Address,
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
      throw new InternalError(InternalErrorReason.PoolRegTxParserError) // TODO
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
  if (withdrawals.length > 0) throw new InternalError(InternalErrorReason.PoolRegTxParserError)
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
    change: [],
    certificates: parseCliCertificates(unsignedTx.certificates, stakingAddress),
    deposit: 0 as Lovelace,
    additionalLovelaceAmount: 0 as Lovelace,
    fee: parseCliFee(unsignedTx.fee) as Lovelace,
    baseFee: parseCliFee(unsignedTx.fee) as Lovelace,
    withdrawals: parseCliWithdrawals(unsignedTx.withdrawals, stakingAddress),
    auxiliaryData: null,
  }
}

function parsePoolRegTxFile(fileContentStr: string) {
  const {cborHex, type: txBodyType} = JSON.parse(fileContentStr)
  if (!cborHex || !txBodyType) {
    throw new Error(
      'Invalid file structure. Make sure the JSON file has "type" and "cborHex" keys on the top level.'
    )
  }
  if (!Object.keys(cliTxBodyTypeToWitnessType).includes(txBodyType)) {
    throw new Error(`Unsupported transaction era, preferably use ${preferredCliTxBodyType} era.`)
  }
  return {cborHex, txBodyType}
}

const parseCliUnsignedTx = (cborHex: string) => {
  const unsignedTxDecoded = decode(cborHex)
  const unsignedTxParsed = parseUnsignedTx(unsignedTxDecoded)
  const deserializedTxValidationError = validatePoolRegUnsignedTx(unsignedTxParsed)
  if (deserializedTxValidationError) {
    throw deserializedTxValidationError
  }
  return {
    unsignedTxParsed,
    ttl: parseCliTtl(unsignedTxParsed.ttl),
    validityIntervalStart: parseCliValidityIntervalStart(unsignedTxParsed.validityIntervalStart),
  }
}

const transformSignatureToCliFormat = (witness: CborizedCliWitness, txBodyType: string) => {
  const type = cliTxBodyTypeToWitnessType[txBodyType]
  return {
    type,
    description: '',
    cborHex: encode(witness).toString('hex'),
  }
}

export {
  parsePoolRegTxFile,
  parseCliUnsignedTx,
  parseCliTtl,
  parseCliValidityIntervalStart,
  parseCliFee,
  unsignedPoolTxToTxPlan,
  transformSignatureToCliFormat,
}
