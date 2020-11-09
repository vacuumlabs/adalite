import {isValidBootstrapAddress, isValidShelleyAddress} from 'cardano-crypto.js'
import {ADALITE_CONFIG} from '../config'
import {toCoins} from './adaConverters'
import {validateMnemonic} from '../wallet/mnemonic'
import {Lovelace, Ada} from '../state'
import {NETWORKS, CERTIFICATES_ENUM} from '../wallet/constants'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG
const parseToLovelace = (str): Lovelace => Math.trunc(toCoins(parseFloat(str) as Ada)) as Lovelace

const _sendAddressValidators = {
  byron: isValidBootstrapAddress,
  shelley: (address) => isValidShelleyAddress(address) || isValidBootstrapAddress(address),
}

const sendAddressValidator = (fieldValue) =>
  !_sendAddressValidators[ADALITE_CONFIG.ADALITE_CARDANO_VERSION](fieldValue) && fieldValue !== ''
    ? {code: 'SendAddressInvalidAddress'}
    : null

const sendAmountValidator = (fieldValue, coins, balance) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER
  const minAmount = NETWORKS.SHELLEY.MAINNET.minimalOutput

  if (fieldValue === '') {
    return null
  }
  if (coins === null) {
    return {code: 'SendAmountCantSendAnyFunds'}
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
  if (balance < 1000000) {
    return {code: 'SendAmountBalanceTooLow'}
  }
  if (coins < minAmount) {
    return {code: 'SendAmountTooLow'}
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

const txPlanValidator = (sendAmount, balance, txPlan, donationAmount = 0) => {
  const transactionFee = txPlan.fee || txPlan.estimatedFee

  if (transactionFee >= balance) {
    return {code: 'SendAmountCantSendAnyFunds'}
  }
  if (sendAmount + transactionFee > balance) {
    return {
      code: 'SendAmountInsufficientFunds',
      params: {balance},
    }
  }
  if (donationAmount > 0 && sendAmount + transactionFee + donationAmount > balance) {
    return {
      code: 'DonationInsufficientBalance',
      params: {balance},
    }
  }
  if (txPlan.error) return txPlan.error
  return null
}

const delegationPlanValidator = (balance, txPlan) => {
  const transactionFee = txPlan.fee || txPlan.estimatedFee
  const deposit = txPlan.deposit || 0
  if (transactionFee + deposit > balance) {
    return {
      code: 'DelegationBalanceError',
      params: {balance},
    }
  }
  const txPlanError = txPlanValidator(0, balance, txPlan)
  return txPlanError || null
}

const withdrawalPlanValidator = (rewardsAmount, balance, txPlan) => {
  const transactionFee = txPlan.fee || txPlan.estimatedFee
  if (transactionFee >= rewardsAmount) {
    return {code: 'RewardsBalanceTooLow', message: ''}
  }
  const txPlanError = txPlanValidator(0, balance, txPlan)
  return txPlanError || null
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

const validatePoolRegUnsignedTx = (unsignedTx) => {
  if (!unsignedTx || !unsignedTx.certificates || unsignedTx.certificates.length !== 1) {
    return {code: 'PoolRegInvalidNumCerts'}
  }
  if (unsignedTx.certificates[0].type !== CERTIFICATES_ENUM.STAKEPOOL_REGISTRATION) {
    return {code: 'PoolRegInvalidType'}
  }
  if (unsignedTx.withdrawals.lengh > 0) {
    return {code: 'PoolRegWithdrawalDetected'}
  }
  return null
}

export {
  parseToLovelace as parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  txPlanValidator,
  delegationPlanValidator,
  withdrawalPlanValidator,
  mnemonicValidator,
  donationAmountValidator,
  poolIdValidator,
  validatePoolRegUnsignedTx,
}
