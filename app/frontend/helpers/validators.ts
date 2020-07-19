import {isValidAddress as isValidByronAddress} from 'cardano-crypto.js'
import {isShelleyAddress as isValidShelleyAddress} from '../wallet/shelley/helpers/addresses'
import {ADALITE_CONFIG} from '../config'
import {toCoins} from './adaConverters'
import {validateMnemonic} from '../wallet/mnemonic'
import {Lovelace, Ada} from '../state'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG
const parseToLovelace = (str): Lovelace => Math.trunc(toCoins(parseFloat(str) as Ada)) as Lovelace

const _sendAddressValidators = {
  byron: isValidByronAddress,
  shelley: isValidShelleyAddress,
}

const sendAddressValidator = (fieldValue) =>
  !_sendAddressValidators[ADALITE_CONFIG.ADALITE_CARDANO_VERSION](fieldValue) && fieldValue !== ''
    ? {code: 'SendAddressInvalidAddress'}
    : null

const sendAmountValidator = (fieldValue, coins, balance) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER

  if (fieldValue === '') {
    return null
  }
  if (coins === null) {
    return {code: 'SendAmountCantSendAnyFunds'} // TODO: never used, delete
  }
  if (!floatRegex.test(fieldValue) || isNaN(coins)) {
    return {code: 'SendAmountIsNan'}
  }
  if (fieldValue.split('.').length === 2 && fieldValue.split('.')[1].length > 6) {
    return {code: 'SendAmountPrecisionLimit'}
  }
  if (coins > maxAmount) {
    return {code: 'SendAmountIsTooBig'}
  }
  if (coins <= 0) {
    return {code: 'SendAmountIsNotPositive'}
  }
  if (balance < coins) {
    return {
      code: 'SendAmountInsufficientFunds',
      params: {balance},
    }
  }
  return null
}

const donationAmountValidator = (fieldValue, coins, balance) => {
  const amountError = sendAmountValidator(fieldValue, coins, balance)
  if (amountError) {
    return amountError
  }
  if (fieldValue !== '' && coins >= 0 && coins < toCoins(ADALITE_MIN_DONATION_VALUE)) {
    return {code: 'DonationAmountTooLow'}
  }
  return null
}

const feeValidator = (sendAmount, transactionFee, donationAmount, balance) => {
  if (transactionFee >= balance) {
    return {code: 'SendAmountCantSendAnyFunds'}
  }
  if (donationAmount > 0 && sendAmount + transactionFee + donationAmount > balance) {
    return {
      code: 'DonationInsufficientBalance',
      params: {balance},
    }
  }
  if (sendAmount + transactionFee > balance) {
    return {
      code: 'SendAmountInsufficientFunds',
      params: {balance},
    }
  }
  return null
}

const delegationFeeValidator = (fee, balance) => {
  if (fee > balance) {
    return {
      code: 'DelegationAccountBalanceError',
      params: {balance},
    }
  }
  return null
}

const mnemonicValidator = (mnemonic) => {
  if (!validateMnemonic(mnemonic)) {
    return {
      code: 'InvalidMnemonic',
    }
  }
  return null
}

const poolIdValidator = (poolId, validStakepools) => {
  if (poolId === '') {
    return null
  }
  if (!validStakepools[poolId]) {
    return {
      code: 'InvalidStakepoolIdentifier',
    }
  }
  return null
}

export {
  parseToLovelace as parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  delegationFeeValidator,
  mnemonicValidator,
  donationAmountValidator,
  poolIdValidator,
}
