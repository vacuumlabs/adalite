import {HexString, _PubKeyCbor, _XPubKey} from '../../types'
import {HARDENED_THRESHOLD} from '../constants'
import {
  stakingAddressFromXpub,
  baseAddressFromXpub,
  stakingAddressHexFromXpub,
} from './helpers/addresses'
import {encode} from 'borc'

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

export const getStakingAddressHex = async (
  cryptoProvider,
  accountIndex: number
): Promise<HexString> => {
  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)
  return stakingAddressHexFromXpub(stakeXpub, cryptoProvider.network.networkId)
}

export const getAccountXpub = async (cryptoProvider, accountIndex: number): Promise<_XPubKey> => {
  const path = shelleyStakeAccountPath(accountIndex).slice(0, 3)

  const xpubHex: HexString = (await cryptoProvider.deriveXpub(path)).toString('hex')
  return {
    path,
    xpubHex,
  }
}

export const getStakingKeyCborHex = async (
  cryptoProvider,
  accountIndex: number
): Promise<_PubKeyCbor> => {
  const path = shelleyStakeAccountPath(accountIndex)
  const pubKey: HexString = (await cryptoProvider.deriveXpub(path)).slice(0, 32)
  const cborHex: HexString = encode(pubKey).toString('hex')
  return {
    path,
    cborHex,
  }
}

export const ShelleyStakingAccountProvider = (cryptoProvider, accountIndex: number) => async () => {
  const pathStake = shelleyStakeAccountPath(accountIndex)
  const stakeXpub = await cryptoProvider.deriveXpub(pathStake)

  return {
    path: pathStake,
    address: stakingAddressFromXpub(stakeXpub, cryptoProvider.network.networkId),
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
