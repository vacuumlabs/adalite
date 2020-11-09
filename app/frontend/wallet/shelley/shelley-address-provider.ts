import {HARDENED_THRESHOLD} from '../constants'
import {
  accountAddressFromXpub,
  baseAddressFromXpub,
  accountHexAddressFromXpub,
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

export const stakeAccountPubkeyHex = async (cryptoProvider, accountIndex: number) => {
  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)
  return accountHexAddressFromXpub(stakeXpub, cryptoProvider.network.networkId)
}

// TODO: this is probably useless
export const ShelleyStakingAccountProvider = (cryptoProvider, accountIndex) => async () => {
  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)

  return {
    path: pathStake,
    address: accountAddressFromXpub(stakeXpub, cryptoProvider.network.networkId),
  }
}

export const ShelleyBaseAddressProvider = (
  cryptoProvider,
  accountIndex: number,
  isChange: boolean
) => async (i: number) => {
  const pathSpend = shelleyPath(accountIndex, isChange, i)
  const spendXpub = await cryptoProvider.deriveXpub(pathSpend)

  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)

  return {
    path: pathSpend,
    address: baseAddressFromXpub(spendXpub, stakeXpub, cryptoProvider.network.networkId),
  }
}
