import {AssetFamily, TxType} from '../../../frontend/types'

const ttl = 8493834

const inputTokens = [
  {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '66697273746173736574',
    quantity: 8,
  },
  {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '7365636f6e646173736574',
    quantity: 4,
  },
  {
    policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
    assetName: '',
    quantity: 2,
  },
]

const transactionSettings = {
  sendAda: {
    args: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      coins: 1000000,
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: `${1.5}`, coins: 1500000},
      txType: TxType.SEND_ADA,
    },
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 10000000,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false,
            address:
              'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
            coins: 1500000,
            tokenBundle: [],
          },
        ],
        change: [
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 6544342,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1777776,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: 0,
        additionalLovelaceAmount: 0,
        fee: 177882,
        baseFee: 177882,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '059cce8e6c1d404798237b36ee45f74dafb0cf463ad236def4bf305474b6a666',
  },
  sendToken: {
    args: {
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
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 10000000,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false,
            address:
              'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
            coins: 1481480,
            tokenBundle: [
              {
                policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
                assetName: '7365636f6e646173736574',
                quantity: 2,
              },
            ],
          },
        ],
        change: [
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 6560841,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1777776,
            tokenBundle: [
              {
                policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
                assetName: '66697273746173736574',
                quantity: 8,
              },
              {
                policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
                assetName: '7365636f6e646173736574',
                quantity: 2,
              },
              {
                policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
                assetName: '',
                quantity: 2,
              },
            ],
          },
        ],
        certificates: [],
        deposit: 0,
        additionalLovelaceAmount: 1481480,
        fee: 179903,
        baseFee: 179903,
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
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
      txType: TxType.DELEGATE,
    },
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 10000000,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 6031202,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1777776,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [
          {
            type: 0,
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
          },
          {
            type: 2,
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
            poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
          },
        ],
        deposit: 2000000,
        additionalLovelaceAmount: 0,
        fee: 191022,
        baseFee: 191022,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: 'b195266615c6cff1aa099a4569d435838630ed946a97be626fc0100e8e1849f1',
  },
  rewardWithdrawal: {
    args: {
      rewards: 5000000,
      txType: TxType.WITHDRAW,
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
    },
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 10000000,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 13040035,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1777776,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: 0,
        additionalLovelaceAmount: 0,
        fee: 182189,
        baseFee: 182189,
        withdrawals: [
          {
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
            rewards: 5000000,
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
      txType: TxType.REGISTER_VOTING,
      votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
      stakePubKey: '2ef8d7c9e19bb688860a900123e5bbe2eff7187336590b3928d43a830110cd62',
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
      nonce: BigInt(25000000),
    },
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 10000000,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 8039420,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1777776,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: 0,
        fee: 182804,
        baseFee: 182804,
        additionalLovelaceAmount: 0,
        withdrawals: [],
        auxiliaryData: {
          type: 'CATALYST_VOTING',
          nonce: BigInt(25000000),
          rewardDestinationAddress: {
            address: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
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

export {transactionSettings}
