import {TestnetBlockchainExplorer}  from './blockchain-testnet-explorer'
import loadWasm from '../helpers/wasmLoader'

const {
  privkey_hex,
  dst_account,
  stake_pool_ids_5100,
} = require('./constants')

const pools = stake_pool_ids_5100

const value = 4899450
const counter = 10

const TestnetWallet = async (options) => {
  const {walletSecretDef} = options

  loadWasm().catch(() => {
    throw new Error('WasmLoadingError')
  })

  const blockchainExplorer = TestnetBlockchainExplorer()

  async function submitTxFromAccount() {
    const {
      buildTransactionFromAccount,
    } = require('./transaction')
    const txData = buildTransactionFromAccount(
      {
        address: dst_account,
        counter,
        value,
        privkey_hex: privkey_hex
      },
      {
        address: dst_account,
        value: 1000000
      }
    );
    // console.log(txData.fragment_id)
    return await blockchainExplorer.submitRaw(txData.transaction)
  }

  async function submitDelegationCert() {
    const {
      buildTransactionDelegatingStake,
    } = require('./delegation')
    const delgData = buildTransactionDelegatingStake({
      value,
      address: dst_account,
      counter,
      privkey_hex,
      pools,
    });
    //console.log(delgData.fragment_id)
    return await blockchainExplorer.submitRaw(delgData.transaction)
  }

  async function getAccountStatus(accountPubkeyHex) {
    const accountInfo = await blockchainExplorer.getAccountStatus(accountPubkeyHex)
    let delegationRatioSum = 0
    accountInfo.delegation.map((pool) => {
      delegationRatioSum += pool.ratio
    })
    const currentDelegation = accountInfo.delegation.map((pool) => {
      return {
          ...pool,
          ratio: Math.round(pool.ratio * (100/delegationRatioSum))
      }
  })

    return {
      shelleyBalances: {
        stakingBalance: 20000,
        nonStakingBalance: 30000,
        rewards: accountInfo.last_rewards.reward,
        balance: accountInfo.value,
      },
      txCounter: accountInfo.counter,
      currentDelegation,
    }
  }

  async function getValidStakePools() {
    return await blockchainExplorer.getRunningStakePools()
  }

  async function getDelegationHistory(accountPubkeyHex, limit) {
      const delegationHistory = await blockchainExplorer.getDelegationHistory(accountPubkeyHex, limit)
      
      return delegationHistory
  }

  return {
    submitTxFromAccount,
    submitDelegationCert,
    getAccountStatus,
    getDelegationHistory,
    getValidStakePools
  }
}


// function submitTransactionFromUtxo() {
//   const txData = buildTransactionFromUtxos(
//     [
//       {
//         txid_hex:
//           "709a58e7b8371907b4a61640336fc537d01738de0c31462a171c8c7a6e12ee62",
//         output_no: 1,
//         value: 5000000,
//         privkey_hex: privkey_hex
//       }
//     ],
//     { address: dst_account, value: 1000000 },
//     dst_account
//   );
// }

export default TestnetWallet