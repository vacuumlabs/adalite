import * as wasm from "./bitbox_api_bg.wasm";
import { __wbg_set_wasm } from "./bitbox_api_bg.js";
__wbg_set_wasm(wasm);
export * from "./bitbox_api_bg.js";
