"use strict";

exports.__esModule = true;
exports.CARDANO_CERTIFICATE_TYPE = exports.CARDANO_ADDRESS_TYPE = exports.NETWORK_IDS = exports.PROTOCOL_MAGICS = void 0;
var PROTOCOL_MAGICS = {
  mainnet: 764824073,
  testnet: 42
};
exports.PROTOCOL_MAGICS = PROTOCOL_MAGICS;
var NETWORK_IDS = {
  mainnet: 1,
  testnet: 0
};
exports.NETWORK_IDS = NETWORK_IDS;
var CARDANO_ADDRESS_TYPE = Object.freeze({
  Base: 0,
  Pointer: 4,
  Enterprise: 6,
  Byron: 8,
  Reward: 14
});
exports.CARDANO_ADDRESS_TYPE = CARDANO_ADDRESS_TYPE;
var CARDANO_CERTIFICATE_TYPE = Object.freeze({
  StakeRegistration: 0,
  StakeDeregistration: 1,
  StakeDelegation: 2
});
exports.CARDANO_CERTIFICATE_TYPE = CARDANO_CERTIFICATE_TYPE;