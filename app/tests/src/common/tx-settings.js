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
            coins: 6433231,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1888887,
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
    txHash: '186e6f496e87a9dac39688dcaccbc5e3a4297e891a56a07bfec479c7ee597225',
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
            coins: 6449730,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1888887,
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
    txHash: '9ac6b55f250cb15a9e93d36a1edf7faf1853dabb9d01baa930ee1ab43965d024',
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
            coins: 5920091,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1888887,
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
    txHash: '007b558ee98ea911a377e369e1d1949cece4f737c699b6455c1d58325c961446',
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
            coins: 12928924,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1888887,
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
    txHash: '445ad4faa81cb91381a59abf43fc4f6d3a9889f5115fd70015907a5b4140da69',
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
            coins: 7928309,
            tokenBundle: [],
          },
          {
            isChange: false,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
            coins: 1888887,
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
    txHash: 'ef22be382e71ee1f5d05874f8e41f767ef9e77ce623fe6728aaa1865c6da71eb',
  },
}

export {transactionSettings}
