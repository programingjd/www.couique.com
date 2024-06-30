// from https://github.com/packurl/wasm_gz
import {zopfli} from "./zopfli_enc.mjs";
onmessage=async({data})=>postMessage(zopfli(data));
postMessage('ready');
