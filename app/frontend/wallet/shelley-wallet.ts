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
  ShelleySingleAddressProvider,
  ShelleyStakingAccountProvider,
} from './shelley/shelley-address-provider'

import {computeRequiredTxFee} from './shelley/helpers/chainlib-wrapper'
import {selectMinimalTxPlan, computeAccountTxPlan} from './shelley/build-transaction'
import shuffleArray from './helpers/shuffleArray'
import {MaxAmountCalculator} from './max-amount-calculator'
import {ByronAddressProvider} from './byron/byron-address-provider'
import {isShelleyAddress, bechAddressToHex, isGroup, isSingle} from './shelley/helpers/addresses'
import request from './helpers/request'
import {ADALITE_CONFIG} from '../config'

const isUtxoProfitable = () => true

const isUtxoNonStaking = ({address}) => !isGroup(address)

const isUtxoStaking = ({address}) => isGroup(address)

const isShelleyUtxo = ({address}) => isGroup(address) || isSingle(address)

const MyAddresses = ({accountIndex, cryptoProvider, gapLimit, blockchainExplorer}) => {
  const legacyExtManager = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const legacyIntManager = AddressManager({
    addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  const singleExtManager = AddressManager({
    addressProvider: ShelleySingleAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const singleIntManager = AddressManager({
    addressProvider: ShelleySingleAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  const groupExtManager = AddressManager({
    addressProvider: ShelleyGroupAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const groupIntManager = AddressManager({
    addressProvider: ShelleyGroupAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  const accountAddrManager = AddressManager({
    addressProvider: ShelleyStakingAccountProvider(cryptoProvider, accountIndex),
    gapLimit: 1,
    blockchainExplorer,
  })

  async function discoverAllAddresses() {
    const legacyInt = await legacyIntManager.discoverAddresses()
    const legacyExt = await legacyExtManager.discoverAddresses()
    const groupInt = await groupIntManager.discoverAddresses()
    const groupExt = await groupExtManager.discoverAddresses()

    const singleInt = await singleIntManager.discoverAddresses()
    const singleExt = await singleExtManager.discoverAddresses()
    const accountAddr = await accountAddrManager._deriveAddress(accountIndex)

    const isV1scheme = cryptoProvider.getDerivationScheme().type === 'v1'
    return {
      legacy: isV1scheme ? [...legacyInt] : [...legacyInt, ...legacyExt],
      group: [...groupInt, ...groupExt],
      single: [...singleInt, ...singleExt],
      account: accountAddr,
    }
  }

  function getAddressToAbsPathMapper() {
    const mapping = Object.assign(
      {},
      legacyIntManager.getAddressToAbsPathMapping(),
      legacyExtManager.getAddressToAbsPathMapping(),
      singleIntManager.getAddressToAbsPathMapping(),
      singleExtManager.getAddressToAbsPathMapping(),
      groupIntManager.getAddressToAbsPathMapping(),
      groupExtManager.getAddressToAbsPathMapping(),
      accountAddrManager.getAddressToAbsPathMapping()
    )
    return (address) => mapping[address]
  }

  function fixedPathMapper() {
    const mappingLegacy = {
      ...legacyIntManager.getAddressToAbsPathMapping(),
      ...legacyExtManager.getAddressToAbsPathMapping(),
    }
    const mappingShelley = {
      ...singleIntManager.getAddressToAbsPathMapping(),
      ...singleExtManager.getAddressToAbsPathMapping(),
      ...groupIntManager.getAddressToAbsPathMapping(),
      ...groupExtManager.getAddressToAbsPathMapping(),
      ...accountAddrManager.getAddressToAbsPathMapping(),
    }

    const fixedShelley = {}
    for (const key in mappingShelley) {
      fixedShelley[bechAddressToHex(key)] = mappingShelley[key]
    }

    return (address) => mappingLegacy[address] || fixedShelley[address] || mappingShelley[address]
  }

  async function getVisibleAddressesWithMeta() {
    // TODO : only group?
    const addresses = await groupExtManager.discoverAddressesWithMeta()
    return addresses //filterUnusedEndAddresses(addresses, config.ADALITE_DEFAULT_ADDRESS_COUNT)
  }

  async function getChangeAddress(rngSeed: number): Promise<string> {
    /*
    * We use visible addresses as change addresses to mainintain
    * AdaLite original functionality which did not consider change addresses.
    * This is an intermediate step between legacy mode and full Yoroi compatibility.
    */
    const candidates = await getVisibleAddressesWithMeta()
    //.filter(isAddressGroupType)

    const randomSeedGenerator = PseudoRandom(rngSeed)
    const choice = candidates[randomSeedGenerator.nextInt() % candidates.length]
    return choice.address
  }

  return {
    getAddressToAbsPathMapper,
    fixedPathMapper,
    discoverAllAddresses,
    // TODO(refactor)
    groupExtManager,
    singleExtManager,
    accountAddrManager,
    getChangeAddress,
    getVisibleAddressesWithMeta,
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

  async function getValidStakepools() {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`
    let response
    try {
      response = await fetch(url, {
        method: 'GET',
        body: null,
        headers: {
          'content-Type': 'application/json',
        },
      })
      if (response.status >= 400) {
        throw NamedError('NetworkError', 'Unable to fetch running stakepools.')
      }
    } catch (e) {
      throw NamedError('NetworkError', e.message)
    }
    const poolArray = JSON.parse(await response.text())
    const validStakepools = poolArray.reduce((dict, el) => ((dict[el.pool_id] = {...el}), dict), {})
    const ticker2Id = poolArray.reduce((dict, el) => ((dict[el.ticker] = el.pool_id), dict), {})
    return {validStakepools, ticker2Id}
  }

  return {
    getTxHistory: (addresses) => {
      return be.getTxHistory(fix(addresses))
    },
    fetchTxRaw: be.fetchTxRaw,
    fetchUnspentTxOutputs: (addresses) => be.fetchUnspentTxOutputs(fix(addresses)),
    isSomeAddressUsed: (addresses) => be.isSomeAddressUsed(fix(addresses)),
    submitTxRaw: be.submitTxRaw,
    getBalance: (addresses) => {
      return be.getBalance(fix(addresses))
    },
    fetchTxInfo: be.fetchTxInfo,
    filterUsedAddresses: (addresses) => be.filterUsedAddresses(fix(addresses)),
    getAccountInfo,
    getValidStakepools,
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

  async function getMaxNonStakingAmount(address) {
    const utxos = (await getUTxOs()).filter(isUtxoNonStaking)
    return _getMaxSendableAmount(utxos, address, false, 0, false)
  }

  const uTxOTxPlanner = async (args, txType) => {
    const {address, coins, donationAmount, pools} = args
    const utxoFilters = {
      delegation: isShelleyUtxo,
      nonStakingConversion: isUtxoNonStaking,
      utxo: () => true,
    }
    const utxoFilter = utxoFilters[txType]
    const accountAddress = await myAddresses.accountAddrManager._deriveAddress(0)
    const availableUtxos = (await getUTxOs()).filter(utxoFilter)
    const changeAddress = await getChangeAddress()
    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    const shuffledUtxos = shuffleArray(availableUtxos, randomGenerator)
    const plan = selectMinimalTxPlan(
      cryptoProvider.network.chainConfig,
      shuffledUtxos,
      address,
      donationAmount,
      changeAddress,
      coins,
      pools,
      accountAddress
    )
    return plan
  }

  const accountTxPlanner = async (args, txType) => {
    const srcAddress = await myAddresses.accountAddrManager._deriveAddress(0)
    const {dstAddress, amount, pools, accountCounter, accountBalance} = args
    const plan = computeAccountTxPlan(
      cryptoProvider.network.chainConfig,
      dstAddress,
      amount,
      srcAddress,
      pools,
      accountCounter,
      accountBalance
    )
    return plan
  }

  async function getTxPlan(args, txType) {
    const txPlaner = {
      utxo: uTxOTxPlanner,
      nonStakingConversion: uTxOTxPlanner,
      delegation: uTxOTxPlanner,
      account: accountTxPlanner,
    }
    const plan = txPlaner[txType](args, txType)
    return plan
  }

  async function getWalletInfo() {
    const {stakingBalance, nonStakingBalance, balance} = await getBalance()
    const shelleyAccountInfo = await getAccountInfo()
    const visibleAddresses = await getVisibleAddresses()
    const transactionHistory = await getHistory()
    // getDelegationHistory
    return {
      balance,
      shelleyBalances: {
        nonStakingBalance,
        stakingBalance: stakingBalance + shelleyAccountInfo.value,
        rewardsAccountBalance: shelleyAccountInfo.value,
      },
      shelleyAccountInfo,
      transactionHistory,
      visibleAddresses,
    }
  }

  async function getBalance() {
    const {legacy, group, single} = await myAddresses.discoverAllAddresses()
    const nonStakingBalance = await blockchainExplorer.getBalance([...legacy, ...single])
    const stakingBalance = await blockchainExplorer.getBalance(group)
    return {
      stakingBalance,
      nonStakingBalance,
      balance: nonStakingBalance + stakingBalance,
    }
  }

  async function getHistory() {
    // TODO refactor to getTxHistory?
    const {legacy, group, single, account} = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getTxHistory([...single, ...group, ...legacy, account])
  }

  async function getAccountInfo() {
    const accountPubkeyHex = await stakeAccountPubkeyHex(cryptoProvider, 0)
    const accountInfo = await blockchainExplorer.getAccountInfo(accountPubkeyHex)
    const delegationRatioSum = accountInfo.delegation.reduce(
      (prev, current) => prev + current.ratio,
      0
    )
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
    return blockchainExplorer.getValidStakepools()
  }

  async function fetchTxInfo(txHash) {
    return await blockchainExplorer.fetchTxInfo(txHash)
  }

  async function getChangeAddress() {
    return myAddresses.getChangeAddress(seeds.randomChangeSeed)
  }

  async function getUTxOs(): Promise<Array<any>> {
    try {
      const {legacy, group, single} = await myAddresses.discoverAllAddresses()
      const groupUtxos = await blockchainExplorer.fetchUnspentTxOutputs(group)
      const nonGroupUtxos = await blockchainExplorer.fetchUnspentTxOutputs([...legacy, ...single])
      const groupUtxoAddresses = groupUtxos
        .map(({address}) => isGroup(address) && address)
        .filter((a) => !!a)
      const uniqueNonGroupUtxos = nonGroupUtxos
        .map((u) => !groupUtxoAddresses.includes(u.address) && u)
        .filter((u) => !!u)
      return [...uniqueNonGroupUtxos, ...groupUtxos]
    } catch (e) {
      throw NamedError('NetworkError')
    }
  }

  async function getVisibleAddresses() {
    const single = await myAddresses.singleExtManager.discoverAddressesWithMeta()
    const group = await myAddresses.groupExtManager.discoverAddressesWithMeta()
    // TODO why not get also the account address
    // need to change the ..withMeta function to do that
    return [...group, ...single] //filterUnusedEndAddresses(addresses, config.ADALITE_DEFAULT_ADDRESS_COUNT)
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
    getMaxNonStakingAmount,
    getTxPlan,
    getHistory,
    getVisibleAddresses,
    prepareTxAux,
    verifyAddress,
    fetchTxInfo,
    generateNewSeeds,
    getAccountInfo,
    getValidStakepools,
    getWalletInfo,
  }
}

export {ShelleyWallet}
