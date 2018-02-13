const exceptions = require("node-exceptions");
const cbor = require("cbor");
const base58 = require("bs58");
const EdDSA = require('elliptic-cardano').eddsa;
const crypto = require('crypto');
const {hex2buf, add256NoCarry, scalarAdd256ModM, multiply8} = require("./utils");

var ec = new EdDSA('ed25519');

exports.TxInput = class TxInput {
  constructor(txId, outputIndex) {
    this.id = txId;
    this.outputIndex = outputIndex; // the index of the input transaction when it was the output of another
    this.type = 0; // default input type
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([
      this.type,
      new cbor.Tagged(24, cbor.encode([
        hex2buf(this.id),
        this.outputIndex
      ]))
    ]);
  }
}

exports.TxOutput = class TxOutput {
  constructor(walletAddress, coins) {
    this.walletAddress = walletAddress;
    this.coins = coins;
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([this.walletAddress, this.coins]);
  }
}

exports.WalletAddress = class WalletAddress {
  constructor(address) {
    this.address = address;
  }

  encodeCBOR(encoder) {
    return encoder.push(base58.decode(this.address));
  }
}

exports.WalletSecretString = class WalletSecretString {
  constructor(secretString) {
    this.secretString = secretString;
  }

  getSecretKey() {
    return this.secretString.substr(0, 128);
  }

  getPublicKey() {
    return this.secretString.substr(128, 64);
  }

  getChainCode() {
    return this.secretString.substr(192, 64);
  }
}

exports.TxPublicString = class TxPublicString {
  // hex string representing 64 bytes
  constructor(txPublicString) {
    this.txPublicString = txPublicString;
  }

  getPublicKey() {
    return this.txPublicString.substr(0, 64);
  }

  getChainCode() {
    return this.txPublicString.substr(64, 64);
  }

  encodeCBOR(encoder) {
    return encoder.pushAny(new Buffer(this.txPublicString, "hex"));
  }
}

exports.TxSignature = class TxSignature {
  constructor(signature) {
    this.signature = signature;
  }

  encodeCBOR(encoder) {
    return encoder.pushAny(new Buffer(this.signature, "hex"));
  }
}

exports.TxWitness = class TxWitness {
  constructor(publicString, signature) {
    this.publicString = publicString;
    this.signature = signature;
    this.type = 0; // default - PkWitness
  }

  getPublicKey() {
    return this.publicString.getPublicKey();
  }

  getSignature() {
    return this.signature.signature;
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([
      this.type,
      new cbor.Tagged(24, cbor.encode([this.publicString, this.signature]))
    ]);
  }
}

exports.deriveSK = function (parentSecretString, childIndex) {
  var childIndexFirstBit = childIndex >> 31;
  if (!childIndexFirstBit) throw new exceptions.InvalidArgumentException("childindex starts with zero bit," +
    " we don't " +
    "support non-hardened derivation for private keys");
  var firstround = deriveSkIteration(parentSecretString, 0x80000000);
  if (childIndex === 0x80000000)
    return firstround;
  return deriveSkIteration(firstround.secretString, childIndex);
}

function deriveSkIteration(parentSecretString, childIndex) {
  var parentSecretString = new exports.WalletSecretString(parentSecretString);
  var chainCode = new Buffer(parentSecretString.getChainCode(), 'hex');

  var hmac1 = crypto.createHmac('sha512', chainCode);
  hmac1.update(new Buffer('00', 'hex'));
  hmac1.update(new Buffer(parentSecretString.getSecretKey(), 'hex'));
  hmac1.update(new Buffer(childIndex.toString(16).padStart(8, '0'), 'hex'));

  var z = new Buffer(hmac1.digest('hex'), 'hex');

  var zl8 = multiply8(z, new Buffer('08', 'hex')).slice(0, 32);
  var parentKey = new Buffer(parentSecretString.getSecretKey(), 'hex');

  var kl = scalarAdd256ModM(zl8, parentKey.slice(0, 32));
  var kr = add256NoCarry(z.slice(32, 64), parentKey.slice(32, 64));

  var resKey = Buffer.concat([kl, kr]);

  var hmac2 = crypto.createHmac('sha512', chainCode);
  hmac2.update(new Buffer('01', 'hex'));
  hmac2.update(new Buffer(parentSecretString.getSecretKey(), 'hex'));
  hmac2.update(new Buffer(childIndex.toString(16).padStart(8, '0'), 'hex'));

  var newChainCode = new Buffer(hmac2.digest('hex').slice(64, 128), 'hex');
  var newPublicKey = new Buffer(ec.keyFromSecret(resKey.toString('hex').slice(0, 64)).getPublic('hex'), 'hex');

  return new exports.WalletSecretString(Buffer.concat([resKey, newPublicKey, newChainCode]).toString('hex'));
}
