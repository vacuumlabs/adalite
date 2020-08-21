import debugLog from '../helpers/debugLog'
import AddressManager from './address-manager'
import BlockchainExplorer from './blockchain-explorer'
import PseudoRandom from './helpers/PseudoRandom'
import {MAX_INT32, UNKNOWN_POOL_NAME} from './constants'
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
  isUtxoProfitable,
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
import {
  DelegetionHistoryObject,
  StakePool,
  StakeDelegation,
  DelegetionHistoryItemType,
  StakingReward,
  RewardWithdrawal,
} from '../components/pages/delegations/delegationHistoryPage'
import distinct from '../helpers/distinct'

// const isUtxoProfitable = () => true

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

  async function getRewardsBalance(accountPubKeyHex) {
    const url = 'https://iohk-mainnet.yoroiwallet.com/api/getAccountState'
    const response = await request(url, 'POST', JSON.stringify({addresses: [accountPubKeyHex]}), {
      'Content-Type': 'application/json',
    }).catch(() => {
      return 0
    })
    if (!response || !response[accountPubKeyHex] || !response[accountPubKeyHex].remainingAmount) {
      return 0
    }
    return parseInt(response[accountPubKeyHex].remainingAmount, 10)
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
        throw NamedError('NetworkError', {message: 'Unable to fetch running stakepools.'})
      }
    } catch (e) {
      throw NamedError('NetworkError', {message: e.message})
    }
    const validStakepools = JSON.parse(await response.text())
    return {validStakepools}
  }

  async function getPoolInfo(url) {
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/poolMeta`,
      'POST',
      JSON.stringify({poolUrl: url}),
      {'Content-Type': 'application/json'}
    ).catch(() => {
      return {}
    })
    return response
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
    getRewardsBalance,
    getValidStakepools,
    getPoolInfo,
    getDelegationHistory: be.getDelegationHistory,
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

  function getHwWalletName() {
    return isHwWallet ? (cryptoProvider as any).getHwWalletName() : undefined
  }

  function submitTx(signedTx): Promise<any> {
    const {txBody, txHash} = signedTx
    return blockchainExplorer.submitTxRaw(txHash, txBody)
  }

  function getWalletSecretDef() {
    return {
      rootSecret: cryptoProvider.getWalletSecret(),
      derivationScheme: cryptoProvider.getDerivationScheme(),
    }
  }

  function prepareTxAux(plan) {
    const txInputs = plan.inputs.map(ShelleyTxInputFromUtxo)
    const txOutputs = plan.outputs.map(({address, coins}) => ShelleyTxOutput(address, coins, false))
    const txCerts = plan.certs.map(({type, accountAddress, poolHash}) =>
      ShelleyTxCert(type, accountAddress, poolHash)
    )
    const txFee = ShelleyFee(plan.fee)
    const txTtl = ShelleyTtl(cryptoProvider.network.ttl)
    const txWithdrawals = plan.withdrawals.map(({accountAddress, rewards}) => {
      return ShelleyWitdrawal(accountAddress, rewards)
    })
    if (plan.change) {
      const {address, coins, accountAddress} = plan.change
      const absDerivationPath = myAddresses.getAddressToAbsPathMapper()(address)
      const stakingPath = myAddresses.getAddressToAbsPathMapper()(accountAddress)
      txOutputs.push(ShelleyTxOutput(address, coins, true, absDerivationPath, stakingPath))
    }
    return ShelleyTxAux(txInputs, txOutputs, txFee, txTtl, txCerts, txWithdrawals[0]) // TODO: witdrawal is just one
  }

  async function signTxAux(txAux: any) {
    const signedTx = await cryptoProvider
      .signTx(txAux, [], myAddresses.fixedPathMapper())
      .catch((e) => {
        debugLog(e)
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

  type accountArgs = {
    address: string
    coins: Lovelace
    accountBalance: Lovelace
    counter: number
    txType: string
  }

  // const accountTxPlanner = (args: accountArgs, accountAddress: string) => {
  //   const {address, coins, accountBalance, counter} = args
  //   const plan = computeAccountTxPlan(
  //     cryptoProvider.network.chainConfig,
  //     coins,
  //     address,
  //     accountAddress,
  //     counter,
  //     accountBalance
  //   )
  //   return plan
  // }

  async function getTxPlan(args: utxoArgs | accountArgs) {
    // TODO: passing accountAddress to plan is useless, as well as this function
    const accountAddress = await myAddresses.accountAddrManager._deriveAddress(accountIndex)
    const txPlanners = {
      sendAda: utxoTxPlanner,
      convert: utxoTxPlanner,
      delegate: utxoTxPlanner,
      redeem: utxoTxPlanner,
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
    const shelleyAccountInfo = await getAccountInfo()
    const visibleAddresses = await getVisibleAddresses()
    const transactionHistory = await getHistory()
    const delegationHistory = await getDelegationHistory(shelleyAccountInfo, validStakepools)
    // getWithdrawalHistory
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
      delegationHistory,
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

  async function getDelegationHistory(
    shelleyAccountInfo,
    validStakepools
  ): Promise<DelegetionHistoryObject[]> {
    const {delegations, rewards, withdrawals} = await blockchainExplorer.getDelegationHistory(
      shelleyAccountInfo.accountPubkeyHex
    )

    const extractUrl = (poolHash) => {
      const stakePool = validStakepools[poolHash]
      if (stakePool) {
        return stakePool.url
      } else {
        return null
      }
    }

    const poolMetaUrls = distinct([
      ...distinct(delegations.map((delegation) => extractUrl(delegation.poolHash))),
      ...distinct(rewards.map((reward) => extractUrl(reward.poolHash))),
    ]).filter((x) => x != null)

    // Run requests for meta data in parallel
    const metaDataPromises = poolMetaUrls.map((url: string) => ({
      url,
      metaDataPromise: getPoolInfo(url),
    }))
    const metaUrlToPoolNameMap = {}
    for (const promise of metaDataPromises) {
      const metaData = await promise.metaDataPromise
      metaUrlToPoolNameMap[promise.url] = metaData.name
    }

    const poolHashToPoolName = (poolHash) => {
      const poolName = metaUrlToPoolNameMap[extractUrl(poolHash)]
      if (poolName) {
        return poolName
      } else {
        return UNKNOWN_POOL_NAME
      }
    }

    const parseStakePool = (delegationHistoryObject) => {
      const stakePool: StakePool = {
        id: delegationHistoryObject.poolHash,
        name: poolHashToPoolName(delegationHistoryObject.poolHash),
      }

      return stakePool
    }

    // Prepare delegations
    let oldPool: StakePool = null
    const parsedDelegations = delegations
      .map((delegation) => ({...delegation, time: new Date(delegation.time)}))
      .sort((a, b) => a.time.getTime() - b.time.getTime()) // sort by time, oldest first
      .map((delegation) => {
        const stakePool: StakePool = parseStakePool(delegation)
        const stakeDelegation: StakeDelegation = {
          type: DelegetionHistoryItemType.StakeDelegation,
          epoch: delegation.epochNo,
          dateTime: new Date(delegation.time),
          newStakePool: stakePool,
          oldStakePool: oldPool,
        }
        oldPool = stakePool

        return stakeDelegation
      })
      .reverse() // newest first

    // Prepare rewards
    const parsedRewards = rewards.map((reward) => {
      const stakingReward: StakingReward = {
        type: DelegetionHistoryItemType.StakingReward,
        epoch: reward.epochNo,
        dateTime: new Date(reward.time),
        reward: reward.amount,
        stakePool: parseStakePool(reward),
      }

      return stakingReward
    })

    // Prepare withdrawals
    const parsedWithdrawals = withdrawals.map((withdrawal) => {
      const rewardWithdrawal: RewardWithdrawal = {
        type: DelegetionHistoryItemType.RewardWithdrawal,
        epoch: withdrawal.epochNo,
        dateTime: new Date(withdrawal.time),
        credit: withdrawal.amount,
      }

      return rewardWithdrawal
    })

    const combined = [...parsedDelegations, ...parsedRewards, ...parsedWithdrawals].sort(
      (a, b) => b.dateTime.getTime() - a.dateTime.getTime()
    ) // sort by time, newest first

    return combined
  }

  async function getAccountInfo() {
    const accountPubkeyHex = await stakeAccountPubkeyHex(cryptoProvider, accountIndex)
    const accountInfo = await blockchainExplorer.getAccountInfo(accountPubkeyHex)
    const poolInfo = await getPoolInfo(accountInfo.delegation.url)
    const rewardsAccountBalance = await blockchainExplorer.getRewardsBalance(accountPubkeyHex)
    return {
      accountPubkeyHex,
      ...accountInfo,
      delegation: {
        ...accountInfo.delegation,
        ...poolInfo,
      },
      value: rewardsAccountBalance || 0,
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
    getPoolInfo,
    checkCryptoProviderVersion,
  }
}

export {ShelleyWallet}
