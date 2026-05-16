import {jpg} from "./jpg.mjs";
onmessage=async({data:{bytes,width,height,quality}})=>{
  const res=jpg(bytes,width,height,quality);
  postMessage(res,[res.buffer]);
}
postMessage('ready');