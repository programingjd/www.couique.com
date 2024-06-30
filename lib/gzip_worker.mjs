// from https://github.com/packurl/wasm_gz
const url=new URL('gzip.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
const worker=await new Promise(r=>{
  // For browsers that don't support type: module on workers (firefox < 114, safari < 15)
  // const worker=new Worker(new URL('./gzip_worker_script.js',import.meta.url));
  const worker=new Worker(new URL('./gzip_worker_script.mjs',import.meta.url),{type:'module'});
  worker.onmessage=msg=>{
    if(msg.data==='ready'){
      worker.onmessage=null;
      r(worker);
    }
  };
});
/**
 * Compresses an array of bytes with Gzip (with a minimal header).
 * @param {Uint8Array} bytes
 * @param {0|1|2|3|4|5|6|7|8|9|10} [level=10]
 * @return {Promise<Uint8Array>}
 */
const gzip=(bytes,level=10)=>new Promise(r=>{
  worker.onmessage=msg=>{
    worker.onmessage=null;
    r(msg.data);
  }
  worker.postMessage({bytes,level});
});

export {gzip};
export default gzip;
