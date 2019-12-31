// const { bech32_decode, buf2hex } = require('./libs/bech32')

const chain_config_3100 = {
  block0Hash: 'dceef4d6696ead83eadb5104c6383e1905aa81fc7a79ea2ca87a97c2bfd2f4a1',
  block0Time: '2019-11-14T17:57:41+00:00',
  consensusVersion: 'genesis',
  currSlotStartTime: null,
  fees: {
    certificate: 10000,
    coefficient: 50,
    constant: 1000,
  },
  maxTxsPerBlock: 255,
  slotDuration: 2,
  slotsPerEpoch: 7200,
}

const chain_config_4100 = {
  block0Hash: '0f9d564199ad7f71af3daaff4b6997cb7f2e3d7c422fa29097f5d6a018c440d1',
  block0Time: '2019-11-12T12:00:00+00:00',
  consensusVersion: 'genesis',
  currSlotStartTime: '2019-12-04T15:31:52+00:00',
  fees: {
    certificate: 10000000000,
    coefficient: 50,
    constant: 500000,
  },
  maxTxsPerBlock: 255,
  slotDuration: 2,
  slotsPerEpoch: 432000,
}

const chain_config_5100 = {
  block0Hash: '27668e95121566df0bb2e2c11c5fd95dfe59efd570f8f592235ecff167ca3f29',
  block0Time: '2019-11-14T15:01:11+00:00',
  consensusVersion: 'genesis',
  currSlotStartTime: '2019-12-04T10:26:10+00:00',
  fees: {
    certificate: 10000,
    coefficient: 50,
    constant: 1000,
  },
  maxTxsPerBlock: 255,
  slotDuration: 2,
  slotsPerEpoch: 7200,
}

// const privkey_hex = buf2hex(
//   bech32_decode(
//     "ed25519e_sk1erx07yl7ud3rm9qze5qd6yxfyc5239c2gqas3gsc20sd8nkdadf67dwrqdgjewmytce079hvhwlzawt793lzdhgmm22q7kvje72tqjgpe003k"
//   ).data
// );

const dst_account = 'ca1s4z58wngpxn0sdjat3a9ryjlma98r7nxwt4ldk4tma2m050287mxsj4evmm'

// "ca1q4z58wngpxn0sdjat3a9ryjlma98r7nxwt4ldk4tma2m050287mxswprwwh"

const dst_single_address = 'ca1sdz58wngpxn0sdjat3a9ryjlma98r7nxwt4ldk4tma2m050287mxsu9uu3j'

const dst_group_address =
  'ca1s3z58wngpxn0sdjat3a9ryjlma98r7nxwt4ldk4tma2m050287mxs32rhf5qnfhcxew4c7j3jf0a7jn3lfn896lkm24a74dh684rldngumahlz'

const stake_pool_id_3100 = '3174cbe4b5f6933842217c4f5d257c7f5bc89bc9edddbb07aeccbeaf3735ae5c'

const stake_pool_id_4100 = ''
//54501f9a86b0aa964b53929ab542a2b77971b23ea0b82f36c4d9b8e8c0288e53

const stake_pool_id_5100 = 'dd5a2bb4cf6836d565b96c23b8d37027399e599d155861bb2eff3f8b7ab6802e'

const stake_pool_ids_5100 = [
  {
    id: '1f809592a443bd582bc6ac78f553e8fe1844085bfe5281efb197a72dddfdef83',
    ratio: 3,
  },
  {
    id: 'fb988d0e21c1d3d4c2bcfa647e73467a8ede6f13ff77d0af52f64da10c2ae59b',
    ratio: 2,
  },
]

const stake_pool_id_2 = 'e6272b43ad96bd079257940c91eb71bacde6e45892d8b0e6aa2a9eebd777eaa8'

const account_hex_pub_key = '4543ba6809a6f8365d5c7a51925fdf4a71fa6672ebf6daabdf55b7d1ea3fb668'

module.exports = {
  dst_account,
  dst_single_address,
  dst_group_address,
  chain_config_3100,
  chain_config_4100,
  chain_config_5100,
  stake_pool_id_3100,
  stake_pool_id_4100,
  stake_pool_ids_5100,
  account_hex_pub_key,
}
