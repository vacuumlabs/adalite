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
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 8325150,
          tokenBundle: inputTokens,
        },
        certificates: [],
        deposit: 0,
        fee: 174850,
        baseFee: 174850,
        additionalLovelaceAmount: 0,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '95e89dc2a9d11568d1de54c179b973e25f9be197bd36212b63703fe8e2c1e319',
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
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 8341649,
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
        certificates: [],
        deposit: 0,
        fee: 176871,
        baseFee: 176871,
        additionalLovelaceAmount: 1481480,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '0f3979c1f43e6cdc62ca9aa0516b126917b053d0bc7751b5906fdc94a8b5d0b0',
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
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 7812011,
          tokenBundle: inputTokens,
        },
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
        fee: 187989,
        baseFee: 187989,
        additionalLovelaceAmount: 0,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '0ebd31e3a3c3b4d16fd12b4dd99024ed8270667a43ebdcd208eed082737c7ba6',
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
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 14820844,
          tokenBundle: inputTokens,
        },
        certificates: [],
        deposit: 0,
        fee: 179156,
        baseFee: 179156,
        additionalLovelaceAmount: 0,
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
    txHash: 'e9eb23bbea1fd11bb84f7c0f201bdebc86329bd9bc1f78404b802585d3bdf0c9',
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
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 9820228,
          tokenBundle: inputTokens,
        },
        certificates: [],
        deposit: 0,
        fee: 179772,
        baseFee: 179772,
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
    txHash: '009d1b3a4b1ae81719322fa02149cd126a2f348950424014cbae0c99ea17fcac',
  },
}

export {transactionSettings}
