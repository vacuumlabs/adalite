// eslint-disable-next-line import/no-unresolved
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {ADALITE_SUPPORT_EMAIL} from '../constants'
import derivationSchemes from '../helpers/derivation-schemes'
import NamedError from '../../helpers/NamedError'
import debugLog from '../../helpers/debugLog'

const CardanoTrezorCryptoProvider = ({network, config}) => {
  const derivationScheme = derivationSchemes.v2

  const TrezorConnect = config.ADALITE_TREZOR_CONNECT_URL
    ? (window as any).TrezorConnect
    : require('trezor-connect').default

  TrezorConnect.manifest({
    email: ADALITE_SUPPORT_EMAIL,
    appUrl: config.ADALITE_SERVER_URL,
  })

  const isHwWallet = () => true
  const getHwWalletName = () => 'Trezor'

  const deriveXpub = CachedDeriveXpubFactory(derivationScheme, async (absDerivationPath) => {
    const response = await TrezorConnect.cardanoGetPublicKey({
      path: absDerivationPath,
      showOnTrezor: false,
    })
    throwIfNotSuccess(response)
    return Buffer.from(response.payload.publicKey, 'hex')
  })

  function deriveHdNode(childIndex) {
    throw NamedError('UnsupportedOperationError', {
      message: 'This operation is not supported on TrezorCryptoProvider!',
    })
  }

  function sign(message, absDerivationPath) {
    throw NamedError('UnsupportedOperationError', {message: 'Operation not supported'})
  }

  async function displayAddressForPath(absDerivationPath) {
    const response = await TrezorConnect.cardanoGetAddress({
      path: absDerivationPath,
      showOnTrezor: true,
    })

    throwIfNotSuccess(response)
  }

  function prepareInput(input, addressToAbsPathMapper) {
    const data = {
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
      type: 0,
      path: addressToAbsPathMapper(input.utxo.address),
    }

    return data
  }

  interface TrezorOutput {
    amount: string
    address?: string
    path?: Array<number>
  }

  function prepareOutput(output, addressToAbsPathMapper) {
    const data: TrezorOutput = {
      amount: `${output.coins}`,
    }

    if (output.isChange) {
      data.path = addressToAbsPathMapper(output.address)
    } else {
      data.address = output.address
    }

    return data
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const inputs = []
    for (const input of unsignedTx.inputs) {
      inputs.push(await prepareInput(input, addressToAbsPathMapper))
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await prepareOutput(output, addressToAbsPathMapper)
      outputs.push(data)
    }

    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const response = await TrezorConnect.cardanoSignTransaction({
      inputs,
      outputs,
      transactions,
      protocol_magic: network.protocolMagic,
    })

    if (response.error || !response.success) {
      debugLog(response)
      throw NamedError('TrezorSignTxError', {message: response.payload.error})
    }

    return {
      txHash: response.payload.hash,
      txBody: response.payload.body,
    }
  }

  function getWalletSecret() {
    throw NamedError('UnsupportedOperationError', {message: 'Unsupported operation!'})
  }

  function getDerivationScheme() {
    return derivationScheme
  }

  function throwIfNotSuccess(response) {
    if (response.error || !response.success) {
      debugLog(response)
      throw NamedError('TrezorError', {
        message:
          'Trezor operation failed, please make sure ad blockers are switched off for this site',
      })
    }
  }

  return {
    getWalletSecret,
    getDerivationScheme,
    signTx,
    displayAddressForPath,
    deriveXpub,
    isHwWallet,
    getHwWalletName,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

export default CardanoTrezorCryptoProvider
