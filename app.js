var express = require('express');
var sha1 = require('sha1');
var app = express();
var cbor = require('cbor');
var blake2 = require('blake2');

// this is the hash function used in cardano-sl
function hash(input) {
  var h = blake2.createHash('blake2b', {digestLength: 32});
  h.update(cbor.encode(input));
  return h.digest("hex")
}

app.get('/', function (req, res) {
  //res.send(sha1('<b>Hello World!</b>'));
  res.send(hash("AAA"));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
