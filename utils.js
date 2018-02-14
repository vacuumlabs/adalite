const blake2 = require("blakejs");
const cbor = require("cbor");
const fetch = require("node-fetch");
const exceptions = require("node-exceptions");
var ed25519 = require("ed25519-supercop");
var bignum = require("bignum");
var sha3_256 = require('js-sha3').sha3_256;

class HttpException extends exceptions.LogicalException {};

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


exports.hex2buf = function(hexString) {
  return Buffer.from(hexString, "hex");
};

exports.sign = function(message, extendedPrivateKey) {
  var privKey = extendedPrivateKey.getSecretKey(); //extendedPrivateKey.substr(0, 128);
  var pubKey = extendedPrivateKey.getPublicKey(); //substr(128, 64);
  var chainCode = extendedPrivateKey.getChainCode(); //substr(192, 64);

  var messageToSign = new Buffer(message, "hex");

  return ed25519.sign(messageToSign, new Buffer(pubKey, "hex"), new Buffer(privKey, "hex")).toString("hex");
}

exports.add256NoCarry = function (b1, b2) {
  var result = "";

  for (var i = 0; i < 32; i++) {
    result += ((b1[i] + b2[i]) & 0xff).toString(16).padStart(2, "0");
  }

  return new Buffer(result, "hex");
}

exports.scalarAdd256ModM = function (b1, b2) {
  var m = bignum.fromBuffer(new Buffer("1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed", "hex"), {
    endian: "big",
    size: "auto",
  });

  var a = bignum.fromBuffer(b1, {
    endian: "little",
    size: "auto"
  });

  var b = bignum.fromBuffer(b2, {
    endian: "little",
    size: "auto"
  });

  var resultAsHexString = a.add(b).mod(m).toBuffer({
    endian: "little",
    size: "auto"
  }).toString("hex").padEnd(64, "0");

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

exports.request = async function (url, method = "get", body = null) {
  const res = await fetch(url , {
    method: method,
    body: body,
  });
  if (res.status >= 400) {
    throw new exceptions.HttpException(res.status)
  }
  return await res.json()
};