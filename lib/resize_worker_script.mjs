// From https://github.com/packurl/wasm_resize_rgba
import {resize} from "./resize.mjs";
onmessage=async({data:{data,sourceWidth,sourceHeight,targetWidth,targetHeight,hq}})=>postMessage(resize(data,sourceWidth,sourceHeight,targetWidth,targetHeight,hq));
postMessage('ready');
