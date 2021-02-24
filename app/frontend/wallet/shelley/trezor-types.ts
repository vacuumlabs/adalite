/* eslint-disable camelcase */
import {BIP32Path} from '../../types'

export type TrezorCertificatePointer = {
  blockIndex: number
  txIndex: number
  certificateIndex: number
}

export type TrezorInput = {
  path?: string | BIP32Path
  prev_hash: string
  prev_index: number
}

export type TrezorAddressParameters = {
  addressType: number
  path: string | BIP32Path
  stakingPath?: string | BIP32Path
  stakingKeyHash?: string
  certificatePointer?: TrezorCertificatePointer
}

export type TrezorToken = {
  assetNameBytes: string
  amount: string
}

export type TrezorAsset = {
  policyId: string
  tokenAmounts: Array<TrezorToken>
}

export type TrezorMultiAsset = Array<TrezorAsset>

export type TrezorOutput =
  | {
      addressParameters: TrezorAddressParameters
      amount: string
      tokenBundle?: TrezorMultiAsset
    }
  | {
      address: string
      amount: string
      tokenBundle?: TrezorMultiAsset
    }

export type TrezorWithdrawal = {
  path: string | BIP32Path
  amount: string
}

export type TrezorPoolOwner = {
  stakingKeyPath?: string | number[]
  stakingKeyHash?: string
}

export type TrezorPoolRelay = {
  type: number
  ipv4Address?: string
  ipv6Address?: string
  port?: number
  hostName?: string
}

export type TrezorPoolMetadata = null | {
  url: string
  hash: string
}

export type TrezorPoolMargin = {
  numerator: string
  denominator: string
}

export type TrezorPoolParameters = {
  poolId: string
  vrfKeyHash: string
  pledge: string
  cost: string
  margin: TrezorPoolMargin
  rewardAccount: string
  owners: TrezorPoolOwner[]
  relays: TrezorPoolRelay[]
  metadata: TrezorPoolMetadata
}

export type TrezorTxCertificate = {
  type: number
  path?: Array<number>
  pool?: string
  poolParameters?: TrezorPoolParameters
}

export const enum TrezorCryptoProviderFeature {
  MULTI_ASSET,
  ALLEGRA, // this includes optional TTL and validity interval start
}

export type TrezorFailureResponse = {
  success: false
  payload: {
    error: string
  }
}

export type TrezorSignTxResponse =
  | {
      success: true
      payload: {
        hash: string
        serializedTx: string
      }
    }
  | TrezorFailureResponse

export type TrezorGetAddressResponse =
  | {
      success: true
      payload: any
    }
  | TrezorFailureResponse

export type TrezorGetPublicKeyResponse =
  | {
      success: true
      payload: [
        {
          path: Array<number>
          serializedPath: string
          publicKey: string
          node: any
          hdPassphrase: string
        }, // account 1
        {
          path: Array<number>
          serializedPath: string
          publicKey: string
          node: any
          rootHDPassphrase: string
        }, // account 2
        {
          path: Array<number>
          serializedPath: string
          publicKey: string
          node: any
          hdPassphrase: string
        } // account 3
      ]
    }
  | TrezorFailureResponse
