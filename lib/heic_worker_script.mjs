// From https://github.com/packurl/wasm_heic
import {heic} from "./heic.mjs";
onmessage=async({data})=>{
  const res=heic(data);
  postMessage(res,[res.rgba.buffer]);
}
postMessage('ready');