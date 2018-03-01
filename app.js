var express = require("express");
var app = express();
var cbor = require('cbor');
require("isomorphic-fetch");
var fetchMock = require("fetch-mock");

const mnemonic = require("./mnemonic");
const tx = require("./transaction");
const CardanoWallet = require("./cardano-wallet").CardanoWallet;
const address = require("./address");
const request = require("./utils").request;
const sign = require("./utils").sign;

app.get("/", function (req, res) {
  var parentSK = new tx.WalletSecretString("28e375ee5af42a9641c5c31b1b2d24df7f1d2212116bc0b0fc58816f06985b072cf5960d205736cac2e8224dd6018f7223c1bdc630d2b866703670a37316f44003b5417131136bd53174f09b129ae0499bd718ca55c5d40877c33b5ee10e5ba89661f96070a9d39df75c21f6142415502e254523cbacff2b4d58aa87d9021d65586431347c387c317c5743444d717639614345576c56534e75467a71356857635a76512b39664a49375239394f6975435a427a354b66513d3d7c6b2f6b44623075566a6e4659704a6d4c4c664e6e4d495241512b53546b76637272643775666b526c7535343d");
  var childIndex = 0xa078ec7e;

  //console.log(add256BitsNoCarry(new Buffer('aa', 'hex'), new Buffer('ff', 'hex')));
  console.log(address.deriveSK(parentSK, childIndex).secretString);
  //console.log('child secret key: ' + deriveSK(parentSK, childIndex).secretString);

  // should be E7936BB0820521FA75A6119F0A3B207E103ECB3F2CEC0CCC97EEDDDA993C62055D5C3DB61814BF7EED2D232F32C3F5CDED3BB2B5821DC5C0FD153A6F07BCA213FD4676EDD8543C7366EAADB0D8809303E40A8E475D31516D8CB46BFB3C4D046B6A4ADB978F650C0715E9088353D1B7BA27707C066B71D6C1425AC9F758577FB3

/*
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
  */res.send("AAAAAA");
});

app.listen(3000, async function () {
  console.log("Example app listening on port 3000!");
  console.log(mnemonic.generateMnemonic());
  // let wallet = new CardanoWallet(mnemonic.mnemonicToWalletSecretString("cruise bike bar reopen mimic title style fence race solar million clean") );
  // console.log(new CardanoWallet( )  )

  let wallet = new CardanoWallet(new tx.WalletSecretString("A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3"));

  console.log(wallet.rootSecret.secretString);
  console.log(await wallet.getBalance());
  const freeAddress = wallet.getChangeAddress();
  console.log(await wallet.getTxFee(freeAddress, 1));
  console.log(wallet.getChangeAddress());
  // console.log(await wallet.sendAda(freeAddress, 1));

  /*
  // console.log(mnemonic.mnemonicToWalletSecretString("cruise bike bar reopen mimic title style fence race solar million clean"));

  /*for (var i = 345000; i < 345010; i++) {
    console.log(address.deriveAddressAndSecret(
      new tx.WalletSecretString(
        'B0D4187B81B5C2FB8234378EBCF33A1C2E2293369BD2263B6DCF672A29676A5A2E73D1F6E660365EACDDE77052625F0CC6E50C0710B35E45095FB1B51B9B9315F83D8464268BBB19FE416000FA846EAED7171D4390242AA966AB80C36694B7FA6EEC090FD6C6498BB4A28B61F8C4C5AE19B635E20052CB0BC7E0D17404B1717E'
      ),
      i
    ));
  }*//*
  */
  // var wallet = new CardanoWallet(
  //   new tx.WalletSecretString(
  //     "A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3"
  //   )
  // );

  // console.log(await wallet.getBalance());

  // console.log(await wallet.getUnspentTxOutputsWithSecrets());

  //console.log(JSON.stringify(await wallet.sendAda("DdzFFzCqrhswXkREAGRUQRGm3fYnhiujfFsXELpP3FDfSA7atExtvqBuWSk8C5PwD9PnDF7qXJjs9yX48QpkqRVgV4YCfuiVAZN2rEVF", 47)));

  // console.log(await wallet.getTxFee("DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY", 47));
  /*
  const txHash = "56fe463c07376328c538df81195b4c431539267c64067ab5559e84f996103773";
  // tx CBOR encoded
  const txBody = "82839f8200d81858248258206d4470051958285efd392e02b83643227e0176ff4c" +
    "7db399b5c0b1a6eeb70f9e01ff9f8282d818584283581c90adbb1eccedb270cb27964ee6ceb7cbe237e833a13ccff7" +
    "25dc8de6a101581e581c0c54a726973aaa6c9fe0ca213ac20db19ef9c1e13724dc288966f66a001aa825f71d1a001d" +
    "72618282d818584283581c606dee4b1dd9a6586dc4dfaf07d948c35a4e2be0dc2057d53cf7a69ca101581e581c2eab" +
    "4601bfe583ff36c14d4f8467083e0723ba8c7aae861885321346001a52127e911a000f4240ffa0818200d818588582" +
    "58404a2427be54bcabf815b76e984d6c5b127ae967c98777ba705bbe996bd7b912028b30cd8761b9a58970a42b4166" +
    "29fb7f73344e664db526a712c69384f116d4815840520727b0ffda18a586f1c040a36a16e945d691c863fd0b113bff" +
    "d39d489f765004b4d79c5f2893b93cb3290cac25b105ce802131d13b8dae5d17b80c7b06c00d";

  // console.log(await wallet.submitTxRaw(txHash, txBody));

  //console.log(mnemonic.mnemonicToWalletSecretString("cruise bike bar reopen mimic title style fence race solar million clean"));

  //console.log(mnemonic.mnemonicToWalletSecretString("cruise bike bar reopen mimic title style fence race solar million clean"));
  /*console.log(address.deriveAddressAndSecret(
    new tx.WalletSecretString(
      '28EF77600EECD471759EA745BBBB7A661056424F8B83649B0F1E554209BCB944607A2C14CF22D2FB33ADE875452CFD29D62EBDA62DAA1A2FFFA98DFA6539F8B5955DFBC21C49588A2CB74CE60E5800601AA8BEFF746F765AC73FBF6CE0FA117478CEA3F02354DDB44F208A72D4F10D33D740384FBCBFC895022C005784B4CFF5'
    ),
    0x4c194bfd
  ));*//*

  //console.log(mnemonic.mnemonicToWalletSecretString("cruise bike bar reopen mimic title style fence race solar million clean"));*//*
  var secretstring = new tx.WalletSecretString('28EF77600EECD471759EA745BBBB7A661056424F8B83649B0F1E554209BCB944607A2C14CF22D2FB33ADE875452CFD29D62EBDA62DAA1A2FFFA98DFA6539F8B5955DFBC21C49588A2CB74CE60E5800601AA8BEFF746F765AC73FBF6CE0FA117478CEA3F02354DDB44F208A72D4F10D33D740384FBCBFC895022C005784B4CFF5');

  var newAddress = address.deriveAddressAndSecret(secretstring, 0x4c194bfd);
  console.log("derived address:" + newAddress);

  //var newaddr = JSON.parse(newAddress).address;

  var derivationPath = address.getKeysFromAddressUnsafe(secretstring, newAddress);

  console.log("derivation path:[");
  console.log(derivationPath[0].toString() + "," + derivationPath[1].toString(16) + "]");*/

  //console.log(await blockChainExplorer.getUnspentTxOutputs("DdzFFzCqrhsdrw7okJHkY7gCPUTEGNyND5QpfQpuWAP7GHF9AWyaYPpGFWSvnxpQ3Tth2xbRRCi3boWABkHYHJvjDAv6un5fQmpphYuJ"));
  /*var secretString = new tx.WalletSecretString('28EF77600EECD471759EA745BBBB7A661056424F8B83649B0F1E554209BCB944607A2C14CF22D2FB33ADE875452CFD29D62EBDA62DAA1A2FFFA98DFA6539F8B5955DFBC21C49588A2CB74CE60E5800601AA8BEFF746F765AC73FBF6CE0FA117478CEA3F02354DDB44F208A72D4F10D33D740384FBCBFC895022C005784B4CFF5');
  walletAddress = address.deriveAddressAndSecret(secretString, 0x4c194bfd);


  secretString = new tx.WalletSecretString('B0D4187B81B5C2FB8234378EBCF33A1C2E2293369BD2263B6DCF672A29676A5A2E73D1F6E660365EACDDE77052625F0CC6E50C0710B35E45095FB1B51B9B9315F83D8464268BBB19FE416000FA846EAED7171D4390242AA966AB80C36694B7FA6EEC090FD6C6498BB4A28B61F8C4C5AE19B635E20052CB0BC7E0D17404B1717E');

  console.log(walletAddress);

  console.log(address.isAddressDerivableFromSecretString(
    walletAddress.address,
    secretString
  ));*/
});
