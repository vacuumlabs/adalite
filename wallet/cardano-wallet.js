const cbor = require('cbor')
const base58 = require('bs58')

const {generateMnemonic, validateMnemonic} = require('./mnemonic')
const {TxInputFromUtxo, TxOutput, TxAux} = require('./transaction')
const BlockchainExplorer = require('./blockchain-explorer')
const CardanoMnemonicCryptoProvider = require('./cardano-mnemonic-crypto-provider')
const PseudoRandom = require('./helpers/PseudoRandom')
const {HARDENED_THRESHOLD, MAX_INT32} = require('./constants')
const shuffleArray = require('./helpers/shuffleArray')
const range = require('./helpers/range')

function txFeeFunction(txSizeInBytes) {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b)
}

function isValidAddress(address) {
  try {
    // we decode the address from the base58 string
    // and then we strip the 24 CBOR data taga (the "[0].value" part)
    const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
    const addressData = cbor.decode(addressAsBuffer)
    const addressAttributes = addressData[1]
    cbor.decode(addressAttributes.get(1))
  } catch (e) {
    return false
  }
  return true
}

const CardanoWallet = (mnemonicOrHdNodeString, CARDANOLITE_CONFIG, randomSeed) => {
  const state = {
    randomSeed: randomSeed || Math.floor(Math.random() * MAX_INT32),
    ownUtxos: {},
    overallTxCountSinceLastUtxoFetch: 0,
    accountIndex: HARDENED_THRESHOLD,
    addressDerivationMode: 'hardened', // temporary - use it to switch between hardened and non-hardened addresses
  }

  const blockchainExplorer = BlockchainExplorer(CARDANOLITE_CONFIG, state)
  const cryptoProvider = CardanoMnemonicCryptoProvider(mnemonicOrHdNodeString, state)

  // fetch unspent outputs list asynchronously
  getUnspentTxOutputs()

  async function sendAda(address, coins) {
    const txAux = await prepareTxAux(address, coins)
    const signedTx = await cryptoProvider.signTx(txAux)

    const result = await blockchainExplorer.submitTxRaw(signedTx.txHash, signedTx.txBody)

    if (result) {
      updateUtxosFromTxAux(txAux)
    }

    return result
  }

  async function getId() {
    return await cryptoProvider.getWalletId()
  }

  async function prepareTx(address, coins) {
    const txAux = await prepareTxAux(address, coins)

    return cryptoProvider.signTx(txAux)
  }

  async function prepareTxAux(address, coins) {
    const txInputs = await prepareTxInputs(coins)
    const txInputsCoinsSum = txInputs.reduce((acc, elem) => {
      return acc + elem.coins
    }, 0)

    const fee = computeTxFee(txInputs, coins)
    const changeAmount = txInputsCoinsSum - coins - fee
    if (changeAmount < 0) {
      return false
    }

    const txOutputs = [TxOutput(address, coins, false)]

    if (changeAmount > 0) {
      txOutputs.push(TxOutput(await getChangeAddress(), txInputsCoinsSum - fee - coins, true))
    }

    return TxAux(txInputs, txOutputs, {})
  }

  async function getTxFee(address, coins) {
    const txInputs = await prepareTxInputs(coins)

    return computeTxFee(txInputs, coins)
  }

  async function getBalance() {
    const addresses = await discoverOwnAddresses()

    return await blockchainExplorer.getBalance(addresses)
  }

  async function getHistory() {
    const addresses = await discoverOwnAddresses()

    return await blockchainExplorer.getTxHistory(addresses)
  }

  async function prepareTxInputs(coins) {
    // we want to do it pseudorandomly to guarantee fee computation stability
    const randomGenerator = PseudoRandom(state.randomSeed)
    const utxos = shuffleArray(await getUnspentTxOutputs(), randomGenerator)

    const txInputs = []
    let sumUtxos = 0
    let totalCoins = coins

    for (let i = 0; i < utxos.length && sumUtxos < totalCoins; i++) {
      txInputs.push(TxInputFromUtxo(utxos[i]))
      sumUtxos += utxos[i].coins

      totalCoins = coins + computeTxFee(txInputs)
    }

    return txInputs
  }

  // if the fee cannot be paid it returns -1, otherwise it returns the fee
  function computeTxFee(txInputs, coins) {
    if (coins > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Unsupported amount of coins: ${coins}`)
    }

    const txInputsCoinsSum = txInputs.reduce((acc, elem) => {
      return acc + elem.coins
    }, 0)

    const out1coins = coins
    const out2coinsUpperBound = Math.max(0, txInputsCoinsSum - coins)

    // the +1 is there because in the actual transaction
    // the txInputs are encoded as indefinite length array
    const txInputsSize = cbor.encode(txInputs).length + 1

    /*
    * we assume that only two outputs (destination and change address) will be present
    * encoded in an indefinite length array
    */
    // TODO - consider case when only 1 output is present
    const txOutputsSize =
      2 * 77 + cbor.encode(out1coins).length + cbor.encode(out2coinsUpperBound).length + 2
    const txMetaSize = 1 // currently empty Map

    // the 1 is there for the CBOR "tag" for an array of 3 elements
    const txAuxSize = 1 + txInputsSize + txOutputsSize + txMetaSize

    const txWitnessesSize = txInputs.length * 139 + 1

    // the 1 is there for the CBOR "tag" for an array of 2 elements
    const txSizeInBytes = 1 + txAuxSize + txWitnessesSize

    /*
    * the deviation is there for the array of tx witnesses
    * because it may have more than 1 byte of overhead
    * if more than 16 elements are present
    */
    const deviation = 4

    return txFeeFunction(txSizeInBytes + deviation)
  }

  async function getChangeAddress() {
    // if we used all available addresses return random address from the available ones
    const ownAddresses = await discoverOwnAddresses()
    const randomSeedGenerator = new PseudoRandom(state.randomSeed)

    return ownAddresses[randomSeedGenerator.nextInt() % ownAddresses.length]
  }

  async function getUnspentTxOutputs() {
    const addresses = await discoverOwnAddresses()

    const currentOverallTxCount = await blockchainExplorer.getOverallTxCount(addresses)

    if (state.overallTxCountSinceLastUtxoFetch < currentOverallTxCount) {
      const nonemptyAddresses = await blockchainExplorer.selectNonemptyAddresses(addresses)
      const response = await blockchainExplorer.fetchUnspentTxOutputs(nonemptyAddresses)
      state.ownUtxos = Object.assign(
        ...response.map((elem) => ({[`${elem.txHash}_${elem.outputIndex}`]: elem}))
      )

      state.overallTxCountSinceLastUtxoFetch = currentOverallTxCount
    }

    return Object.values(state.ownUtxos)
  }

  async function discoverOwnAddresses() {
    const childIndexBegin = state.addressDerivationMode === 'hardened' ? HARDENED_THRESHOLD : 0
    const childIndexEnd = childIndexBegin + CARDANOLITE_CONFIG.CARDANOLITE_WALLET_ADDRESS_LIMIT
    const derivationPaths = range(childIndexBegin, childIndexEnd).map((i) => [
      HARDENED_THRESHOLD,
      i,
    ])

    return await cryptoProvider.deriveAddresses(derivationPaths, state.addressDerivationMode)
  }

  function txFeeFunction(txSizeInBytes) {
    const a = 155381
    const b = 43.946

    return Math.ceil(a + txSizeInBytes * b)
  }

  async function isOwnAddress(addr) {
    return await cryptoProvider.isOwnAddress(addr)
  }

  function updateUtxosFromTxAux(txAux) {
    const spentUtxos = txAux.inputs.map((elem) => elem.utxo)
    discardUtxos(spentUtxos)

    const newUtxos = txAux.outputs.filter((elem) => isOwnAddress(elem.address)).map((elem, i) => {
      return {
        address: elem.address,
        coins: elem.coins,
        txHash: txAux.getId(),
        outputIndex: i,
      }
    })

    addUtxos(newUtxos)
    state.overallTxCountSinceLastUtxoFetch++

    // shift randomSeed for next unspent outputs selection
    const randomSeedGenerator = new PseudoRandom(state.randomSeed)
    for (let i = 0; i < spentUtxos.length; i++) {
      state.randomSeed = randomSeedGenerator.nextInt()
    }
  }

  function discardUtxos(utxos) {
    utxos.map((utxo) => {
      delete state.ownUtxos[`${utxo.txHash}_${utxo.outputIndex}`]
    })
  }

  function addUtxos(utxos) {
    utxos.map((utxo) => {
      state.ownUtxos[`${utxo.txHash}_${utxo.outputIndex}`] = utxo
    })
  }

  return {
    getId,
    sendAda,
    getBalance,
    getChangeAddress,
    getTxFee,
    prepareTx,
    getHistory,
    getOwnAddresses: discoverOwnAddresses,
    _prepareTxAux: prepareTxAux,
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
  isValidAddress,
}
