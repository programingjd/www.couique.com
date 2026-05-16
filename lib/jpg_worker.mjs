// jpeg encoding implementation from the rust heic crate (https://github.com/imazen/zenjepg)
// under the AGPL3 license (https://github.com/imazen/zenjpeg/blob/main/LICENSE-AGPL3)
const url=new URL('jpg.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
/**
 * Encodes the supplied ImageData rgba array.
 * @param {Uint8Array} bytes
 * @param {number} width
 * @param {number} height
 * @param {number} [quality=80] (1 to 100)
 * @param {?AbortSignal} [signal=undefined]
 * @param {boolean} [transfer=false]
 * @return {Promise<Uint8Array>}
 */
const jpg=(bytes,width,height,quality=80,signal,transfer=false)=>new Promise(r=>{
  const worker=new Worker(new URL('./jpg_worker_script.mjs',import.meta.url),{type:'module'});
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
        worker.postMessage({bytes,width,height,quality},transfer?[bytes.buffer]:undefined);
      }
    }
  };
});

export {jpg};
export default jpg;
