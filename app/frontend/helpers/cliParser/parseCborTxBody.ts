import {Address, CertificateType, HexString, Lovelace, Token} from '../../types'
import {decode} from 'borc'
import {parseUnsignedTx} from './parser'
import {
  TxCertificateKeys,
  _Certificate,
  _Input,
  _MultiAsset,
  _Output,
  _UnsignedTxParsed,
  _Withdrawal,
} from './types'
import {TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../../frontend/wallet/types'
import NamedError from '../NamedError'
import {transformPoolParamsTypes} from '../../../frontend/wallet/shelley/helpers/poolCertificateUtils'
import {bech32} from 'cardano-crypto.js'
import * as _ from 'lodash'

const parseCliTokens = (tokenBundle: _MultiAsset[]): Token[] =>
  _(tokenBundle)
    .map((token) =>
      token.assets.map((asset) => ({
        policyId: token.policyId.toString('hex'),
        assetName: asset.assetName.toString('hex'),
        quantity: Number(asset.amount),
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
      tokens: null,
      address: null,
    }
  })
}

const parseCliOutputs = (outputs: _Output[]): TxOutput[] => {
  return outputs.map((output) => {
    return {
      isChange: false,
      address: bech32.encode('addr', output.address),
      coins: Number(output.coins) as Lovelace,
      tokens: parseCliTokens(output.tokenBundle),
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
      poolRegistrationParams: transformPoolParamsTypes(certificate),
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

const parseCliTtl = (ttl: BigInt) => Number(ttl)

const parseCliFee = (fee: BigInt) => Number(fee)

const parseCliValidityIntervalStart = (validityIntervalStart: BigInt) =>
  Number(validityIntervalStart)

const parseCliUnsignedTxCborHex = (unsignedTxCborHex: HexString): _UnsignedTxParsed => {
  const unsignedTxDecoded = decode(unsignedTxCborHex)
  return parseUnsignedTx(unsignedTxDecoded)
}

export {
  parseCliCertificates,
  parseCliInputs,
  parseCliOutputs,
  parseCliUnsignedTxCborHex,
  parseCliWithdrawals,
  parseCliTtl,
  parseCliValidityIntervalStart,
  parseCliFee,
}
