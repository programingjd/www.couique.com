// From https://github.com/packurl/wasm_resize_rgba with added abort controller.
const url=new URL('resize.wasm',import.meta.url);
await (await fetch(url)).arrayBuffer();
/**
 * Resizes the supplied ImageData rgba array.
 * @param {Uint8Array} data
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @param {boolean} [hq=true]
 * @param {?AbortSignal} [signal=undefined]
 * @return {Promise<Uint8Array>}
 */
const resize=(data,sourceWidth,sourceHeight,targetWidth,targetHeight,hq=true,signal)=>new Promise((r,a)=>{
  const worker=new Worker(new URL('./resize_worker_script.mjs',import.meta.url),{type:'module'});
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
        worker.postMessage({data,sourceWidth,sourceHeight,targetWidth,targetHeight,hq});
      }
    }
  };
});

export {resize};
export default resize;
