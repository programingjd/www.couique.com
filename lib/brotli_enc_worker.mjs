// From https://github.com/packurl/wasm_br
const url=new URL('brotli_enc.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
const worker=await new Promise(r=>{
  const worker=new Worker(new URL('./brotli_enc_worker_script.mjs',import.meta.url),{type:'module'});
  worker.onmessage=msg=>{
    if(msg.data==='ready'){
      worker.onmessage=null;
      r(worker);
    }
  };
});
/**
 * Compresses an array of bytes with Brotli.
 * @param {Uint8Array} bytes
 * @param {0|1|2|3|4|5|6|7|8|9|10|11} [level=11]
 * @return {Promise<Uint8Array>}
 */
const br=(bytes,level=11)=>new Promise(r=>{
  worker.onmessage=msg=>{
    worker.onmessage=null;
    r(msg.data);
  }
  worker.postMessage({bytes,level});
});

export {br};
export default br;
