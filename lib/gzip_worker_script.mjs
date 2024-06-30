// from https://github.com/packurl/wasm_gz
import {gzip} from "./gzip.mjs";
onmessage=async({data:{bytes,level}})=>postMessage(gzip(bytes,level));
postMessage('ready');
