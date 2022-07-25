import BigNumber from 'bignumber.js'
import {Address, AssetFamily, TxType, Lovelace} from '../../../frontend/types'
import {TxAuxiliaryDataTypes} from '../../../frontend/wallet/types'

const ttl = new BigNumber(8493834)

const inputTokens = [
  {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '66697273746173736574',
    quantity: new BigNumber(8),
  },
  {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '7365636f6e646173736574',
    quantity: new BigNumber(4),
  },
  {
    policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
    assetName: '',
    quantity: new BigNumber(2),
  },
]

const utxos = [
  {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(10000000) as Lovelace,
    tokenBundle: inputTokens,
    outputIndex: 1,
  },
]

export const transactionSettings = {
  sendAda: {
    args: {
      address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
      coins: new BigNumber(1000000) as Lovelace,
      sendAmount: {
        assetFamily: AssetFamily.ADA as const,
        fieldValue: `${1.5}`,
        coins: new BigNumber(1500000) as Lovelace,
      },
      txType: TxType.SEND_ADA as const,
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false as const,
            address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
            coins: new BigNumber(1500000) as Lovelace,
            tokenBundle: [],
          },
        ],
        change: [
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(6544342) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1777776) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: new BigNumber(0) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        fee: new BigNumber(177882) as Lovelace,
        baseFee: new BigNumber(177882) as Lovelace,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '059cce8e6c1d404798237b36ee45f74dafb0cf463ad236def4bf305474b6a666',
  },
  sendToken: {
    args: {
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
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false as const,
            address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
            coins: new BigNumber(1481480) as Lovelace,
            tokenBundle: [
              {
                policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
                assetName: '7365636f6e646173736574',
                quantity: new BigNumber(2),
              },
            ],
          },
        ],
        change: [
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(6560841) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1777776) as Lovelace,
            tokenBundle: [
              {
                policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
                assetName: '66697273746173736574',
                quantity: new BigNumber(8),
              },
              {
                policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
                assetName: '7365636f6e646173736574',
                quantity: new BigNumber(2),
              },
              {
                policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
                assetName: '',
                quantity: new BigNumber(2),
              },
            ],
          },
        ],
        certificates: [],
        deposit: new BigNumber(0) as Lovelace,
        additionalLovelaceAmount: new BigNumber(1481480) as Lovelace,
        fee: new BigNumber(179903) as Lovelace,
        baseFee: new BigNumber(179903) as Lovelace,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '53fd4e279c36779d2a005ea339d96d5f4f9d221918f65d8c2a74050bbe43826f',
  },
  delegation: {
    args: {
      poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
      isStakingKeyRegistered: false,
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
      txType: TxType.DELEGATE as const,
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(6031202) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1777776) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [
          {
            type: 0,
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
          },
          {
            type: 2,
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
          },
        ],
        deposit: new BigNumber(2000000) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        fee: new BigNumber(191022) as Lovelace,
        baseFee: new BigNumber(191022) as Lovelace,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: 'b195266615c6cff1aa099a4569d435838630ed946a97be626fc0100e8e1849f1',
  },
  rewardWithdrawal: {
    args: {
      rewards: new BigNumber(5000000) as Lovelace,
      txType: TxType.WITHDRAW as const,
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(13040035) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1777776) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: new BigNumber(0) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        fee: new BigNumber(182189) as Lovelace,
        baseFee: new BigNumber(182189) as Lovelace,
        withdrawals: [
          {
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            rewards: new BigNumber(5000000) as Lovelace,
          },
        ],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '96820946d577d47c1b979762536878c04b8fe900ae82d7b373fc30bf09d60207',
  },
  voting: {
    args: {
      txType: TxType.REGISTER_VOTING as const,
      votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
      stakePubKey: '2ef8d7c9e19bb688860a900123e5bbe2eff7187336590b3928d43a830110cd62',
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
      nonce: BigInt(25000000),
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(8039420) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1777776) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: new BigNumber(0) as Lovelace,
        fee: new BigNumber(182804) as Lovelace,
        baseFee: new BigNumber(182804) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        withdrawals: [],
        auxiliaryData: {
          type: 'CATALYST_VOTING' as TxAuxiliaryDataTypes,
          nonce: BigInt(25000000),
          rewardDestinationAddress: {
            address: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            stakingPath: null,
          },
          stakePubKey: '2ef8d7c9e19bb688860a900123e5bbe2eff7187336590b3928d43a830110cd62',
          votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
        },
      },
    },
    ttl,
    txHash: '88913ad717860e531796597c16108ef35c8a189634971051905e635b6ee78d6a',
  },
}
