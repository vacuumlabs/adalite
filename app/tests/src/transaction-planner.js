import assert from 'assert'
import {selectMinimalTxPlan} from '../../frontend/wallet/shelley/transaction'
import {AssetFamily, TxType} from '../../frontend/types'
import {UnexpectedErrorReason} from '../../frontend/errors'
import {isTxPlanResultSuccess} from '../../frontend/wallet/shelley/transaction/types'

const tokens = {
  token1: {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '66697273746173736574',
    quantity: 8,
  },
  token2: {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '7365636f6e646173736574',
    quantity: 4,
  },
  token3: {
    policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
    assetName: '',
    quantity: 2,
  },
}

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
  utxoWithTokens1: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address:
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
    coins: 3000000,
    outputIndex: 0,
    tokenBundle: [...Object.values(tokens)],
  },
}

const sendAdaAmountArgs = (lovelace) => ({
  address:
    'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
  coins: lovelace,
  sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: `${lovelace}`, coins: lovelace},
  txType: TxType.SEND_ADA,
})

const sendTokenAmountArgs = (token, quantity) => ({
  address:
    'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
  coins: 1500000,
  sendAmount: {
    assetFamily: AssetFamily.TOKEN,
    fieldValue: `${quantity}`,
    token: {
      policyId: token.policyId,
      assetName: token.assetName,
      quantity,
    },
  },
  txType: TxType.SEND_ADA,
})

const changeAddress =
  'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3'

const successPlanFixtures = {
  'not add change to fee': {
    args: sendAdaAmountArgs(1500000),
    changeAddress,
    utxos: [utxos.utxo2, utxos.utxo1],
    fee: 178541,
  },
  'not create big enough change so should add change to fee': {
    args: sendAdaAmountArgs(1500000),
    changeAddress,
    utxos: [utxos.utxo2],
    fee: 500000,
  },
  'fit perfectly': {
    args: sendAdaAmountArgs(1832182),
    changeAddress,
    utxos: [utxos.utxo2],
    fee: 167818,
  },
  'not fit change into tx so should increase fee': {
    args: sendAdaAmountArgs(1832181),
    changeAddress,
    utxos: [utxos.utxo2],
    fee: 167819,
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

const failurePlanFixtures = {
  'fail with empty inputs': {
    args: sendAdaAmountArgs(1500000),
    changeAddress,
    utxos: [],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
  'fail with not enough ada': {
    args: sendAdaAmountArgs(5000000),
    changeAddress,
    utxos: [utxos.utxo1, utxos.utxo2],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
  'fail with not enough tokens': {
    args: sendTokenAmountArgs(tokens.token2, 8),
    changeAddress,
    utxos: [utxos.utxoWithTokens1],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
  'fail with not enough ada to pay for min change lovelace': {
    args: sendAdaAmountArgs(2500000),
    changeAddress,
    utxos: [utxos.utxoWithTokens1],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
}

describe('Unsuccesful transaction plans', () => {
  Object.entries(failurePlanFixtures).forEach(([name, setting]) =>
    it(`should ${name}`, () => {
      const {utxos, changeAddress, error, args} = setting
      const txPlanResult = selectMinimalTxPlan(utxos, changeAddress, args)
      if (txPlanResult.success === false) {
        assert.equal(txPlanResult.error.code, error)
      } else {
        assert(false, 'Transaction plan is succesful and it should not be')
      }
    })
  )
})
