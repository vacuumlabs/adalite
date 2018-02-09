const bip39 = require("bip39");

exports.generateMnemonic = function() {return bip39.generateMnemonic(null, null, validWords).split(" ")};
