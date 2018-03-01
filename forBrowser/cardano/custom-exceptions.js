const exceptions = require("node-exceptions");

exports.AddressDecodingException = class AddressDecodingException extends exceptions.LogicalException {}