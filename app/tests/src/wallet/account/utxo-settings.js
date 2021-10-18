import {TxType, AssetFamily} from '../../../../frontend/types'

const utxos = {
  legacy: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
    coins: 10000000,
    outputIndex: 0,
    tokenBundle: [],
  },
  adaOnly: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    coins: 10000000,
    outputIndex: 0,
    tokenBundle: [],
  },
  withTokens1: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    coins: 10000000,
    outputIndex: 1,
    tokenBundle: [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '7365636f6e646173736574',
        quantity: 4,
      },
    ],
  },
  withTokens2: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    coins: 10000000,
    outputIndex: 2,
    tokenBundle: [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '66697273746173736574',
        quantity: 8,
      },
    ],
  },
}

export const utxoSettings = {
  'sending ada without tokens': {
    txPlanArgs: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      coins: 1000000,
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: `${1.5}`, coins: 1500000},
      txType: TxType.SEND_ADA,
    },
    availableUtxos: [utxos.withTokens1, utxos.adaOnly],
    selectedUtxos: [utxos.adaOnly, utxos.withTokens1],
  },
  'sending tokens': {
    txPlanArgs: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      sendAmount: {
        assetFamily: AssetFamily.TOKEN,
        fieldValue: `${2}`,
        token: {
          policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
          assetName: '7365636f6e646173736574',
          quantity: 2,
        },
      },
      txType: TxType.SEND_ADA,
    },
    availableUtxos: [utxos.adaOnly, utxos.withTokens2, utxos.legacy, utxos.withTokens1],
    selectedUtxos: [utxos.withTokens1, utxos.legacy, utxos.adaOnly, utxos.withTokens2],
  },
}
