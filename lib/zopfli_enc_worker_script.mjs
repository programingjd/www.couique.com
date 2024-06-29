import {zopfli} from "./zopfli_enc.mjs";
onmessage=async({data})=>postMessage(zopfli(data));
postMessage('ready');
