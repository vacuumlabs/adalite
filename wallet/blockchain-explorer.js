const request = require('./helpers/request')

const blockchainExplorer = (CARDANOLITE_CONFIG) => {
  async function getUnspentTxOutputs(address) {
    if (getAddressBalance(address) === 0) {
      // if balance is zero, all outputs must be spent so we don't waste time and return []
      return []
    }

    const unspentTxOutputs = []

    const addressInfo = await getAddressInfo(address)

    // order transactions by time from earliest to latest
    const txList = addressInfo.caTxList.reverse()

    for (let i = 0; i < txList.length; i++) {
      const txInputs = Object.values(txList[i].ctbInputs)
      const txOutputs = Object.values(txList[i].ctbOutputs)

      // first we remove the inputs from unspent outputs
      for (let j = 0; j < txInputs.length; j++) {
        const txInput = {
          txHash: txList[i].ctbId,
          address: txInputs[j][0],
          coins: parseInt(txInputs[j][1].getCoin, 10),
        }

        const unspentTxOutputToRemoveIndex = unspentTxOutputs.findIndex((element) => {
          return element.address === txInput.address && element.coins === txInput.coins
        })

        unspentTxOutputs.splice(unspentTxOutputToRemoveIndex, 1)
      }

      // then we add the outputs corresponding to our address
      for (let j = 0; j < txOutputs.length; j++) {
        const txOutput = {
          txHash: txList[i].ctbId,
          address: txOutputs[j][0],
          coins: parseInt(txOutputs[j][1].getCoin, 10),
          outputIndex: j, // this should be refactored to get the actual map key from the response
        }

        if (txOutput.address === address) {
          unspentTxOutputs.push(txOutput)
        }
      }
    }

    return unspentTxOutputs
  }

  async function getAddressTxList(address) {
    const addressInfo = await getAddressInfo(address)

    return addressInfo.caTxList
  }

  async function getAddressInfo(address) {
    // eslint-disable-next-line no-undef
    const url = `${
      CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL
    }/api/addresses/summary/${address}`
    const result = await request.execute(url)

    return result.Right
  }

  async function getAddressBalance(address) {
    const result = await getAddressInfo(address)

    return parseInt(result.caBalance.getCoin, 10)
  }

  async function isAddressUsed(address) {
    const result = await getAddressInfo(address)

    return result.caTxNum > 0
  }

  return {
    getUnspentTxOutputs,
    getAddressTxList,
    getAddressInfo,
    getAddressBalance,
    isAddressUsed,
  }
}

module.exports = blockchainExplorer
