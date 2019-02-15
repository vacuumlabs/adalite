const cbor = require('borc')
const {base58} = require('cardano-crypto.js')

const debugLog = require('../helpers/debugLog')
const {generateMnemonic, validateMnemonic} = require('./mnemonic')
const {TxInputFromUtxo, TxOutput, TxAux} = require('./transaction')
const AddressManager = require('./address-manager')
const BlockchainExplorer = require('./blockchain-explorer')
const CardanoWalletSecretCryptoProvider = require('./cardano-wallet-secret-crypto-provider')
const CardanoTrezorCryptoProvider = require('./cardano-trezor-crypto-provider')
const PseudoRandom = require('./helpers/PseudoRandom')
const {HARDENED_THRESHOLD, MAX_INT32, TX_WITNESS_SIZE_BYTES} = require('./constants')
const derivationSchemes = require('./derivation-schemes.js')
const shuffleArray = require('./helpers/shuffleArray')
const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')
const NamedError = require('../helpers/NamedError')
const mnemonicOrHdNodeStringToWalletSecret = require('./helpers/mnemonicOrHdNodeStringToWalletSecret')
const alertIfUnsupportedTrezorFwVersion = require('./helpers/alertIfUnsupportedTrezorFwVersion')

function txFeeFunction(txSizeInBytes) {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b)
}

const CardanoWallet = async (options) => {
  const {mnemonicOrHdNodeString, config, randomSeed, network} = options

  const state = {
    randomSeed: randomSeed || Math.floor(Math.random() * MAX_INT32),
    overallTxCountSinceLastUtxoFetch: 0,
    accountIndex: HARDENED_THRESHOLD,
    network,
    derivationScheme: options.derivationScheme || derivationSchemes.v2,
  }

  const blockchainExplorer = BlockchainExplorer(config, state)

  let cryptoProvider = null
  if (options.cryptoProvider === 'trezor') {
    await alertIfUnsupportedTrezorFwVersion()
    cryptoProvider = CardanoTrezorCryptoProvider(config, state)
  } else if (options.cryptoProvider === 'mnemonic') {
    const {walletSecret, derivationScheme} = await mnemonicOrHdNodeStringToWalletSecret(
      mnemonicOrHdNodeString,
      options.derivationScheme
    )

    cryptoProvider = CardanoWalletSecretCryptoProvider(
      {
        walletSecret,
        derivationScheme,
        network,
      },
      state
    )
  } else {
    throw new Error(`Uknown crypto provider: ${options.cryptoProvider}`)
  }

  const visibleAddressManager = AddressManager({
    accountIndex: state.accountIndex,
    addressLimitV1: config.ADALITE_WALLET_ADDRESS_LIMIT_V1,
    gapLimit: config.ADALITE_GAP_LIMIT,
    cryptoProvider,
    derivationScheme: state.derivationScheme,
    isChange: false,
    blockchainExplorer,
  })

  const changeAddressManager = AddressManager({
    accountIndex: state.accountIndex,
    addressLimitV1: config.ADALITE_WALLET_ADDRESS_LIMIT_V1,
    gapLimit: config.ADALITE_GAP_LIMIT,
    cryptoProvider,
    derivationScheme: state.derivationScheme,
    isChange: true,
    blockchainExplorer,
  })

  async function submitTx(signedTx) {
    const {txBody, txHash} = signedTx
    const response = await blockchainExplorer.submitTxRaw(txHash, txBody).catch((e) => {
      debugLog(e)
      throw NamedError('TransactionRejectedByNetwork')
    })

    return response
  }

  function getSecret() {
    return cryptoProvider.getWalletSecret()
  }

  async function prepareSignedTx(address, coins) {
    const txAux = await prepareTxAux(address, coins).catch((e) => {
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
        throw NamedError('TransactionRejected')
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

  async function prepareTxAux(address, coins) {
    const txInputs = await prepareTxInputs(address, coins)
    const txInputsCoinsSum = txInputs.reduce((acc, elem) => acc + elem.coins, 0)
    const fee = computeTxFee(txInputs, address, coins)
    const changeAmount = txInputsCoinsSum - coins - fee

    if (changeAmount < 0) {
      throw Error(`
        Transaction inputs (sum ${txInputsCoinsSum}) don't cover coins (${coins}) + fee (${fee})`)
    }

    const txOutputs = [TxOutput(address, coins, false)]

    if (changeAmount > 0) {
      txOutputs.push(TxOutput(await getChangeAddress(), changeAmount, true))
    }

    return TxAux(txInputs, txOutputs, {})
  }

  async function getMaxSendableAmount(address) {
    const utxos = await getUnspentTxOutputs()
    const txInputs = []
    let coins = 0
    const profitableUtxos = utxos.filter(isUtxoProfitable)

    for (let i = 0; i < profitableUtxos.length; i++) {
      txInputs.push(TxInputFromUtxo(profitableUtxos[i]))
      coins += profitableUtxos[i].coins
    }
    const txFee = computeTxFee(txInputs, address, coins)
    return Math.max(coins - txFee, 0)
  }

  async function getTxFee(address, coins) {
    const txInputs = await prepareTxInputs(address, coins)
    return computeTxFee(txInputs, address, coins)
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
    const inputSize = cbor.encode(TxInputFromUtxo(utxo)).length
    const addedCost = txFeeFunction(inputSize + TX_WITNESS_SIZE_BYTES) - txFeeFunction(0)

    return utxo.coins > addedCost
  }

  async function prepareTxInputs(address, coins) {
    // we do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(state.randomSeed)
    const utxos = shuffleArray(await getUnspentTxOutputs(), randomGenerator)
    const profitableUtxos = utxos.filter(isUtxoProfitable)

    const txInputs = []
    let sumUtxos = 0
    let totalCoins = coins

    for (let i = 0; i < profitableUtxos.length && sumUtxos < totalCoins; i++) {
      txInputs.push(TxInputFromUtxo(profitableUtxos[i]))
      sumUtxos += profitableUtxos[i].coins

      totalCoins = coins + computeTxFee(txInputs, address, totalCoins)
    }

    return txInputs
  }

  function computeTxFee(txInputs, address, coins) {
    if (coins > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Unsupported amount of coins: ${coins}`)
    }
    const txInputsCoinsSum = txInputs.reduce((acc, elem) => {
      return acc + elem.coins
    }, 0)
    const oneOutputFee = txFeeFunction(estimateTxSize(txInputs, address, coins, false))

    /*
    * if (coins+oneOutputFee) is equal to (txInputsCoinsSum) it means there is no change necessary
    * if (coins+oneOutputFee) is bigger the transaction is invalid even with higher fee
    * so we let caller handle it
    */
    if (coins + oneOutputFee >= txInputsCoinsSum) {
      return oneOutputFee
    } else {
      const twoOutputFee = txFeeFunction(estimateTxSize(txInputs, address, coins, true))
      if (coins + twoOutputFee > txInputsCoinsSum) {
        //means one output transaction was possible, while 2 output is not
        //so we return fee equal to inputs - coins which is guaranteed to pass
        return txInputsCoinsSum - coins
      } else {
        return twoOutputFee
      }
    }
  }

  function estimateTxSize(txInputs, outAddress, coins, hasChange) {
    const txInputsSize = cbor.encode(new CborIndefiniteLengthArray(txInputs)).length
    const outAddressSize = base58.decode(outAddress).length

    //size of addresses used by AdaLite
    const ownAddressSize = 76

    /*
    * we assume that at most two outputs (destination and change address) will be present
    * encoded in an indefinite length array
    */
    const maxCborCoinsLen = 9 //length of CBOR encoded 64 bit integer, currently max supported
    const txOutputsSize = hasChange
      ? outAddressSize + ownAddressSize + maxCborCoinsLen * 2 + 2
      : outAddressSize + maxCborCoinsLen + 2

    const txMetaSize = 1 // currently empty Map

    // the 1 is there for the CBOR "tag" for an array of 3 elements
    const txAuxSize = 1 + txInputsSize + txOutputsSize + txMetaSize

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

  async function getChangeAddress() {
    /*
    * We use visible addresses as change addresses to mainintain
    * AdaLite original functionality which did not consider change addresses.
    * This is an intermediate step between legacy mode and full Yoroi compatibility.
    */
    const addresses = await visibleAddressManager.discoverAddresses()
    const randomSeedGenerator = new PseudoRandom(state.randomSeed)

    return addresses[randomSeedGenerator.nextInt() % addresses.length]
  }

  async function getUnspentTxOutputs() {
    const addresses = await discoverAllAddresses()
    return await blockchainExplorer.fetchUnspentTxOutputs(addresses)
  }

  async function discoverAllAddresses() {
    const visibleAddresses = await visibleAddressManager.discoverAddresses()
    const changeAddresses = await changeAddressManager.discoverAddresses()

    return visibleAddresses[0] === changeAddresses[0]
      ? visibleAddresses
      : visibleAddresses.concat(changeAddresses)
  }

  function getVisibleAddressesWithMeta() {
    return visibleAddressManager.discoverAddressesWithMeta()
  }

  async function isOwnAddress(addr) {
    const addresses = await discoverAllAddresses()
    return addresses.find((address) => address === addr) !== undefined
  }

  function verifyAddress(addr) {
    if (!cryptoProvider.displayAddressForPath) {
      throw Error('unsupported operation: verifyAddress')
    }
    const absDerivationPath = getAddressToAbsPathMapper()(addr)
    return cryptoProvider.displayAddressForPath(absDerivationPath)
  }

  async function getNewUtxosFromTxAux(txAux) {
    const result = []
    for (let i = 0; i < txAux.outputs.length; i++) {
      if (await isOwnAddress(txAux.outputs[i].address)) {
        result.push({
          address: txAux.outputs[i].address,
          coins: txAux.outputs[i].coins,
          txHash: txAux.getId(),
          outputIndex: i,
        })
      }
    }

    return result
  }

  return {
    getSecret,
    submitTx,
    prepareSignedTx,
    getBalance,
    getChangeAddress,
    getMaxSendableAmount,
    getTxFee,
    getHistory,
    isOwnAddress,
    getVisibleAddressesWithMeta,
    prepareTxAux,
    verifyAddress,
    fetchTxInfo,
    _getNewUtxosFromTxAux: getNewUtxosFromTxAux,
  }
}

if (typeof window !== 'undefined') {
  window.CardanoWallet = exports.CardanoWallet
}

module.exports = {
  CardanoWallet,
  generateMnemonic,
  validateMnemonic,
  txFeeFunction,
}
