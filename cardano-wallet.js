var cbor = require('cbor');

const mnemonic = require("./mnemonic");
const tx = require("./transaction");
const address = require("./address");
const blockchainExplorer = require("./blockchain-explorer");
const utils = require("./utils");
const helpers = require("./helpers");

exports.CardanoWallet = class CardanoWallet{
  constructor(rootSecret) {
    this.rootSecret = rootSecret;
  }

  fromMnemonic(mnemonic) {
    return exports.Wallet(mnemonic.mnemonicToWalletSecretString(mnemonic));
  }

  async sendAda(address, amount) {
    var utxos = await this.getUnspentTxOutputsWithSecrets();
    var utxosCoinsSum = utxos.reduce((acc, elem) => {
      return acc + elem.coins;
    }, 0);

    var txInputs = [];
    for (var i = 0; i < utxos.length; i++) {
      txInputs.push(
        new tx.TxInput(utxos[i].txHash, utxos[i].outputIndex, utxos[i].secret)
      );
    }

    var fee = this.getTxFeeEstimate(txInputs);

    var txOutputs = [
      new tx.TxOutput(
        new tx.WalletAddress(address),
        amount
      ),
      new tx.TxOutput(
        new tx.WalletAddress(this.getChangeAddress()),
        utxosCoinsSum - fee - amount
      )
    ];

    var unsignedTx = new tx.UnsignedTransaction(
      txInputs,
      txOutputs,
      {}
    );

    var txHash = unsignedTx.getId();

    var witnesses = unsignedTx.inputs.map((input) => {
      return input.getWitness(txHash);
    });

    var finalTx = new tx.SignedTransaction(unsignedTx, witnesses);

    return cbor.encode(finalTx);
    //return await this.submitTxRaw(txHash, cbor.encode(finalTx));
  }

  getTxFeeEstimate(txInputs) {
    // we should be able to determine the fee based just on the txInputs, since the
    // size of the remainder of the transaction is predictable
    return this.computeTxFee(531);
  }

  getChangeAddress() {
    return this.getUsedAddressesAndSecrets()[0].address;
  }

  async getUnspentTxOutputsWithSecrets() {
    var result = [];

    var addresses = this.getUsedAddressesAndSecrets();

    for (var i = 0; i < addresses.length; i++) {
      var addressUnspentOutputs = await blockchainExplorer.getUnspentTxOutputs(addresses[i].address);
    
      addressUnspentOutputs.map((element) => {
        element.secret = addresses[i].secret;  
      });

      var result = result.concat(addressUnspentOutputs);
    }

    return result;
  }

  async getBalance() {
    var result = 0;

    var addresses = this.getUsedAddressesAndSecrets();

    for (var i = 0; i < addresses.length; i++) {
      result += await blockchainExplorer.getAddressBallance(addresses[i].address);
    }

    return result;
  }

  getUsedAddressesAndSecrets() {
    var result = [];
    for (var i = 345000; i < 345010; i++) {
      result.push(address.deriveAddressAndSecret(this.rootSecret, i));
    }

    return result;
  }

  computeTxFee(txSizeInBytes) {
    var a = 155381;
    var b = 43.946;

    return Math.ceil(a + txSizeInBytes * b);
  }

  async submitTxRaw (txHash, txBody) {
    try {
      const res = await utils.request(
        "http://localhost:3001/",
        "post",
        JSON.stringify({
          txHash,
          txBody
        }),
        {
          "Content-Type": "application/json"
        }
      );

      if (res.status >= 300) {
        console.log(res.status + " " + JSON.stringify(res));
      }
      else {
        return res.result;
      }
    } catch (err) {
      console.log("txSubmiter unreachable " + err);
    }
  }
}
