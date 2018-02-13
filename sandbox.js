const exceptions = require("node-exceptions");
const cbor = require("cbor");
const base58 = require("bs58");
var EdDSA = require('elliptic-cardano').eddsa;
const crypto = require('crypto');
const { hex2buf, add256NoCarry, scalarAdd256ModM, multiply8 } = require("./utils");
var ec = new EdDSA('ed25519');

const crypto = require('crypto');
const bip39 = require("bip39");
const blake2 = require("blake2");
const  validWords = require("./assets/valid-words.en").words;

const blake2b = (data) => blakejs.blake2b(data, null, 32);

const fromMnemonic = (words) => hexToBytes(bip39.mnemonicToEntropy(words, validWords));

var hmac = crypto.createHmac('sha512', input);
