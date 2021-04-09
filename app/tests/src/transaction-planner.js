import assert from 'assert'
import {selectMinimalTxPlan} from '../../frontend/wallet/shelley/shelley-transaction-planner'
import {AssetFamily, TxType} from '../..//frontend/types'

const utxos = {
  utxo1: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    coins: 1000000,
    outputIndex: 1,
    tokenBundle: [],
  },
  utxo2: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    coins: 2000000,
    outputIndex: 0,
    tokenBundle: [],
  },
}

const successPlanFixtures = {
  'not add fee to change': {
    args: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      coins: 1500000,
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: `${1.5}`, coins: 1500000},
      txType: TxType.SEND_ADA,
    },
    changeAddress:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    utxos: [utxos.utxo2, utxos.utxo1],
    fee: 178541,
  },
  'add fee to change': {
    args: {
      address:
        'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      coins: 1500000,
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: `${1.5}`, coins: 1500000},
      txType: TxType.SEND_ADA,
    },
    changeAddress:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    utxos: [utxos.utxo2],
    fee: 500000,
  },
}

describe('Succesful transaction plans', () => {
  Object.entries(successPlanFixtures).forEach(([name, setting]) =>
    it(`should ${name}`, () => {
      const {utxos, changeAddress, fee, args} = setting
      const txPlanResult = selectMinimalTxPlan(utxos, changeAddress, args)
      if (txPlanResult.success === true) {
        assert.equal(txPlanResult.txPlan.fee, fee)
      } else {
        assert(false, 'Transaction plan is not succesful')
      }
    })
  )
})
