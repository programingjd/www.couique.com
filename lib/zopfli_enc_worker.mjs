// from https://github.com/packurl/wasm_gz
const url=new URL('zopfli_enc.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
const worker=await new Promise(r=>{
  // For browsers that don't support type: module on workers (firefox < 114, safari < 15)
  // const worker=new Worker(new URL('./zopfli_enc_worker_script.js',import.meta.url));
  const worker=new Worker(new URL('./zopfli_enc_worker_script.mjs',import.meta.url),{type:'module'});
  worker.onmessage=msg=>{
    if(msg.data==='ready'){
      worker.onmessage=null;
      r(worker);
    }
  };
});
/**
 * Compresses an array of bytes with Zopfli Gzip compatible compression.
 * @param {Uint8Array} bytes
 * @return {Promise<Uint8Array>}
 */
const zopfli=(bytes)=>new Promise(r=>{
  worker.onmessage=msg=>{
    worker.onmessage=null;
    r(msg.data);
  }
  worker.postMessage(bytes);
});

export {zopfli};
export default zopfli;
