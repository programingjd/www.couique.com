// heic decoding implementation from the rust heic crate (https://github.com/imazen/heic)
// under the AGPL3 license (https://github.com/imazen/heic/blob/main/LICENSE-AGPL3)
const url=new URL('heic.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
const worker=await new Promise(r=>{
  // For browsers that don't support type: module on workers (firefox < 114, safari < 15)
  // const worker=new Worker(new URL('./heif_worker_script.js',import.meta.url));
  const worker=new Worker(new URL('./heic_worker_script.mjs',import.meta.url),{type:'module'});
  worker.onmessage=msg=>{
    if(msg.data==='ready'){
      worker.onmessage=null;
      r(worker);
    }
  };
});
/**
 * @typedef {Record<string,any>} DecodedRgbaImage
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array} rgba
 */
/**
 * Decodes the bytes from a heic photo to rgba.
 * @param {Uint8Array} bytes
 * @param {boolean} [transfer=false]
 * @return {Promise<DecodedRgbaImage>}
 */
const heic=(bytes,transfer=false)=>new Promise((r,a)=>{
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
        worker.postMessage(bytes,transfer?[bytes.buffer]:undefined);
      }
    }
  };
});

export {heic};
export default heic;
