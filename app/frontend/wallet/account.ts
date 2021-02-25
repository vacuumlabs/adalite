import AddressManager from './address-manager'
import PseudoRandom from './helpers/PseudoRandom'
import {DEFAULT_TTL_SLOTS, MAX_INT32} from './constants'
import NamedError from '../helpers/NamedError'
import {
  AddressToPathMapper,
  AddressToPathMapping,
  AddressWithMeta,
  BIP32Path,
  CryptoProvider,
  Lovelace,
  StakingHistoryObject,
  TxPlanArgs,
  TxType,
  _Address,
} from '../types'
import {
  getAccountXpub as getAccoutXpubShelley,
  ShelleyStakingAccountProvider,
  ShelleyBaseAddressProvider,
  getStakingXpub,
} from './shelley/shelley-address-provider'

import {
  selectMinimalTxPlan,
  computeRequiredTxFee,
  isUtxoProfitable,
  TxPlan,
  TxPlanResult, // TODO: useless
} from './shelley/shelley-transaction-planner'
import shuffleArray from './helpers/shuffleArray'
import {MaxAmountCalculator} from './max-amount-calculator'
import {
  ByronAddressProvider,
  getAccountXpub as getAccoutXpubByron,
} from './byron/byron-address-provider'
import {bechAddressToHex, isBase, addressToHex} from './shelley/helpers/addresses'
import {ShelleyTxAux} from './shelley/shelley-transaction'
import blockchainExplorer from './blockchain-explorer'
import {_TxAux} from './shelley/types'
import {_Output} from './types'
import {aggregateTokens} from './helpers/tokenFormater'
import {StakepoolDataProvider} from '../helpers/dataProviders/types'

const DummyAddressManager = () => {
  return {
    discoverAddresses: (): Promise<_Address[]> => Promise.resolve([]),
    discoverAddressesWithMeta: (): Promise<AddressWithMeta[]> => Promise.resolve([]),
    getAddressToAbsPathMapping: (): AddressToPathMapping => ({}),
    _deriveAddress: (): Promise<_Address> => Promise.resolve(null),
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
    return (address: _Address) => {
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

  async function prepareTxAux(txPlan: TxPlan, ttl?: number) {
    const {inputs, outputs, change, fee, certificates, withdrawals} = txPlan
    const txOutputs = [...outputs]
    if (change) {
      const stakingAddress = await myAddresses.getStakingAddress()
      const changeOutput: _Output = {
        ...change,
        isChange: true,
        spendingPath: myAddresses.getAddressToAbsPathMapper()(change.address),
        stakingPath: myAddresses.getAddressToAbsPathMapper()(stakingAddress),
      }
      txOutputs.push(changeOutput)
    }
    const txTtl = !ttl ? await calculateTtl() : ttl
    return ShelleyTxAux(inputs, txOutputs, fee, txTtl, certificates, withdrawals)
  }

  async function signTxAux(txAux: _TxAux) {
    const signedTx = await cryptoProvider
      .signTx(txAux, myAddresses.fixedPathMapper())
      .catch((e) => {
        throw NamedError('TransactionRejectedWhileSigning', {message: e.message})
      })
    return signedTx
  }

  async function getMaxSendableAmount(address: _Address) {
    // TODO: why do we need hasDonation?
    const utxos = (await getUtxos()).filter(isUtxoProfitable)
    return _getMaxSendableAmount(utxos, address)
  }

  async function getMaxDonationAmount(address: _Address, sendAmount: Lovelace) {
    const utxos = (await getUtxos()).filter(isUtxoProfitable)
    return _getMaxDonationAmount(utxos, address, sendAmount)
  }

  async function getMaxNonStakingAmount(address: _Address) {
    const utxos = (await getUtxos()).filter(({address}) => !isBase(addressToHex(address)))
    return _getMaxSendableAmount(utxos, address)
  }

  const getTxPlan = async (txPlanArgs: TxPlanArgs): Promise<TxPlanResult> => {
    const {txType} = txPlanArgs
    const changeAddress = await getChangeAddress()
    const availableUtxos = await getUtxos()
    const nonStakingUtxos = availableUtxos.filter(({address}) => !isBase(addressToHex(address)))
    const baseAddressUtxos = availableUtxos.filter(({address}) => isBase(addressToHex(address)))
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    // we shuffle non-staking utxos separately since we want them to be spend first
    const shuffledUtxos =
      txType === TxType.CONVERT_LEGACY
        ? shuffleArray(nonStakingUtxos, randomGenerator)
        : [
          ...shuffleArray(nonStakingUtxos, randomGenerator),
          ...shuffleArray(baseAddressUtxos, randomGenerator),
        ]
    const plan = selectMinimalTxPlan(shuffledUtxos, changeAddress, txPlanArgs)
    return plan
  }

  async function getPoolInfo(url) {
    const poolInfo = await blockchainExplorer.getPoolInfo(url)
    return poolInfo
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
      tokens: nonStakingTokens,
    } = await blockchainExplorer.getBalance(legacy)
    const {coins: baseAddressBalance, tokens: stakingTokens} = await blockchainExplorer.getBalance(
      base
    )
    return {
      tokenBalance: aggregateTokens([nonStakingTokens, stakingTokens]),
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

  async function getChangeAddress(): Promise<_Address> {
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
