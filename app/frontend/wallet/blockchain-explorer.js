const request = require('./helpers/request')
const range = require('./helpers/range')
const NamedError = require('../helpers/NamedError')
const debugLog = require('../helpers/debugLog')

const blockchainExplorer = (ADALITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    ownUtxos: {},
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
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/summary/${txHash}`
    const response = await request(url)

    return response.Right
  }

  async function fetchTxRaw(txId) {
    // eslint-disable-next-line no-undef
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${txId}`
    const result = await request(url)
    return Buffer.from(result.Right, 'hex')
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

  function getAddressInfo(address) {
    const addressInfo = state.addressInfos[address]
    const maxAddressInfoAge = 15000

    if (!addressInfo || Date.now() - addressInfo.timestamp > maxAddressInfoAge) {
      state.addressInfos[address] = {
        timestamp: Date.now(),
        data: fetchAddressInfo(address),
      }
    }

    return state.addressInfos[address].data
  }

  async function getBalance(addresses) {
    const addressInfos = await getAddressInfos(addresses)

    return addressInfos.reduce((acc, elem) => acc + parseInt(elem.caBalance.getCoin, 10), 0)
  }

  async function submitTxRaw(txHash, txBody) {
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/txs/submit`,
      'POST',
      JSON.stringify({
        txHash,
        txBody,
      }),
      {
        'Content-Type': 'application/json',
      }
    )

    if (!response.Right) {
      debugLog(`Unexpected tx submission response: ${response}`)
      throw NamedError('TransactionRejectedByNetwork')
    }

    return response.Right
  }

  async function fetchUnspentTxOutputs(addresses) {
    const nonemptyAddresses = await selectNonemptyAddresses(addresses)
    const chunks = range(0, Math.ceil(nonemptyAddresses.length / 10))

    const url = 'https://iohk-mainnet.yoroiwallet.com/api/txs/utxoForAddresses'
    const response = (await Promise.all(
      chunks.map(async (index) => {
        return await request(
          url,
          'POST',
          JSON.stringify({
            addresses: nonemptyAddresses.slice(index, 10),
          }),
          {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        )
      })
    )).reduce((acc, cur) => acc.concat(cur), [])

    return response.map((elem) => {
      return {
        txHash: elem.tx_hash,
        address: elem.receiver,
        coins: parseInt(elem.amount, 10),
        outputIndex: elem.tx_index,
      }
    })
  }

  async function fetchAddressInfo(address) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/addresses/summary/${address}`
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
