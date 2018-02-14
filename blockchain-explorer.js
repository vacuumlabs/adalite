const request = require("./utils").request;

exports.getUnspentTxOutputs = async function (address) {
  var unspentTxOutputs = [];

  var addressInfo = await exports.getAddressInfo(address);

  var txList = Object.values(addressInfo.caTxList);

  for (var i = 0; i < txList.length; i++) {
    var txInputs = Object.values(txList[i].ctbInputs);
    var txOutputs = Object.values(txList[i].ctbOutputs);

    // first we remove the inputs from unspent outputs
    for (var j = 0; j < txInputs.length; j++) {
      var txInput = {
        "txHash" : txList[i].ctbId,
        "address" : txInputs[j][0],
        "coins" : parseInt(txInputs[j][1].getCoin)
      };

      var unspentTxOutputToRemoveIndex = unspentTxOutputs.findIndex((element) => {
        return (element.address === txInput.address) && (element.coins === txInput.coins);
      });

      unspentTxOutputs.splice(unspentTxOutputToRemoveIndex, 1);
    }

    // then we add the outputs corresponding to our address
    for (var j = 0; j < txOutputs.length; j++) {
      var txOutput = {
        "txHash" : txList[i].ctbId,
        "address" : txOutputs[j][0],
        "coins" : parseInt(txOutputs[j][1].getCoin),
        "outputIndex" : j, // this should be refactored to get the actual map key from the response
      }

      if (txOutput.address === address) {
        unspentTxOutputs.push(txOutput);
      }
    }
  }

  return unspentTxOutputs;
}

exports.getAddressTxList = async function (address) {
  var addressInfo = await exports.getAddressInfo(address);

  return addressInfo.caTxList;
}

exports.getAddressInfo = async function (address) {
  const url = "https://cardanoexplorer.com/api/addresses/summary/" + address;
  var result = await request(url);

  return result.Right;
}

exports.getAddressBallance = async function (address) {
  const url = "https://cardanoexplorer.com/api/addresses/summary/" + address;
  var result = await request(url);

  return parseInt(result.Right.caBalance.getCoin);
}
