// using nodejs's build in asserts that throw on failure 
var assert = require("assert")
var utils = require("../utils")
var transaction = require("../transaction");
var mnemonic = require("../mnemonic");

exports["test signing"] = function() {
  var extPrivKey = new transaction.WalletSecretString("50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c");
  var message = "011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950";
  var signature = "ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02"

  // test signing
  assert.equal(utils.sign(message, extPrivKey), signature);
}

exports["test signature verification"] = function() {
  var extPrivKey = new transaction.WalletSecretString("50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c");
  var message = "011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950";
  var rightSignature = "ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02";
  var wrongSignature = "ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dff8eb8bae46a1824f62fb80cc3b65aff02";

  assert.equal(utils.verify(message, extPrivKey.getPublicKey(), rightSignature), true);
  assert.equal(utils.verify(message, extPrivKey.getPublicKey(), wrongSignature), false);
}

exports["test mnemonic to secret key conversion"] = function() {
  var mnemonicString = "cruise bike bar reopen mimic title style fence race solar million clean";
  var generatedWalletSecret = mnemonic.mnemonicToWalletSecretString(mnemonicString).secretString;
  var expectedWalletSecret = "b0d4187b81b5c2fb8234378ebcf33a1c2e2293369bd2263b6dcf672a29676a5a2e73d1f6e660365eacdde77052625f0cc6e50c0710b35e45095fb1b51b9b9315f83d8464268bbb19fe416000fa846eaed7171d4390242aa966ab80c36694b7fa6eec090fd6c6498bb4a28b61f8c4c5ae19b635e20052cb0bc7e0d17404b1717e";

  assert.equal(generatedWalletSecret, expectedWalletSecret);
}

if (module == require.main) require("test").run(exports)