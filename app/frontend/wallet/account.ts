import AddressManager from './address-manager'
import PseudoRandom from './helpers/PseudoRandom'
import {MAX_INT32} from './constants'
import NamedError from '../helpers/NamedError'
import {CryptoProvider, Lovelace} from '../types'
import {
  getAccountXpub as getAccoutXpubShelley,
  ShelleyStakingAccountProvider,
  ShelleyBaseAddressProvider,
  getStakingXpub,
} from './shelley/shelley-address-provider'

import {
  selectMinimalTxPlan,
  computeRequiredTxFee,
  isUtxoProfitable, // TODO: useless
} from './shelley/shelley-transaction-planner'
import shuffleArray from './helpers/shuffleArray'
import {MaxAmountCalculator} from './max-amount-calculator'
import {
  ByronAddressProvider,
  getAccountXpub as getAccoutXpubByron,
} from './byron/byron-address-provider'
import {bechAddressToHex, isBase, addressToHex} from './shelley/helpers/addresses'
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
import blockchainExplorer from './blockchain-explorer'

const DummyAddressManager = () => {
  return {
    discoverAddresses: () => [],
    discoverAddressesWithMeta: () => [],
    getAddressToAbsPathMapping: () => ({}),
    _deriveAddress: () => ({}),
  }
}

export default DummyAddressManager

type MyAddressesParams = {
  accountIndex: number
  cryptoProvider: CryptoProvider
  gapLimit: number
  blockchainExplorer: ReturnType<typeof blockchainExplorer>
}

const MyAddresses = ({
  accountIndex,
  cryptoProvider,
  gapLimit,
  blockchainExplorer,
}: MyAddressesParams) => {
  const legacyExtManager =
    accountIndex === 0
      ? AddressManager({
        addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, false),
        gapLimit,
        blockchainExplorer,
      })
      : DummyAddressManager()

  const legacyIntManager =
    accountIndex === 0
      ? AddressManager({
        addressProvider: ByronAddressProvider(cryptoProvider, accountIndex, true),
        gapLimit,
        blockchainExplorer,
      })
      : DummyAddressManager()

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
    return (address) => {
      return mappingLegacy[address] || fixedShelley[address] || mappingShelley[address]
    }
  }

  async function areAddressesUsed() {
    const baseInt = await baseIntAddrManager.discoverAddresses()
    const baseExt = await baseExtAddrManager.discoverAddresses()
    return (
      (await blockchainExplorer.isSomeAddressUsed(baseInt)) ||
      (await blockchainExplorer.isSomeAddressUsed(baseExt))
    )
  }

  async function getStakingAddress() {
    return await accountAddrManager._deriveAddress(accountIndex)
  }

  return {
    getAddressToAbsPathMapper,
    fixedPathMapper,
    discoverAllAddresses,
    // TODO(refactor)
    baseExtAddrManager,
    accountAddrManager,
    legacyExtManager,
    areAddressesUsed,
    getStakingAddress,
  }
}

type AccountParams = {
  config: any
  randomInputSeed?: any
  randomChangeSeed?: any
  cryptoProvider: CryptoProvider
  blockchainExplorer: ReturnType<typeof blockchainExplorer>
  accountIndex: number
}

const Account = ({
  config,
  randomInputSeed,
  randomChangeSeed,
  cryptoProvider,
  blockchainExplorer,
  accountIndex,
}: AccountParams) => {
  const {
    getMaxDonationAmount: _getMaxDonationAmount,
    getMaxSendableAmount: _getMaxSendableAmount,
  } = MaxAmountCalculator(computeRequiredTxFee)

  let seeds = {
    randomInputSeed,
    randomChangeSeed,
  }

  generateNewSeeds()

  const myAddresses = MyAddresses({
    accountIndex,
    cryptoProvider,
    gapLimit: config.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })

  async function ensureXpubIsExported() {
    // get first address to ensure that public key was exported
    await myAddresses.baseExtAddrManager._deriveAddress(0)
  }

  async function calculateTtl() {
    // TODO: move to wallet
    try {
      const bestSlot = await blockchainExplorer.getBestSlot().then((res) => res.Right.bestSlot)
      return bestSlot + cryptoProvider.network.ttl
    } catch (e) {
      const timePassed = Math.floor((Date.now() - cryptoProvider.network.eraStartDateTime) / 1000)
      return cryptoProvider.network.eraStartSlot + timePassed + cryptoProvider.network.ttl
    }
  }

  async function prepareTxAux(plan, ttl?) {
    // TODO: move to wallet
    const txInputs = plan.inputs.map(ShelleyTxInputFromUtxo)
    const txOutputs = plan.outputs.map(({address, coins}) => ShelleyTxOutput(address, coins, false))
    const txCerts = plan.certs.map(({type, accountAddress, poolHash, poolRegistrationParams}) =>
      ShelleyTxCert(type, accountAddress, poolHash, poolRegistrationParams)
    )
    const txFee = ShelleyFee(plan.fee)
    const txTtl = ShelleyTtl(!ttl ? await calculateTtl() : ttl)
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

  const getTxPlan = async (args: utxoArgs) => {
    const stakingAddress = await myAddresses.getStakingAddress()
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
      stakingAddress,
      poolHash,
      !stakingKeyRegistered,
      rewards
    )
    return plan
  }

  async function getPoolInfo(url) {
    const poolInfo = await blockchainExplorer.getPoolInfo(url)
    return poolInfo
  }

  function isAccountUsed(): Promise<boolean> {
    return config.isShelleyCompatible && myAddresses.areAddressesUsed()
  }

  async function getAccountInfo(validStakepools) {
    const accountXpubs = await getAccountXpubs()
    const stakingXpub = await getStakingXpub(cryptoProvider, accountIndex)
    const stakingAddress = await myAddresses.getStakingAddress()
    const {baseAddressBalance, nonStakingBalance, balance} = await getBalance()
    const shelleyAccountInfo = await getStakingInfo(validStakepools)
    const stakingHistory = await getStakingHistory(validStakepools)
    const visibleAddresses = await getVisibleAddresses()
    const transactionHistory = await getTxHistory()
    const poolRecommendation = await getPoolRecommendation(
      shelleyAccountInfo.delegation,
      baseAddressBalance
    )
    const isUsed = await isAccountUsed()

    return {
      accountXpubs,
      stakingXpub,
      stakingAddress,
      balance,
      shelleyBalances: {
        nonStakingBalance,
        stakingBalance: baseAddressBalance + shelleyAccountInfo.value,
        rewardsAccountBalance: shelleyAccountInfo.value,
      },
      shelleyAccountInfo,
      transactionHistory,
      stakingHistory,
      visibleAddresses,
      poolRecommendation,
      isUsed,
      accountIndex,
    }
  }

  async function getBalance() {
    const {legacy, base} = await myAddresses.discoverAllAddresses()
    const nonStakingBalance = await blockchainExplorer.getBalance(legacy)
    const baseAddressBalance = await blockchainExplorer.getBalance(base)
    return {
      baseAddressBalance,
      nonStakingBalance,
      balance: nonStakingBalance + baseAddressBalance,
    }
  }

  async function getTxHistory(): Promise<any> {
    const {legacy, base, account} = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getTxHistory([...base, ...legacy, account])
  }

  async function getStakingHistory(validStakepools): Promise<StakingHistoryObject[]> {
    const stakingAddress = await myAddresses.getStakingAddress()
    return blockchainExplorer.getStakingHistory(bechAddressToHex(stakingAddress), validStakepools)
  }

  async function getAccountXpubs() {
    const shelleyAccountXpub = await getAccoutXpubShelley(cryptoProvider, accountIndex)
    const byronAccountXpub = await getAccoutXpubByron(cryptoProvider, accountIndex)
    return {
      shelleyAccountXpub,
      byronAccountXpub,
    }
  }

  async function getStakingInfo(validStakepools) {
    const stakingAddressHex = bechAddressToHex(await myAddresses.getStakingAddress())
    const {nextRewardDetails, ...accountInfo} = await blockchainExplorer.getStakingInfo(
      stakingAddressHex
    )
    const poolInfo = await getPoolInfo(accountInfo.delegation.url)
    const rewardDetails = await blockchainExplorer.getRewardDetails(
      nextRewardDetails,
      accountInfo.delegation.poolHash,
      validStakepools,
      cryptoProvider.network.epochsToRewardDistribution
    )

    return {
      ...accountInfo,
      delegation: {
        ...accountInfo.delegation,
        ...poolInfo,
      },
      rewardDetails,
      value: accountInfo.rewards ? parseInt(accountInfo.rewards, 10) : 0,
    }
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
    const addresses = config.isShelleyCompatible
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

  async function getPoolRecommendation(pool: any, stakeAmount: Lovelace): Promise<any> {
    const poolHash = pool ? pool.poolHash : null
    const poolRecommendation = await blockchainExplorer.getPoolRecommendation(poolHash, stakeAmount)
    if (!poolRecommendation.recommendedPoolHash || config.ADALITE_ENFORCE_STAKEPOOL) {
      Object.assign(poolRecommendation, {
        recommendedPoolHash: config.ADALITE_STAKE_POOL_ID,
      })
    }
    const delegatesToRecommended = poolRecommendation.recommendedPoolHash === pool.poolHash
    return {
      ...poolRecommendation,
      shouldShowSaturatedBanner:
        !delegatesToRecommended && poolRecommendation.status === 'GivenPoolSaturated',
    }
  }

  async function getPoolOwnerCredentials() {
    const stakingAddress = await myAddresses.getStakingAddress()
    const path = myAddresses.fixedPathMapper()(stakingAddress)
    // TODO: this is not pubkeyHex, its staking address hex
    const pubKeyHex = bechAddressToHex(stakingAddress)
    return {
      pubKeyHex: Buffer.from(pubKeyHex, 'hex')
        .slice(1)
        .toString('hex'),
      path,
    }
  }

  return {
    signTxAux,
    getBalance,
    getChangeAddress,
    getMaxSendableAmount,
    getMaxDonationAmount,
    getMaxNonStakingAmount,
    getTxPlan,
    getTxHistory,
    getVisibleAddresses,
    prepareTxAux,
    verifyAddress,
    generateNewSeeds,
    getAccountInfo,
    getStakingInfo,
    getPoolInfo,
    getPoolOwnerCredentials,
    accountIndex,
    getPoolRecommendation,
    isAccountUsed,
    ensureXpubIsExported,
    _getAccountXpubs: getAccountXpubs,
  }
}

export {Account}
