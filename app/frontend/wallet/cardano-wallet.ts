import {encode} from 'borc'
import {base58} from 'cardano-crypto.js'

import debugLog from '../helpers/debugLog'
import {generateMnemonic, validateMnemonic} from './mnemonic'

import {TxInputFromUtxo, TxOutput, TxAux} from './transaction'

import AddressManager from './address-manager'
import BlockchainExplorer from './blockchain-explorer'
import PseudoRandom from './helpers/PseudoRandom'
import {
  ADA_DONATION_ADDRESS,
  HARDENED_THRESHOLD,
  MAX_INT32,
  TX_WITNESS_SIZE_BYTES,
} from './constants'
import shuffleArray from './helpers/shuffleArray'
import CborIndefiniteLengthArray from './helpers/CborIndefiniteLengthArray'
import NamedError from '../helpers/NamedError'
import CryptoProviderFactory from './crypto-provider-factory'
import {roundWholeAdas} from '../helpers/adaConverters'
import {Lovelace} from '../state'

function txFeeFunction(txSizeInBytes: number): Lovelace {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b) as Lovelace
}

type UTxO = {
  txHash: string
  address: string
  coins: Lovelace
  outputIndex: number
}

type Input = UTxO

type Output = {
  address: string
  coins: Lovelace
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
function estimateTxSize(inputs: Array<Input>, outputs: Array<Output>): Lovelace {
  // exact size for inputs
  const preparedInputs = inputs.map(TxInputFromUtxo)
  const txInputsSize = encode(new CborIndefiniteLengthArray(preparedInputs)).length

  const maxCborCoinsLen = 9 //length of CBOR encoded 64 bit integer, currently max supported

  const txOutputsSizes = outputs.map(
    // Note(ppershing): we are conservative here
    // FIXME(ppershing): shouldn't there be some +1 for the array encoding?
    // Is it in maxCborCoinsLen?
    ({address, coins}) => base58.decode(address).length + maxCborCoinsLen
  )

  // +2 for indef array start & end
  const txOutputsSize = txOutputsSizes.reduce((acc, x) => acc + x, 0) + 2

  const txMetaSize = 1 // currently empty Map

  // the 1 is there for the CBOR "tag" for an array of 4 elements
  const txAuxSize = 1 + txInputsSize + txOutputsSize + txMetaSize

  const txWitnessesSize = inputs.length * TX_WITNESS_SIZE_BYTES + 1

  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize

  /*
  * the slack is there for the array of tx witnesses
  * because it may have more than 1 byte of overhead
  * if more than 16 elements are present
  */
  const slack = 4

  return txSizeInBytes + slack
}

function computeRequiredTxFee(inputs: Array<Input>, outputs: Array<Output>): Lovelace {
  const fee = txFeeFunction(estimateTxSize(inputs, outputs))
  return fee
}

interface TxPlan {
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  fee: Lovelace
}

interface NoTxPlan {
  estimatedFee: Lovelace
}

function computeTxPlan(
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange: Output
): TxPlan | null {
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0)
  const totalOutput = outputs.reduce((acc, output) => acc + output.coins, 0)

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(inputs, outputs)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput) {
    return {inputs, outputs, change: null, fee: feeWithoutChange as Lovelace}
  }

  const feeWithChange = computeRequiredTxFee(inputs, [...outputs, possibleChange])

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // Instead, just increase the fee
    return {
      inputs,
      outputs,
      change: null,
      fee: (totalOutput - totalInput) as Lovelace,
    }
  }

  return {
    inputs,
    outputs,
    change: {
      address: possibleChange.address,
      coins: (totalInput - totalOutput - feeWithChange) as Lovelace,
    },
    fee: feeWithChange as Lovelace,
  }
}

function getAvailableBalance(utxos: Array<UTxO>): Lovelace {
  return utxos.reduce((acc, utxo) => acc + utxo.coins, 0) as Lovelace
}

function isUtxoProfitable(utxo: UTxO) {
  const inputSize = encode(TxInputFromUtxo(utxo)).length
  const addedCost = txFeeFunction(inputSize + TX_WITNESS_SIZE_BYTES) - txFeeFunction(0)

  return utxo.coins > addedCost
}

function prepareTxAux(plan: TxPlan) {
  const txInputs = plan.inputs.map(TxInputFromUtxo)
  const txOutputs = plan.outputs.map(({address, coins}) => TxOutput(address, coins, false))

  if (plan.change) {
    const {address, coins} = plan.change
    txOutputs.push(TxOutput(address, coins, true))
  }
  return TxAux(txInputs, txOutputs, {})
}

const CardanoWallet = async (options) => {
  const {walletSecretDef, config, randomInputSeed, randomChangeSeed, network} = options
  const state = {
    accountIndex: HARDENED_THRESHOLD,
    network,
  }

  let seeds
  generateNewSeeds()

  const blockchainExplorer = BlockchainExplorer(config)
  const cryptoProvider = await CryptoProviderFactory.getCryptoProvider(
    options.cryptoProviderType,
    Object.assign({}, config, {
      walletSecretDef,
      network,
    }),
    state
  )

  const visibleAddressManager = AddressManager({
    accountIndex: state.accountIndex,
    defaultAddressCount: config.ADALITE_DEFAULT_ADDRESS_COUNT,
    gapLimit: config.ADALITE_GAP_LIMIT,
    cryptoProvider,
    isChange: false,
    blockchainExplorer,
  })

  const changeAddressManager = AddressManager({
    accountIndex: state.accountIndex,
    defaultAddressCount: config.ADALITE_DEFAULT_ADDRESS_COUNT,
    gapLimit: config.ADALITE_GAP_LIMIT,
    cryptoProvider,
    isChange: true,
    blockchainExplorer,
  })

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getHwWalletName() {
    return isHwWallet ? cryptoProvider.getHwWalletName() : undefined
  }

  async function submitTx(signedTx) {
    const {txBody, txHash} = signedTx
    const response = await blockchainExplorer.submitTxRaw(txHash, txBody).catch((e) => {
      debugLog(e)
      throw e
    })

    return response
  }

  function getWalletSecretDef() {
    return {
      rootSecret: cryptoProvider.getWalletSecret(),
      derivationScheme: cryptoProvider.getDerivationScheme(),
    }
  }

  async function signTxAux(txAux: any) {
    const rawInputTxs = await Promise.all(
      txAux.inputs.map(({txHash}) => blockchainExplorer.fetchTxRaw(txHash))
    )
    const signedTx = await cryptoProvider
      .signTx(txAux, rawInputTxs, getAddressToAbsPathMapper())
      .catch((e) => {
        debugLog(e)
        throw NamedError('TransactionRejectedWhileSigning', e.message)
      })

    return signedTx
  }

  function getAddressToAbsPathMapper() {
    const mapping = Object.assign(
      visibleAddressManager.getAddressToAbsPathMapping(),
      changeAddressManager.getAddressToAbsPathMapping()
    )

    return (address) => mapping[address]
  }

  async function getMaxSendableAmount(address, hasDonation, donationAmount, donationType) {
    const utxos = await getUTxOs()
    const profitableUtxos = utxos.filter(isUtxoProfitable)
    const coins = getAvailableBalance(profitableUtxos)

    if (!hasDonation) {
      const inputs = profitableUtxos
      const outputs = [{address, coins: 0 as Lovelace}]

      const txFee = computeRequiredTxFee(inputs, outputs)
      return {sendAmount: Math.max(coins - txFee, 0)}
    } else {
      const inputs = profitableUtxos
      const outputs = [
        {address, coins: 0 as Lovelace},
        {address: ADA_DONATION_ADDRESS, coins: 0 as Lovelace},
      ]
      const txFee = computeRequiredTxFee(inputs, outputs)

      if (donationType === 'percentage') {
        // set maxSendAmount and percentageDonation (0.2% of max) to deplete balance completely
        const percent = 0.2

        const reducedAmount: Lovelace = Math.floor(coins / (1 + percent / 100)) as Lovelace
        const roundedDonation = roundWholeAdas(((reducedAmount * percent) / 100) as Lovelace)

        return {
          sendAmount: coins - txFee - roundedDonation,
          donationAmount: roundedDonation,
        }
      } else {
        return {sendAmount: Math.max(coins - donationAmount - txFee, 0)}
      }
    }
  }

  async function getMaxDonationAmount(address, sendAmount: Lovelace) {
    const utxos = await getUTxOs()
    const profitableUtxos = utxos.filter(isUtxoProfitable)
    const coins = getAvailableBalance(profitableUtxos)

    const inputs = profitableUtxos
    const outputs = [
      {address, coins: 0 as Lovelace},
      {address: ADA_DONATION_ADDRESS, coins: 0 as Lovelace},
    ]

    const txFee = computeRequiredTxFee(inputs, outputs)
    return Math.max(coins - txFee - sendAmount, 0)
  }

  async function getTxPlan(address, coins: Lovelace, donationAmount: Lovelace) {
    const allUtxos = await getUTxOs()
    const changeAddress = await getChangeAddress()
    const plan = selectMinimalTxPlan(allUtxos, address, coins, donationAmount, changeAddress)

    return plan
  }

  async function getBalance() {
    const addresses = await discoverAllAddresses()
    return blockchainExplorer.getBalance(addresses)
  }

  async function getHistory() {
    const addresses = await discoverAllAddresses()

    return blockchainExplorer.getTxHistory(addresses)
  }

  function fetchTxInfo(txHash) {
    return blockchainExplorer.fetchTxInfo(txHash)
  }

  function selectMinimalTxPlan(
    availableUtxos: Array<UTxO>,
    address,
    coins,
    donationAmount,
    changeAddress
  ): TxPlan | NoTxPlan {
    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    const utxos = shuffleArray(availableUtxos, randomGenerator)

    const profitableUtxos = utxos.filter(isUtxoProfitable)

    const inputs = []

    const outputs = [{address, coins}]
    if (donationAmount > 0) outputs.push({address: ADA_DONATION_ADDRESS, coins: donationAmount})

    const change = {address: changeAddress, coins: 0 as Lovelace}

    for (let i = 0; i < profitableUtxos.length; i++) {
      inputs.push(profitableUtxos[i])
      const plan = computeTxPlan(inputs, outputs, change)
      if (plan) return plan
    }

    return {estimatedFee: computeRequiredTxFee(inputs, outputs)}
  }

  async function getChangeAddress() {
    /*
    * We use visible addresses as change addresses to mainintain
    * AdaLite original functionality which did not consider change addresses.
    * This is an intermediate step between legacy mode and full Yoroi compatibility.
    */
    const addresses = filterUnusedEndAddresses(
      await visibleAddressManager.discoverAddressesWithMeta()
    ).map((addrWithMeta) => addrWithMeta.address)

    const randomSeedGenerator = PseudoRandom(seeds.randomChangeSeed)
    const result = addresses[randomSeedGenerator.nextInt() % addresses.length]
    return result
  }

  async function getUTxOs(): Promise<Array<UTxO>> {
    try {
      const addresses = await discoverAllAddresses()
      return await blockchainExplorer.fetchUnspentTxOutputs(addresses)
    } catch (e) {
      throw NamedError('NetworkError')
    }
  }

  async function discoverAllAddresses() {
    const visibleAddresses = await visibleAddressManager.discoverAddresses()
    const changeAddresses = await changeAddressManager.discoverAddresses()

    return visibleAddresses[0] === changeAddresses[0]
      ? visibleAddresses
      : visibleAddresses.concat(changeAddresses)
  }

  async function getFilteredVisibleAddressesWithMeta() {
    return filterUnusedEndAddresses(await visibleAddressManager.discoverAddressesWithMeta())
  }

  function filterUnusedEndAddresses(addressesWithMeta) {
    const defaultAddressCount = config.ADALITE_DEFAULT_ADDRESS_COUNT
    for (let i = addressesWithMeta.length - 1; i >= defaultAddressCount; --i) {
      if (addressesWithMeta[i].isUsed) {
        return addressesWithMeta.slice(0, i + 1)
      }
    }
    return addressesWithMeta.slice(0, defaultAddressCount)
  }

  async function isOwnAddress(addr) {
    const addresses = await discoverAllAddresses()
    return addresses.find((address) => address === addr) !== undefined
  }

  function verifyAddress(addr) {
    if (!cryptoProvider.displayAddressForPath) {
      throw NamedError('UnsupportedOperationError', 'unsupported operation: verifyAddress')
    }
    const absDerivationPath = getAddressToAbsPathMapper()(addr)
    return cryptoProvider.displayAddressForPath(absDerivationPath)
  }

  function generateNewSeeds() {
    seeds = Object.assign({}, seeds, {
      randomInputSeed: randomInputSeed || Math.floor(Math.random() * MAX_INT32),
      randomChangeSeed: randomChangeSeed || Math.floor(Math.random() * MAX_INT32),
    })
  }

  return {
    isHwWallet,
    getHwWalletName,
    getWalletSecretDef,
    submitTx,
    signTxAux,
    getBalance,
    getChangeAddress,
    getMaxSendableAmount,
    getMaxDonationAmount,
    getTxPlan,
    getHistory,
    isOwnAddress,
    getFilteredVisibleAddressesWithMeta,
    prepareTxAux,
    verifyAddress,
    fetchTxInfo,
    generateNewSeeds,
  }
}

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.CardanoWallet = CardanoWallet
}

export {CardanoWallet, generateMnemonic, validateMnemonic, txFeeFunction}
