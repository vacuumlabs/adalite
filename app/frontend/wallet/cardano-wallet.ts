import debugLog from '../helpers/debugLog'

import {TxInputFromUtxo, TxOutput, TxAux} from './byron/byron-transaction'

import AddressManager from './address-manager'
import {ByronAddressProvider} from './byron/byron-address-provider'
import BlockchainExplorer from './blockchain-explorer'
import PseudoRandom from './helpers/PseudoRandom'
import {MAX_INT32} from './constants'
import shuffleArray from './helpers/shuffleArray'
import NamedError from '../helpers/NamedError'
import {Lovelace} from '../state'

import {computeRequiredTxFee, selectMinimalTxPlan, isUtxoProfitable} from './byron-tx-planner'

import {MaxAmountCalculator} from './max-amount-calculator'

const {
  getMaxDonationAmount: _getMaxDonationAmount,
  getMaxSendableAmount: _getMaxSendableAmount,
} = MaxAmountCalculator(computeRequiredTxFee)

type UTxO = {
  txHash: string
  address: string
  coins: Lovelace
  outputIndex: number
}

export type Input = UTxO

export type Output = {
  address: string
  coins: Lovelace
}

export interface TxPlan {
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  fee: Lovelace
}

interface NoTxPlan {
  estimatedFee: Lovelace
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

interface AddressInfo {
  address: string
  bip32StringPath: string
  isUsed: boolean
}

function filterUnusedEndAddresses(
  addressesWithMeta: Array<AddressInfo>,
  minCount: number
): Array<AddressInfo> {
  for (let i = addressesWithMeta.length - 1; i >= minCount; --i) {
    if (addressesWithMeta[i].isUsed) {
      return addressesWithMeta.slice(0, i + 1)
    }
  }
  return addressesWithMeta.slice(0, minCount)
}

const CardanoWallet = (options) => {
  const {cryptoProvider, config, randomInputSeed, randomChangeSeed} = options
  const accountIndex = 0

  let seeds
  generateNewSeeds()

  const blockchainExplorer = BlockchainExplorer(config)

  const visibleAddressManager = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit: config.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })

  const changeAddressManager = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit: config.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getHwWalletName() {
    return isHwWallet ? (cryptoProvider as any).getHwWalletName() : undefined
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
    return _getMaxSendableAmount(utxos, address, hasDonation, donationAmount, donationType)
  }

  async function getMaxDonationAmount(address, sendAmount: Lovelace) {
    const utxos = await getUTxOs()
    return _getMaxDonationAmount(utxos, address, sendAmount)
  }

  async function getTxPlan(address, coins: Lovelace, donationAmount: Lovelace) {
    const availableUtxos = await getUTxOs()
    const changeAddress = await getChangeAddress()

    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    const shuffledUtxos = shuffleArray(availableUtxos, randomGenerator)
    const plan = selectMinimalTxPlan(shuffledUtxos, address, coins, donationAmount, changeAddress)

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

  async function fetchTxInfo(txHash) {
    return await blockchainExplorer.fetchTxInfo(txHash)
  }

  async function getChangeAddress() {
    /*
    * We use visible addresses as change addresses to mainintain
    * AdaLite original functionality which did not consider change addresses.
    * This is an intermediate step between legacy mode and full Yoroi compatibility.
    */
    const candidates = await getVisibleAddresses()

    const randomSeedGenerator = PseudoRandom(seeds.randomChangeSeed)
    const choice = candidates[randomSeedGenerator.nextInt() % candidates.length]
    return choice.address
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

  async function getVisibleAddresses() {
    const addresses = await visibleAddressManager.discoverAddressesWithMeta()
    return filterUnusedEndAddresses(addresses, config.ADALITE_DEFAULT_ADDRESS_COUNT)
  }

  async function verifyAddress(addr: string) {
    if (!('displayAddressForPath' in cryptoProvider)) {
      throw NamedError('UnsupportedOperationError', 'unsupported operation: verifyAddress')
    }
    const absDerivationPath = getAddressToAbsPathMapper()(addr)
    return await cryptoProvider.displayAddressForPath(absDerivationPath)
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
    getVisibleAddresses,
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

export {CardanoWallet}
