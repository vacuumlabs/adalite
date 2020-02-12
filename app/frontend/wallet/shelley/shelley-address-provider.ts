import {HARDENED_THRESHOLD} from '../constants'
import {
  accountAddressFromXpub,
  singleAddressFromXpub,
  groupAddressFromXpub,
} from './helpers/addresses'

const shelleyPath = (account: number, isChange: boolean, addrIdx: number) => {
  return [
    HARDENED_THRESHOLD + 1852,
    HARDENED_THRESHOLD + 1815,
    HARDENED_THRESHOLD + account,
    isChange ? 1 : 0,
    addrIdx,
  ]
}

const shelleyStakeAccountPath = (account: number) => {
  return [
    HARDENED_THRESHOLD + 1852,
    HARDENED_THRESHOLD + 1815,
    HARDENED_THRESHOLD + account,
    2, // "staking key chain"
    0,
  ]
}

const _validateScheme = (cryptoProvider) => {
  const scheme = cryptoProvider.getDerivationScheme()
  //if (scheme.type !== 'v2') throw new Error('Invalid mnemonic scheme')
}

export const stakeAccountPubkeyHex = async (cryptoProvider, accountIndex: number) => {
  const pathStake = shelleyStakeAccountPath(accountIndex)
  return await cryptoProvider
    .deriveXpub(pathStake)
    .slice(0, 32)
    .toString('hex')
}

export const ShelleyStakingAccountProvider = (cryptoProvider, accountIndex) => async () => {
  _validateScheme(cryptoProvider)

  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)

  return {
    path: pathStake,
    address: accountAddressFromXpub(stakeXpub, cryptoProvider.network),
  }
}

export const ShelleySingleAddressProvider = (
  cryptoProvider,
  accountIndex: number,
  isChange: boolean
) => async (i: number) => {
  _validateScheme(cryptoProvider)

  const pathSpend = shelleyPath(accountIndex, isChange, i)
  const spendXpub = await cryptoProvider.deriveXpub(pathSpend)

  return {
    path: pathSpend,
    address: singleAddressFromXpub(spendXpub, cryptoProvider.network),
  }
}

export const ShelleyGroupAddressProvider = (
  cryptoProvider,
  accountIndex: number,
  isChange: boolean
) => async (i: number) => {
  _validateScheme(cryptoProvider)

  const pathSpend = shelleyPath(accountIndex, isChange, i)
  const spendXpub = await cryptoProvider.deriveXpub(pathSpend)

  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)

  return {
    path: pathSpend,
    address: groupAddressFromXpub(spendXpub, stakeXpub, cryptoProvider.network),
  }
}
