// From https://github.com/packurl/wasm_avif with added log and abort controller.
import {avif} from "./avif.mjs";
onmessage=async({data:{bytes,width,height,quality,speed,log}})=>postMessage(avif(bytes,width,height,quality,speed,log));
postMessage('ready');