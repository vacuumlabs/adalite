import {isValidBootstrapAddress, isValidShelleyAddress} from 'cardano-crypto.js'
import {ADALITE_CONFIG} from '../config'
import {toCoins} from './adaConverters'
import {validateMnemonic} from '../wallet/mnemonic'
import {Lovelace, Ada, CertificateType, SendAmount} from '../types'
import {NETWORKS} from '../wallet/constants'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG
const parseToLovelace = (str: string): Lovelace =>
  Math.trunc(toCoins(parseFloat(str) as Ada)) as Lovelace

const _sendAddressValidators = {
  byron: isValidBootstrapAddress,
  shelley: (address: string) => isValidShelleyAddress(address) || isValidBootstrapAddress(address),
}

const sendAddressValidator = (fieldValue: string) =>
  !_sendAddressValidators[ADALITE_CONFIG.ADALITE_CARDANO_VERSION](fieldValue) && fieldValue !== ''
    ? {code: 'SendAddressInvalidAddress'}
    : null

const sendAmountValidator = (fieldValue: string, coins: Lovelace, balance: Lovelace) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER
  // TODO: we should not import NETWORK anywhere
  // we should always get it from wallet/cryptoProvider
  // and pass it as argument
  const minAmount = NETWORKS.MAINNET.minimalOutput

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

const tokenAmountValidator = (fieldValue: string, quantity: number, tokenBalance: number) => {
  const maxAmount = Number.MAX_SAFE_INTEGER
  const integerRegex = /^\d+$/

  if (fieldValue === '') {
    return null
  }
  if (quantity > maxAmount) {
    return {code: 'SendAmountIsTooBig'}
  }
  if (quantity <= 0) {
    return {code: 'SendAmountIsNotPositive'}
  }
  if (!integerRegex.test(fieldValue)) {
    return {code: 'TokenAmountOnlyWholeNumbers'}
  }
  if (isNaN(quantity)) {
    return {code: 'SendAmountIsNan'}
  }
  if (quantity > tokenBalance) {
    return {
      code: 'TokenAmountInsufficientFunds',
      params: {tokenBalance},
    }
  }
  return null
}

const donationAmountValidator = (fieldValue: string, coins: Lovelace, balance: Lovelace) => {
  const amountError = sendAmountValidator(fieldValue, coins, balance)
  if (amountError) {
    return amountError
  }
  if (fieldValue !== '' && coins >= 0 && coins < toCoins(ADALITE_MIN_DONATION_VALUE)) {
    return {code: 'DonationAmountTooLow'}
  }
  return null
}

const txPlanValidator = (
  coins: Lovelace,
  balance: Lovelace,
  fee: Lovelace,
  donationAmount: Lovelace = 0 as Lovelace
) => {
  if (fee >= balance) {
    return {code: 'SendAmountCantSendAnyFunds'}
  }
  if (coins + fee > balance) {
    return {
      code: 'SendAmountInsufficientFunds',
      params: {balance},
    }
  }
  if (donationAmount > 0 && coins + fee + donationAmount > balance) {
    return {
      code: 'DonationInsufficientBalance',
      params: {balance},
    }
  }
  return null
}

const delegationPlanValidator = (balance: Lovelace, deposit: Lovelace, fee: Lovelace) => {
  if (fee + deposit > balance) {
    return {
      code: 'DelegationBalanceError',
      params: {balance},
    }
  }
  const txPlanError = txPlanValidator(0 as Lovelace, balance, fee)
  return txPlanError || null
}

const withdrawalPlanValidator = (rewardsAmount: Lovelace, balance: Lovelace, fee: Lovelace) => {
  if (fee >= rewardsAmount) {
    return {code: 'RewardsBalanceTooLow', message: ''}
  }
  const txPlanError = txPlanValidator(0 as Lovelace, balance, fee)
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

const validatePoolRegUnsignedTx = (unsignedTx) => {
  if (!unsignedTx || !unsignedTx.certificates || unsignedTx.certificates.length !== 1) {
    return {code: 'PoolRegInvalidNumCerts'}
  }
  if (unsignedTx.certificates[0].type !== CertificateType.STAKEPOOL_REGISTRATION) {
    return {code: 'PoolRegInvalidType'}
  }
  if (unsignedTx.withdrawals.lengh > 0) {
    return {code: 'PoolRegWithdrawalDetected'}
  }
  if (!unsignedTx.ttl) {
    return {code: 'PoolRegNoTtl'}
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
  validatePoolRegUnsignedTx,
  tokenAmountValidator,
}
