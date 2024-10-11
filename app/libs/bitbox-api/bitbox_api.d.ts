/* tslint:disable */
/* eslint-disable */
/**
* Connect to a BitBox02 using WebHID. WebHID is mainly supported by Chrome.
* @param {OnCloseCb} on_close_cb
* @returns {Promise<BitBox>}
*/
export function bitbox02ConnectWebHID(on_close_cb: OnCloseCb): Promise<BitBox>;
/**
* Connect to a BitBox02 by using the BitBoxBridge service.
* @param {OnCloseCb} on_close_cb
* @returns {Promise<BitBox>}
*/
export function bitbox02ConnectBridge(on_close_cb: OnCloseCb): Promise<BitBox>;
/**
* Connect to a BitBox02 using WebHID if available. If WebHID is not available, we attempt to
* connect using the BitBoxBridge.
* @param {OnCloseCb} on_close_cb
* @returns {Promise<BitBox>}
*/
export function bitbox02ConnectAuto(on_close_cb: OnCloseCb): Promise<BitBox>;
/**
* Run any exception raised by this library through this function to get a typed error.
*
* Example:
* ```JavaScript
* try { ... }
* catch (err) {
*   const typedErr: Error = bitbox.ensureError(err);
*   // Handle error by checking the error code, displaying the error message, etc.
* }
*
* See also: isUserAbort().
* @param {any} err
* @returns {Error}
*/
export function ensureError(err: any): Error;
/**
* Returns true if the user cancelled an operation.
* @param {Error} err
* @returns {boolean}
*/
export function isUserAbort(err: Error): boolean;

type OnCloseCb = undefined | (() => void);
type Product = 'unknown' | 'bitbox02-multi' | 'bitbox02-btconly';
type BtcCoin = 'btc' | 'tbtc' | 'ltc' | 'tltc';
type BtcFormatUnit = 'default' | 'sat';
type XPubType = 'tpub' | 'xpub' | 'ypub' | 'zpub' | 'vpub' | 'upub' | 'Vpub' | 'Zpub' | 'Upub' | 'Ypub';
type Keypath = string | number[];
type XPub = string;
type DeviceInfo = {
  name: string;
  initialized: boolean;
  version: string;
  mnemonicPassphraseEnabled: boolean;
  securechipModel: string;
  monotonicIncrementsRemaining: number;
};
type BtcSimpleType = 'p2wpkhP2sh' | 'p2wpkh' | 'p2tr';
type KeyOriginInfo = {
  rootFingerprint?: string;
  keypath?: Keypath;
  xpub: XPub;
};
type BtcRegisterXPubType = 'autoElectrum' | 'autoXpubTpub';
type BtcMultisigScriptType = 'p2wsh' | 'p2wshP2sh';
type BtcMultisig = {
  threshold: number;
  xpubs: XPub[];
  ourXpubIndex: number;
  scriptType: BtcMultisigScriptType;
};
type BtcPolicy = { policy: string; keys: KeyOriginInfo[] };
type BtcScriptConfig = { simpleType: BtcSimpleType; } | { multisig: BtcMultisig } | { policy: BtcPolicy };
type BtcScriptConfigWithKeypath = {
  scriptConfig: BtcScriptConfig;
  keypath: Keypath;
};
type BtcSignMessageSignature = {
  sig: Uint8Array,
  recid: bigint,
  electrumSig65: Uint8Array,
}
// nonce, gasPrice, gasLimit and value must be big-endian encoded, no trailing zeroes.
type EthTransaction = {
  nonce: Uint8Array;
  gasPrice: Uint8Array;
  gasLimit: Uint8Array;
  recipient: Uint8Array;
  value: Uint8Array;
  data: Uint8Array;
};
// chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit and value must be big-endian encoded, no trailing zeroes.
type Eth1559Transaction = {
  chainId: number;
  nonce: Uint8Array;
  maxPriorityFeePerGas: Uint8Array;
  maxFeePerGas: Uint8Array;
  gasLimit: Uint8Array;
  recipient: Uint8Array;
  value: Uint8Array;
  data: Uint8Array;
};
type EthSignature = {
  r: Uint8Array;
  s: Uint8Array;
  v: Uint8Array;
};
type CardanoXpub = Uint8Array;
type CardanoXpubs = CardanoXpub[];
type CardanoNetwork = 'mainnet' | 'testnet';
type CardanoScriptConfig = {
  pkhSkh: {
    keypathPayment: Keypath;
    keypathStake: Keypath;
  };
};
type CardanoInput = {
  keypath: Keypath;
  prevOutHash: Uint8Array;
  prevOutIndex: number;
};
type CardanoAssetGroupToken = {
  assetName: Uint8Array;
  value: bigint;
}
type CardanoAssetGroup = {
  policyId: Uint8Array;
  tokens: CardanoAssetGroupToken[];
}
type CardanoOutput = {
  encodedAddress: string;
  value: bigint;
  scriptConfig?: CardanoScriptConfig;
  assetGroups?: CardanoAssetGroup[];
}
type CardanoDrepType = 'keyHash'  | 'scriptHash' | 'alwaysAbstain'  | 'alwaysNoConfidence'
type CardanoCertificate =
  | {
      stakeRegistration: {
        keypath: Keypath
      }
    }
  | {
      stakeDeregistration: {
        keypath: Keypath
      }
    }
  | {
      stakeDelegation: {
        keypath: Keypath
        poolKeyhash: Uint8Array
      }
    }
  | {
      voteDelegation: {
        keypath: Keypath
        type: CardanoDrepType
        drepCredHash?: Uint8Array
      }
    };
type CardanoWithdrawal = {
  keypath: Keypath;
  value: bigint;
}
type CardanoTransaction = {
  network: CardanoNetwork;
  inputs: CardanoInput[];
  outputs: CardanoOutput[];
  fee: bigint;
  ttl: bigint;
  certificates: CardanoCertificate[];
  withdrawals: CardanoWithdrawal[];
  validityIntervalStart: bigint;
  allowZeroTTL: boolean;
};
type CardanoShelleyWitness = {
  signature: Uint8Array;
  publicKey: Uint8Array;
}
type CardanoSignTransactionResult = {
  shelleyWitnesses: CardanoShelleyWitness[];
};
type Error = {
  code: string;
  message: string;
  // original JS error if code === 'unknown-js'
  err?: any;
}


/**
* BitBox client. Instantiate it using `bitbox02ConnectAuto()`.
*/
export class BitBox {
  free(): void;
/**
* Invokes the device unlock and pairing. After this, stop using this instance and continue
* with the returned instance of type `PairingBitBox`.
* @returns {Promise<PairingBitBox>}
*/
  unlockAndPair(): Promise<PairingBitBox>;
}
/**
* Paired BitBox. This is where you can invoke most API functions like getting xpubs, displaying
* receive addresses, etc.
*/
export class PairedBitBox {
  free(): void;
/**
* Closes the BitBox connection. This also invokes the `on_close_cb` callback which was
* provided to the connect method creating the connection.
*/
  close(): void;
/**
* @returns {Promise<DeviceInfo>}
*/
  deviceInfo(): Promise<DeviceInfo>;
/**
* Returns which product we are connected to.
* @returns {Product}
*/
  product(): Product;
/**
* Returns the firmware version, e.g. "9.18.0".
* @returns {string}
*/
  version(): string;
/**
* Returns the hex-encoded 4-byte root fingerprint.
* @returns {Promise<string>}
*/
  rootFingerprint(): Promise<string>;
/**
* Show recovery words on the Bitbox.
* @returns {Promise<void>}
*/
  showMnemonic(): Promise<void>;
/**
* Retrieves an xpub. For non-standard keypaths, a warning is displayed on the BitBox even if
* `display` is false.
* @param {BtcCoin} coin
* @param {Keypath} keypath
* @param {XPubType} xpub_type
* @param {boolean} display
* @returns {Promise<string>}
*/
  btcXpub(coin: BtcCoin, keypath: Keypath, xpub_type: XPubType, display: boolean): Promise<string>;
/**
* Before a multisig or policy script config can be used to display receive addresses or sign
* transactions, it must be registered on the device. This function checks if the script config
* was already registered.
*
* `keypath_account` must be set if the script config is multisig, and can be `undefined` if it
* is a policy.
* @param {BtcCoin} coin
* @param {BtcScriptConfig} script_config
* @param {Keypath | undefined} [keypath_account]
* @returns {Promise<boolean>}
*/
  btcIsScriptConfigRegistered(coin: BtcCoin, script_config: BtcScriptConfig, keypath_account?: Keypath): Promise<boolean>;
/**
* Before a multisig or policy script config can be used to display receive addresses or sign
* transcations, it must be registered on the device.
*
* If no name is provided, the user will be asked to enter it on the device instead.  If
* provided, it must be non-empty, smaller or equal to 30 chars, consist only of printable
* ASCII characters, and contain no whitespace other than spaces.
*
*
* `keypath_account` must be set if the script config is multisig, and can be `undefined` if it
* is a policy.
* @param {BtcCoin} coin
* @param {BtcScriptConfig} script_config
* @param {Keypath | undefined} keypath_account
* @param {BtcRegisterXPubType} xpub_type
* @param {string | undefined} [name]
* @returns {Promise<void>}
*/
  btcRegisterScriptConfig(coin: BtcCoin, script_config: BtcScriptConfig, keypath_account: Keypath | undefined, xpub_type: BtcRegisterXPubType, name?: string): Promise<void>;
/**
* Retrieves a Bitcoin address at the provided keypath.
*
* For the simple script configs (single-sig), the keypath must follow the
* BIP44/BIP49/BIP84/BIP86 conventions.
* @param {BtcCoin} coin
* @param {Keypath} keypath
* @param {BtcScriptConfig} script_config
* @param {boolean} display
* @returns {Promise<string>}
*/
  btcAddress(coin: BtcCoin, keypath: Keypath, script_config: BtcScriptConfig, display: boolean): Promise<string>;
/**
* Sign a PSBT.
*
* If `force_script_config` is `undefined`, we attempt to infer the involved script
* configs. For the simple script config (single sig), we infer the script config from the
* involved redeem scripts and provided derviation paths.
*
* Multisig and policy configs are currently not inferred and must be provided using
* `force_script_config`.
* @param {BtcCoin} coin
* @param {string} psbt
* @param {BtcScriptConfigWithKeypath | undefined} force_script_config
* @param {BtcFormatUnit} format_unit
* @returns {Promise<string>}
*/
  btcSignPSBT(coin: BtcCoin, psbt: string, force_script_config: BtcScriptConfigWithKeypath | undefined, format_unit: BtcFormatUnit): Promise<string>;
/**
* @param {BtcCoin} coin
* @param {BtcScriptConfigWithKeypath} script_config
* @param {Uint8Array} msg
* @returns {Promise<BtcSignMessageSignature>}
*/
  btcSignMessage(coin: BtcCoin, script_config: BtcScriptConfigWithKeypath, msg: Uint8Array): Promise<BtcSignMessageSignature>;
/**
* Does this device support ETH functionality? Currently this means BitBox02 Multi.
* @returns {boolean}
*/
  ethSupported(): boolean;
/**
* Query the device for an xpub.
* @param {Keypath} keypath
* @returns {Promise<string>}
*/
  ethXpub(keypath: Keypath): Promise<string>;
/**
* Query the device for an Ethereum address.
* @param {bigint} chain_id
* @param {Keypath} keypath
* @param {boolean} display
* @returns {Promise<string>}
*/
  ethAddress(chain_id: bigint, keypath: Keypath, display: boolean): Promise<string>;
/**
* Signs an Ethereum transaction. It returns a 65 byte signature (R, S, and 1 byte recID).
* @param {bigint} chain_id
* @param {Keypath} keypath
* @param {EthTransaction} tx
* @returns {Promise<EthSignature>}
*/
  ethSignTransaction(chain_id: bigint, keypath: Keypath, tx: EthTransaction): Promise<EthSignature>;
/**
* Signs an Ethereum type 2 transaction according to EIP 1559. It returns a 65 byte signature (R, S, and 1 byte recID).
* @param {Keypath} keypath
* @param {Eth1559Transaction} tx
* @returns {Promise<EthSignature>}
*/
  ethSign1559Transaction(keypath: Keypath, tx: Eth1559Transaction): Promise<EthSignature>;
/**
* Signs an Ethereum message. The provided msg will be prefixed with "\x19Ethereum message\n" +
* len(msg) in the hardware, e.g. "\x19Ethereum\n5hello" (yes, the len prefix is the ascii
* representation with no fixed size or delimiter).  It returns a 65 byte signature (R, S, and
* 1 byte recID). 27 is added to the recID to denote an uncompressed pubkey.
* @param {bigint} chain_id
* @param {Keypath} keypath
* @param {Uint8Array} msg
* @returns {Promise<EthSignature>}
*/
  ethSignMessage(chain_id: bigint, keypath: Keypath, msg: Uint8Array): Promise<EthSignature>;
/**
* Signs an Ethereum EIP-712 typed message. It returns a 65 byte signature (R, S, and 1 byte
* recID). 27 is added to the recID to denote an uncompressed pubkey.
* @param {bigint} chain_id
* @param {Keypath} keypath
* @param {any} msg
* @returns {Promise<EthSignature>}
*/
  ethSignTypedMessage(chain_id: bigint, keypath: Keypath, msg: any): Promise<EthSignature>;
/**
* Does this device support Cardano functionality? Currently this means BitBox02 Multi.
* @returns {boolean}
*/
  cardanoSupported(): boolean;
/**
* Query the device for xpubs. The result contains one xpub per requested keypath. Each xpub is
* 64 bytes: 32 byte chain code + 32 byte pubkey.
* @param {(Keypath)[]} keypaths
* @returns {Promise<CardanoXpubs>}
*/
  cardanoXpubs(keypaths: (Keypath)[]): Promise<CardanoXpubs>;
/**
* Query the device for a Cardano address.
* @param {CardanoNetwork} network
* @param {CardanoScriptConfig} script_config
* @param {boolean} display
* @returns {Promise<string>}
*/
  cardanoAddress(network: CardanoNetwork, script_config: CardanoScriptConfig, display: boolean): Promise<string>;
/**
* Sign a Cardano transaction.
* @param {CardanoTransaction} transaction
* @returns {Promise<CardanoSignTransactionResult>}
*/
  cardanoSignTransaction(transaction: CardanoTransaction): Promise<CardanoSignTransactionResult>;
}
/**
* BitBox in the pairing state. Use `getPairingCode()` to display the pairing code to the user and
* `waitConfirm()` to proceed to the paired state.
*/
export class PairingBitBox {
  free(): void;
/**
* If a pairing code confirmation is required, this returns the pairing code. You must display
* it to the user and then call `waitConfirm()` to wait until the user confirms the code on
* the BitBox.
*
* If the BitBox was paired before and the pairing was persisted, the pairing step is
* skipped. In this case, `undefined` is returned. Also in this case, call `waitConfirm()` to
* establish the encrypted connection.
* @returns {string | undefined}
*/
  getPairingCode(): string | undefined;
/**
* Proceed to the paired state. After this, stop using this instance and continue with the
* returned instance of type `PairedBitBox`.
* @returns {Promise<PairedBitBox>}
*/
  waitConfirm(): Promise<PairedBitBox>;
}
