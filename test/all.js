// using nodejs's build in asserts that throw on failure 
var assert = require("assert")
var utils = require("../utils")
var transaction = require("../transaction");
var mnemonic = require("../mnemonic");
var address = require("../address");

exports["test signing"] = function() {
  var secret = new transaction.WalletSecretString("50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c");
  var message = "011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950";
  var signature = "ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02"

  // test signing
  assert.equal(utils.sign(message, secret), signature);
}

exports["test signature verification"] = function() {
  var secret = new transaction.WalletSecretString("50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c");
  var message = "011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950";
  var rightSignature = "ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02";
  var wrongSignature = "ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dff8eb8bae46a1824f62fb80cc3b65aff02";

  assert.equal(utils.verify(message, secret.getPublicKey(), rightSignature), true);
  assert.equal(utils.verify(message, secret.getPublicKey(), wrongSignature), false);
}

exports["test secret key derivation from mnemonic"] = function() {
  var mnemonicString = "cruise bike bar reopen mimic title style fence race solar million clean";
  var generatedWalletSecret = mnemonic.mnemonicToWalletSecretString(mnemonicString).secretString;
  var expectedWalletSecret = "b0d4187b81b5c2fb8234378ebcf33a1c2e2293369bd2263b6dcf672a29676a5a2e73d1f6e660365eacdde77052625f0cc6e50c0710b35e45095fb1b51b9b9315f83d8464268bbb19fe416000fa846eaed7171d4390242aa966ab80c36694b7fa6eec090fd6c6498bb4a28b61f8c4c5ae19b635e20052cb0bc7e0d17404b1717e";

  assert.equal(generatedWalletSecret, expectedWalletSecret);
}

exports["test private key derivation"] = function() {
  var secret = new transaction.WalletSecretString("a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3");

  // root public secret key (the one used as "wallet id" in Daedalus)
  var childIndex1 = 0x80000000;
  var expectedSecret1 = "28e375ee5af42a9641c5c31b1b2d24df7f1d2212116bc0b0fc58816f06985b072cf5960d205736cac2e8224dd6018f7223c1bdc630d2b866703670a37316f440de7c9d85c129d339dc4ac2fa6ea5f3a98606dcb38966b79fc3f361cb134654979661f96070a9d39df75c21f6142415502e254523cbacff2b4d58aa87d9021d65"
  assert.equal(address.deriveSK(secret, childIndex1).secretString, expectedSecret1);

  // some hardened secret key - child index starts with 1 in binary
  var childIndex2 = 0xf9745151;
  var expectedSecret2 = "ffd89a6ecc943cd58766294e7575d20f775eba62a93361412d61718026781c00d3d86147df3aa92147ea48f786b2cd2bd7d756d37add3055caa8ba4f1d543198e0bcbbda7b76ce5dc5dabb0728435e1031a21020248a23d36b74c094d6ad3ebcf0bd12bacfb4f58697cd088f6531130584933aed7dfe53163b7f24f10e6c25da";
  assert.equal(address.deriveSK(secret, childIndex2).secretString, expectedSecret2);

  // some nonhardened secret key - child index starts with 0 in binary
  var childIndex3 = 0x10000323;
  var expectedSecret3 = "9f88124e740474c5575f090635050280ef65baf2c9836819c5f989afee884c005a8aabb3f7c26c277c7900c7bab232f682c0c17aa5a97fb1948f298589f65e722f42bccf4ee8fb814cc90299c2c6d7a12f4a38f35b5e50e55207ccc8984bd86cbb6af24fc5249eb317602d455cce7461112150afbfb66fb6525d3aba70fac7e4";
  assert.equal(address.deriveSK(secret, childIndex3).secretString, expectedSecret3);
}

exports["test address generation from secret key"] = function() {
  var secret = new transaction.WalletSecretString("a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3");
  
  // root public address (the one used as "wallet id" in Daedalus)
  var childIndex1 = 0x80000000;
  var expectedAddress1 = "Ae2tdPwUPEZLdysXE34s6xRCpqSHvy5mRbrQiegSVQGQFBvkXf5pvseKuzH"
  assert.equal(address.deriveAddressAndSecret(secret, childIndex1).address, expectedAddress1);

  // some hardened address - child index starts with 1 in binary
  var childIndex2 = 0xf9745151;
  var expectedAddress2 = "DdzFFzCqrhsoStdHaBGfa5ZaLysiTnVuu7SHRcJvvu4yKg94gVBx3TzEV9CjphrFxLhnu1DJUKm2kdcrxYDZBGosrv4Gq3HuiFWRYVdZ";
  assert.equal(address.deriveAddressAndSecret(secret, childIndex2).address, expectedAddress2);
  
  // some nonhardened address - child index starts with 0 in binary
  var childIndex3 = 0x10000323;
  var expectedAddress3 = "DdzFFzCqrhtBxUBQBKEUmVNYUQnnzgh46BhnxXnp4arQV2NF47gVqWpkFfSxnTmbjcznVrFVGquXAkaDwjT8AgBEZZQJvfZwtpox9czm";
  assert.equal(address.deriveAddressAndSecret(secret, childIndex3).address, expectedAddress3);
}

exports["test address ownership verification"] = function() {
  var secret = new transaction.WalletSecretString("a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3");

  var ownAddress = "DdzFFzCqrhsoStdHaBGfa5ZaLysiTnVuu7SHRcJvvu4yKg94gVBx3TzEV9CjphrFxLhnu1DJUKm2kdcrxYDZBGosrv4Gq3HuiFWRYVdZ";
  assert.equal(address.isAddressDerivableFromSecretString(ownAddress, secret), true);

  var foreignAddress = "DdzFFzCqrht1Su7MEaCbFUcKpZnqQp5aUudPjrJZ2h8YADJBDvpsXZk9BducpXcSgujYJGKaTuZye9hb9z3Hff42TXDft5yrsKka6rDW"
  assert.equal(address.isAddressDerivableFromSecretString(foreignAddress, secret), false);
}

exports["test transaction serialization"] = function() {
  // TODO
}

exports["test transaction hash computation"] = function() {
  // TODO
}

exports["test transaction fee computation"] = function() {
  // TODO
}

if (module == require.main) require("test").run(exports)