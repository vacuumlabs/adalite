import * as lib from '@emurgo/js-chain-libs'
import * as _ from 'lodash'
import {Buffer} from 'buffer'

// Note(ppershing): cannot be imported directly via destructuring :-(
const {
  Account,
  Address,
  Fee,
  Fragment,
  Hash,
  Input,
  InputOutputBuilder,
  OutputPolicy,
  Payload,
  PayloadAuthData,
  DelegationType,
  DelegationRatio,
  PoolDelegationRatios,
  PoolDelegationRatio,
  PoolId,
  Certificate,
  StakeDelegation,
  StakeDelegationAuthData,
  AccountBindingSignature,
  PrivateKey,
  SpendingCounter,
  TransactionBuilder,
  Value,
  Witness,
  Witnesses,
  TransactionSignDataHash,
  UtxoPointer,
  FragmentId,
  Bip32PrivateKey,
  LegacyDaedalusPrivateKey,
} = lib

export type HexString = string & {__typeHexString: any}

export const buf2hex = (arrayBuffer) => {
  return Array.from(new Uint8Array(arrayBuffer))
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
}

const hex2buf = (str) => new Buffer(str, 'hex')

interface ChainConfig {
  block0Hash: string
  fees: {
    constant: number
    coefficient: number
    certificate: number
    // eslint-disable-next-line camelcase
    per_certificate_fees: {
      // eslint-disable-next-line camelcase
      certificate_pool_registration: number
      // eslint-disable-next-line camelcase
      certificate_stake_delegation: number
    }
  }
}

interface CalculateFeeParams {
  inputCount: number
  outputCount: number
  certCount: number
  chainConfig: ChainConfig
}

export const computeRequiredTxFee = (chainConfig: ChainConfig) => (
  inputs,
  outputs,
  extra?: any
) => {
  const fees = chainConfig.fees
  return (
    fees.constant +
    fees.coefficient * (inputs.length + outputs.length) +
    (extra ? fees.per_certificate_fees[extra.type] : 0)
  )
}

const _buildIOs = (inputs, outputs, payload) => {
  const inputBuilders = {
    account: ({address, value}) =>
      Input.from_account(
        Account.from_address(Address.from_string(address)),
        Value.from_str(value.toString())
      ),
    utxo: ({txid, outputNo, value}) =>
      Input.from_utxo(
        UtxoPointer.new(
          FragmentId.from_bytes(hex2buf(txid)),
          outputNo,
          Value.from_str(value.toString())
        )
      ),
  }
  const ioBuilder = InputOutputBuilder.empty()
  inputs.forEach((input) => ioBuilder.add_input(inputBuilders[input.type](input)))

  outputs.forEach(({address, value}) => {
    ioBuilder.add_output(Address.from_string(address), Value.from_str(value.toString()))
  })

  const ios = ioBuilder.seal_with_output_policy(
    payload,
    Fee.linear_fee(Value.from_str('0'), Value.from_str('0'), Value.from_str('0')),
    OutputPolicy.forget()
  )

  return ios
}

const isLegacyAddress = (addr) => addr.toLowerCase() !== addr

const makeWitness = (block0Hash, txAuth, input) => {
  const witnessBuilders = {
    account: (input: AccountInput) =>
      Witness.for_account(
        Hash.from_hex(block0Hash),
        TransactionSignDataHash.from_hex(txAuth),
        PrivateKey.from_extended_bytes(hex2buf(input.privkey)),
        SpendingCounter.from_u32(input.accountCounter)
      ),
    utxo: (input: UTxOInput) =>
      isLegacyAddress(input.address)
        ? /*Witness.for_legacy_icarus_utxo(
          Hash.from_hex(block0Hash),
          TransactionSignDataHash.from_hex(txAuth),
          LegacyDaedalusPrivateKey.from_bytes(hex2buf(input.privkey + input.chaincode)) as any
        )*/
        Witness.for_legacy_daedalus_utxo(
          Hash.from_hex(block0Hash),
          TransactionSignDataHash.from_hex(txAuth),
          LegacyDaedalusPrivateKey.from_bytes(hex2buf(input.privkey + input.chaincode))
        )
        : Witness.for_utxo(
          Hash.from_hex(block0Hash),
          TransactionSignDataHash.from_hex(txAuth),
          PrivateKey.from_extended_bytes(hex2buf(input.privkey))
        ),
  }
  return witnessBuilders[input.type](input)
}

const _buildWitnesses = (block0Hash, txAuth, inputs) => {
  const witnesses = Witnesses.new()

  inputs.forEach((input) => witnesses.add(makeWitness(block0Hash, txAuth, input)))
  return witnesses
}

const createStakeDelegationCert = (pools, publicKey) => {
  const getDelegation = (pools) => {
    if (pools.length === 0) {
      return DelegationType.non_delegated()
    }
    if (pools.length === 1) {
      // full delegation
      return DelegationType.full(PoolId.from_hex(pools[0].id))
    }
    // delegation by ratio
    const poolDelegationRatios = PoolDelegationRatios.new()
    let ratioSum = 0
    pools.map((pool) => {
      poolDelegationRatios.add(PoolDelegationRatio.new(PoolId.from_hex(pool.id), pool.ratio))
      ratioSum += pool.ratio
    })

    return DelegationType.ratio(DelegationRatio.new(ratioSum, poolDelegationRatios))
  }

  return Certificate.stake_delegation(StakeDelegation.new(getDelegation(pools), publicKey))
}

const _getCert = (extra) => {
  if (extra == null) {
    return {
      certificate: null,
      payloadAuth: (data) => PayloadAuthData.for_no_payload(),
    }
  }

  if (extra.type === 'stake_delegation') {
    const makePrivateKey = (privkey) => PrivateKey.from_extended_bytes(hex2buf(privkey))
    const certificate = createStakeDelegationCert(
      extra.pools,
      makePrivateKey(extra.privkey).to_public()
    )
    const payloadAuth = (data) =>
      PayloadAuthData.for_stake_delegation(
        StakeDelegationAuthData.new(
          AccountBindingSignature.new_single(makePrivateKey(extra.privkey), data)
        )
      )
    return {
      certificate,
      payloadAuth,
    }
  }

  throw Error('unknown cert type')
}

type Input = AccountInput | UTxOInput

interface AccountInput {
  type: 'account'
  address: string
  privkey: HexString
  accountCounter: number
  value: number
}

interface UTxOInput {
  type: 'utxo'
  address: string
  privkey: HexString
  chaincode: HexString
  value: number
}

interface Output {
  address: string
  value: number
}

interface StakeDelegation {
  type: 'stake_delegation' | string
  privkey: HexString
  pools: Array<{id: HexString; ratio: number}>
}

interface BuildTransactionParams {
  inputs: Array<Input>
  outputs: Array<Output>
  cert: StakeDelegation | null
  chainConfig: ChainConfig
}

export const verifyFee = ({inputs, outputs, cert, chainConfig}) => {
  const amountIn = _.sumBy(inputs, (inp) => inp.value)
  const amountOut = _.sumBy(outputs, (out) => out.value)
  const fee = computeRequiredTxFee(chainConfig)(inputs, outputs, cert)

  // if (amountIn !== amountOut + fee) throw new Error('Unbalanced tx')
}

export const buildTransaction = ({inputs, outputs, cert, chainConfig}: BuildTransactionParams) => {
  const {certificate, payloadAuth} = _getCert(cert)

  const txbuilder = new TransactionBuilder()
  const txIOsBuilder = certificate ? txbuilder.payload(certificate) : txbuilder.no_payload()

  const ios = _buildIOs(
    inputs,
    outputs,
    certificate ? Payload.certificate(certificate) : Payload.no_payload()
  )
  const txWitnessBuilder = txIOsBuilder.set_ios(ios.inputs(), ios.outputs())

  const txAuthHash = buf2hex(txWitnessBuilder.get_auth_data_for_witness().as_bytes())

  const witnesses = _buildWitnesses(chainConfig.block0Hash, txAuthHash, inputs)

  const txAuthBuilder = txWitnessBuilder.set_witnesses(witnesses)

  const signedTx = txAuthBuilder.set_payload_auth(payloadAuth(txAuthBuilder.get_auth_data()))

  const message = Fragment.from_transaction(signedTx)

  verifyFee({inputs, outputs, cert, chainConfig})

  return {
    transaction: buf2hex(message.as_bytes()),
    fragmentId: buf2hex(message.id().as_bytes()),
  }
}
