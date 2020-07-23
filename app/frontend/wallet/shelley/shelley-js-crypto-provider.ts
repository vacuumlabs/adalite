/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {sign as signMsg, derivePrivate, xpubToHdPassphrase, blake2b} from 'cardano-crypto.js'
import cbor from 'borc'

import HdNode from '../helpers/hd-node'

type HexString = string & {__typeHexString: any}

const ShelleyJsCryptoProvider = ({walletSecretDef: {rootSecret, derivationScheme}, network}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getWalletSecret = () => masterHdNode.toBuffer()

  const getDerivationScheme = () => derivationScheme

  const deriveXpub = (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey

  const deriveXpriv = (derivationPath) => deriveHdNode(derivationPath).secretKey

  function deriveHdNode(derivationPath) {
    return derivationPath.reduce(deriveChildHdNode, masterHdNode)
  }

  function deriveChildHdNode(hdNode, childIndex) {
    const result = derivePrivate(hdNode.toBuffer(), childIndex, derivationScheme.ed25519Mode)

    return HdNode(result)
  }

  async function sign(message, keyDerivationPath) {
    const hdNode = await deriveHdNode(keyDerivationPath)
    const messageToSign = Buffer.from(message, 'hex')

    return signMsg(messageToSign, hdNode.toBuffer())
  }

  // eslint-disable-next-line require-await
  async function signTx(txAux, addressToAbsPathMapper) {
    const prepareUtxoInput = (input, hdnode, path) => {
      return {
        type: input.type,
        txid: input.txHash,
        value: input.coins,
        outputNo: input.outputIndex,
        address: input.address,
        pubKey: Buffer.from(hdnode.publicKey).toString('hex'),
        path,
        chaincode: Buffer.from(hdnode.chainCode).toString('hex'),
        protocolMagic: network.protocolMagic,
      }
    }

    const prepareAccountInput = (input, hdnode, path) => {
      return {
        type: input.type,
        address: input.address,
        pubKey: Buffer.from(hdnode.publicKey).toString('hex'),
        path,
        accountCounter: input.counter,
        value: input.coins,
      }
    }

    const prepareInput = (input) => {
      const path = addressToAbsPathMapper(input.address)
      const hdnode = deriveHdNode(path)
      const inputPreparator = {
        utxo: prepareUtxoInput,
        account: prepareAccountInput,
      }
      return inputPreparator[input.type](input, hdnode, path)
    }

    const prepareOutput = ({address, coins}) => {
      return {
        address,
        value: coins,
      }
    }

    const prepareCert = ({type, pools}) => {
      const path = addressToAbsPathMapper(txAux.cert.accountAddress)
      const hdnode = deriveHdNode(path)
      return {
        type: 'stake_delegation',
        privkey: Buffer.from(hdnode.secretKey).toString('hex') as HexString,
        pools,
      }
    }

    const buildTransaction = (inputs, outputs, cert, fee) => {
      const tx_body = build_tx_body(inputs, outputs, cert, fee)
      const tx_hash = hash_tx_body(tx_body)

      const witnesses = build_witnesses(inputs, tx_hash)

      const serialized_tx = cbor.encode([tx_body, witnesses, null]) //cert

      return {transaction: serialized_tx, fragmentId: tx_hash}
    }

    const build_tx_body = (inputs, outputs, cert, fee) => {
      const inputs_for_cbor = build_inputs(inputs)
      const outputs_for_cbor = build_outputs(outputs)

      const tx_body = {
        0: inputs_for_cbor,
        1: outputs_for_cbor,
        2: fee,
        3: null, //ttl
      }

      return tx_body
    }

    const build_inputs = (inputs) => {
      const res = []
      inputs.forEach((index, input) => {
        res.push([input.txid, input.outputNo])
      })
      return res
    }

    const build_outputs = (outputs) => {
      const result = []
      outputs.forEach((index, output) => {
        result.push([output.address, output.value])
      })
      return result
    }

    const hash_tx_body = (tx_body) => {
      const tx_body_cbor = cbor.encode(tx_body)
      return blake2b(tx_body_cbor, 32).toString('hex')
    }

    const build_witnesses = (inputs, tx_body_hash) => {
      const shelley_witnesses = build_shelley_witnesses(inputs, tx_body_hash)
      const byron_witnesses = build_byron_witnesses(inputs, tx_body_hash)

      const witnesses = {}
      if (shelley_witnesses.length > 0) {
        witnesses[0] = shelley_witnesses
      }
      if (byron_witnesses.length > 0) {
        witnesses[2] = byron_witnesses
      }

      return witnesses
    }

    const build_shelley_witnesses = (inputs, tx_body_hash) => {
      const shelley_witnesses = []
      inputs.forEach((index, input) => {
        const signature = sign(tx_body_hash, input.path)
        shelley_witnesses.push([input.pubKey, signature])
      })

      return shelley_witnesses
    }

    const build_byron_witnesses = (inputs, tx_body_hash) => {
      const byron_witnesses = []
      inputs.forEach((index, input) => {
        const signature = sign(tx_body_hash, input.path)
        const address_attributes = cbor.encode(
          input.protocolMagic === network.protocolMagic ? {} : {2: cbor.encode(input.protocolMagic)}
        )
        byron_witnesses.push([input.pubKey, signature, input.chaincode, address_attributes])
      })

      return byron_witnesses
    }

    const inputs = txAux.inputs.map(prepareInput)
    const outpustAndChange = txAux.change ? [...txAux.outputs, txAux.change] : [...txAux.outputs]
    const outputs = outpustAndChange.length ? outpustAndChange.map(prepareOutput) : []
    const cert = txAux.cert ? prepareCert(txAux.cert) : null
    const fee = txAux.fee

    const tx = buildTransaction(inputs, outputs, cert, fee)

    return tx
  }

  function getHdPassphrase() {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
  }

  return {
    network,
    signTx,
    getWalletSecret,
    getDerivationScheme,
    deriveXpub,
    isHwWallet,
    getHdPassphrase,
    _sign: sign,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
    deriveXpriv,
  }
}

export default ShelleyJsCryptoProvider
