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
import {computeRequiredTxFee, selectMinimalTxPlan, isUtxoProfitable} from './byron/byron-tx-planner'
import {MaxAmountCalculator} from './max-amount-calculator'
// eslint-disable-next-line no-unused-vars
import {TxPlan} from './shelley/build-transaction'

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

const MyAddresses = ({
  cryptoProvider,
  accountIndex,
  gapLimit,
  blockchainExplorer,
  defaultAddressCount,
}) => {
  const visibleAddressManager = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const changeAddressManager = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  function getAddressToAbsPathMapper() {
    const mapping = Object.assign(
      visibleAddressManager.getAddressToAbsPathMapping(),
      changeAddressManager.getAddressToAbsPathMapping()
    )

    return (address) => mapping[address]
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
    return filterUnusedEndAddresses(addresses, defaultAddressCount)
  }

  return {
    getAddressToAbsPathMapper,
    discoverAllAddresses,
    getVisibleAddresses,
  }
}

const CardanoWallet = (options) => {
  const {cryptoProvider, config, randomInputSeed, randomChangeSeed} = options

  let seeds
  generateNewSeeds()

  const blockchainExplorer = BlockchainExplorer(config)

  const myAddresses = MyAddresses({
    accountIndex: 0,
    cryptoProvider,
    gapLimit: config.ADALITE_GAP_LIMIT,
    defaultAddressCount: config.ADALITE_DEFAULT_ADDRESS_COUNT,
    blockchainExplorer,
  })

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getWalletName() {
    return isHwWallet ? (cryptoProvider as any).getHwWalletName() : undefined
  }

  function submitTx(signedTx): Promise<any> {
    const {txBody, txHash} = signedTx
    return blockchainExplorer.submitTxRaw(txHash, txBody, {})
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
      .signTx(txAux, rawInputTxs, myAddresses.getAddressToAbsPathMapper())
      .catch((e) => {
        debugLog(e)
        throw NamedError('TransactionRejectedWhileSigning', {message: e.message})
      })

    return signedTx
  }

  async function getMaxSendableAmount(address, hasDonation, donationAmount, donationType) {
    const utxos = (await getUTxOs()).filter(isUtxoProfitable)
    return _getMaxSendableAmount(utxos, address, hasDonation, donationAmount, donationType)
  }

  async function getMaxDonationAmount(address, sendAmount: Lovelace) {
    const utxos = (await getUTxOs()).filter(isUtxoProfitable)
    return _getMaxDonationAmount(utxos, address, sendAmount)
  }

  async function getTxPlan(args) {
    const {address, coins, donationAmount} = args
    const availableUtxos = (await getUTxOs()).filter(isUtxoProfitable)
    const changeAddress = await getChangeAddress()

    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    const shuffledUtxos = shuffleArray(availableUtxos, randomGenerator)
    const plan = selectMinimalTxPlan(shuffledUtxos, address, coins, donationAmount, changeAddress)

    return plan
  }

  async function getWalletInfo() {
    const balance = await getBalance()
    const transactionHistory = await getHistory()
    const visibleAddresses = await getVisibleAddresses()
    return {
      balance,
      transactionHistory,
      visibleAddresses,
    }
  }

  async function getBalance() {
    const addresses = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getBalance(addresses)
  }

  async function getHistory() {
    const addresses = await myAddresses.discoverAllAddresses()

    return blockchainExplorer.getTxHistory(addresses)
  }

  function getValidStakepools() {
    return {validStakepools: null, ticker2Id: null}
  }

  function getMaxNonStakingAmount(address) {
    throw NamedError('UnsupportedOperationError', {
      message: 'Incompatible operation with Byron wallet',
    })
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
    const addresses = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.fetchUnspentTxOutputs(addresses)
  }

  function getVisibleAddresses(): Promise<any> {
    return myAddresses.getVisibleAddresses()
  }

  async function verifyAddress(addr: string) {
    if (!('displayAddressForPath' in cryptoProvider)) {
      throw NamedError('UnsupportedOperationError', {
        message: 'unsupported operation: verifyAddress',
      })
    }
    const absDerivationPath = myAddresses.getAddressToAbsPathMapper()(addr)
    return await cryptoProvider.displayAddressForPath(absDerivationPath)
  }

  function generateNewSeeds() {
    seeds = {
      randomInputSeed: randomInputSeed || Math.floor(Math.random() * MAX_INT32),
      randomChangeSeed: randomChangeSeed || Math.floor(Math.random() * MAX_INT32),
    }
  }

  function getPoolInfo(url) {
    return {}
  }

  function checkCryptoProviderVersion() {
    return {code: 'UnsupportedOperation', message: ''}
  }

  return {
    isHwWallet,
    getWalletName,
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
    getValidStakepools,
    getWalletInfo,
    getMaxNonStakingAmount,
    getPoolInfo,
    checkCryptoProviderVersion,
  }
}

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.CardanoWallet = CardanoWallet
}

export {CardanoWallet}
