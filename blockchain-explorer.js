const request = require('./utils').request
const config = require('./config')

exports.getUnspentTxOutputs = async function(address) {
  if (exports.getAddressBalance(address) === 0) {
    // if ballance is zero, all outputs must be spent so we don't waste time and return []
    return []
  }

  const unspentTxOutputs = []

  const addressInfo = await exports.getAddressInfo(address)

  // order transactions by time from earliest to latest
  const txList = Object.values(addressInfo.caTxList).sort((a, b) => {
    return parseInt(a.ctbTimeIssued) - parseInt(b.ctbTimeIssued)
  })

  for (let i = 0; i < txList.length; i++) {
    const txInputs = Object.values(txList[i].ctbInputs)
    const txOutputs = Object.values(txList[i].ctbOutputs)

    // first we remove the inputs from unspent outputs
    for (var j = 0; j < txInputs.length; j++) {
      var txInput = {
        txHash: txList[i].ctbId,
        address: txInputs[j][0],
        coins: parseInt(txInputs[j][1].getCoin),
      }

      const unspentTxOutputToRemoveIndex = unspentTxOutputs.findIndex((element) => {
        return element.address === txInput.address && element.coins === txInput.coins
      })

      unspentTxOutputs.splice(unspentTxOutputToRemoveIndex, 1)
    }

    // then we add the outputs corresponding to our address
    for (var j = 0; j < txOutputs.length; j++) {
      const txOutput = {
        txHash: txList[i].ctbId,
        address: txOutputs[j][0],
        coins: parseInt(txOutputs[j][1].getCoin),
        outputIndex: j, // this should be refactored to get the actual map key from the response
      }

      if (txOutput.address === address) {
        unspentTxOutputs.push(txOutput)
      }
    }
  }

  return unspentTxOutputs
}

exports.getAddressTxList = async function(address) {
  const addressInfo = await exports.getAddressInfo(address)

  return addressInfo.caTxList
}

exports.getAddressInfo = async function(address) {
  const url = `${config.blockchain_explorer_url}/api/addresses/summary/${address}`
  const result = await request(url)

  return result.Right
}

exports.getAddressBalance = async function(address) {
  const result = await exports.getAddressInfo(address)

  return parseInt(result.caBalance.getCoin)
}
