const blake2 = require("blakejs");
const cbor = require("cbor");
const fetch = require("node-fetch");
const exceptions = require("node-exceptions");
const EdDSA = require("elliptic-cardano").eddsa;
const ec = new EdDSA("ed25519");
const ed25519 = require("ed25519-supercop");
const bigNumber = require("bignumber.js");
const sha3_256 = require('js-sha3').sha3_256;
const padStart = require('string.prototype.padstart');
padStart.shim();


exports.hashBlake2b256 = function (input) {
  var context = blake2.blake2bInit(32);
  blake2.blake2bUpdate(context, new Buffer(cbor.encode(input), 'hex'));

  result = new Buffer(blake2.blake2bFinal(context));

  return result.toString('hex');
};

exports.addressHash = function (input) {
  var serializedInput = cbor.encode(input);

  var firstHash = new Buffer(sha3_256(serializedInput), 'hex');

  var context = blake2.blake2bInit(28); // blake2b-224
  blake2.blake2bUpdate(context, firstHash);

  result = new Buffer(blake2.blake2bFinal(context));

  return result.toString('hex');
};


exports.hex2buf = function (hexString) {
  return Buffer.from(hexString, "hex");
};

exports.sign = function (message, extendedPrivateKey) {
  var privKey = extendedPrivateKey.getSecretKey(); //extendedPrivateKey.substr(0, 128);
  console.log(extendedPrivateKey.getSecretKey());
  var pubKey = extendedPrivateKey.getPublicKey(); //substr(128, 64);
  var chainCode = extendedPrivateKey.getChainCode(); //substr(192, 64);

  var messageToSign = new Buffer(message, "hex");
  // var signed = ed25519.sign(messageToSign, new Buffer(pubKey, "hex"), new Buffer(privKey, "hex")).toString("hex");

  var key = ec.keyFromSecret(privKey);
  // console.log("supercop: " + signed);
  // console.log("elliptic: " + key.sign(message).toHex());
  return ed25519.sign(messageToSign, new Buffer(pubKey, "hex"), new Buffer(privKey, "hex")).toString("hex");
  // to get rid of eddsa25519 supercop
  // return key.sign(message).toHex();
}

exports.add256NoCarry = function (b1, b2) {
  var result = "";

  for (var i = 0; i < 32; i++) {
    result += ((b1[i] + b2[i]) & 0xff).toString(16).padStart(2, "0");
  }

  return new Buffer(result, "hex");
}

function toLittleEndian(str) {
  // from https://stackoverflow.com/questions/7946094/swap-endianness-javascript
  s = str.replace(/^(.(..)*)$/, "0$1"); // add a leading zero if needed
  var a = s.match(/../g);             // split number in groups of two
  a.reverse();                        // reverse the goups
  return a.join("");                // join the groups back together
}

exports.scalarAdd256ModM = function (b1, b2) {
  let resultAsHexString = bigNumber(toLittleEndian(b1.toString("hex")), 16)
    .plus(bigNumber(toLittleEndian(b2.toString("hex")), 16))
    .mod(bigNumber("1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed", 16))
    .toString(16);
  resultAsHexString = toLittleEndian(resultAsHexString).padEnd(64, "0");

  return new Buffer(resultAsHexString, "hex");
}

exports.multiply8 = function (buf) {
  var result = "";
  var prevAcc = 0;

  for (var i = 0; i < buf.length; i++) {
    result += ((((buf[i] * 8) & 0xff) + (prevAcc & 0x8)) & 0xff).toString(16).padStart(2, "0");
    prevAcc = buf[i] * 32;
  }

  return new Buffer(result, "hex");
}

exports.request = async function (url, method = "get", body = null, headers = null) {
  const res = await fetch(url, {
    method: method,
    headers: headers,
    body: body,
  });
  if (res.status >= 400) {
    throw new exceptions.HttpException(res.status)
  }
  return await res.json()
};
