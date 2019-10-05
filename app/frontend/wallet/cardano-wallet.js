const cbor = require('borc')
const {base58} = require('cardano-crypto.js')

const debugLog = require('../helpers/debugLog')
const {generateMnemonic, validateMnemonic} = require('./mnemonic')
const {TxInputFromUtxo, TxOutput, TxAux} = require('./transaction')
const AddressManager = require('./address-manager')
const BlockchainExplorer = require('./blockchain-explorer')
const PseudoRandom = require('./helpers/PseudoRandom')
const {HARDENED_THRESHOLD, MAX_INT32, TX_WITNESS_SIZE_BYTES} = require('./constants')
const shuffleArray = require('./helpers/shuffleArray')
const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')
const NamedError = require('../helpers/NamedError')
const CryptoProviderFactory = require('./crypto-provider-factory')

function txFeeFunction(txSizeInBytes) {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b)
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
  })

  const changeAddressManager = AddressManager({
    accountIndex: state.accountIndex,
    defaultAddressCount: config.ADALITE_DEFAULT_ADDRESS_COUNT,
    gapLimit: config.ADALITE_GAP_LIMIT,
    cryptoProvider,
    isChange: true,
    blockchainExplorer,
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
      throw NamedError('TransactionRejectedByNetwork')
    })

    return response
  }

  function getWalletSecretDef() {
    return {
      rootSecret: cryptoProvider.getWalletSecret(),
      derivationScheme: cryptoProvider.getDerivationScheme(),
    }
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
        throw NamedError('TransactionRejected', e.message)
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
    const randomGenerator = PseudoRandom(seeds.randomInputSeed)
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
    const addresses = filterUnusedEndAddresses(
      await visibleAddressManager.discoverAddressesWithMeta()
    ).map((addrWithMeta) => addrWithMeta.address)

    const randomSeedGenerator = new PseudoRandom(seeds.randomChangeSeed)
    const result = addresses[randomSeedGenerator.nextInt() % addresses.length]
    return result
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
    getTxFee,
    getHistory,
    isOwnAddress,
    getFilteredVisibleAddressesWithMeta,
    prepareTxAux,
    verifyAddress,
    fetchTxInfo,
    _getNewUtxosFromTxAux: getNewUtxosFromTxAux,
    generateNewSeeds,
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
