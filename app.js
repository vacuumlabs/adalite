var express = require('express');
var sha1 = require('sha1');
var app = express();
var cbor = require('cbor');
var blake2 = require('blake2');
var request = require('request');
var base58 = require('bs58');

var EdDSA = require('elliptic').eddsa;
var ec = new EdDSA('ed25519');
var ed25519 = require('ed25519-supercop')

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
        this.outputIndex = outputIndex; // the index of the input transaction when it was the output of another
        this.type = 0; // default input type
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
            new cbor.Tagged(24, cbor.encode([this.publicString, this.signature]))
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
                new TxPublicString('140D31459D822826515315CE965AEA82276130A9503D1465177352A8AE232171CC8BDCD93AD67107B1BDFAE759C241E2F40C7ADD308FFDD83B59D41B03343CDA'),
                new TxSignature('72ED9F3CD4EEDCD761B8F8008968A321E713578EB8E7788ABA4904003F24FE98BEDA0A83BD6CB3A5538EBA828E1C28661640E02BFACC743935B01FC97793C205')
            ),
            new Witness(
                new TxPublicString('D8C6472977695C1234D6DEB2210484B76E12AF5C05AD18C2FF4A768F85BF07F0C6AA501B0A25D0E7C18A342E5ECC0B7DEE9A26EBFDF6E6B0A3D3606EEB1D0C2D'),
                new TxSignature('8EBF3201644269B4B73FF06C67EBC9DF7AC4B5FF9C2F25F393618AA21DF2744797540158E220F38E106C0653CEB57811E403DF3811A5A12CC0DCE0CCB7A2F20E')
            ),
            new Witness(
                new TxPublicString('6C230A4F5FBD0A546E6232F84AF0E2B7BB3FC1C8E3A5A2B88280DAC7B6D79645304A2A9A3EB17AB87A8D98CD953C0EBF98B251280B102B30CAD825C6094E0404'),
                new TxSignature('2293E1223D56710F84669CB5D15E20198B49B8A88F72CDD44A0B9439690A8E2461A32058741DF3ECBA909256A1949179FB986B5C26718C20D16A1D6AFB271D00')
            ),
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
    constructor (txPublicString) {
        this.txPublicString = txPublicString;
    }

    getPublicKey() {
        return  this.txPublicString.substr(0, 64);
    }

    getChainCode() {
        return this.txPublicString.substr(64, 64);
    }

    encodeCBOR (encoder) {
        return encoder.pushAny(new Buffer(this.txPublicString, 'hex'));
    }
}

class TxSignature {
    constructor (signature) {
        this.signature = signature;
    }

    encodeCBOR (encoder) {
        return encoder.pushAny(new Buffer(this.signature, 'hex'));
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
        return this.witnesses.map(witness => {
            var key = ec.keyFromPublic(witness.getPublicKey(), 'hex');
            
            /*
            * '011a2d964a095820' is a magic prefix from the cardano-sl code
               the '01' byte is a constant to denote signatures of transactions
               the '1a2d964a09' part is the CBOR representation of the blockchain-specific magic constant
               the '5820' part is the CBOR prefix for a hex string
            */
            var message = '011a2d964a095820' + this.getId();

            return key.verify(message, witness.getSignature());
        }).reduce((a, b) => a && b, true);
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
            new TxInput('308244BE8550AEA4780E527A377CAFBF62BB20F899C8B528C569DAA43A6C0544', 1),
            new TxInput('2B051E692725C5319EB438EE48E8BFA0B7448EDF7045D732F3148B6875963103', 1),
            new TxInput('68768AB60F52B0B9B3B4BD84160B2700FAD32A0DA35B21755CF52273D41451A5', 0)
        ],
        [
            new TxOutput(
                new WalletAddress('DdzFFzCqrhswXkREAGRUQRGm3fYnhiujfFsXELpP3FDfSA7atExtvqBuWSk8C5PwD9PnDF7qXJjs9yX48QpkqRVgV4YCfuiVAZN2rEVF'),
                115078
            ),
            new TxOutput(
                new WalletAddress('DdzFFzCqrhsxJZXW35PCYcF6RJ5QLoEmJvsTpV5SKy5xWPyyqyvFFxD2EwAABynutBrw3AcR9Mx5QaEYHRtAWgf2VL6U3G1yngYCD9zi'),
                3100719
            ),
        ],
        {}
    );
}

function sign(message, extendedPrivateKey) {
    var privKey = extendedPrivateKey.substr(0,128);
    var pubKey = extendedPrivateKey.substr(128,64);
    var chainCode = extendedPrivateKey.substr(192,64);

    var key = ec.keyFromSecret(privKey);

    var messageToSign = new Buffer(message, 'hex');

    return ed25519.sign(messageToSign, new Buffer(pubKey, 'hex'), new Buffer(privKey, 'hex')).toString('hex');
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
    console.log(finalTx.verify());

    //res.send(cbor.encode(new Buffer(hash("AAA"), 'hex')).toString('hex'));

    //res.send(Buffer.concat([new Buffer('012D964A09', 'hex'), cbor.encode(new Buffer('E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18', 'hex'))]).toString('hex'));

    console.log(sign(
        '011a2d964a095820009e7136f7b6d4cee95df0c546c0ab04552e0c5b333e84e2ca98cb9031f131c5',
        'd10fb5b73cfbdbde1657f5c2e7efa7b047268a9a798b28b9cca1d9773e803c088a64d56893c464385194527f441a06730afdca7453eda31adbe2e1b901a9dd54ba58b329478fe4563faee5d4c452146d004cda4f64254b660f03dc95b82855efdd45348149dc858aa355169baea60d1645a780edaf759678204d9cf7253cdb4e'
    ));

    // the signature should be: 2E5F42AC23B0758D29EAE09D8FFAF935A15DFC2A60E58F3C5039CC250A8B75F530BF368E8CE77D682DB0600ACF505F3275FA8F7112EFB3537B49F4FFB7BA2709

    res.send(cbor.encode(finalTx).toString('hex'));

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
