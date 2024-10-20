const encode=async(blob,signal)=>new Promise((resolve,reject)=>{
  const reader=new FileReader();
  if(signal){
    signal.onabort=e=>{
      reader.abort();
      reject(e);
    };
  }
  reader.onload=e=>{
    const url=e.target.result;
    const i=url.indexOf('base64,');
    resolve(url.substring(i+7));
  };
  reader.onerror=e=>reject(e?.target?.error||e);
  reader.readAsDataURL(blob);
});
const decode=async(s,signal)=>new Promise(async(resolve,reject)=>{
  try{
    resolve(await(await(fetch(`data:,${s}`,{signal}))).arrayBuffer());
  }catch(e){
    reject(e);
  }
});
if(!globalThis.document){
  onmessage=async({data})=>{
    try{
      if(typeof data==='string'){
        postMessage(await decode(data));
      }else{
        postMessage(await encode(data));
      }
    }catch(e){
      postMessage(null);
    }
  };
  postMessage('ready');
}
export {encode,decode};