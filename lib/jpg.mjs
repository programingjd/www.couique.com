// jpeg encoding implementation from the rust heic crate (https://github.com/imazen/zenjepg)
// under the AGPL3 license (https://github.com/imazen/zenjpeg/blob/main/LICENSE-AGPL3)
const url=new URL('jpg.wasm',import.meta.url);
let wasm;
const imports={
  js:{
    println:(ptr,len)=>console.log(new TextDecoder().decode(new Uint8Array(wasm.memory.buffer,ptr,len)))
  }
};
const {instance}=await WebAssembly.instantiateStreaming(await fetch(url,{cache:'force-cache'}),imports);
wasm=instance.exports;
const malloc=wasm.malloc;
const free=wasm.free;
/**
 * Encodes the supplied ImageData rgba array.
 * @param {Uint8Array} bytes
 * @param {number} width
 * @param {number} height
 * @param {number} [quality=80] (1 to 100)
 * @return {Uint8Array}
 */
const jpg=(bytes,width,height,quality=80)=>{
  const n1=bytes.length;
  const p1=malloc(n1,1);
  new Uint8Array(wasm.memory.buffer).set(bytes,p1);
  const r=wasm.encode_rgba(p1,n1,width,height,quality);
  free(p1,n1);
  const ptr_and_len=new DataView(wasm.memory.buffer,r,8);
  const p2=ptr_and_len.getUint32(0,true);
  const n2=ptr_and_len.getUint32(4,true);
  free(r,8);
  const res=new Uint8Array(wasm.memory.buffer).subarray(p2,p2+n2).slice();
  free(p2,n2);
  return res;
};
export {jpg};
export default jpg;
