import BigNumber from 'bignumber.js'
import {Address, AssetFamily, TxType, Lovelace, CertificateType} from '../../../frontend/types'
import {TxAuxiliaryDataTypes, TxDRepType} from '../../../frontend/wallet/types'

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
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(10000000) as Lovelace,
    tokenBundle: inputTokens,
    outputIndex: 1,
  },
]

export const transactionSettings = {
  sendAda: {
    args: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
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
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false as const,
            address:
              'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
            coins: new BigNumber(1500000) as Lovelace,
            tokenBundle: [],
          },
        ],
        change: [
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(6938608) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
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
    txHash: 'c3d9e9c12abbc73dc5a90092c36b590e838b5e3dc194b81f3681c71eedba2fbc',
  },
  sendToken: {
    args: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
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
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false as const,
            address:
              'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
            coins: new BigNumber(1224040) as Lovelace,
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
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(7212547) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
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
        additionalLovelaceAmount: new BigNumber(1224040) as Lovelace,
        fee: new BigNumber(179903) as Lovelace,
        baseFee: new BigNumber(179903) as Lovelace,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '5f6ebc3e55fe70a51c90398d533c89eade39a7552adbb06eef248c0ac24fee2c',
  },
  delegation: {
    args: {
      poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
      isStakingKeyRegistered: false,
      hasVoteDelegation: true,
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
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(6425468) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [
          {
            type: 0,
            stakingAddress:
              'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
          },
          {
            type: 2,
            stakingAddress:
              'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
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
    txHash: 'c0195f77805b1aeb41744d574685cce7b9123e4638467b2a2d953651bcf60b36',
  },
  rewardWithdrawal: {
    args: {
      rewards: new BigNumber(5000000) as Lovelace,
      txType: TxType.WITHDRAW as const,
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
      hasVoteDelegation: true,
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(13434301) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
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
            stakingAddress:
              'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            rewards: new BigNumber(5000000) as Lovelace,
          },
        ],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: 'e590203e2bed2074b38b970bcd8202d6b7bacfb5ea4bfb579d5160bddb81e217',
  },
  rewardWithdrawalNoVoteDelegation: {
    args: {
      rewards: new BigNumber(5000000) as Lovelace,
      txType: TxType.WITHDRAW as const,
      stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
      hasVoteDelegation: false,
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(13426611) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [
          {
            type: CertificateType.VOTE_DELEGATION,
            stakingAddress:
              'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            dRep: {type: TxDRepType.ALWAYS_ABSTAIN},
          } as const,
        ],
        deposit: new BigNumber(0) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        fee: new BigNumber(189879) as Lovelace,
        baseFee: new BigNumber(189879) as Lovelace,
        withdrawals: [
          {
            stakingAddress:
              'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            rewards: new BigNumber(5000000) as Lovelace,
          },
        ],
        auxiliaryData: null,
      },
    },
    ttl,
    txHash: '74cb7308c8017cc0104415062fa9ac9227816f0a4f35e733f6fa6e256da13bac',
  },
  voting: {
    args: {
      txType: TxType.REGISTER_VOTING as const,
      votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
      stakePubKey: '2ef8d7c9e19bb688860a900123e5bbe2eff7187336590b3928d43a830110cd62',
      rewardDestinationBaseAddress:
        'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
      nonce: BigInt(25000000),
    },
    utxos,
    txPlanResult: {
      success: true,
      txPlan: {
        inputs: [
          {
            txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [],
        change: [
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(8432456) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
            tokenBundle: inputTokens,
          },
        ],
        certificates: [],
        deposit: new BigNumber(0) as Lovelace,
        fee: new BigNumber(184034) as Lovelace,
        baseFee: new BigNumber(184034) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        withdrawals: [],
        auxiliaryData: {
          type: 'CATALYST_VOTING' as TxAuxiliaryDataTypes,
          nonce: BigInt(25000000),
          rewardDestinationAddress: {
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            stakingPath: null,
            spendingPath: null,
          },
          stakePubKey: '2ef8d7c9e19bb688860a900123e5bbe2eff7187336590b3928d43a830110cd62',
          votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
        },
      },
    },
    ttl,
    txHash: 'bd14cd4375f1c9bffdec00f78b3638d32719b44b0bbf1232fb4676f919e403fb',
  },
  sendAdaNullTtl: {
    args: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
      coins: 1000000,
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
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(10000000) as Lovelace,
            outputIndex: 1,
            tokenBundle: inputTokens,
          },
        ],
        outputs: [
          {
            isChange: false as const,
            address:
              'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
            coins: new BigNumber(1500000) as Lovelace,
            tokenBundle: [],
          },
        ],
        change: [
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(6938608) as Lovelace,
            tokenBundle: [],
          },
          {
            isChange: false as const,
            address:
              'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
            coins: new BigNumber(1383510) as Lovelace,
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
    ttl: null,
    txHash: 'c986502d4efa9d31a5cb99bd18306e49ff7ed96d62e2b3095b591cf34834bdb9',
  },
}
