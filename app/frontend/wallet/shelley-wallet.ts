import debugLog from '../helpers/debugLog'

import AddressManager from './address-manager'
import BlockchainExplorer from './blockchain-explorer'
import PseudoRandom from './helpers/PseudoRandom'
import {MAX_INT32} from './constants'
import NamedError from '../helpers/NamedError'
import {Lovelace} from '../state'
import {
  ShelleyGroupAddressProvider,
  stakeAccountPubkeyHex,
  ShelleyStakingAccountProvider,
} from './shelley/shelley-address-provider'

import {computeRequiredTxFee} from './shelley/helpers/chainlib-wrapper'
import {selectMinimalTxPlan, computeDelegationTxPlan} from './shelley/build-transaction'
import shuffleArray from './helpers/shuffleArray'
import {MaxAmountCalculator} from './max-amount-calculator'
import {ByronAddressProvider} from './byron/byron-address-provider'
import {isShelleyAddress, bechAddressToHex, groupToSingle} from './shelley/helpers/addresses'
import request from './helpers/request'
import {ADALITE_CONFIG} from '../config'

const isUtxoProfitable = () => true

const MyAddresses = ({accountIndex, cryptoProvider, gapLimit, blockchainExplorer}) => {
  const legacyExternal = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const legacyInternal = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  const shelleyExternal = AddressManager({
    addressProvider: ShelleyGroupAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const shelleyInternal = AddressManager({
    addressProvider: ShelleyGroupAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  // const shelleyAccountAddressManager = AddressManager({
  //   addressProvider: ShelleyStakingAccountProvider(cryptoProvider, accountIndex),
  //   gapLimit,
  //   blockchainExplorer,
  // })

  const accountAddress = ShelleyStakingAccountProvider(cryptoProvider, accountIndex)

  async function discoverAllAddresses() {
    const a1 = await legacyInternal.discoverAddresses()
    const a2 = await legacyExternal.discoverAddresses()
    const a3 = await shelleyInternal.discoverAddresses()
    const a4 = await shelleyExternal.discoverAddresses()
    // await shelleyAccountAddressManager.discoverAddresses()

    if (cryptoProvider.getDerivationScheme().type === 'v1') {
      return [...a1, ...a3, ...a4]
    } else {
      return [...a1, ...a2, ...a3, ...a4]
    }
  }

  function getAddressToAbsPathMapper() {
    const mapping = Object.assign(
      {},
      legacyInternal.getAddressToAbsPathMapping(),
      legacyExternal.getAddressToAbsPathMapping(),
      shelleyInternal.getAddressToAbsPathMapping(),
      shelleyExternal.getAddressToAbsPathMapping()
      // shelleyAccountAddressManager.getAddressToAbsPathMapping()
    )
    console.log(mapping)
    return (address) => mapping[address]
  }

  function fixedPathMapper() {
    const mappingLegacy = {
      ...legacyInternal.getAddressToAbsPathMapping(),
      ...legacyExternal.getAddressToAbsPathMapping(),
    }
    const mappingShelley = {
      ...shelleyInternal.getAddressToAbsPathMapping(),
      ...shelleyExternal.getAddressToAbsPathMapping(),
    }

    const fixedShelley = {}
    for (const key in mappingShelley) {
      fixedShelley[bechAddressToHex(key)] = mappingShelley[key]
    }

    return (address) => mappingLegacy[address] || fixedShelley[address]
  }

  async function getVisibleAddressesWithMeta() {
    const addresses = await shelleyExternal.discoverAddressesWithMeta()
    return addresses //filterUnusedEndAddresses(addresses, config.ADALITE_DEFAULT_ADDRESS_COUNT)
  }

  async function getChangeAddress(rngSeed: number): Promise<string> {
    /*
    * We use visible addresses as change addresses to mainintain
    * AdaLite original functionality which did not consider change addresses.
    * This is an intermediate step between legacy mode and full Yoroi compatibility.
    */
    const candidates = await getVisibleAddressesWithMeta()

    const randomSeedGenerator = PseudoRandom(rngSeed)
    const choice = candidates[randomSeedGenerator.nextInt() % candidates.length]
    return choice.address
  }

  return {
    getAddressToAbsPathMapper,
    fixedPathMapper,
    discoverAllAddresses,
    // TODO(refactor)
    shelleyExternal,
    getChangeAddress,
    getVisibleAddressesWithMeta,
    accountAddress,
  }
}

const ShelleyBlockchainExplorer = (config) => {
  const be = BlockchainExplorer(config)

  const fixAddress = (address) => (isShelleyAddress(address) ? bechAddressToHex(address) : address)
  const fix = (addresses: Array<string>): Array<string> => {
    return addresses.map(fixAddress)
  }

  async function getAccountInfo(accountPubkeyHex) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/account/info`
    const response = await request(
      url,
      'POST',
      JSON.stringify({
        account: accountPubkeyHex,
      }),
      {
        'content-Type': 'application/json',
      }
    )
    return response
  }

  async function getRunningStakePools() {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`
    const response = await fetch(url, {
      method: 'GET',
      body: null,
      headers: {
        'content-Type': 'application/json',
      },
    })
    const poolArray = JSON.parse(await response.text())
    const poolDict = poolArray.reduce((dict, el) => ((dict[el.pool_id] = {...el}), dict), {})
    return poolDict
  }

  return {
    getTxHistory: (addresses) => {
      console.log('getTxHistory', fix(addresses))
      return be.getTxHistory(fix(addresses))
    },
    fetchTxRaw: be.fetchTxRaw,
    fetchUnspentTxOutputs: (addresses) => be.fetchUnspentTxOutputs(fix(addresses)),
    isSomeAddressUsed: (addresses) => be.isSomeAddressUsed(fix(addresses)),
    submitTxRaw: be.submitTxRaw,
    getBalance: (addresses) => {
      console.log('getBalance', fix(addresses))
      return be.getBalance(fix(addresses))
    },
    fetchTxInfo: be.fetchTxInfo,
    filterUsedAddresses: (addresses) => be.filterUsedAddresses(fix(addresses)),
    getAccountInfo,
    getRunningStakePools,
  }
}
const ShelleyWallet = ({config, randomInputSeed, randomChangeSeed, cryptoProvider}: any) => {
  const {
    getMaxDonationAmount: _getMaxDonationAmount,
    getMaxSendableAmount: _getMaxSendableAmount,
  } = MaxAmountCalculator(computeRequiredTxFee(cryptoProvider.network.chainConfig))

  let seeds = {
    randomInputSeed,
    randomChangeSeed,
  }

  generateNewSeeds()

  const blockchainExplorer = ShelleyBlockchainExplorer(config)

  const myAddresses = MyAddresses({
    accountIndex: 0,
    cryptoProvider,
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
    console.log('wallet.submitTx', signedTx)
    const {transaction, fragmentId} = signedTx
    const response = await blockchainExplorer.submitTxRaw(fragmentId, transaction).catch((e) => {
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

  function prepareTxAux(plan) {
    return plan
  }

  async function signTxAux(txAux: any) {
    const signedTx = await cryptoProvider
      .signTx(txAux, myAddresses.fixedPathMapper())
      .catch((e) => {
        debugLog(e)
        throw NamedError('TransactionRejectedWhileSigning', e.message)
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

  const sendTxPlanner = async (args) => {
    const {address, coins, donationAmount} = args
    const availableUtxos = await getUTxOs()
    const changeAddress = await getChangeAddress()

    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    const shuffledUtxos = shuffleArray(availableUtxos, randomGenerator)
    const plan = selectMinimalTxPlan(
      cryptoProvider.network.chainConfig,
      shuffledUtxos,
      address,
      coins,
      donationAmount,
      changeAddress
    )
    console.log(plan)
    return plan
  }

  const delegateTxPlanner = async (args) => {
    const address = (await myAddresses.accountAddress()).address
    const {pools, accountCounter, accountBalance} = args
    const plan = computeDelegationTxPlan(
      cryptoProvider.network.chainConfig,
      address,
      pools,
      accountCounter,
      accountBalance
    )
    console.log(plan)
    return plan
  }

  const txPlaner = {
    send: sendTxPlanner,
    delegate: delegateTxPlanner,
  }

  async function getTxPlan(args, txType) {
    const plan = txPlaner[txType](args)
    return plan
  }

  async function getBalance() {
    const addresses = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getBalance(addresses)
  }

  async function getHistory() {
    const addresses = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getTxHistory(addresses)
  }

  async function getAccountInfo() {
    const accountPubkeyHex = await stakeAccountPubkeyHex(cryptoProvider, 0)
    const accountInfo = await blockchainExplorer.getAccountInfo(accountPubkeyHex)
    let delegationRatioSum = 0
    accountInfo.delegation.map((pool) => {
      delegationRatioSum += pool.ratio
    })
    const delegation = accountInfo.delegation.map((pool) => {
      return {
        ...pool,
        ratio: Math.round(pool.ratio * (100 / delegationRatioSum)),
      }
    })
    return {
      ...accountInfo,
      delegation,
    }
  }

  async function getValidStakepools() {
    return blockchainExplorer.getRunningStakePools()
  }

  async function fetchTxInfo(txHash) {
    return await blockchainExplorer.fetchTxInfo(txHash)
  }

  async function getChangeAddress() {
    return myAddresses.getChangeAddress(seeds.randomChangeSeed)
  }

  async function getUTxOs(): Promise<Array<any>> {
    try {
      const addresses = await myAddresses.discoverAllAddresses()
      return await blockchainExplorer.fetchUnspentTxOutputs(addresses)
    } catch (e) {
      throw NamedError('NetworkError')
    }
  }

  async function getVisibleAddresses() {
    const addresses = await myAddresses.shelleyExternal.discoverAddressesWithMeta()
    return addresses //filterUnusedEndAddresses(addresses, config.ADALITE_DEFAULT_ADDRESS_COUNT)
  }

  async function verifyAddress(addr: string) {
    throw NamedError('UnsupportedOperationError', 'unsupported operation: verifyAddress')
  }

  function generateNewSeeds() {
    seeds = {
      randomInputSeed: randomInputSeed || Math.floor(Math.random() * MAX_INT32),
      randomChangeSeed: randomChangeSeed || Math.floor(Math.random() * MAX_INT32),
    }
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
    getAccountInfo,
    getValidStakepools,
  }
}

export {ShelleyWallet}
