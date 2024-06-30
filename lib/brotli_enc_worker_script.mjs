// From https://github.com/packurl/wasm_br
import {br} from "./brotli_enc.mjs";
onmessage=async({data:{bytes,level}})=>postMessage(br(bytes,level));
postMessage('ready');
