const request = require('./helpers/request')
const range = require('./helpers/range')

const blockchainExplorer = (CARDANOLITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    ownUtxos: {},
    overallTxCountSinceLastUtxoFetch: 0,
    addressInfos: {},
  })

  async function getTxHistory(addresses) {
    const transactions = []
    const addressInfos = await getAddressInfos(addresses)

    addressInfos.forEach((addressInfo) => {
      addressInfo.caTxList.forEach((tx) => {
        transactions[tx.ctbId] = tx
      })
    })

    for (const t of Object.values(transactions)) {
      let effect = 0 //effect on wallet balance accumulated
      for (const input of t.ctbInputs) {
        if (addresses.includes(input[0])) {
          effect -= +input[1].getCoin
        }
      }
      for (const output of t.ctbOutputs) {
        if (addresses.includes(output[0])) {
          effect += +output[1].getCoin
        }
      }
      t.effect = effect
      t.fee = t.ctbInputSum.getCoin - t.ctbOutputSum.getCoin
    }
    return Object.values(transactions).sort((a, b) => b.ctbTimeIssued - a.ctbTimeIssued)
  }

  async function fetchTxInfo(txHash) {
    const url = `${
      CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL
    }/api/txs/summary/${txHash}`
    const result = await request(url)

    return result.Right
  }

  async function fetchTxRaw(txId) {
    // eslint-disable-next-line no-undef
    const url = `${CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${txId}`
    const result = await request(url)

    return Buffer.from(JSON.parse(result.Right), 'hex')
  }

  async function getOverallTxCount(addresses) {
    return (await getTxHistory(addresses)).length
  }

  async function getAddressInfos(addresses) {
    return await Promise.all(addresses.slice().map(getAddressInfo))
  }

  async function isAddressUsed(address) {
    const addressInfo = await getAddressInfo(address)

    return addressInfo.caTxNum > 0
  }

  async function selectNonemptyAddresses(addresses) {
    const isNonempty = await Promise.all(
      addresses.map(
        async (address) => parseInt((await getAddressInfo(address)).caBalance.getCoin, 10) > 0
      )
    )

    return addresses.filter((address, i) => isNonempty[i])
  }

  async function selectUnusedAddresses(addresses) {
    const addressesUsageMask = await Promise.all(
      addresses.map(async (elem) => await isAddressUsed(elem))
    )

    return addresses.filter((address, i) => !addressesUsageMask[i])
  }

  async function isSomeAddressUsed(addresses) {
    return (await selectUnusedAddresses(addresses)).length !== addresses.length
  }

  async function getAddressInfo(address) {
    const addressInfo = state.addressInfos[address]
    const maxAddressInfoAge = 10000

    if (!addressInfo || Date.now() - addressInfo.timestamp > maxAddressInfoAge) {
      state.addressInfos[address] = {
        timestamp: Date.now(),
        data: await fetchAddressInfo(address),
      }
    }

    return state.addressInfos[address].data
  }

  async function getBalance(addresses) {
    const addressInfos = await getAddressInfos(addresses)

    return addressInfos.reduce((acc, elem) => acc + parseInt(elem.caBalance.getCoin, 10), 0)
  }

  async function submitTxRaw(txHash, txBody) {
    return await request(
      CARDANOLITE_CONFIG.CARDANOLITE_TRANSACTION_SUBMITTER_URL,
      'POST',
      JSON.stringify({
        txHash,
        txBody,
      }),
      {
        'Content-Type': 'application/json',
      }
    )
  }

  async function fetchUnspentTxOutputs(addresses) {
    const nonemptyAddresses = await selectNonemptyAddresses(addresses)
    const chunks = range(0, Math.ceil(nonemptyAddresses.length / 10))

    const url = `${CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`
    const response = (await Promise.all(
      chunks.map(async (index) => {
        return (await request(url, 'POST', JSON.stringify(nonemptyAddresses.slice(index, 10)), {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        })).Right
      })
    )).reduce((acc, cur) => acc.concat(cur), [])

    return response.map((elem) => {
      return {
        txHash: elem.cuId,
        address: elem.cuAddress,
        coins: parseInt(elem.cuCoins.getCoin, 10),
        outputIndex: elem.cuOutIndex,
      }
    })
  }

  async function fetchAddressInfo(address) {
    const url = `${
      CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL
    }/api/addresses/summary/${address}`
    const result = await request(url)

    return result.Right
  }

  return {
    getTxHistory,
    fetchTxRaw,
    getOverallTxCount,
    fetchUnspentTxOutputs,
    isAddressUsed,
    isSomeAddressUsed,
    selectUnusedAddresses,
    submitTxRaw,
    getBalance,
    fetchTxInfo,
  }
}

module.exports = blockchainExplorer
