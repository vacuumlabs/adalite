const crc32 = require("crc-32");
const cbor = require("cbor");
const pbkdf2 = require("pbkdf2");
const chacha20 = require("@stablelib/chacha20poly1305");
const bs58 = require('bs58')

const CBORIndefiniteLengthArray = require("./helpers").CBORIndefiniteLengthArray;
const addressHash = require("./utils").addressHash;


exports.secretToAddress = function (rootWalletSecretString, walletSecretString, derivationPath) {

  var hdPassphrase = deriveHDPassphrase(rootWalletSecretString);
  
  var addressPayload = encryptDerivationPath(derivationPath, hdPassphrase);
  var addressRoot = new Buffer(getAddressRoot(walletSecretString, addressPayload), 'hex');

  var addressAttributes = new Map([[1, cbor.encode(addressPayload)]]);
  var addressType = 0; // Public key address
  
  var addressData = [addressRoot, addressAttributes, addressType];
  
  var addressDataEncoded = new Buffer(cbor.encode(addressData), 'hex');

  return bs58.encode(cbor.encode([
    new cbor.Tagged(24, addressDataEncoded),
    getCheckSum(addressDataEncoded)
  ]));
};

function getAddressRoot(walletSecretString, addressPayload) {
  var extendedPublicKey = new Buffer(walletSecretString.getPublicKey() + walletSecretString.getChainCode(), 'hex');

  return addressHash([
    0,
    [
      0,
      extendedPublicKey
    ],
    new Map([[1, cbor.encode(addressPayload)]])
  ]);
}

function encryptDerivationPath(derivationPath, hdPassphrase) {
  var serializedDerivationPath = cbor.encode(new CBORIndefiniteLengthArray(derivationPath));

  var cipher = new chacha20.ChaCha20Poly1305(hdPassphrase);

  return new Buffer(cipher.seal(new Buffer("serokellfore"), serializedDerivationPath));
}

function getCheckSum(input) {
  return crc32.buf(input)>>>0;
};

function deriveHDPassphrase(walletSecretString) {
  var extendedPublicKey = new Buffer(walletSecretString.getPublicKey() + walletSecretString.getChainCode(), 'hex');

  var derivedKey = pbkdf2.pbkdf2Sync(extendedPublicKey, "address-hashing", 500, 32, 'sha512')
  return new Buffer(derivedKey.toString('hex'), 'hex');
}
