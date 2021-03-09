import {Address, CertificateType, HexString, Lovelace} from '../../types'
import {decode} from 'borc'
import {parseUnsignedTx} from './parser'
import {
  TxCertificateKeys,
  _Certificate,
  _Input,
  _Output,
  _UnsignedTxParsed,
  _Withdrawal,
} from './types'
import {TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../../frontend/wallet/types'
import NamedError from '../NamedError'
import {transformPoolParamsTypes} from '../../../frontend/wallet/shelley/helpers/poolCertificateUtils'
import {bech32} from 'cardano-crypto.js'

const prepareInputs = (inputs: _Input[]): TxInput[] => {
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

const prepareOutputs = (outputs: _Output[]): TxOutput[] => {
  return outputs.map((output) => {
    return {
      isChange: false,
      address: bech32.encode('addr', output.address),
      coins: Number(output.coins) as Lovelace,
      tokens: [], // TODO: convert tokens to adalite type
    }
  })
}

const prepareCertificates = (
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

const prepareWithdrawals = (
  withdrawals: _Withdrawal[],
  stakingAddress: Address
): TxWithdrawal[] => {
  if (withdrawals.length > 0) throw NamedError('PoolRegTxParserError')
  return [] // pool reg tx cant have withdrawals
}

const prepareTtl = (ttl: BigInt) => Number(ttl)

const prepareFee = (fee: BigInt) => Number(fee)

const parseUnsignedTxCborHex = (unsignedTxCborHex: HexString): _UnsignedTxParsed => {
  const unsignedTxDecoded = decode(unsignedTxCborHex)
  return parseUnsignedTx(unsignedTxDecoded)
}

export {
  prepareCertificates,
  prepareInputs,
  prepareOutputs,
  parseUnsignedTxCborHex,
  prepareWithdrawals,
  prepareTtl,
  prepareFee,
}
