// From https://github.com/packurl/wasm_avif, with added log.
const url=new URL('avif.wasm',import.meta.url);
const imports={
  wbg: {
    __wbg_log_12edb8942696c207: (p,n)=>{
      console.log(new TextDecoder().decode(new Uint8Array(wasm.memory.buffer).subarray(p,p+n)));
    }
  }
};
const {instance: {exports: wasm}}=await WebAssembly.instantiateStreaming(await fetch(url,{cache: 'force-cache'}),imports);
const malloc=wasm.__wbindgen_malloc;
const free=wasm.__wbindgen_free;
const pointer=wasm.__wbindgen_add_to_stack_pointer;
/**
 * Encodes the supplied ImageData rgba array.
 * @param {Uint8Array} bytes
 * @param {number} width
 * @param {number} height
 * @param {number} quality (1 to 100)
 * @param {number} speed (1 to 10)
 * @param {?string} [log=undefined]
 * @return {Uint8Array}
 */
const avif=(bytes,width,height,quality=50,speed=6,log)=>{
  const n1=bytes.length;
  const p1=malloc(n1,1);
  const r=pointer(-16);
  try{
    const t=log?Date.now():0;
    new Uint8Array(wasm.memory.buffer).set(bytes,p1);
    wasm.avif_from_imagedata(r,p1,n1,width,height,quality,speed);
    const arr=new Int32Array(wasm.memory.buffer);
    const p2=arr[r/4];
    const n2=arr[r/4+1];
    const res=new Uint8Array(wasm.memory.buffer).subarray(p2,p2+n2).slice();
    free(p2,n2);
    if(log){
      let su='b';
      let size=res.length;
      if(size>1024){
        size/=1024;
        su='kb';
        if(size>1024){
          size/=1024;
          su='mb';
        }
      }
      let tu='ms';
      let dt=Date.now()-t;
      if(dt>1000){
        dt/=1000;
        tu='s';
      }
      console.info(`${log}: ${size.toPrecision(4).replace(/[.]?0+$/,'')}${su} in ${dt.toPrecision(3).replace(/[.]?0+$/,'')}${tu}`);
    }
    return res;
  }finally{
    pointer(16)
  }
};
export {avif};
export default avif;
