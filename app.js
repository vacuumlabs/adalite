var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cbor = require("cbor");
var EdDSA = require("elliptic-cardano").eddsa;
var ec = new EdDSA("ed25519");

const {hash, sign, getAddressStatus, request} = require("./utils");
const tx = require("./transaction");
const CBORIndefiniteLengthArray = require("./helpers").CBORIndefiniteLengthArray;
const mnemonic = require("./mnemonic")

app.use(bodyParser.json());

class UnsignedTransaction {
  constructor(inputs, outputs, attributes) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.attributes = attributes;
  }

  getId() {
    return hash(this);
  }

  getSigned(privateKey) {
    return new SignedTransaction(this, [ // witnesses of transaction inputs - currently hardcoded
      new tx.TxWitness(
        new tx.TxPublicString("140D31459D822826515315CE965AEA82276130A9503D1465177352A8AE232171CC8BDCD93AD67107B1BDFAE759C241E2F40C7ADD308FFDD83B59D41B03343CDA"),
        new tx.TxSignature("72ED9F3CD4EEDCD761B8F8008968A321E713578EB8E7788ABA4904003F24FE98BEDA0A83BD6CB3A5538EBA828E1C28661640E02BFACC743935B01FC97793C205")
      ),
      new tx.TxWitness(
        new tx.TxPublicString("D8C6472977695C1234D6DEB2210484B76E12AF5C05AD18C2FF4A768F85BF07F0C6AA501B0A25D0E7C18A342E5ECC0B7DEE9A26EBFDF6E6B0A3D3606EEB1D0C2D"),
        new tx.TxSignature("8EBF3201644269B4B73FF06C67EBC9DF7AC4B5FF9C2F25F393618AA21DF2744797540158E220F38E106C0653CEB57811E403DF3811A5A12CC0DCE0CCB7A2F20E")
      ),
      new tx.TxWitness(
        new tx.TxPublicString("6C230A4F5FBD0A546E6232F84AF0E2B7BB3FC1C8E3A5A2B88280DAC7B6D79645304A2A9A3EB17AB87A8D98CD953C0EBF98B251280B102B30CAD825C6094E0404"),
        new tx.TxSignature("2293E1223D56710F84669CB5D15E20198B49B8A88F72CDD44A0B9439690A8E2461A32058741DF3ECBA909256A1949179FB986B5C26718C20D16A1D6AFB271D00")
      ),
    ]);
  }

  encodeCBOR(encoder) {
    return encoder.pushAny([
      new CBORIndefiniteLengthArray(this.inputs),
      new CBORIndefiniteLengthArray(this.outputs),
      this.attributes
    ]);
  }
}

class SignedTransaction {
  constructor(transaction, witnesses) {
    this.transaction = transaction;
    this.witnesses = witnesses;
  }

  getId() {
    return this.transaction.getId();
  }

  verify() {
    return this.witnesses.map(witness => {
      var key = ec.keyFromPublic(witness.getPublicKey(), "hex");

      /*
      * "011a2d964a095820" is a magic prefix from the cardano-sl code
        the "01" byte is a constant to denote signatures of transactions
        the "1a2d964a09" part is the CBOR representation of the blockchain-specific magic constant
        the "5820" part is the CBOR prefix for a hex string
      */
      var message = "011a2d964a095820" + this.getId();

      return key.verify(message, witness.getSignature());
    }).reduce((a, b) => a && b, true);
  }

  encodeCBOR(encoder) {
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
    new tx.TxInput("308244BE8550AEA4780E527A377CAFBF62BB20F899C8B528C569DAA43A6C0544", 1),
    new tx.TxInput("2B051E692725C5319EB438EE48E8BFA0B7448EDF7045D732F3148B6875963103", 1),
    new tx.TxInput("68768AB60F52B0B9B3B4BD84160B2700FAD32A0DA35B21755CF52273D41451A5", 0)
  ],
  [
    new tx.TxOutput(
      new tx.WalletAddress("DdzFFzCqrhswXkREAGRUQRGm3fYnhiujfFsXELpP3FDfSA7atExtvqBuWSk8C5PwD9PnDF7qXJjs9yX48QpkqRVgV4YCfuiVAZN2rEVF"),
      115078
    ),
    new tx.TxOutput(
      new tx.WalletAddress("DdzFFzCqrhsxJZXW35PCYcF6RJ5QLoEmJvsTpV5SKy5xWPyyqyvFFxD2EwAABynutBrw3AcR9Mx5QaEYHRtAWgf2VL6U3G1yngYCD9zi"),
      3100719
    ),
  ],
  {}
  );
}

app.get("/", function (req, res) {
  var parentSK = "28e375ee5af42a9641c5c31b1b2d24df7f1d2212116bc0b0fc58816f06985b072cf5960d205736cac2e8224dd6018f7223c1bdc630d2b866703670a37316f44003b5417131136bd53174f09b129ae0499bd718ca55c5d40877c33b5ee10e5ba89661f96070a9d39df75c21f6142415502e254523cbacff2b4d58aa87d9021d65586431347c387c317c5743444d717639614345576c56534e75467a71356857635a76512b39664a49375239394f6975435a427a354b66513d3d7c6b2f6b44623075566a6e4659704a6d4c4c664e6e4d495241512b53546b76637272643775666b526c7535343d";
  var childIndex = 0xa078ec7e;

  //console.log(add256BitsNoCarry(new Buffer("aa", "hex"), new Buffer("ff", "hex")));
  console.log(tx.deriveSK(parentSK, childIndex).secretString);
  //console.log("child secret key: " + deriveSK(parentSK, childIndex).secretString);

  // should be E7936BB0820521FA75A6119F0A3B207E103ECB3F2CEC0CCC97EEDDDA993C62055D5C3DB61814BF7EED2D232F32C3F5CDED3BB2B5821DC5C0FD153A6F07BCA213FD4676EDD8543C7366EAADB0D8809303E40A8E475D31516D8CB46BFB3C4D046B6A4ADB978F650C0715E9088353D1B7BA27707C066B71D6C1425AC9F758577FB3


  var unsignedTx = getUnsignedTransaction();
  var finalTx = unsignedTx.getSigned();

  //res.send(cbor.encode(finalTx).toString("hex"));

  console.log("Tx id: " + hash(unsignedTx));
  console.log("Tx fee: " + getTxFee(finalTx));
  console.log(finalTx.verify());

  //console.log("Tx id: " + hash(unsignedTx));
  //console.log("Tx fee: " + getTxFee(finalTx));
  //console.log(finalTx.verify());
  //res.send(cbor.encode(new Buffer(hash("AAA"), "hex")).toString("hex"));

  //res.send(Buffer.concat([new Buffer("012D964A09", "hex"),
  // cbor.encode(new Buffer("E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18", "hex"))]).toString("hex"));

  console.log(sign(
    "011a2d964a095820009e7136f7b6d4cee95df0c546c0ab04552e0c5b333e84e2ca98cb9031f131c5",
    "d10fb5b73cfbdbde1657f5c2e7efa7b047268a9a798b28b9cca1d9773e803c088a64d56893c464385194527f441a067" +
    "30afdca7453eda31adbe2e1b901a9dd54ba58b329478fe4563faee5d4c452146d004cda4f64254b660f03dc95b82855" +
    "efdd45348149dc858aa355169baea60d1645a780edaf759678204d9cf7253cdb4e"
  ));

  //console.log(hash(""));
  // the signature should be: 2E5F42AC23B0758D29EAE09D8FFAF935A15DFC2A60E58F3C5039CC250A8B75F530BF368E8CE77D682DB0600ACF505F3275FA8F7112EFB3537B49F4FFB7BA2709

  res.send(cbor.encode(finalTx).toString("hex"));

  /*console.log(verify(new Buffer("E88716E0E5060A92DC3B6441C4F3BE45B3575A99799A737F3B07732656B03D18", "hex"), {
    signature: "ACCD5281BA0E7ADA54A6456D1DF8DCD05BF9A96BDD7A5C2C41DE10FFBF66E41CD729F81396F166A2E0E64422637BFF3C914CB62BE0E2694975ADE111EC75F405",
    publicKey: "76EAEF312A3E90C13B0EA1A7B3C0E16D8549345BEC84826D9B1CE98C57AD8BADBA8598CF9314D97DF4BA0051E1471A99C4F77A3021C77212BBCA6AEA699A38DB"
  }));*/
  //var address = "DdzFFzCqrht3ZMo1JFBiHJJxQAudUNt4eLfRhV7uBHxX1E3XoDWSru89MSenwacBdLjRTQL68WWsWsRjfJRSf5A89SpFDShuZUkJxdfc";

  //getAddressStatus(address, result => res.json(result))
});

app.listen(3000, async function () {
  console.log("Example app listening on port 3000!");

  const txHash = "56fe463c07376328c538df81195b4c431539267c64067ab5559e84f996103773";
  // tx CBOR encoded
  const txBody = "820182839f8200d81858248258206d4470051958285efd392e02b83643227e0176ff4c" +
    "7db399b5c0b1a6eeb70f9e01ff9f8282d818584283581c90adbb1eccedb270cb27964ee6ceb7cbe237e833a13ccff7" +
    "25dc8de6a101581e581c0c54a726973aaa6c9fe0ca213ac20db19ef9c1e13724dc288966f66a001aa825f71d1a001d" +
    "72618282d818584283581c606dee4b1dd9a6586dc4dfaf07d948c35a4e2be0dc2057d53cf7a69ca101581e581c2eab" +
    "4601bfe583ff36c14d4f8467083e0723ba8c7aae861885321346001a52127e911a000f4240ffa0818200d818588582" +
    "58404a2427be54bcabf815b76e984d6c5b127ae967c98777ba705bbe996bd7b912028b30cd8761b9a58970a42b4166" +
    "29fb7f73344e664db526a712c69384f116d4815840520727b0ffda18a586f1c040a36a16e945d691c863fd0b113bff" +
    "d39d489f765004b4d79c5f2893b93cb3290cac25b105ce802131d13b8dae5d17b80c7b06c00d";
  try {
    const res = await request("http://localhost:3001/", "post", JSON.stringify({
      txHash,
      txBody
    }), {"Content-Type": "application/json"});
    if (res.status >= 300) {
      console.log(res.status + " " + JSON.stringify(res));
    }
    else {
      console.log(JSON.stringify(res));
    }
  } catch (err) {
    console.log("txSubmiter unreachable " + err);
  }

  console.log(mnemonic.mnemonicToWalletSecretString("cruise bike bar reopen mimic title style fence race solar million clean"));
});
