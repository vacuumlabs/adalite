const cbor = require('cbor')

const {mnemonicToWalletSecretString, generateMnemonic} = require('./mnemonic')
const tx = require('./transaction')
const address = require('./address')
const blockchainExplorerObject = require('./blockchain-explorer')
const request = require('./helpers/request')

function txFeeFunction(txSizeInBytes) {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b)
}

async function filterUsed(arr, callback) {
  return (await Promise.all(
    arr.map(async (item) => {
      return (await callback(item)) ? item : undefined
    })
  )).filter((i) => i !== undefined)
}

const CardanoWallet = (secretOrMnemonic, CARDANOLITE_CONFIG) => {
  const blockchainExplorer = blockchainExplorerObject(CARDANOLITE_CONFIG)

  const rootSecret =
    secretOrMnemonic.search(' ') >= 0
      ? mnemonicToWalletSecretString(secretOrMnemonic)
      : new tx.WalletSecretString(secretOrMnemonic)

  async function sendAda(address, coins) {
    const transaction = await prepareTx(address, coins)

    const txHash = transaction.getId()
    const txBody = cbor.encode(transaction).toString('hex')

    return await submitTxRaw(txHash, txBody)
  }

  function getRootSecret() {
    return rootSecret
  }

  function getId() {
    return address.deriveAddress(rootSecret, 0x80000000)
  }

  async function prepareTx(address, coins) {
    const txInputs = await prepareTxInputs(coins)
    const txInputsCoinsSum = txInputs.reduce((acc, elem) => {
      return acc + elem.coins
    }, 0)

    const fee = computeTxFee(txInputs, coins)

    //comment this for developement
    if (fee === -1) {
      return false
    }

    const txOutputs = [
      new tx.TxOutput(new tx.WalletAddress(address), coins),
      new tx.TxOutput(
        new tx.WalletAddress(await getChangeAddress()),
        txInputsCoinsSum - fee - coins
      ),
    ]

    return new tx.Transaction(txInputs, txOutputs, {})
  }

  async function getTxFee(address, coins) {
    const txInputs = await prepareTxInputs(coins)

    return computeTxFee(txInputs, coins)
  }

  async function getBalance() {
    let result = 0

    const addresses = await getUsedAddresses()

    for (let i = 0; i < addresses.length; i++) {
      result += await blockchainExplorer.getAddressBalance(addresses[i])
    }

    return result
  }

  async function getHistory() {
    const transactions = {}

    const addresses = await getUsedAddresses()

    for (const a of addresses) {
      const myTransactions = await blockchainExplorer.getAddressTxList(a)
      for (const t of myTransactions) {
        transactions[t.ctbId] = t
      }
    }
    for (const t of Object.values(transactions)) {
      let effect = 0 //effect on wallet balance accumulated
      for (const input of t.ctbInputs) {
        if (addresses.includes(input[0])) {
          effect -= +input[1].getCoin
        }
      }
      for (const output of t.ctbOutputs) {
        if (addresses.includes(output[0])) {
          effect += +output[1].getCoin
        }
      }
      t.effect = effect
    }
    return Object.values(transactions).sort((a, b) => b.ctbTimeIssued - a.ctbTimeIssued)
  }

  async function prepareTxInputs(coins) {
    // TODO optimize tx inputs selection, now it takes all utxos
    const utxos = await getUnspentTxOutputsWithSecrets()

    const txInputs = []
    for (let i = 0; i < utxos.length; i++) {
      txInputs.push(
        new tx.TxInput(utxos[i].txHash, utxos[i].outputIndex, utxos[i].secret, utxos[i].coins)
      )
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
    const out2coinsUpperBound = txInputsCoinsSum - coins

    // the +1 is there because in the actual transaction
    // the txInputs are encoded as indefinite length array
    const txInputsSize = cbor.encode(txInputs).length + 1

    /*
    * we assume that only two outputs (destination and change address) will be present
    * encoded in an indefinite length array
    */
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

    const fee = txFeeFunction(txSizeInBytes + deviation)

    if (txInputsCoinsSum - coins - fee < 0) {
      return -1
    }

    return fee
  }

  async function getChangeAddress(usedAddressesLimit = Number.MAX_SAFE_INTEGER, offset = 0) {
    const usedAddressesAndSecrets = await getUsedAddressesAndSecrets()

    let result

    if (usedAddressesAndSecrets.length < usedAddressesLimit) {
      const highestUsedChildIndex = Math.max(
        usedAddressesAndSecrets.reduce((acc, item) => {
          return Math.max(item.childIndex, acc)
        }, 0),
        0x80000000
      )

      result = address.deriveAddressAndSecret(rootSecret, highestUsedChildIndex + 1 + offset)
        .address
    } else {
      result =
        usedAddressesAndSecrets[Math.floor(Math.random() * usedAddressesAndSecrets.length)].address
    }

    return result
  }

  async function getUnspentTxOutputsWithSecrets() {
    let result = []

    const addresses = await getUsedAddressesAndSecrets()

    for (let i = 0; i < addresses.length; i++) {
      const addressUnspentOutputs = await blockchainExplorer.getUnspentTxOutputs(
        addresses[i].address
      )

      addressUnspentOutputs.map((element) => {
        element.secret = addresses[i].secret
      })

      result = result.concat(addressUnspentOutputs)
    }

    return result
  }

  async function getUsedAddressesAndSecrets() {
    let result = []
    // eslint-disable-next-line no-undef
    const gapLength = CARDANOLITE_CONFIG.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH

    for (let i = 0; ; i++) {
      const usedAddresses = await filterUsed(
        deriveAddressesAndSecrets(i * gapLength, (i + 1) * gapLength),
        async (addressData) => {
          return await blockchainExplorer.isAddressUsed(addressData.address)
        }
      )

      if (usedAddresses.length === 0) {
        break
      }

      result = result.concat(usedAddresses)
    }

    return result
  }

  function deriveAddresses(
    begin = 0,
    // eslint-disable-next-line no-undef
    end = CARDANOLITE_CONFIG.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH
  ) {
    return deriveAddressesAndSecrets(begin, end).map((item) => item.address)
  }

  function deriveAddressesAndSecrets(
    begin = 0,
    // eslint-disable-next-line no-undef
    end = CARDANOLITE_CONFIG.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH
  ) {
    const result = []
    for (let i = begin; i < end; i++) {
      result.push(address.deriveAddressAndSecret(rootSecret, 0x80000001 + i))
    }

    return result
  }

  async function getUsedAddresses() {
    return (await getUsedAddressesAndSecrets()).map((item) => {
      return item.address
    })
  }

  function txFeeFunction(txSizeInBytes) {
    const a = 155381
    const b = 43.946

    return Math.ceil(a + txSizeInBytes * b)
  }

  async function submitTxRaw(txHash, txBody) {
    try {
      const res = await request.execute(
        `${CARDANOLITE_CONFIG.CARDANOLITE_TRANSACTION_SUBMITTER_URL}/api/transactions`,
        'POST',
        JSON.stringify({
          txHash,
          txBody,
        }),
        {
          'Content-Type': 'application/json',
        }
      )

      if (res.status >= 300) {
        throw Error(`${res.status} ${JSON.stringify(res)}`)
      } else {
        return res.result
      }
    } catch (err) {
      throw err //Error(`txSubmiter unreachable ${err}`)
    }
  }

  return {
    getId,
    sendAda,
    getBalance,
    getChangeAddress,
    getTxFee,
    getUsedAddresses,
    prepareTx,
    deriveAddresses,
    getHistory,
    getRootSecret,
  }
}

if (typeof window !== 'undefined') {
  window.CardanoWallet = exports.CardanoWallet
}

module.exports = {
  CardanoWallet,
  generateMnemonic,
  txFeeFunction,
  isValidAddress: address.isValidAddress,
}
