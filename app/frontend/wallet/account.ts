import AddressManager from './address-manager'
import PseudoRandom from './helpers/PseudoRandom'
import {DEFAULT_TTL_SLOTS, MAX_INT32} from './constants'
import {
  AddressToPathMapper,
  AddressToPathMapping,
  AddressWithMeta,
  CryptoProvider,
  Lovelace,
  SendAmount,
  StakingHistoryObject,
  TxPlanArgs,
  TxType,
  Address,
  PoolOwnerTxPlanArgs,
} from '../types'
import {
  getAccountXpub as getAccoutXpubShelley,
  ShelleyStakingAccountProvider,
  ShelleyBaseAddressProvider,
  getStakingXpub,
} from './shelley/shelley-address-provider'

import {selectMinimalTxPlan, TxPlan, TxPlanResult} from './shelley/shelley-transaction-planner'
import shuffleArray from './helpers/shuffleArray'
import {MaxAmountCalculator} from './max-amount-calculator'
import {
  ByronAddressProvider,
  getAccountXpub as getAccoutXpubByron,
} from './byron/byron-address-provider'
import {bechAddressToHex, isBase, addressToHex} from './shelley/helpers/addresses'
import {ShelleyTxAux} from './shelley/shelley-transaction'
import blockchainExplorer from './blockchain-explorer'
import {TxAux} from './shelley/types'
import {UTxO, TxOutput} from './types'
import {aggregateTokenBundles} from './helpers/tokenFormater'
import {StakepoolDataProvider} from '../helpers/dataProviders/types'
import {unsignedPoolTxToTxPlan} from './shelley/helpers/stakepoolRegistrationUtils'
import {InternalError, InternalErrorReason, UnexpectedError, UnexpectedErrorReason} from '../errors'

const DummyAddressManager = () => {
  return {
    discoverAddresses: (): Promise<Address[]> => Promise.resolve([]),
    discoverAddressesWithMeta: (): Promise<AddressWithMeta[]> => Promise.resolve([]),
    getAddressToAbsPathMapping: (): AddressToPathMapping => ({}),
    _deriveAddress: (): Promise<Address> => Promise.resolve(null),
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

  function fixedPathMapper(): AddressToPathMapper {
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
    return (address: Address) => {
      return mappingLegacy[address] || fixedShelley[address] || mappingShelley[address]
    }
  }

  async function areAddressesUsed(): Promise<boolean> {
    // we check only the external addresses since internal should not be used before external
    // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit
    const baseExt = await baseExtAddrManager._deriveAddresses(0, gapLimit)
    return await blockchainExplorer.isSomeAddressUsed(baseExt)
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
  const {getMaxSendableAmount: _getMaxSendableAmount} = MaxAmountCalculator()

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

  async function ensureXpubIsExported(): Promise<void> {
    // get first address to ensure that public key was exported
    await myAddresses.baseExtAddrManager._deriveAddress(0)
  }

  async function calculateTtl(): Promise<number> {
    // TODO: move to wallet
    try {
      const bestSlot = await blockchainExplorer.getBestSlot().then((res) => res.Right.bestSlot)
      return bestSlot + DEFAULT_TTL_SLOTS
    } catch (e) {
      const timePassed = Math.floor((Date.now() - cryptoProvider.network.eraStartDateTime) / 1000)
      return cryptoProvider.network.eraStartSlot + timePassed + DEFAULT_TTL_SLOTS
    }
  }

  async function prepareTxAux(txPlan: TxPlan, ttl?: number, validityIntervalStart?: number) {
    const {inputs, outputs, change, fee, certificates, withdrawals} = txPlan
    const txOutputs = [...outputs]
    if (change) {
      // TODO: do this with map
      const stakingAddress = await myAddresses.getStakingAddress()
      const changeOutput: TxOutput = {
        ...change,
        isChange: true,
        spendingPath: myAddresses.getAddressToAbsPathMapper()(change.address),
        stakingPath: myAddresses.getAddressToAbsPathMapper()(stakingAddress),
      }
      txOutputs.push(changeOutput)
    }
    // tll is null if it's deliberately empty
    const txTtl = ttl === undefined ? await calculateTtl() : ttl
    const txValidityIntervalStart = validityIntervalStart ?? null
    return ShelleyTxAux({
      inputs,
      outputs: txOutputs,
      fee,
      ttl: txTtl,
      certificates,
      withdrawals,
      validityIntervalStart: txValidityIntervalStart,
    })
  }

  async function signTxAux(txAux: TxAux) {
    const signedTx = await cryptoProvider
      .signTx(txAux, myAddresses.fixedPathMapper())
      .catch((e) => {
        throw new InternalError(InternalErrorReason.TransactionRejectedWhileSigning, {
          message: e.message,
        })
      })
    return signedTx
  }

  async function witnessPoolRegTxAux(txAux: TxAux) {
    const txWitness = await cryptoProvider
      .witnessPoolRegTx(txAux, myAddresses.fixedPathMapper())
      .catch((e) => {
        throw new InternalError(InternalErrorReason.TransactionRejectedWhileSigning, {
          message: e.message,
        })
      })
    return txWitness
  }

  async function getMaxSendableAmount(address: Address, sendAmount: SendAmount) {
    // TODO: why do we need hasDonation?
    const utxos = await getUtxos()
    return _getMaxSendableAmount(utxos, address, sendAmount)
  }

  async function getMaxNonStakingAmount(address: Address, sendAmount: SendAmount) {
    const utxos = (await getUtxos()).filter(({address}) => !isBase(addressToHex(address)))
    return _getMaxSendableAmount(utxos, address, sendAmount)
  }

  const selectUTxOs = async (txType: TxType): Promise<UTxO[]> => {
    const availableUtxos = await getUtxos()
    const nonStakingUtxos = availableUtxos.filter(({address}) => !isBase(addressToHex(address)))
    const baseAddressUtxos = availableUtxos.filter(({address}) => isBase(addressToHex(address)))
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    // TODO: ideally we want to do nonStaking, with token, only ada, the rest
    if (txType === TxType.SEND_ADA || txType === TxType.CONVERT_LEGACY) {
      return [
        ...shuffleArray(nonStakingUtxos, randomGenerator),
        ...shuffleArray(baseAddressUtxos, randomGenerator),
      ]
    }
    const adaUTxOs = baseAddressUtxos.filter(({tokenBundle}) => tokenBundle.length === 0)
    const tokenUTxOs = baseAddressUtxos.filter(({tokenBundle}) => tokenBundle.length > 0)
    return [
      ...shuffleArray(nonStakingUtxos, randomGenerator),
      ...shuffleArray(adaUTxOs, randomGenerator),
      ...shuffleArray(tokenUTxOs, randomGenerator),
    ]
  }

  const getTxPlan = async (txPlanArgs: TxPlanArgs): Promise<TxPlanResult> => {
    const changeAddress = await getChangeAddress()
    const shuffledUtxos = await selectUTxOs(txPlanArgs.txType)
    return selectMinimalTxPlan(shuffledUtxos, changeAddress, txPlanArgs)
  }

  function isAccountUsed(): Promise<boolean> {
    //TODO: we should decouple shelley compatibility from usedness
    // in case the wallet is not shelley compatible we consider the
    // the first account not used
    return config.isShelleyCompatible && myAddresses.areAddressesUsed()
  }

  async function getAccountInfo(validStakepoolDataProvider: StakepoolDataProvider) {
    const accountXpubs = await getAccountXpubs()
    const stakingXpub = await getStakingXpub(cryptoProvider, accountIndex)
    const stakingAddress = await myAddresses.getStakingAddress()
    const {baseAddressBalance, nonStakingBalance, balance, tokenBalance} = await getBalance()
    const shelleyAccountInfo = await getStakingInfo(validStakepoolDataProvider)
    const stakingHistory = await getStakingHistory(validStakepoolDataProvider)
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
      tokenBalance,
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
    const {
      coins: nonStakingBalance,
      tokenBundle: nonStakingTokenBundle,
    } = await blockchainExplorer.getBalance(legacy)
    const {
      coins: baseAddressBalance,
      tokenBundle: stakingTokenBundle,
    } = await blockchainExplorer.getBalance(base)
    return {
      tokenBalance: aggregateTokenBundles([nonStakingTokenBundle, stakingTokenBundle]),
      baseAddressBalance,
      nonStakingBalance,
      balance: nonStakingBalance + baseAddressBalance,
    }
  }

  async function getTxHistory(): Promise<any> {
    const {legacy, base, account} = await myAddresses.discoverAllAddresses()
    return blockchainExplorer.getTxHistory([...base, ...legacy, account])
  }

  async function getStakingHistory(
    validStakepoolDataProvider: StakepoolDataProvider
  ): Promise<StakingHistoryObject[]> {
    const stakingAddress = await myAddresses.getStakingAddress()
    return blockchainExplorer.getStakingHistory(
      bechAddressToHex(stakingAddress),
      validStakepoolDataProvider
    )
  }

  async function getAccountXpubs() {
    const shelleyAccountXpub = await getAccoutXpubShelley(cryptoProvider, accountIndex)
    const byronAccountXpub = await getAccoutXpubByron(cryptoProvider, accountIndex)
    return {
      shelleyAccountXpub,
      byronAccountXpub,
    }
  }

  async function getStakingInfo(validStakepoolDataProvider: StakepoolDataProvider) {
    const stakingAddressHex = bechAddressToHex(await myAddresses.getStakingAddress())
    const {nextRewardDetails, ...accountInfo} = await blockchainExplorer.getStakingInfo(
      stakingAddressHex
    )
    const rewardDetails = await blockchainExplorer.getRewardDetails(
      nextRewardDetails,
      accountInfo.delegation.poolHash,
      validStakepoolDataProvider,
      cryptoProvider.network.epochsToRewardDistribution
    )

    return {
      ...accountInfo,
      rewardDetails,
      value: accountInfo.rewards ? parseInt(accountInfo.rewards, 10) : 0,
    }
  }

  async function getChangeAddress(): Promise<Address> {
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

  async function getUtxos(): Promise<Array<UTxO>> {
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
      throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
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

  async function getPoolRegistrationTxPlan(poolRegistrationArgs: PoolOwnerTxPlanArgs) {
    const stakingAddress = await myAddresses.getStakingAddress()
    return unsignedPoolTxToTxPlan(poolRegistrationArgs.unsignedTxParsed, stakingAddress)
  }

  return {
    signTxAux,
    witnessPoolRegTxAux,
    getBalance,
    getChangeAddress,
    getMaxSendableAmount,
    getMaxNonStakingAmount,
    getTxPlan,
    getTxHistory,
    getVisibleAddresses,
    prepareTxAux,
    verifyAddress,
    generateNewSeeds,
    getAccountInfo,
    getStakingInfo,
    accountIndex,
    getPoolRecommendation,
    isAccountUsed,
    ensureXpubIsExported,
    _getAccountXpubs: getAccountXpubs,
    getPoolRegistrationTxPlan,
  }
}

export {Account}
