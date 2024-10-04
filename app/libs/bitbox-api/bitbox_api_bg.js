import { getWebHIDDevice, getBridgeDevice, jsSleep } from './webhid';

let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_52(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__hcda56f28a2ecc7a0(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* Connect to a BitBox02 using WebHID. WebHID is mainly supported by Chrome.
* @param {OnCloseCb} on_close_cb
* @returns {Promise<BitBox>}
*/
export function bitbox02ConnectWebHID(on_close_cb) {
    const ret = wasm.bitbox02ConnectWebHID(addHeapObject(on_close_cb));
    return takeObject(ret);
}

/**
* Connect to a BitBox02 by using the BitBoxBridge service.
* @param {OnCloseCb} on_close_cb
* @returns {Promise<BitBox>}
*/
export function bitbox02ConnectBridge(on_close_cb) {
    const ret = wasm.bitbox02ConnectBridge(addHeapObject(on_close_cb));
    return takeObject(ret);
}

/**
* Connect to a BitBox02 using WebHID if available. If WebHID is not available, we attempt to
* connect using the BitBoxBridge.
* @param {OnCloseCb} on_close_cb
* @returns {Promise<BitBox>}
*/
export function bitbox02ConnectAuto(on_close_cb) {
    const ret = wasm.bitbox02ConnectAuto(addHeapObject(on_close_cb));
    return takeObject(ret);
}

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
export function ensureError(err) {
    const ret = wasm.ensureError(addHeapObject(err));
    return takeObject(ret);
}

/**
* Returns true if the user cancelled an operation.
* @param {Error} err
* @returns {boolean}
*/
export function isUserAbort(err) {
    const ret = wasm.isUserAbort(addHeapObject(err));
    return ret !== 0;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
function __wbg_adapter_178(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h993bf318c938ef9e(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const BitBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bitbox_free(ptr >>> 0));
/**
* BitBox client. Instantiate it using `bitbox02ConnectAuto()`.
*/
export class BitBox {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BitBox.prototype);
        obj.__wbg_ptr = ptr;
        BitBoxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BitBoxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bitbox_free(ptr);
    }
    /**
    * Invokes the device unlock and pairing. After this, stop using this instance and continue
    * with the returned instance of type `PairingBitBox`.
    * @returns {Promise<PairingBitBox>}
    */
    unlockAndPair() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.bitbox_unlockAndPair(ptr);
        return takeObject(ret);
    }
}

const PairedBitBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pairedbitbox_free(ptr >>> 0));
/**
* Paired BitBox. This is where you can invoke most API functions like getting xpubs, displaying
* receive addresses, etc.
*/
export class PairedBitBox {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PairedBitBox.prototype);
        obj.__wbg_ptr = ptr;
        PairedBitBoxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PairedBitBoxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pairedbitbox_free(ptr);
    }
    /**
    * Closes the BitBox connection. This also invokes the `on_close_cb` callback which was
    * provided to the connect method creating the connection.
    */
    close() {
        const ptr = this.__destroy_into_raw();
        wasm.pairedbitbox_close(ptr);
    }
    /**
    * @returns {Promise<DeviceInfo>}
    */
    deviceInfo() {
        const ret = wasm.pairedbitbox_deviceInfo(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Returns which product we are connected to.
    * @returns {Product}
    */
    product() {
        const ret = wasm.pairedbitbox_product(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Returns the firmware version, e.g. "9.18.0".
    * @returns {string}
    */
    version() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pairedbitbox_version(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Returns the hex-encoded 4-byte root fingerprint.
    * @returns {Promise<string>}
    */
    rootFingerprint() {
        const ret = wasm.pairedbitbox_rootFingerprint(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Show recovery words on the Bitbox.
    * @returns {Promise<void>}
    */
    showMnemonic() {
        const ret = wasm.pairedbitbox_showMnemonic(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Retrieves an xpub. For non-standard keypaths, a warning is displayed on the BitBox even if
    * `display` is false.
    * @param {BtcCoin} coin
    * @param {Keypath} keypath
    * @param {XPubType} xpub_type
    * @param {boolean} display
    * @returns {Promise<string>}
    */
    btcXpub(coin, keypath, xpub_type, display) {
        const ret = wasm.pairedbitbox_btcXpub(this.__wbg_ptr, addHeapObject(coin), addHeapObject(keypath), addHeapObject(xpub_type), display);
        return takeObject(ret);
    }
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
    btcIsScriptConfigRegistered(coin, script_config, keypath_account) {
        const ret = wasm.pairedbitbox_btcIsScriptConfigRegistered(this.__wbg_ptr, addHeapObject(coin), addHeapObject(script_config), isLikeNone(keypath_account) ? 0 : addHeapObject(keypath_account));
        return takeObject(ret);
    }
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
    btcRegisterScriptConfig(coin, script_config, keypath_account, xpub_type, name) {
        var ptr0 = isLikeNone(name) ? 0 : passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.pairedbitbox_btcRegisterScriptConfig(this.__wbg_ptr, addHeapObject(coin), addHeapObject(script_config), isLikeNone(keypath_account) ? 0 : addHeapObject(keypath_account), addHeapObject(xpub_type), ptr0, len0);
        return takeObject(ret);
    }
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
    btcAddress(coin, keypath, script_config, display) {
        const ret = wasm.pairedbitbox_btcAddress(this.__wbg_ptr, addHeapObject(coin), addHeapObject(keypath), addHeapObject(script_config), display);
        return takeObject(ret);
    }
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
    btcSignPSBT(coin, psbt, force_script_config, format_unit) {
        const ptr0 = passStringToWasm0(psbt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pairedbitbox_btcSignPSBT(this.__wbg_ptr, addHeapObject(coin), ptr0, len0, isLikeNone(force_script_config) ? 0 : addHeapObject(force_script_config), addHeapObject(format_unit));
        return takeObject(ret);
    }
    /**
    * @param {BtcCoin} coin
    * @param {BtcScriptConfigWithKeypath} script_config
    * @param {Uint8Array} msg
    * @returns {Promise<BtcSignMessageSignature>}
    */
    btcSignMessage(coin, script_config, msg) {
        const ptr0 = passArray8ToWasm0(msg, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pairedbitbox_btcSignMessage(this.__wbg_ptr, addHeapObject(coin), addHeapObject(script_config), ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Does this device support ETH functionality? Currently this means BitBox02 Multi.
    * @returns {boolean}
    */
    ethSupported() {
        const ret = wasm.pairedbitbox_cardanoSupported(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * Query the device for an xpub.
    * @param {Keypath} keypath
    * @returns {Promise<string>}
    */
    ethXpub(keypath) {
        const ret = wasm.pairedbitbox_ethXpub(this.__wbg_ptr, addHeapObject(keypath));
        return takeObject(ret);
    }
    /**
    * Query the device for an Ethereum address.
    * @param {bigint} chain_id
    * @param {Keypath} keypath
    * @param {boolean} display
    * @returns {Promise<string>}
    */
    ethAddress(chain_id, keypath, display) {
        const ret = wasm.pairedbitbox_ethAddress(this.__wbg_ptr, chain_id, addHeapObject(keypath), display);
        return takeObject(ret);
    }
    /**
    * Signs an Ethereum transaction. It returns a 65 byte signature (R, S, and 1 byte recID).
    * @param {bigint} chain_id
    * @param {Keypath} keypath
    * @param {EthTransaction} tx
    * @returns {Promise<EthSignature>}
    */
    ethSignTransaction(chain_id, keypath, tx) {
        const ret = wasm.pairedbitbox_ethSignTransaction(this.__wbg_ptr, chain_id, addHeapObject(keypath), addHeapObject(tx));
        return takeObject(ret);
    }
    /**
    * Signs an Ethereum type 2 transaction according to EIP 1559. It returns a 65 byte signature (R, S, and 1 byte recID).
    * @param {Keypath} keypath
    * @param {Eth1559Transaction} tx
    * @returns {Promise<EthSignature>}
    */
    ethSign1559Transaction(keypath, tx) {
        const ret = wasm.pairedbitbox_ethSign1559Transaction(this.__wbg_ptr, addHeapObject(keypath), addHeapObject(tx));
        return takeObject(ret);
    }
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
    ethSignMessage(chain_id, keypath, msg) {
        const ptr0 = passArray8ToWasm0(msg, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pairedbitbox_ethSignMessage(this.__wbg_ptr, chain_id, addHeapObject(keypath), ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Signs an Ethereum EIP-712 typed message. It returns a 65 byte signature (R, S, and 1 byte
    * recID). 27 is added to the recID to denote an uncompressed pubkey.
    * @param {bigint} chain_id
    * @param {Keypath} keypath
    * @param {any} msg
    * @returns {Promise<EthSignature>}
    */
    ethSignTypedMessage(chain_id, keypath, msg) {
        const ret = wasm.pairedbitbox_ethSignTypedMessage(this.__wbg_ptr, chain_id, addHeapObject(keypath), addHeapObject(msg));
        return takeObject(ret);
    }
    /**
    * Does this device support Cardano functionality? Currently this means BitBox02 Multi.
    * @returns {boolean}
    */
    cardanoSupported() {
        const ret = wasm.pairedbitbox_cardanoSupported(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * Query the device for xpubs. The result contains one xpub per requested keypath. Each xpub is
    * 64 bytes: 32 byte chain code + 32 byte pubkey.
    * @param {(Keypath)[]} keypaths
    * @returns {Promise<CardanoXpubs>}
    */
    cardanoXpubs(keypaths) {
        const ptr0 = passArrayJsValueToWasm0(keypaths, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pairedbitbox_cardanoXpubs(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Query the device for a Cardano address.
    * @param {CardanoNetwork} network
    * @param {CardanoScriptConfig} script_config
    * @param {boolean} display
    * @returns {Promise<string>}
    */
    cardanoAddress(network, script_config, display) {
        const ret = wasm.pairedbitbox_cardanoAddress(this.__wbg_ptr, addHeapObject(network), addHeapObject(script_config), display);
        return takeObject(ret);
    }
    /**
    * Sign a Cardano transaction.
    * @param {CardanoTransaction} transaction
    * @returns {Promise<CardanoSignTransactionResult>}
    */
    cardanoSignTransaction(transaction) {
        const ret = wasm.pairedbitbox_cardanoSignTransaction(this.__wbg_ptr, addHeapObject(transaction));
        return takeObject(ret);
    }
}

const PairingBitBoxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pairingbitbox_free(ptr >>> 0));
/**
* BitBox in the pairing state. Use `getPairingCode()` to display the pairing code to the user and
* `waitConfirm()` to proceed to the paired state.
*/
export class PairingBitBox {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PairingBitBox.prototype);
        obj.__wbg_ptr = ptr;
        PairingBitBoxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PairingBitBoxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pairingbitbox_free(ptr);
    }
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
    getPairingCode() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pairingbitbox_getPairingCode(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Proceed to the paired state. After this, stop using this instance and continue with the
    * returned instance of type `PairedBitBox`.
    * @returns {Promise<PairedBitBox>}
    */
    waitConfirm() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.pairingbitbox_waitConfirm(ptr);
        return takeObject(ret);
    }
}

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_in(arg0, arg1) {
    const ret = getObject(arg0) in getObject(arg1);
    return ret;
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_is_null(arg0) {
    const ret = getObject(arg0) === null;
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_is_bigint(arg0) {
    const ret = typeof(getObject(arg0)) === 'bigint';
    return ret;
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_jsval_eq(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_getWebHIDDevice_b0c6403b73dd7a2c() { return handleError(function (arg0, arg1, arg2) {
    const ret = getWebHIDDevice(arg0, arg1, takeObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getBridgeDevice_78162303c7d8bbd2() { return handleError(function (arg0) {
    const ret = getBridgeDevice(takeObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_jsSleep_5e4f5d05d0900f3a(arg0) {
    const ret = jsSleep(arg0);
    return addHeapObject(ret);
};

export function __wbg_bitbox_new(arg0) {
    const ret = BitBox.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pairingbitbox_new(arg0) {
    const ret = PairingBitBox.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_pairedbitbox_new(arg0) {
    const ret = PairedBitBox.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_crypto_1d1f22824a6a080c(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_process_4a72847cc503995b(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_versions_f686565e586dd935(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_104a2ff8d6ea03a2(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbg_require_cca90b1a94a0255b() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_msCrypto_eb05e62b530a1508(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_5c9c955aa56b6049() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_getRandomValues_3aa56aa6edec874c() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
};

export function __wbindgen_as_number(arg0) {
    const ret = +getObject(arg0);
    return ret;
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_getwithrefkey_edc2c8960f0f1191(arg0, arg1) {
    const ret = getObject(arg0)[getObject(arg1)];
    return addHeapObject(ret);
};

export function __wbg_set_f975102236d3c502(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_getItem_164e8e5265095b87() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };

export function __wbg_setItem_ba2bb41d73dac079() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_instanceof_Window_f401953a2cf86220(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_localStorage_e381d34d0c40c761() { return handleError(function (arg0) {
    const ret = getObject(arg0).localStorage;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_queueMicrotask_3cbae2ec6b6cd3d6(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbg_queueMicrotask_481971b0d87f3dd4(arg0) {
    queueMicrotask(getObject(arg0));
};

export function __wbg_self_ce0dbfc45cf2f5be() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_c6fb939a7f436783() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_d1e6af4856ba331b() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_207b558942527489() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_newnoargs_e258087cd0daa0ea(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_length_cd7af8117672b8b8(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_new_16b304a2cfa7ff4a() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_next_40fc327bfc8770e6(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_value_d93c65011f51a456(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbg_iterator_2cee6dadfd956dfa() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_new_72fb9a18b5ae2624() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_get_bd8e338fbd5f5cc8(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_set_d4638f722068f043(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

export function __wbg_isArray_2ab64d95e09ea0ae(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

export function __wbg_instanceof_ArrayBuffer_836825be07d4c9d2(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Error_e20bb56fd5591a93(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Error;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_message_5bf28016c2b49cfb(arg0) {
    const ret = getObject(arg0).message;
    return addHeapObject(ret);
};

export function __wbg_call_27c0f87801dedf93() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_call_b3ca7c6051f9bec1() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_instanceof_Map_87917e0a7aaf4012(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Map;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_next_196c84450b364254() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_done_298b57d23c0fc80c(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_isSafeInteger_f7b04ef02296c4d2(arg0) {
    const ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};

export function __wbg_entries_95cc2c823b285a09(arg0) {
    const ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_get_e3c254076557e348() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_set_1f9b04f170055d33() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbg_buffer_12d079cc21e14bdb(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_stringify_8887fe74e1c50d81() { return handleError(function (arg0) {
    const ret = JSON.stringify(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_81740750da40724f(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_178(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_b0083a7967828ec8(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_0c86a60e8fcfe9f6(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_a73caa9a87991566(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_63b92bc8671ed464(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_instanceof_Uint8Array_2b3bbecd033d19f6(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_newwithlength_e9b4878cebadb3d3(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_a1f73cd4b5b42fe1(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_length_c20a40f15020d68a(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_set_a47bac70306a19a7(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
    const v = getObject(arg1);
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2347(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 247, __wbg_adapter_52);
    return addHeapObject(ret);
};

