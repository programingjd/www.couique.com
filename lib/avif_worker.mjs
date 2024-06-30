// From https://github.com/packurl/wasm_avif with added log and abort controller.
const url=new URL('avif.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
/**
 * Encodes the supplied ImageData rgba array.
 * @param {Uint8Array} bytes
 * @param {number} width
 * @param {number} height
 * @param {number} quality (1 to 100)
 * @param {number} speed (1 to 10)
 * @param {?AbortSignal} [signal=undefined]
 * @param {?string} [log=undefined]
 * @return {Promise<Uint8Array>}
 */
const avif=(bytes,width,height,quality=50,speed=6,signal,log)=>new Promise((r,a)=>{
  const worker=new Worker(new URL('./avif_worker_script.mjs',import.meta.url),{type: 'module'});
  worker.onmessage=msg=>{
    if(msg.data==='ready'){
      worker.onmessage=msg=>{
        worker.onmessage=null;
        r(msg.data);
        worker.terminate();
      }
      if(signal.aborted){
        a(signal.reason);
        worker.terminate();
      }else{
        signal.addEventListener('abort',_=>{
          a(signal.reason);
          worker.terminate();
        });
        worker.postMessage({bytes,width,height,quality,speed,log});
      }
    }
  };
});

export {avif};
export default avif;
