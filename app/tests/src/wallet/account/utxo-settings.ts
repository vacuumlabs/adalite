import BigNumber from 'bignumber.js'
import {TxType, AssetFamily, Address, Lovelace} from '../../../../frontend/types'

const utxos = {
  legacy: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5' as Address,
    coins: new BigNumber(10000000) as Lovelace,
    outputIndex: 0,
    tokenBundle: [],
  },
  adaOnly: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(10000000) as Lovelace,
    outputIndex: 0,
    tokenBundle: [],
  },
  withTokens1: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(10000000) as Lovelace,
    outputIndex: 1,
    tokenBundle: [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '7365636f6e646173736574',
        quantity: new BigNumber(4) as Lovelace,
      },
    ],
  },
  withTokens2: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(10000000) as Lovelace,
    outputIndex: 2,
    tokenBundle: [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '66697273746173736574',
        quantity: new BigNumber(8),
      },
    ],
  },
}

export const utxoSettings = {
  'sending ada without tokens': {
    txPlanArgs: {
      address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
      coins: new BigNumber(1000000) as Lovelace,
      sendAmount: {
        assetFamily: AssetFamily.ADA as const,
        fieldValue: `${1.5}`,
        coins: new BigNumber(1500000) as Lovelace,
      },
      txType: TxType.SEND_ADA as const,
    },
    availableUtxos: [utxos.withTokens1, utxos.adaOnly],
    selectedUtxos: [utxos.adaOnly, utxos.withTokens1],
  },
  'sending tokens': {
    txPlanArgs: {
      address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
      sendAmount: {
        assetFamily: AssetFamily.TOKEN as const,
        fieldValue: `${2}`,
        token: {
          policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
          assetName: '7365636f6e646173736574',
          quantity: new BigNumber(2),
        },
      },
      txType: TxType.SEND_ADA as const,
    },
    availableUtxos: [utxos.adaOnly, utxos.withTokens2, utxos.legacy, utxos.withTokens1],
    selectedUtxos: [utxos.withTokens1, utxos.legacy, utxos.adaOnly, utxos.withTokens2],
  },
}
