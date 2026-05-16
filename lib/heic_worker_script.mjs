// From https://github.com/packurl/wasm_heic
import {heic} from "./heic.mjs";
onmessage=async({data})=>{
  const r=heic(data);
  postMessage(r,[r.rgba.buffer]);
}
postMessage('ready');