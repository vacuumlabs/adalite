import {BIP32Path} from '../../types'

export type LedgerInput = {
  path?: BIP32Path
  txHashHex: string
  outputIndex: number
}

export type LedgerWithdrawal = {
  path: string | BIP32Path
  amountStr: string
}

export type LedgerPoolOwnerParams = {
  stakingPath?: BIP32Path
  stakingKeyHashHex?: string
}

export type LedgerSingleHostIPRelay = {
  portNumber?: number
  ipv4?: string | null
  ipv6?: string | null
}

export type LedgerSingleHostNameRelay = {
  portNumber?: number
  dnsName: string
}

export type LedgerMultiHostNameRelay = {
  dnsName: string
}

export type LedgerRelayParams = {
  type: number // single host ip = 0, single hostname = 1, multi host name = 2
  params: LedgerSingleHostIPRelay | LedgerSingleHostNameRelay | LedgerMultiHostNameRelay
}

export type LedgerPoolMetadataParams = null | {
  metadataUrl: string
  metadataHashHex: string
}

export type LedgerMargin = {
  numeratorStr: string
  denominatorStr: string
}

export type LedgerPoolParams = {
  poolKeyHashHex: string
  vrfKeyHashHex: string
  pledgeStr: string
  costStr: string
  margin: LedgerMargin
  rewardAccountHex: string
  poolOwners: Array<LedgerPoolOwnerParams>
  relays: Array<LedgerRelayParams>
  metadata: LedgerPoolMetadataParams
}

export type LedgerCertificate = {
  type: number
  path?: BIP32Path
  poolKeyHashHex?: string
  poolRegistrationParams?: LedgerPoolParams
}

// export const enum LedgerCryptoProviderFeature {
//   BULK_EXPORT,
//   MULTI_ASSET,
//   ALLEGRA, // this includes optional TTL and validity interval start
// }

export type LedgerStakingBlockchainPointer = {
  blockIndex: number
  txIndex: number
  certificateIndex: number
}

export type LedgerToken = {
  assetNameHex: string
  amountStr: string
}

export type LedgerAssetGroup = {
  policyIdHex: string
  tokens: Array<LedgerToken>
}

export type LedgerTxOutputTypeAddress = {
  amountStr: string
  tokenBundle: Array<LedgerAssetGroup>
  addressHex: string
}

export type LedgerTxOutputTypeAddressParams = {
  amountStr: string
  tokenBundle: Array<LedgerAssetGroup>
  addressTypeNibble: number
  spendingPath: BIP32Path
  stakingPath?: BIP32Path
  stakingKeyHashHex?: string
  stakingBlockchainPointer?: LedgerStakingBlockchainPointer
}

export type LedgerOutput = LedgerTxOutputTypeAddress | LedgerTxOutputTypeAddressParams

export type LedgerGetExtendedPublicKeyResponse = {
  publicKeyHex: string
  chainCodeHex: string
}

// export type LedgerGetVersionResponse = {
//   major: number,
//   minor: number,
//   patch: number,
//   flags: any,
// }

export type LedgerWitness = {
  path: BIP32Path
  // Note: this is *only* a signature
  // you need to add proper extended public key
  // to form a full witness
  witnessSignatureHex: string
}

export type LedgerSignTransactionResponse = {
  txHashHex: string
  witnesses: Array<LedgerWitness>
}
