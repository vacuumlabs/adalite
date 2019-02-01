const TransportU2F = require('@ledgerhq/hw-transport-u2f').default // for browser
const Ada = require('@ledgerhq/hw-app-ada').default
const {derivePublic} = require('cardano-crypto.js')
const indexIsHardened = require('./helpers/indexIsHardened')
const cbor = require('borc')
const {TxWitness, SignedTransactionStructured} = require('./transaction')

const CardanoLedgerCryptoProvider = async (ADALITE_CONFIG, walletState) => {
  const transport = await TransportU2F.create()
  const ada = new Ada(transport)

  const state = Object.assign(walletState, {
    derivedXpubs: {},
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  if (state.derivationScheme.type !== 'v2') {
    throw new Error(`Unsupported derivation scheme: ${state.derivationScheme.type}`)
  }

  function deriveXpub(absDerivationPath) {
    const memoKey = JSON.stringify(absDerivationPath)

    if (!state.derivedXpubs[memoKey]) {
      const deriveHardened =
        absDerivationPath.length === 0 ||
        indexIsHardened(absDerivationPath[absDerivationPath.length - 1])

      /*
      * TODO - reset cache if the promise fails, for now it does not matter
      * since a failure (e.g. rejection by user) there leads to
      * the creation of a fresh wallet instance
      */
      state.derivedXpubs[memoKey] = deriveHardened
        ? deriveXpubHardened(absDerivationPath)
        : deriveXpubNonHardened(absDerivationPath)
    }

    return state.derivedXpubs[memoKey]
  }

  function deriveXpubHardened(absDerivationPath) {
    try {
      return ada.getExtendedPublicKey(absDerivationPath).then((response) => {
        // public key which returns trezor-connect contains public key folowed by chain code (see node object in trezor-connect response).
        return Buffer.from(response.publicKeyHex.concat(response.chainCodeHex), 'hex')
      })
    } catch (err) {
      return Promise.reject('operation failed')
    }
  }

  async function deriveXpubNonHardened(absDerivationPath) {
    const lastIndex = absDerivationPath[absDerivationPath.length - 1]
    const parentXpub = await deriveXpub(absDerivationPath.slice(0, absDerivationPath.length - 1))

    return derivePublic(parentXpub, lastIndex, state.derivationScheme.number)
  }

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on LedgerCryptoProvider!')
  }

  function sign(message, absDerivationPath) {
    throw new Error('Not supported')
  }

  async function deviceDisplayAddress(address, addressToAbsPathMapper) {
    const absDerivationPath = addressToAbsPathMapper(address)
    try {
      await ada.showAddress(absDerivationPath)
    } catch (err) {
      throw new Error('Ledger operation failed!')
    }
  }

  function getWalletSecret() {
    throw new Error('Unsupported operation!')
  }

  function prepareInput(input, addressToAbsPathMapper, txDataHex) {
    const data = {
      txDataHex,
      outputIndex: input.outputIndex,
      path: addressToAbsPathMapper(input.utxo.address),
    }

    return data
  }

  function prepareOutput(output, addressToAbsPathMapper) {
    const data = {
      amountStr: `${output.coins}`,
    }

    if (output.isChange) {
      data.path = addressToAbsPathMapper(output.address)
    } else {
      data.address58 = output.address
    }

    return data
  }

  async function prepareWitnesses(witnesses) {
    const data = []
    for (const witness of witnesses) {
      const extendedPublicKey = await deriveXpub(witness.path)
      data.push(TxWitness(extendedPublicKey, Buffer.from(witness.witnessHex, 'hex')))
    }

    return data
  }

  function prepareBody(unsignedTx, txWitnesses) {
    return cbor.encode(SignedTransactionStructured(unsignedTx, txWitnesses)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const inputs = []
    for (let i = 0; i < unsignedTx.inputs.length; i++) {
      inputs.push(await prepareInput(unsignedTx.inputs[i], addressToAbsPathMapper, transactions[i]))
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await prepareOutput(output, addressToAbsPathMapper)
      outputs.push(data)
    }

    try {
      const response = await ada.signTransaction(inputs, outputs)

      if (response.txHashHex !== unsignedTx.getId()) {
        throw new Error('Ledger: Transaction was corrupted')
      } else {
        const txWitnesses = await prepareWitnesses(response.witnesses)
        return {
          txHash: response.txHashHex,
          txBody: prepareBody(unsignedTx, txWitnesses),
        }
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  return {
    getWalletSecret,
    signTx,
    deviceDisplayAddress,
    deriveXpub,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

module.exports = CardanoLedgerCryptoProvider
