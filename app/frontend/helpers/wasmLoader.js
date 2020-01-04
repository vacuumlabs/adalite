import {Buffer} from 'buffer'
// interface extendedWindow extends Window {
//   wasm?: any;
// }

export default async function loadWasmModule() {
  // (window as extendedWindow).wasm = await import('@emurgo/js-chain-libs/js_chain_libs_bg.wasm')
  window.wasm = await import('@emurgo/js-chain-libs/js_chain_libs_bg.wasm')
  window.Buffer = Buffer
}
