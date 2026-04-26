// From https://github.com/packurl/wasm_heic
// HEIC decoding implementation from the rust heic crate (https://github.com/imazen/heic)
// under the AGPL3 license (https://github.com/imazen/heic/blob/main/LICENSE-AGPL3)
const url=new URL('heic.wasm',import.meta.url);
let wasm;
const imports={};
const {instance}=await WebAssembly.instantiateStreaming(await fetch(url,{cache:'force-cache'}),imports);
wasm=instance.exports;
const malloc=wasm.malloc;
const free=wasm.free;
/**
 * @typedef {Record<string,any>} DecodedRgbaImage
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array} rgba
 */
/**
 * Decodes the bytes from a heic photo to rgba.
 * @param {Uint8Array} bytes
 * @return {DecodedRgbaImage}
 */
const heic=bytes=>{
  const n1=bytes.length;
  const p1=malloc(n1,1);
  new Uint8Array(wasm.memory.buffer).set(bytes,p1);
  const r=wasm.decode_rgba(p1,n1);
  free(p1,n1);
  const ptr_len_w_h=new DataView(wasm.memory.buffer,r,12);
  const p2=ptr_len_w_h.getUint32(0,true);
  const n2=ptr_len_w_h.getUint32(4,true);
  const width=ptr_len_w_h.getUint16(8,true);
  const height=ptr_len_w_h.getUint16(10,true);
  free(r,12);
  const rgba=new Uint8Array(wasm.memory.buffer).subarray(p2,p2+n2).slice();
  free(p2,n2);
  return {width,height,rgba};
};
export {heic};
export default heic;
