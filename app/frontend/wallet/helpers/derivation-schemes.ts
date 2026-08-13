import {DerivationScheme} from '../../types'

const derivationSchemes: {[key: string]: DerivationScheme} = {
  v1: {
    type: 'v1',
    ed25519Mode: 1,
    keyfileVersion: '1.0.0',
  },
  v2: {
    type: 'v2',
    ed25519Mode: 2,
    keyfileVersion: '2.0.0',
  },
  // keyfileVersion is only used to reject stale/unsupported Exodus JSON imports;
  // Exodus wallets cannot be exported as keyfiles (BIP39 seed is not serializable this way).
  exodus: {
    type: 'exodus',
    ed25519Mode: 1,
    keyfileVersion: '2.0.0-exodus',
  },
}

export default derivationSchemes
