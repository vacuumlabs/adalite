import * as assert from 'assert'
import {selectMinimalTxPlan} from '../../frontend/wallet/shelley/transaction'
import {Address, AssetFamily, Lovelace, Token, TxType} from '../../frontend/types'
import {UnexpectedErrorReason} from '../../frontend/errors'
import BigNumber from 'bignumber.js'

const tokens = {
  token1: {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '66697273746173736574',
    quantity: new BigNumber(8),
  },
  token2: {
    policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
    assetName: '7365636f6e646173736574',
    quantity: new BigNumber(4),
  },
  token3: {
    policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
    assetName: '',
    quantity: new BigNumber(2),
  },
}

const utxos = {
  utxo1: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(1000000) as Lovelace,
    outputIndex: 1,
    tokenBundle: [],
  },
  utxo2: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(2000000) as Lovelace,
    outputIndex: 0,
    tokenBundle: [],
  },
  utxoWithTokens1: {
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    address: 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address,
    coins: new BigNumber(3000000) as Lovelace,
    outputIndex: 0,
    tokenBundle: [...Object.values(tokens)],
  },
}

const sendAdaAmountArgs = (lovelace: BigNumber) => ({
  address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
  coins: lovelace as Lovelace,
  sendAmount: {
    assetFamily: AssetFamily.ADA as const,
    fieldValue: `${lovelace}`,
    coins: lovelace as Lovelace,
  },
  txType: TxType.SEND_ADA as const,
})

const sendTokenAmountArgs = (token: Token, quantity: BigNumber) => ({
  address: 'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0' as Address,
  coins: new BigNumber(1500000),
  sendAmount: {
    assetFamily: AssetFamily.TOKEN as const,
    fieldValue: `${quantity}`,
    token: {
      policyId: token.policyId,
      assetName: token.assetName,
      quantity,
    },
  },
  txType: TxType.SEND_ADA as const,
})

const changeAddress = 'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3' as Address

const successPlanFixtures = {
  'not add change to fee': {
    args: sendAdaAmountArgs(new BigNumber(1500000)),
    changeAddress,
    utxos: [utxos.utxo2, utxos.utxo1],
    fee: new BigNumber(178541),
  },
  'not create big enough change so should add change to fee': {
    args: sendAdaAmountArgs(new BigNumber(1500000)),
    changeAddress,
    utxos: [utxos.utxo2],
    fee: new BigNumber(500000),
  },
  'fit perfectly': {
    args: sendAdaAmountArgs(new BigNumber(1832007)),
    changeAddress,
    utxos: [utxos.utxo2],
    fee: new BigNumber(167993),
  },
  'not fit change into tx so should increase fee': {
    args: sendAdaAmountArgs(new BigNumber(1832006)),
    changeAddress,
    utxos: [utxos.utxo2],
    fee: new BigNumber(167994),
  },
}

describe('Succesful transaction plans', () => {
  Object.entries(successPlanFixtures).forEach(([name, setting]) =>
    it(`should ${name}`, () => {
      const {utxos, changeAddress, fee, args} = setting
      const txPlanResult = selectMinimalTxPlan(utxos, changeAddress, args)
      if (txPlanResult.success === true) {
        assert.equal(txPlanResult.txPlan.fee.toString(), fee.toString())
      } else {
        assert(false, 'Transaction plan is not succesful')
      }
    })
  )
})

const failurePlanFixtures = {
  'fail with empty inputs': {
    args: sendAdaAmountArgs(new BigNumber(1500000)),
    changeAddress,
    utxos: [],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
  'fail with not enough ada': {
    args: sendAdaAmountArgs(new BigNumber(5000000)),
    changeAddress,
    utxos: [utxos.utxo1, utxos.utxo2],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
  'fail with not enough tokens': {
    args: sendTokenAmountArgs(tokens.token2, new BigNumber(8)),
    changeAddress,
    utxos: [utxos.utxoWithTokens1],
    error: UnexpectedErrorReason.CannotConstructTxPlan,
  },
  'fail with not enough ada to pay for min change lovelace': {
    args: sendAdaAmountArgs(new BigNumber(2500000)),
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
