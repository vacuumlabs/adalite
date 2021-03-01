import {AssetFamily, TxType} from '../../../frontend/types'

const ttl = 8493834

const transactionSettings = {
  donation: {
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
            tokens: [],
          },
        ],
        outputs: [
          {
            isChange: false,
            address:
              'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
            coins: 1500000,
            tokens: [],
          },
        ],
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 8329150,
          tokens: [],
        },
        certificates: [],
        deposit: 0,
        fee: 170850,
        additionalLovelaceAmount: 0,
        withdrawals: [],
      },
    },
    ttl,
    txHash: 'ed69394abc8fd22c4eb3cc24524007f0aa793ef1f96ba7fc5b49504251b4c9f2',
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
            tokens: [],
          },
        ],
        outputs: [],
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 7816010,
          tokens: [],
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
        fee: 183990,
        additionalLovelaceAmount: 0,
        withdrawals: [],
      },
    },
    ttl,
    txHash: '540a00a825b4b1b8d606ca0d44dab00b512eb081dde5ad03eb489973cec2de6d',
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
            tokens: [],
          },
        ],
        outputs: [],
        change: {
          isChange: false,
          address:
            'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
          coins: 14824843,
          tokens: [],
        },
        certificates: [],
        deposit: 0,
        fee: 175157,
        additionalLovelaceAmount: 0,
        withdrawals: [
          {
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks',
            rewards: 5000000,
          },
        ],
      },
    },
    ttl,
    txHash: 'd94f6d79a30cde15d26be15a7c2b7750026ab8c35d16cd42367b28affd67ff6b',
  },
}

export {transactionSettings}
