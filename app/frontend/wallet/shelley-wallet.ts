import AddressManager from './address-manager'
import BlockchainExplorer from './blockchain-explorer'
import PseudoRandom from './helpers/PseudoRandom'
import {MAX_INT32} from './constants'
import NamedError from '../helpers/NamedError'
import {Lovelace} from '../state'
import {
  stakeAccountPubkeyHex,
  ShelleyStakingAccountProvider,
  ShelleyBaseAddressProvider,
} from './shelley/shelley-address-provider'

import {
  selectMinimalTxPlan,
  computeRequiredTxFee,
  isUtxoProfitable, // TODO: useless
} from './shelley/shelley-transaction-planner'
import shuffleArray from './helpers/shuffleArray'
import {MaxAmountCalculator} from './max-amount-calculator'
import {ByronAddressProvider} from './byron/byron-address-provider'
import {
  isShelleyFormat,
  bechAddressToHex,
  isBase,
  base58AddressToHex,
} from './shelley/helpers/addresses'
import request from './helpers/request'
import {ADALITE_CONFIG} from '../config'
import {
  ShelleyTxAux,
  ShelleyTxInputFromUtxo,
  ShelleyTxOutput,
  ShelleyTxCert,
  ShelleyFee,
  ShelleyTtl,
  ShelleyWitdrawal,
} from './shelley/shelley-transaction'
import {StakingHistoryObject} from '../components/pages/delegations/stakingHistoryPage'

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

  const accountAddrManager = AddressManager({
    addressProvider: ShelleyStakingAccountProvider(cryptoProvider, accountIndex),
    gapLimit: 1,
    blockchainExplorer,
  })

  const baseExtAddrManager = AddressManager({
    addressProvider: ShelleyBaseAddressProvider(cryptoProvider, accountIndex, false),
    gapLimit,
    blockchainExplorer,
  })

  const baseIntAddrManager = AddressManager({
    addressProvider: ShelleyBaseAddressProvider(cryptoProvider, accountIndex, true),
    gapLimit,
    blockchainExplorer,
  })

  async function discoverAllAddresses() {
    const baseInt = await baseIntAddrManager.discoverAddresses()
    const baseExt = await baseExtAddrManager.discoverAddresses()
    const legacyInt = await legacyIntManager.discoverAddresses()
    const legacyExt = await legacyExtManager.discoverAddresses()
    const accountAddr = await accountAddrManager._deriveAddress(accountIndex)

    const isV1scheme = cryptoProvider.getDerivationScheme().type === 'v1'
    return {
      legacy: isV1scheme ? [...legacyExt] : [...legacyInt, ...legacyExt],
      base: [...baseInt, ...baseExt],
      account: accountAddr,
    }
  }

  function getAddressToAbsPathMapper() {
    const mapping = Object.assign(
      {},
      legacyIntManager.getAddressToAbsPathMapping(),
      legacyExtManager.getAddressToAbsPathMapping(),
      baseIntAddrManager.getAddressToAbsPathMapping(),
      baseExtAddrManager.getAddressToAbsPathMapping(),
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
      ...baseIntAddrManager.getAddressToAbsPathMapping(),
      ...baseExtAddrManager.getAddressToAbsPathMapping(),
      ...accountAddrManager.getAddressToAbsPathMapping(),
    }

    const fixedShelley = {}
    for (const key in mappingShelley) {
      fixedShelley[bechAddressToHex(key)] = mappingShelley[key]
    }

    return (address) => mappingLegacy[address] || fixedShelley[address] || mappingShelley[address]
  }

  return {
    getAddressToAbsPathMapper,
    fixedPathMapper,
    discoverAllAddresses,
    // TODO(refactor)
    baseExtAddrManager,
    accountAddrManager,
    legacyExtManager,
  }
}

const ShelleyBlockchainExplorer = (config) => {
  // TODO: move methods to blockchain-explorer file
  const be = BlockchainExplorer(config)

  async function getAccountInfo(accountPubkeyHex) {
    // TODO: not pubkey, address
    const url = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/info/${accountPubkeyHex}`
    const response = await request(url)
    return response
  }

  async function getValidStakepools() {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`
    const validStakepools = await request(url)

    return {validStakepools}
  }

  function getBestSlot() {
    return request(`${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/bestSlot`)
  }

  return {
    getTxHistory: (addresses) => be.getTxHistory(addresses),
    fetchTxRaw: be.fetchTxRaw,
    fetchUnspentTxOutputs: (addresses) => be.fetchUnspentTxOutputs(addresses),
    isSomeAddressUsed: (addresses) => be.isSomeAddressUsed(addresses),
    submitTxRaw: be.submitTxRaw,
    getBalance: (addresses) => be.getBalance(addresses),
    fetchTxInfo: be.fetchTxInfo,
    filterUsedAddresses: (addresses) => be.filterUsedAddresses(addresses),
    getAccountInfo,
    getValidStakepools,
    getPoolInfo: (url) => be.getPoolInfo(url),
    getStakingHistory: be.getStakingHistory,
    getBestSlot,
    getRewardDetails: be.getRewardDetails,
  }
}
const ShelleyWallet = ({
  config,
  randomInputSeed,
  randomChangeSeed,
  cryptoProvider,
  isShelleyCompatible,
}: any) => {
  const {
    getMaxDonationAmount: _getMaxDonationAmount,
    getMaxSendableAmount: _getMaxSendableAmount,
  } = MaxAmountCalculator(computeRequiredTxFee)

  let seeds = {
    randomInputSeed,
    randomChangeSeed,
  }

  generateNewSeeds()

  const blockchainExplorer = ShelleyBlockchainExplorer(config)

  const accountIndex = 0

  const myAddresses = MyAddresses({
    accountIndex,
    cryptoProvider,
    gapLimit: config.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })

  const addressToHex = (
    address // TODO: move to addresses
  ) => (isShelleyFormat(address) ? bechAddressToHex(address) : base58AddressToHex(address))

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getWalletName() {
    return cryptoProvider.getWalletName()
  }

  function submitTx(signedTx): Promise<any> {
    const params = {walletType: getWalletName()}
    const {txBody, txHash} = signedTx
    return blockchainExplorer.submitTxRaw(txHash, txBody, params)
  }

  function getWalletSecretDef() {
    return {
      rootSecret: cryptoProvider.getWalletSecret(),
      derivationScheme: cryptoProvider.getDerivationScheme(),
    }
  }

  async function calculateTtl() {
    try {
      const bestSlot = await blockchainExplorer.getBestSlot().then((res) => res.Right.bestSlot)
      return bestSlot + cryptoProvider.network.ttl
    } catch (e) {
      const timePassed = Math.floor((Date.now() - cryptoProvider.network.eraStartDateTime) / 1000)
      return cryptoProvider.network.eraStartSlot + timePassed + cryptoProvider.network.ttl
    }
  }

  async function prepareTxAux(plan) {
    const txInputs = plan.inputs.map(ShelleyTxInputFromUtxo)
    const txOutputs = plan.outputs.map(({address, coins}) => ShelleyTxOutput(address, coins, false))
    const txCerts = plan.certs.map(({type, accountAddress, poolHash}) =>
      ShelleyTxCert(type, accountAddress, poolHash)
    )
    const txFee = ShelleyFee(plan.fee)
    const txTtl = ShelleyTtl(await calculateTtl())
    const txWithdrawals = plan.withdrawals.map(({accountAddress, rewards}) => {
      return ShelleyWitdrawal(accountAddress, rewards)
    })
    if (plan.change) {
      const {address, coins, accountAddress} = plan.change
      const absDerivationPath = myAddresses.getAddressToAbsPathMapper()(address)
      const stakingPath = myAddresses.getAddressToAbsPathMapper()(accountAddress)
      txOutputs.push(ShelleyTxOutput(address, coins, true, absDerivationPath, stakingPath))
    }
    // TODO: there is just one witdrawal
    return ShelleyTxAux(txInputs, txOutputs, txFee, txTtl, txCerts, txWithdrawals[0])
  }

  async function signTxAux(txAux: any) {
    const signedTx = await cryptoProvider
      .signTx(txAux, [], myAddresses.fixedPathMapper())
      .catch((e) => {
        throw NamedError('TransactionRejectedWhileSigning', {message: e.message})
      })
    return signedTx
  }

  async function getMaxSendableAmount(address, hasDonation, donationAmount, donationType) {
    // TODO: why do we need hasDonation?
    const utxos = (await getUtxos()).filter(isUtxoProfitable)
    return _getMaxSendableAmount(utxos, address, hasDonation, donationAmount, donationType)
  }

  async function getMaxDonationAmount(address, sendAmount: Lovelace) {
    const utxos = (await getUtxos()).filter(isUtxoProfitable)
    return _getMaxDonationAmount(utxos, address, sendAmount)
  }

  async function getMaxNonStakingAmount(address) {
    const utxos = (await getUtxos()).filter(({address}) => !isBase(addressToHex(address)))
    return _getMaxSendableAmount(utxos, address, false, 0, false)
  }

  type utxoArgs = {
    address?: string
    donationAmount?: Lovelace
    coins?: Lovelace
    poolHash?: string
    stakingKeyRegistered?: boolean
    txType?: string
    rewards: any
  }

  const utxoTxPlanner = async (args: utxoArgs, accountAddress) => {
    const {address, coins, donationAmount, poolHash, stakingKeyRegistered, txType, rewards} = args
    const changeAddress = await getChangeAddress()
    const availableUtxos = await getUtxos()
    const nonStakingUtxos = availableUtxos.filter(({address}) => !isBase(addressToHex(address)))
    const baseAddressUtxos = availableUtxos.filter(({address}) => isBase(addressToHex(address)))
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    // we shuffle non-staking utxos separately since we want them to be spend first
    const shuffledUtxos =
      txType === 'convert'
        ? shuffleArray(nonStakingUtxos, randomGenerator)
        : [
          ...shuffleArray(nonStakingUtxos, randomGenerator),
          ...shuffleArray(baseAddressUtxos, randomGenerator),
        ]
    const plan = selectMinimalTxPlan(
      shuffledUtxos,
      address,
      coins,
      donationAmount,
      changeAddress,
      accountAddress,
      poolHash,
      !stakingKeyRegistered,
      rewards
    )
    return plan
  }

  async function getTxPlan(args: utxoArgs) {
    // TODO: passing accountAddress to plan is useless, as well as this function
    const accountAddress = await myAddresses.accountAddrManager._deriveAddress(accountIndex)
    const txPlanners = {
      sendAda: utxoTxPlanner,
      convert: utxoTxPlanner,
      delegate: utxoTxPlanner,
      withdraw: utxoTxPlanner,
    }
    return await txPlanners[args.txType](args, accountAddress)
  }

  async function getPoolInfo(url) {
    const poolInfo = await blockchainExplorer.getPoolInfo(url)
    return poolInfo
  }

  async function getWalletInfo() {
    const {validStakepools} = await getValidStakepools()
    const {stakingBalance, nonStakingBalance, balance} = await getBalance()
    const shelleyAccountInfo = await getAccountInfo(validStakepools)
    const visibleAddresses = await getVisibleAddresses()
    const transactionHistory = await getHistory()
    const stakingHistory = await getStakingHistory(shelleyAccountInfo, validStakepools)
    return {
      validStakepools,
      balance,
      shelleyBalances: {
        nonStakingBalance,
        stakingBalance: stakingBalance + shelleyAccountInfo.value,
        rewardsAccountBalance: shelleyAccountInfo.value,
      },
      shelleyAccountInfo,
      transactionHistory,
      stakingHistory,
      visibleAddresses,
    }
  }

  async function getBalance() {
    const {legacy, base} = await myAddresses.discoverAllAddresses()
    const nonStakingBalance = await blockchainExplorer.getBalance(legacy)
    const stakingBalance = await blockchainExplorer.getBalance(base)
    return {
      stakingBalance,
      nonStakingBalance,
      balance: nonStakingBalance + stakingBalance,
    }
  }

  async function getHistory(): Promise<any> {
    // TODO: refactor to getTxHistory? or add delegation history or rewards history
    const {legacy, base, account} = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getTxHistory([...base, ...legacy, account])
  }

  async function getStakingHistory(
    shelleyAccountInfo,
    validStakepools
  ): Promise<StakingHistoryObject[]> {
    return await blockchainExplorer.getStakingHistory(
      shelleyAccountInfo.accountPubkeyHex,
      validStakepools
    )
  }

  async function getAccountInfo(validStakepools) {
    const accountPubkeyHex = await stakeAccountPubkeyHex(cryptoProvider, accountIndex)
    const {nextRewardDetails, ...accountInfo} = await blockchainExplorer.getAccountInfo(
      accountPubkeyHex
    )
    const poolInfo = await getPoolInfo(accountInfo.delegation.url)
    const rewardDetails = await blockchainExplorer.getRewardDetails(
      nextRewardDetails,
      accountInfo.delegation.poolHash,
      validStakepools,
      cryptoProvider.network.epochsToRewardDistribution
    )

    return {
      accountPubkeyHex,
      ...accountInfo,
      delegation: {
        ...accountInfo.delegation,
        ...poolInfo,
      },
      rewardDetails,
      value: accountInfo.rewards ? parseInt(accountInfo.rewards, 10) : 0,
    }
  }

  function getValidStakepools(): Promise<any> {
    return blockchainExplorer.getValidStakepools()
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

    // const randomSeedGenerator = PseudoRandom(rngSeed)
    const choice = candidates[0]
    return choice.address
    // return myAddresses.getChangeAddress(seeds.randomChangeSeed)
  }

  async function getUtxos(): Promise<Array<any>> {
    const {legacy, base} = await myAddresses.discoverAllAddresses()
    const baseUtxos = await blockchainExplorer.fetchUnspentTxOutputs(base)
    const nonStakingUtxos = await blockchainExplorer.fetchUnspentTxOutputs(legacy)
    return [...nonStakingUtxos, ...baseUtxos]
  }

  async function getVisibleAddresses() {
    const addresses = isShelleyCompatible
      ? await myAddresses.baseExtAddrManager.discoverAddressesWithMeta()
      : await myAddresses.legacyExtManager.discoverAddressesWithMeta()
    return addresses
  }

  async function verifyAddress(addr: string) {
    if (!('displayAddressForPath' in cryptoProvider)) {
      throw NamedError('UnsupportedOperationError', {
        message: 'unsupported operation: verifyAddress',
      })
    }
    const absDerivationPath = myAddresses.getAddressToAbsPathMapper()(addr)
    const stakingAddress = await myAddresses.accountAddrManager._deriveAddress(accountIndex)
    const stakingPath = myAddresses.getAddressToAbsPathMapper()(stakingAddress)
    return await cryptoProvider.displayAddressForPath(absDerivationPath, stakingPath)
  }

  function generateNewSeeds() {
    seeds = {
      randomInputSeed: randomInputSeed || Math.floor(Math.random() * MAX_INT32),
      randomChangeSeed: randomChangeSeed || Math.floor(Math.random() * MAX_INT32),
    }
  }

  function checkCryptoProviderVersion() {
    try {
      cryptoProvider.checkVersion(true)
    } catch (e) {
      return {code: e.name, message: e.message}
    }
    return null
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
    getPoolInfo,
    checkCryptoProviderVersion,
  }
}

export {ShelleyWallet}
