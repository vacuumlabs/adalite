var express = require('express');
var sha1 = require('sha1');
var app = express();
var cbor = require('cbor');
var blake2 = require('blake2');
var request = require('request');
var base58 = require('bs58');

var EdDSA = require('elliptic').eddsa;
var ec = new EdDSA('ed25519');

// this is the hash function used in cardano-sl
function hash(input) {
    var h = blake2.createHash('blake2b', {digestLength: 32});
    h.update(cbor.encode(input));
    return h.digest("hex")
}

function getAddressStatus(address, callback) {
    var url = 'https://cardanoexplorer.com/api/addresses/summary/' + address;
    
    var result = undefined;

    return request({
      'url' : url,
      'method' : 'GET'
    }, function (err, output, body) {
        callback(JSON.parse(body));
    });
}

function hex2buf(hexString) {
    return Buffer.from(hexString, 'hex');
}

class TxInput {
    constructor (txId, outputIndex) {
        this.id = txId;
        this.outputIndex = outputIndex;
        this.type = 0; // default output type
    }
    
    encodeCBOR (encoder) {
        return encoder.pushAny([
            this.type,
            new cbor.Tagged(24, cbor.encode([
                hex2buf(this.id),
                this.outputIndex
            ]))
        ]);
    }
}

class TxOutput {
    constructor (walletAddress, coins) {
        this.walletAddress = walletAddress;
        this.coins = coins;
    }

    encodeCBOR (encoder) {
        return encoder.pushAny([this.walletAddress, this.coins]);
    }
}

class WalletAddress {
    constructor (address) {
        this.address = address;
    }

    encodeCBOR (encoder) {
        return encoder.push(base58.decode(this.address));
    }
}

class Witness {
    constructor (publicString, signature) {
        this.publicString = publicString;
        this.signature = signature;
        this.type = 0; // default - PkWitness
    }

    getPublicKey() {
        return this.publicString.getPublicKey();
    }

    getSignature() {
        return this.signature.signature;
    }

    encodeCBOR (encoder) {
        return encoder.pushAny([
            this.type,
            new cbor.Tagged(24, cbor.encode([this.publicKey, this.signature]))
        ]);
    }
}

class CBORIndefiniteLengthArray {
    constructor (elements) {
        this.elements = elements;
    }

    encodeCBOR (encoder) {

        var elementsEncoded = cbor.encode(this.elements);
        
        elementsEncoded[0] = 0x9f;
        elementsEncoded = Buffer.concat([elementsEncoded, Buffer.from('ff', 'hex')])

        return encoder.push(elementsEncoded);
    }
}

class UnsignedTransaction {
    constructor (inputs, outputs, attributes) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.attributes = attributes;
    }

    getId() {
        return hash(this);
    }

    getSigned(privateKey) {
        return new SignedTransaction(this, [ // witnesses of transaction inputs - currently hardcoded
            new Witness(
                new TxPublicString('76EAEF312A3E90C13B0EA1A7B3C0E16D8549345BEC84826D9B1CE98C57AD8BADBA8598CF9314D97DF4BA0051E1471A99C4F77A3021C77212BBCA6AEA699A38DB'),
                new TxSignature('ACCD5281BA0E7ADA54A6456D1DF8DCD05BF9A96BDD7A5C2C41DE10FFBF66E41CD729F81396F166A2E0E64422637BFF3C914CB62BE0E2694975ADE111EC75F405')
            )
        ]);
    }

    encodeCBOR (encoder) {
        return encoder.pushAny([
            new CBORIndefiniteLengthArray(this.inputs),
            new CBORIndefiniteLengthArray(this.outputs),
            this.attributes
        ]);
    }
}

class TxPublicString {
    // hex string representing 64 bytes
    constructor (txPublicKey) {
        this.txPublicKey = txPublicKey;
    }

    getPublicKey() {
        return  this.txPublicKey.substr(0, 64);
    }

    getChainCode() {
        return this.txPublicKey.substr(64, 128);
    }

    encodeCBOR (encoder) {
        return encoder.pushAny(this.txPublicKey);
    }
}

class TxSignature {
    constructor (signature) {
        this.signature = signature;
    }

    encodeCBOR (encoder) {
        return encoder.pushAny(this.signature);
    }
}

class SignedTransaction {
    constructor (transaction, witnesses) {
        this.transaction = transaction;
        this.witnesses = witnesses;
    }

    getId() {
        return this.transaction.getId();
    }

    verify() {
        var witness = this.witnesses[0];
        var key = ec.keyFromPublic(witness.getPublicKey(), 'hex');
        
        /*
        * '011a2d964a095820' is a magic prefix from the cardano-sl code
           the '01' byte is a constant to denote signatures of transactions
           the '1a2d964a09' part is the CBOR representation of the blockchain-specific magic constant
           the '5820' part the CBOR prefix for a hex string
        */
        var message = '011a2d964a095820' + this.getId();

        console.log(this.getId());

        return key.verify(message, witness.getSignature());
    }

    encodeCBOR (encoder) {
        return encoder.pushAny([
            this.transaction,
            this.witnesses
        ]);
    }
}

function getTxFee(transaction) {
    var a = 155381;
    var b = 43.946;

    return Math.ceil(a + cbor.encode(transaction).length * b);
}

function getUnsignedTransaction() {
    return new UnsignedTransaction(
        [
            new TxInput('E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18', 0)
        ],
        [
            new TxOutput(
                new WalletAddress('DdzFFzCqrhtCAAhzES3fi9ow81cyWKxJ4dFm4fUVHgaqToJtnmVkgRDFhGQE2S5U5G6zuHXYna5jaDE1bpvh4jymoGpVzzseNH8KAeUX'),
                5651560
            ),
            new TxOutput(
                new WalletAddress('DdzFFzCqrht3ZMo1JFBiHJJxQAudUNt4eLfRhV7uBHxX1E3XoDWSru89MSenwacBdLjRTQL68WWsWsRjfJRSf5A89SpFDShuZUkJxdfc'),
                1
            )
        ],
        {}
    );
}

function signRaw(messageRaw, keyPair) {
    var pubKey = new Buffer(keyPair.publicKey, 'hex');
    var privKey = new Buffer(keyPair.privateKey, 'hex');
    var msg = messageRaw;

    return supercopEd25519.sign(msg, pubKey, privKey);
}

function signTx(obj, keyPair) {   
    return signRaw(Buffer.concat([new Buffer('011A2D964A09', 'hex'), cbor.encode(obj)]), keyPair);
}

function verify(message, data) {

    var key = ec.keyFromPublic(data.publicKey, 'hex');

    return key.verify(message, data.signature)
}

app.get('/', function (req, res) {
    //res.send(sha1('<b>Hello World!</b>'));

    // takto sa zahashuje prazdny objekt Atributes ()
    //res.send(hash({}));

    // hash pre CCoin 1 objekt - zahashuje priamo hodnotu
    // res.send(hash(1));

    /* hash pre objekt User 
    data User
    = Login { login :: String
            , age   :: Int }
    | FullName { firstName :: String
               , lastName  :: String
               , sex       :: Bool }
    deriving (Show, Eq)

    konkretne instancia FullName "AAA" "BBB" True

    podobne sa hashuju aj ine objekty. Ta 1 na zaciatku je "tag" indikujuci,
    ze sa pouzije druhy datovy typ, t.j. FullName
    */
    //res.send(hash([1, "AAA", "BBB", true]))
  
    var unsignedTx = getUnsignedTransaction();
    var finalTx = unsignedTx.getSigned();

    //res.send(cbor.encode(finalTx).toString('hex'));

    console.log("Tx id: " + hash(unsignedTx));
    console.log("Tx fee: " + getTxFee(finalTx));

    var txi = new TxInput('E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18', 0);

    //res.send(cbor.encode(new Buffer(hash("AAA"), 'hex')).toString('hex'));

    //res.send(Buffer.concat([new Buffer('012D964A09', 'hex'), cbor.encode(new Buffer('E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18', 'hex'))]).toString('hex'));

    console.log(finalTx.verify());

    console.log(verify('011a2d964a0958203b5b8b937d46bd21ede2db07f89d5886bbaf2ed1c74514471504061f14c84b3f', {
        publicKey: '4724b2b8d6ac9a230db50f6ca2a666b24bc3833138031d2ae964c69887a51378',
        signature: 'b2865720437755ccc39aedb39e92e0c4cadd4252a6aad87a643a3e5f3c8f60acf146f32bf37cb830d549a691ced5a1fc7dcd021643d654d5bd0a9bf07d22c80c'
    }));

    res.send('AAAAA');

    /*console.log(verify(new Buffer('E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18', 'hex'), {
        signature: 'ACCD5281BA0E7ADA54A6456D1DF8DCD05BF9A96BDD7A5C2C41DE10FFBF66E41CD729F81396F166A2E0E64422637BFF3C914CB62BE0E2694975ADE111EC75F405',
        publicKey: '76EAEF312A3E90C13B0EA1A7B3C0E16D8549345BEC84826D9B1CE98C57AD8BADBA8598CF9314D97DF4BA0051E1471A99C4F77A3021C77212BBCA6AEA699A38DB'
    }));*/
    //var address = 'DdzFFzCqrht3ZMo1JFBiHJJxQAudUNt4eLfRhV7uBHxX1E3XoDWSru89MSenwacBdLjRTQL68WWsWsRjfJRSf5A89SpFDShuZUkJxdfc';
  
    //getAddressStatus(address, result => res.json(result))
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
