const crc32 = require("crc-32");
const cbor = require("cbor");
const pbkdf2 = require("pbkdf2");
const chacha20 = require("@stablelib/chacha20poly1305");
const base58 = require("bs58");
const crypto = require("crypto");
var EdDSA = require('elliptic-cardano').eddsa;
var ec = new EdDSA('ed25519');

const CBORIndefiniteLengthArray = require("./helpers").CBORIndefiniteLengthArray;
const addressHash = require("./utils").addressHash;
const tx = require("./transaction");
const { add256NoCarry, scalarAdd256ModM, multiply8 } = require("./utils");


exports.deriveAddressAndSecret = function (rootSecretString, childIndex) {
  if (childIndex === 0x80000000) { // root address
    var addressPayload = new Buffer(0);
    var addressAttributes = new Map();
    var derivedSecretString = rootSecretString
    var addressRoot = new Buffer(getAddressRoot(derivedSecretString, addressPayload), 'hex');
  } else { // the remaining addresses
    var hdPassphrase = deriveHDPassphrase(rootSecretString);
    var derivedSecretString = exports.deriveSK(rootSecretString, childIndex);
    var derivationPath = [0x80000000, childIndex];

    var addressPayload = encryptDerivationPath(derivationPath, hdPassphrase);
    var addressAttributes = new Map([[1, cbor.encode(addressPayload)]]);
    var addressRoot = new Buffer(getAddressRoot(derivedSecretString, addressPayload), "hex");
  }

  var addressType = 0; // Public key address
  
  var addressData = [addressRoot, addressAttributes, addressType];
  
  var addressDataEncoded = new Buffer(cbor.encode(addressData), "hex");

  var address = base58.encode(cbor.encode([
    new cbor.Tagged(24, addressDataEncoded),
    getCheckSum(addressDataEncoded)
  ]));

  return {
    "address" : address,
    "secret" : derivedSecretString
  }
};

exports.deriveSK = function(rootSecretString, childIndex) {

  var firstround = deriveSkIteration(rootSecretString, 0x80000000);
  
  if (childIndex === 0x80000000) {
    return firstround;
  }

  return deriveSkIteration(firstround, childIndex);
}

function getAddressRoot(walletSecretString, addressPayload) {
  var extendedPublicKey = new Buffer(walletSecretString.getPublicKey() + walletSecretString.getChainCode(), "hex");

  return addressHash([
    0,
    [
      0,
      extendedPublicKey
    ],
    (addressPayload.length > 0) ? new Map([[1, cbor.encode(addressPayload)]]) : new Map()
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
  var extendedPublicKey = new Buffer(walletSecretString.getPublicKey() + walletSecretString.getChainCode(), "hex");

  var derivedKey = pbkdf2.pbkdf2Sync(extendedPublicKey, "address-hashing", 500, 32, "sha512")
  return new Buffer(derivedKey.toString("hex"), "hex");
}

function deriveSkIteration (parentSecretString, childIndex) {
  var chainCode = new Buffer(parentSecretString.getChainCode(), "hex");

  var hmac1 = crypto.createHmac("sha512", chainCode);

  if (indexIsHardened(childIndex)) {
    hmac1.update(new Buffer("00", "hex")); // TAG_DERIVE_Z_HARDENED
    hmac1.update(new Buffer(parentSecretString.getSecretKey(), "hex"));
  } else {
    hmac1.update(new Buffer("02", "hex")); // TAG_DERIVE_Z_NORMAL
    hmac1.update(new Buffer(parentSecretString.getPublicKey(), "hex"));
  }
  hmac1.update(new Buffer(childIndex.toString(16).padStart(8, '0'), "hex"));
  var z = new Buffer(hmac1.digest("hex"), "hex");

  var zl8 = multiply8(z, new Buffer("08", "hex")).slice(0,32);
  var parentKey = new Buffer(parentSecretString.getSecretKey(), "hex");

  var kl = scalarAdd256ModM(zl8, parentKey.slice(0, 32));
  var kr = add256NoCarry(z.slice(32, 64), parentKey.slice(32, 64));

  var resKey = Buffer.concat([kl, kr]);

  var hmac2 = crypto.createHmac('sha512', chainCode);

  if (indexIsHardened(childIndex)) {  
    hmac2.update(new Buffer("01", "hex")); // TAG_DERIVE_CC_HARDENED
    hmac2.update(new Buffer(parentSecretString.getSecretKey(), "hex"));
  } else {
    hmac2.update(new Buffer("03", "hex")); // TAG_DERIVE_CC_NORMAL
    hmac2.update(new Buffer(parentSecretString.getPublicKey(), "hex"));
  }
  hmac2.update(new Buffer(childIndex.toString(16).padStart(8, "0"), "hex"));

  var newChainCode = new Buffer(hmac2.digest("hex").slice(64, 128), "hex");
  var newPublicKey = new Buffer(ec.keyFromSecret(resKey.toString("hex").slice(0,64)).getPublic("hex"), "hex");

  return new tx.WalletSecretString(Buffer.concat([resKey, newPublicKey, newChainCode]).toString("hex"));
}

function indexIsHardened(childIndex) {
  return !!(childIndex >> 31);
}
