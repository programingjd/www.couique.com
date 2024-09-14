const encode=async(blob,abortSignal)=>new Promise((resolve,reject)=>{
  const reader=new FileReader();
  if(abortSignal){
    abortSignal.onabort=e=>{
      reader.abort();
      reject(e);
    };
  }
  reader.onload=e=>resolve(e.target.result);
  reader.onerror=e=>reject(e?.target?.error||e);
  reader.readAsDataURL(blob);
});
console.log(globalThis.document);
if(!globalThis.document){
  onmessage=async({data:blob})=>{
    try{
      postMessage(await encode(blob));
    }catch(e){
      postMessage(null);
    }
  };
  postMessage('ready');
}
export {encode};
export default encode;