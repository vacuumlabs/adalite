//var Buffer = require("buffer/").Buffer;
const cbor = require('cbor')
const {Buffer} = require('buffer/')
const base58 = require('bs58')
const ed25519 = require('supercop.js')
const EdDSA = require('elliptic-cardano').eddsaVariant
const ec = new EdDSA('ed25519')

const hashBlake2b256 = require('./helpers/hashBlake2b256')
const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')

function hex2buf(hexString) {
  return Buffer.from(hexString, 'hex')
}

exports.sign = function sign(message, extendedPrivateKey) {
  const privKey = extendedPrivateKey.getSecretKey() //extendedPrivateKey.substr(0, 128);
  const pubKey = extendedPrivateKey.getPublicKey() //substr(128, 64);

  const messageToSign = new Buffer(message, 'hex')

  return ed25519
    .sign(messageToSign, new Buffer(pubKey, 'hex'), new Buffer(privKey, 'hex'))
    .toString('hex')
}

exports.verify = function verify(message, publicKey, signature) {
  const key = ec.keyFromPublic(publicKey, 'hex')

  return key.verify(message, signature)
}

class TxAux {
  constructor(inputs, outputs, attributes) {
    this.inputs = inputs
    this.outputs = outputs
    this.attributes = attributes
  }

  getId() {
    return hashBlake2b256(this)
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([
      new CborIndefiniteLengthArray(this.inputs),
      new CborIndefiniteLengthArray(this.outputs),
      this.attributes,
    ])
  }
}

// export only what you really need
exports.TxInput = class TxInput {
  constructor(txId, outputIndex, secret, coins) {
    this.id = txId

    // the index of the input transaction when it was the output of another
    this.outputIndex = outputIndex

    // default input type
    this.type = 0

    // so we are able to sign the input
    this.secret = secret

    this.coins = coins
  }

  getWitness(txHash) {
    return new exports.TxWitness(
      new exports.TxPublicString(this.secret.getPublicKey() + this.secret.getChainCode()),
      /*
      * "011a2d964a095820" is a magic prefix from the cardano-sl code
        the "01" byte is a constant to denote signatures of transactions
        the "1a2d964a09" part is the CBOR representation of the blockchain-specific magic constant
        the "5820" part is the CBOR prefix for a hex string
      */
      new exports.TxSignature(exports.sign(`011a2d964a095820${txHash}`, this.secret))
    )
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([
      this.type,
      new cbor.Tagged(24, cbor.encode([hex2buf(this.id), this.outputIndex])),
    ])
  }
}

exports.TxOutput = class TxOutput {
  constructor(walletAddress, coins) {
    this.walletAddress = walletAddress
    this.coins = coins
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([this.walletAddress, this.coins])
  }
}

exports.WalletAddress = class WalletAddress {
  constructor(address) {
    this.address = address
  }

  encodeCBOR(encoder) {
    return encoder.push(base58.decode(this.address))
  }
}

exports.WalletSecretString = class WalletSecretString {
  constructor(secretString) {
    this.secretString = secretString
  }

  getSecretKey() {
    return this.secretString.substr(0, 128)
  }

  getPublicKey() {
    return this.secretString.substr(128, 64)
  }

  getChainCode() {
    return this.secretString.substr(192, 64)
  }
}

exports.TxPublicString = class TxPublicString {
  // hex string representing 64 bytes
  constructor(txPublicString) {
    this.txPublicString = txPublicString
  }

  getPublicKey() {
    return this.txPublicString.substr(0, 64)
  }

  getChainCode() {
    return this.txPublicString.substr(64, 64)
  }

  encodeCBOR(encoder) {
    return encoder.pushAny(new Buffer(this.txPublicString, 'hex'))
  }
}

exports.TxSignature = class TxSignature {
  constructor(signature) {
    this.signature = signature
  }

  encodeCBOR(encoder) {
    return encoder.pushAny(new Buffer(this.signature, 'hex'))
  }
}

exports.TxWitness = class TxWitness {
  constructor(publicString, signature) {
    this.publicString = publicString
    this.signature = signature
    this.type = 0 // default - PkWitness
  }

  getPublicKey() {
    return this.publicString.getPublicKey()
  }

  getSignature() {
    return this.signature.signature
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([
      this.type,
      new cbor.Tagged(24, cbor.encode([this.publicString, this.signature])),
    ])
  }
}

exports.Transaction = class Transaction {
  constructor(inputs, outputs, attributes, witnesses = undefined) {
    this.inputs = inputs
    this.outputs = outputs
    this.attributes = attributes
    this.witnesses = witnesses
  }

  getId() {
    return this.getTxAux().getId()
  }

  getTxAux() {
    return new TxAux(this.inputs, this.outputs, this.attributes)
  }

  getWitnesses() {
    const txHash = this.getId()
    return this.inputs.map((input) => {
      return input.getWitness(txHash)
    })
  }

  verify() {
    return this.getWitnesses()
      .map((witness) => {
        /*
      * "011a2d964a095820" is a magic prefix from the cardano-sl code
        the "01" byte is a constant to denote signatures of transactions
        the "1a2d964a09" part is the CBOR representation of the blockchain-specific magic constant
        the "5820" part is the CBOR prefix for a hex string
      */
        const message = `011a2d964a095820${this.getId()}`

        return exports.verify(message, witness.getPublicKey(), witness.getSignature())
      })
      .reduce((a, b) => a && b, true)
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([this.getTxAux(), this.getWitnesses()])
  }
}
