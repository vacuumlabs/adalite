// please FINALLY get rid of this
const exceptions = require('node-exceptions')

// inline this into address.js - the only place it's actually used
exports.AddressDecodingException = class AddressDecodingException extends exceptions.LogicalException {}
