import {Address, Lovelace} from '../../../frontend/types'
import BigNumber from 'bignumber.js'

export const poolRegTxSettings = {
  'regular pool registration': {
    unsignedTxParsed: {
      inputs: [
        {
          txHash: Buffer.from(
            '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
            'hex'
          ),
          outputIndex: 0,
        },
      ],
      outputs: [
        {
          address: Buffer.from(
            '017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09',
            'hex'
          ),
          coins: BigInt(1),
          tokenBundle: [],
        },
      ],
      fee: BigInt(42),
      ttl: BigInt(10),
      certificates: [
        {
          type: 3,
          poolKeyHash: Buffer.from(
            '13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad',
            'hex'
          ),
          vrfPubKeyHash: Buffer.from(
            '07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450',
            'hex'
          ),
          pledge: BigInt(50000000000),
          cost: BigInt(340000000),
          margin: {numerator: 3, denominator: 100},
          rewardAddress: Buffer.from(
            'e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
            'hex'
          ),
          poolOwnersPubKeyHashes: [
            Buffer.from('1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c', 'hex'),
            Buffer.from('794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad', 'hex'),
          ],
          relays: [
            {
              ipv4: Buffer.from('36e44b9a', 'hex'),
              ipv6: undefined,
              portNumber: 3000,
              type: 0,
            },
            {
              ipv4: Buffer.from('36e44b9b', 'hex'),
              ipv6: Buffer.from('0178ff2483e3a2330a34c4a5e576c207', 'hex'),
              portNumber: 3000,
              type: 0,
            },
            {
              dnsName: 'aaaa.bbbb.com',
              portNumber: 3000,
              type: 1,
            },
            {
              dnsName: 'aaaa.bbbc.com',
              type: 2,
            },
          ],
          metadata: {
            metadataUrl: 'https://www.vacuumlabs.com/sampleUrl.json',
            metadataHash: Buffer.from(
              'cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb',
              'hex'
            ),
          },
        },
      ],
      withdrawals: [],
      meta: null,
      validityIntervalStart: undefined,
    },
    txPlanResult: {
      txPlan: {
        inputs: [
          {
            txHash: '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
            outputIndex: 0,
            coins: new BigNumber(0) as Lovelace,
            tokenBundle: [],
            address: '' as Address,
          },
        ],
        outputs: [
          {
            isChange: false as const,
            address: 'addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vys6wkj5d' as Address,
            coins: new BigNumber(1) as Lovelace,
            tokenBundle: [],
          },
        ],
        change: [],
        certificates: [
          {
            type: 3,
            stakingAddress: 'stake1uy9ggsc9qls4pu9qvyyacwnmr9tt0gzcdt5s0zj4au8qkqc65geks' as Address,
            poolRegistrationParams: {
              poolKeyHashHex: '13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad',
              vrfKeyHashHex: '07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450',
              pledgeStr: '50000000000',
              costStr: '340000000',
              margin: {
                numeratorStr: '3',
                denominatorStr: '100',
              },
              rewardAccountHex: 'e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
              poolOwners: [
                {
                  stakingKeyHashHex: '1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
                },
                {
                  stakingKeyHashHex: '794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
                },
              ],
              relays: [
                {
                  type: 0,
                  params: {
                    portNumber: 3000,
                    ipv4: '54.228.75.154',
                    ipv6: undefined,
                  },
                },
                {
                  type: 0,
                  params: {
                    portNumber: 3000,
                    ipv4: '54.228.75.155',
                    ipv6: '24ff:7801:33a2:e383:a5c4:340a:07c2:76e5',
                  },
                },
                {
                  type: 1,
                  params: {
                    portNumber: 3000,
                    dnsName: 'aaaa.bbbb.com',
                  },
                },
                {
                  type: 2,
                  params: {
                    dnsName: 'aaaa.bbbc.com',
                  },
                },
              ],
              metadata: {
                metadataUrl: 'https://www.vacuumlabs.com/sampleUrl.json',
                metadataHashHex: 'cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb',
              },
            },
          },
        ],
        deposit: new BigNumber(0) as Lovelace,
        additionalLovelaceAmount: new BigNumber(0) as Lovelace,
        fee: new BigNumber(42) as Lovelace,
        baseFee: new BigNumber(42) as Lovelace,
        withdrawals: [],
        auxiliaryData: null,
      },
    },
    ttl: new BigNumber(10),
    txHash: 'bc678441767b195382f00f9f4c4bddc046f73e6116fa789035105ecddfdee949',
  },
}
