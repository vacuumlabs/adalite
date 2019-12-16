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

function txFeeFunction(txSizeInBytes) {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b)
}

function estimateTxSize(txInputs, outAddress, hasChange, hasDonation) {
  const txInputsSize = encode(new CborIndefiniteLengthArray(txInputs)).length
  const outAddressSize = base58.decode(outAddress).length

  //size of addresses used by AdaLite
  const ownAddressSize = 76
  const donationAddressSize = base58.decode(ADA_DONATION_ADDRESS).length

  /*
  * we assume that at most three outputs (destination, change and possibly donation address)
  * will be present encoded in an indefinite length array
  */
  const maxCborCoinsLen = 9 //length of CBOR encoded 64 bit integer, currently max supported
  const txOutputsSize = hasChange
    ? outAddressSize + ownAddressSize + maxCborCoinsLen * 2 + 2
    : outAddressSize + maxCborCoinsLen + 2

  const donationOutputSize = hasDonation ? donationAddressSize + maxCborCoinsLen : 0

  const txMetaSize = 1 // currently empty Map

  // the 1 is there for the CBOR "tag" for an array of 4 elements
  const txAuxSize = 1 + txInputsSize + txOutputsSize + donationOutputSize + txMetaSize

  const txWitnessesSize = txInputs.length * TX_WITNESS_SIZE_BYTES + 1

  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize

  /*
  * the deviation is there for the array of tx witnesses
  * because it may have more than 1 byte of overhead
  * if more than 16 elements are present
  */
  const deviation = 4

  return txSizeInBytes + deviation
}

function computeTxFee(txInputs, address, coins, hasDonation, donationAmount?) {
  const totalAmount = hasDonation ? coins + donationAmount : coins
  if (totalAmount > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }
  const txInputsCoinsSum = txInputs.reduce((acc, elem) => {
    return acc + elem.coins
  }, 0)
  const withoutChangeFee = txFeeFunction(estimateTxSize(txInputs, address, false, hasDonation))

  /*
  * if (totalAmount+withoutChangeFee) is equal to (txInputsCoinsSum),
      it means there is no change necessary
  * if (totalAmount+withoutChangeFee) is bigger the transaction is invalid even with higher fee
  * so we let caller handle it
  */
  if (totalAmount + withoutChangeFee >= txInputsCoinsSum) {
    return withoutChangeFee
  } else {
    const withChangeFee = txFeeFunction(estimateTxSize(txInputs, address, true, hasDonation))
    if (totalAmount + withChangeFee > txInputsCoinsSum) {
      //means one output transaction was possible, while 2 output is not
      //so we return fee equal to inputs - totalAmount which is guaranteed to pass
      return txInputsCoinsSum - totalAmount
    } else {
      return withChangeFee
    }
  }
}

const CardanoWallet = async (options) => {
  const {walletSecretDef, config, randomInputSeed, randomChangeSeed, network} = options
  const state = {
    accountIndex: HARDENED_THRESHOLD,
    network,
  }

  let seeds
  generateNewSeeds()

  const blockchainExplorer = BlockchainExplorer(config, state)
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
    disableCaching: false,
  })

  const changeAddressManager = AddressManager({
    accountIndex: state.accountIndex,
    defaultAddressCount: config.ADALITE_DEFAULT_ADDRESS_COUNT,
    gapLimit: config.ADALITE_GAP_LIMIT,
    cryptoProvider,
    isChange: true,
    blockchainExplorer,
    disableCaching: false,
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

  async function prepareSignedTx(address, coins, hasDonation, donationAmount) {
    const txAux = await prepareTxAux(address, coins, hasDonation, donationAmount).catch((e) => {
      debugLog(e)
      throw NamedError('TransactionCorrupted')
    })

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

  async function prepareTxAux(address, coins, hasDonation, donationAmount) {
    const txInputs = await prepareTxInputs(address, coins, hasDonation, donationAmount)
    const txInputsCoinsSum = txInputs.reduce((acc, elem) => acc + elem.coins, 0)
    const fee = computeTxFee(txInputs, address, coins, hasDonation, donationAmount)
    const changeAmount = txInputsCoinsSum - coins - fee - (hasDonation ? donationAmount : 0)

    if (changeAmount < 0) {
      throw NamedError('SendAmountInsufficientFunds')
    }

    const txOutputs = [TxOutput(address, coins, false)]

    if (hasDonation) {
      txOutputs.push(TxOutput(ADA_DONATION_ADDRESS, donationAmount, false))
    }

    if (changeAmount > 0) {
      txOutputs.push(TxOutput(await getChangeAddress(), changeAmount, true))
    }

    return TxAux(txInputs, txOutputs, {})
  }

  async function getTxInputsAndCoins() {
    const utxos = await getUTxOs()
    const txInputs = []
    let coins = 0
    const profitableUtxos = utxos.filter(isUtxoProfitable)

    for (let i = 0; i < profitableUtxos.length; i++) {
      txInputs.push(TxInputFromUtxo(profitableUtxos[i]))
      coins += profitableUtxos[i].coins
    }

    return {txInputs, coins}
  }

  const getMaxSendableAmountWithDonation = (
    address,
    txInputs,
    coins,
    donationAmount,
    donationType
  ) => {
    if (donationType === 'percentage') {
      // set maxSendAmount and percentageDonation (0.2% of max) to deplete balance completely
      const reducedAmount = coins / 1.002 //leave some for donation (0.2%)
      const percentageDonation = reducedAmount * 0.002
      // we show rounded % donations in the UI
      const roundedDonation = roundWholeAdas(percentageDonation)
      const diff = percentageDonation - roundedDonation
      // add diff from rounding (can be negative)
      const txFee = computeTxFee(txInputs, address, reducedAmount + diff, true, roundedDonation)
      return {
        sendAmount: reducedAmount + diff - txFee,
        donationAmount: roundedDonation,
      }
    } else {
      const txFee = computeTxFee(txInputs, address, coins - donationAmount, true, donationAmount)
      return {sendAmount: Math.max(coins - donationAmount - txFee, 0)}
    }
  }

  async function getMaxSendableAmount(address, hasDonation, donationAmount, donationType) {
    const {txInputs, coins} = await getTxInputsAndCoins()

    if (!hasDonation) {
      const txFee = computeTxFee(txInputs, address, coins, false)
      return {sendAmount: Math.max(coins - txFee, 0)}
    }

    return getMaxSendableAmountWithDonation(address, txInputs, coins, donationAmount, donationType)
  }

  async function getMaxDonationAmount(address, sendAmount) {
    const {txInputs, coins} = await getTxInputsAndCoins()
    const txFee = computeTxFee(txInputs, address, sendAmount, true, coins - sendAmount)
    return Math.max(coins - txFee - sendAmount, 0)
  }

  async function getTxFee(address, coins, hasDonation, donationAmount) {
    const txInputs = await prepareTxInputs(address, coins, hasDonation, donationAmount)
    return computeTxFee(txInputs, address, coins, hasDonation, donationAmount)
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

  function isUtxoProfitable(utxo) {
    const inputSize = encode(TxInputFromUtxo(utxo)).length
    const addedCost = txFeeFunction(inputSize + TX_WITNESS_SIZE_BYTES) - txFeeFunction(0)

    return utxo.coins > addedCost
  }

  async function prepareTxInputs(address, coins, hasDonation, donationAmount) {
    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
    const utxos = shuffleArray(await getUTxOs(), randomGenerator)
    const profitableUtxos = utxos.filter(isUtxoProfitable)

    const txInputs = []
    let sumUtxos = 0
    const totalAmount = hasDonation ? coins + donationAmount : coins
    let totalCoins = totalAmount

    for (let i = 0; i < profitableUtxos.length && sumUtxos < totalCoins; i++) {
      txInputs.push(TxInputFromUtxo(profitableUtxos[i]))
      sumUtxos += profitableUtxos[i].coins

      totalCoins =
        totalAmount + computeTxFee(txInputs, address, totalCoins, hasDonation, donationAmount)
    }

    return txInputs
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

  async function getUTxOs() {
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
      if (addressesWithMeta[i].isUsedAsOutput || addressesWithMeta[i].isUsedAsInput) {
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
    prepareSignedTx,
    getBalance,
    getChangeAddress,
    getMaxSendableAmount,
    getMaxDonationAmount,
    getTxFee,
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
