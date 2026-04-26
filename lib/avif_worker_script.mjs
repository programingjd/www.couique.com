// From https://github.com/packurl/wasm_avif with added log and abort controller.
import {avif} from "./avif.mjs";
onmessage=async({data:{bytes,width,height,quality,speed,log}})=>{
  const res=avif(bytes,width,height,quality,speed,log);
  postMessage(res,[res.buffer]);
}
postMessage('ready');