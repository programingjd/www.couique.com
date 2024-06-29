const url=new URL('./zopfli_enc.wasm',import.meta.url);
const {instance:{exports:wasm}}=await WebAssembly.instantiateStreaming(await fetch(url,{cache:'force-cache'}),{wbg:{}});
const malloc=wasm.__wbindgen_malloc;
const free=wasm.__wbindgen_free;
const pointer=wasm.__wbindgen_add_to_stack_pointer;
/**
 * Compresses an array of bytes with Zopfli Gzip compatible compression.
 * @param {Uint8Array} bytes
 * @return {Uint8Array}
 */
const zopfli=bytes=>{
  const n1=bytes.length;
  const p1=malloc(n1,1);
  const r=pointer(-16);
  try{
    new Uint8Array(wasm.memory.buffer).set(bytes,p1);
    wasm.zopfli(r,p1,n1);
    const arr=new Int32Array(wasm.memory.buffer);
    const p2=arr[r/4];const n2=arr[r/4+1];
    const res=new Uint8Array(wasm.memory.buffer).subarray(p2,p2+n2).slice();
    free(p2,n2);
    return res;
  }finally{pointer(16)}
};
export {zopfli};
export default zopfli;