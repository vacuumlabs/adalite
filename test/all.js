// using nodejs's build in asserts that throw on failure 
var assert = require("assert");
require("isomorphic-fetch");
var fetchMock = require("fetch-mock");

var utils = require("../utils")
var transaction = require("../transaction");
var mnemonic = require("../mnemonic");
var address = require("../address");

function mockBlockChainExplorer() {
  var addressesAndResponses = {
    "DdzFFzCqrht4XR8CKm4dPXikMyaSt6Y4iPvEwGYW7GYDgXyVHBbvRvGhzzEQT5XvZ3zVCJR7VB15PbVBzKeabPHruC3JvcFjFV8CynEG" : {"Right":{"caAddress":"DdzFFzCqrht4XR8CKm4dPXikMyaSt6Y4iPvEwGYW7GYDgXyVHBbvRvGhzzEQT5XvZ3zVCJR7VB15PbVBzKeabPHruC3JvcFjFV8CynEG","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrht6dzaKMAgFmnkAiyDrdppXw9Pchpf5xofYxgogZTAETLCai7xFwWALmt1vZbwmF2oawDeapBYgkaECcZzYvUmHujuqTiAf" : {"Right":{"caAddress":"DdzFFzCqrht6dzaKMAgFmnkAiyDrdppXw9Pchpf5xofYxgogZTAETLCai7xFwWALmt1vZbwmF2oawDeapBYgkaECcZzYvUmHujuqTiAf","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrht7AoRnNfdGquuiSppnRkN1Ywb1EWH5AKgJbxN2e73y7mZTuY2ayf1qCWrvg8pp38qEDcsbxiAAB3XWzYqnQnohKJXNW8xC" : {"Right":{"caAddress":"DdzFFzCqrht7AoRnNfdGquuiSppnRkN1Ywb1EWH5AKgJbxN2e73y7mZTuY2ayf1qCWrvg8pp38qEDcsbxiAAB3XWzYqnQnohKJXNW8xC","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhspk8W7hHE2DnTroA1jdi5iWTQWNHThdrCr14UxTikuKic6M36FdEGhAjVsuoJfvDbsvXnsWPuuPbuzV9542P5usS1qrabS" : {"Right":{"caAddress":"DdzFFzCqrhspk8W7hHE2DnTroA1jdi5iWTQWNHThdrCr14UxTikuKic6M36FdEGhAjVsuoJfvDbsvXnsWPuuPbuzV9542P5usS1qrabS","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrht4im71gK9VsrbpqQ3hXmUktPekHGHYzZroSqLk2gBzPeEgVQ6vtumqSmcyNmdeMA7MTNeWhxavDVo7cepwPEqXxyFyyXu4" : {"Right":{"caAddress":"DdzFFzCqrht4im71gK9VsrbpqQ3hXmUktPekHGHYzZroSqLk2gBzPeEgVQ6vtumqSmcyNmdeMA7MTNeWhxavDVo7cepwPEqXxyFyyXu4","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhsi3CPXnAidDcHmgEmVyeGmgKV8qoSsnwzjAMjQQj2Rr6i5x2yv2qtqVeJiyvEoUpEMGNtD8xR1VJkX26j4yVoqo3WggEki" : {"Right":{"caAddress":"DdzFFzCqrhsi3CPXnAidDcHmgEmVyeGmgKV8qoSsnwzjAMjQQj2Rr6i5x2yv2qtqVeJiyvEoUpEMGNtD8xR1VJkX26j4yVoqo3WggEki","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrht7nLWxuwUaJcAoBAb1M93sEgp1AAgm8VCqgGkAbVucpLGJEq1bxkeRtX7Jddd4wueJ73KHos7316dVjUScXf3uhpXgTjQd" : {"Right":{"caAddress":"DdzFFzCqrht7nLWxuwUaJcAoBAb1M93sEgp1AAgm8VCqgGkAbVucpLGJEq1bxkeRtX7Jddd4wueJ73KHos7316dVjUScXf3uhpXgTjQd","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrht8KhWRRunt1iHt9oQhCpZFQgt6J4fGfCxvVu5as2NhanRusBYyKgrW8eXtfUCFXmeTGJRQkk9hyXLW4HcUE9KqMBFFxUBo" : {"Right":{"caAddress":"DdzFFzCqrht8KhWRRunt1iHt9oQhCpZFQgt6J4fGfCxvVu5as2NhanRusBYyKgrW8eXtfUCFXmeTGJRQkk9hyXLW4HcUE9KqMBFFxUBo","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhswQUeSvvYbArL3XHAnnk6VpgEgY6KMEi9fE8sSDPPK51FqLkNzGYf6Z9H7CfLrLhwqoGu4HTVvpWV5WwyvQyd3rrkuePSV" : {"Right":{"caAddress":"DdzFFzCqrhswQUeSvvYbArL3XHAnnk6VpgEgY6KMEi9fE8sSDPPK51FqLkNzGYf6Z9H7CfLrLhwqoGu4HTVvpWV5WwyvQyd3rrkuePSV","caType":"CPubKeyAddress","caTxNum":1,"caBalance":{"getCoin":"750000"},"caTxList":[{"ctbId":"3b8573d901522d73114b1c9671698d36b42931c863540fc699a636d3d93a1d68","ctbTimeIssued":1519820491,"ctbInputs":[["DdzFFzCqrhswXkREAGRUQRGm3fYnhiujfFsXELpP3FDfSA7atExtvqBuWSk8C5PwD9PnDF7qXJjs9yX48QpkqRVgV4YCfuiVAZN2rEVF",{"getCoin":"115078"}],["DdzFFzCqrhtAThjMBZNSbed3Dw7GmsEprFphaiasLVvCubwJ5oyfzntR9XDAAT8hCDmuAs2wCxXntcrQvxqsqBboiuCrHSApJnN8XebJ",{"getCoin":"821151"}]],"ctbOutputs":[["DdzFFzCqrhsoggT7JpYS5HeB4BXW5RP2gq8U4pSMmNkREGrby187nbeVDiXTHBAssvHHmVdf7xSRMnAxtR3yHLWqP4GVQqWcsMtVLM4R",{"getCoin":"7468"}],["DdzFFzCqrhswQUeSvvYbArL3XHAnnk6VpgEgY6KMEi9fE8sSDPPK51FqLkNzGYf6Z9H7CfLrLhwqoGu4HTVvpWV5WwyvQyd3rrkuePSV",{"getCoin":"750000"}]],"ctbInputSum":{"getCoin":"936229"},"ctbOutputSum":{"getCoin":"757468"}}]}},
    "DdzFFzCqrhsk4Eyx4CJyr1ymTEDef2A74gMykjTzcBYSV8iXBwYyMC89MJHMdV3itzsCPmc7Cr6yE2H6CRHioWjUs9XkA3UiQpSWzRgP" : {"Right":{"caAddress":"DdzFFzCqrhsk4Eyx4CJyr1ymTEDef2A74gMykjTzcBYSV8iXBwYyMC89MJHMdV3itzsCPmc7Cr6yE2H6CRHioWjUs9XkA3UiQpSWzRgP","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhsvoV83E3MKsrvSLXYMZcTUbTQnTi8gsWsLWPsowVeKADN8phbQ5kkzqGWveFCW4r7SUotDYiGgwdRu67QRRbqTets5jA7g" : {"Right":{"caAddress":"DdzFFzCqrhsvoV83E3MKsrvSLXYMZcTUbTQnTi8gsWsLWPsowVeKADN8phbQ5kkzqGWveFCW4r7SUotDYiGgwdRu67QRRbqTets5jA7g","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrht4Nb7C6niLFvwV3Jwdn2iRZoiBaDqCUdcVChYPZSMh4D8nNpHJtSY9KRF3go2CzVrESmCTjrAQmxYY3S2MDdp2k22sQV8r" : {"Right":{"caAddress":"DdzFFzCqrht4Nb7C6niLFvwV3Jwdn2iRZoiBaDqCUdcVChYPZSMh4D8nNpHJtSY9KRF3go2CzVrESmCTjrAQmxYY3S2MDdp2k22sQV8r","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhseq4DEn7FgcjTQoXXTy9A6wNasdNJT2aapydxAgHLhxMNn9ByQtXhNUKLwku3AQp3usHtvcbNncqyUTuf34ZLQVnA7Bq5J" : {"Right":{"caAddress":"DdzFFzCqrhseq4DEn7FgcjTQoXXTy9A6wNasdNJT2aapydxAgHLhxMNn9ByQtXhNUKLwku3AQp3usHtvcbNncqyUTuf34ZLQVnA7Bq5J","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhspG8UcV5EWC8ZZ51PhiYdrjBF5K8VwugoW75hNWcsgiiGwt19XK6Wjwrj9Dgo8MFLr3p5NqCpmGpwr1feSbknQQWWZnAqu" : {"Right":{"caAddress":"DdzFFzCqrhspG8UcV5EWC8ZZ51PhiYdrjBF5K8VwugoW75hNWcsgiiGwt19XK6Wjwrj9Dgo8MFLr3p5NqCpmGpwr1feSbknQQWWZnAqu","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhsue978fp3K36FRKcjijkRjQTzQPqZ6q9BpMNR5jGSSHsKAPACekuud9bb3Fw5uhZxt4vMQkSWREJUp3vVc1nagk4ygSQt6" : {"Right":{"caAddress":"DdzFFzCqrhsue978fp3K36FRKcjijkRjQTzQPqZ6q9BpMNR5jGSSHsKAPACekuud9bb3Fw5uhZxt4vMQkSWREJUp3vVc1nagk4ygSQt6","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}},
    "DdzFFzCqrhsmagp4fDZpcY9UaBJk4Z8GaDfxqMCSwxPs3PnVoXmJWUZcgAxw3diCHVYauontEfk7YGeAu2LvAwq3aG2XQ8Mtsz7Vc8LA" : {"Right":{"caAddress":"DdzFFzCqrhsmagp4fDZpcY9UaBJk4Z8GaDfxqMCSwxPs3PnVoXmJWUZcgAxw3diCHVYauontEfk7YGeAu2LvAwq3aG2XQ8Mtsz7Vc8LA","caType":"CPubKeyAddress","caTxNum":0,"caBalance":{"getCoin":"0"},"caTxList":[]}}
  }
  for (var address in addressesAndResponses) {
    fetchMock.mock({
      "matcher" : "https://cardanoexplorer.com/api/addresses/summary/" + address,
      "response" : {
        "status" : 200,
        "body" : addressesAndResponses[address],
        "sendAsJson" : true,
      }
    });
  }
}

mockBlockChainExplorer();

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