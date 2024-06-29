const suffixes=['.br','-q5.br','-zopfli.gz','.gz'];
const compressors=['brotli_enc','brotli_enc_additional','zopfli_enc','gzip'];
const params=[[11],[5],[],[10]];
const imports=Object.fromEntries(compressors.map(it=>[it,import(`../lib/${it}_worker.mjs`)]));
const formatSize=(size)=>{
  if(size>=10485760)return `${Math.trunc(size/104857.6)/10}mb`;
  if(size>=1000000)return `${Math.trunc(size/10485.76)/100}mb`;
  if(size>=102400)return `${Math.trunc(size/1024)}kb`;
  if(size>=10240)return `${Math.trunc(size/102.4)/10}kb`;
  if(size>=1000)return `${Math.trunc(size/10.24)/100}kb`;
  return `${size}b`;
}
const formatDuration=(duration)=>{
  if(duration>=100000)return `${Math.trunc(duration/1000)}s`;
  if(duration>850)return `${Math.trunc(duration/100)/10}s`;
  return `${duration}ms`;
};
(list=>((listener)=>list.forEach(it=>window.addEventListener(it,listener,false)))(e=>{
  e.preventDefault();e.stopPropagation();document.body.classList.remove('dragover');
}))(['dragenter','dragover','dragleave','drop']);
(list=>((listener)=>list.forEach(it=>window.addEventListener(it,listener,false)))(e=>{
  e.dataTransfer.dropEffect='copy';document.body.classList.add('dragover');
}))(['dragover']);
const graph=document.querySelector('.graph');
const svg=document.querySelector('svg');
const topBars=[...svg.querySelectorAll('g.top.bars rect')];
const bottomBars=[...svg.querySelectorAll('g.bottom.bars rect'),null];
const spinners=[...svg.querySelectorAll('g.top.bars use[href="#spinner"]'),null];
const topLabels=[...svg.querySelectorAll('g.top.labels text')];
const bottomLabels=[...svg.querySelectorAll('g.bottom.labels text'),null];
const a=document.querySelector('a#download');
topLabels[topLabels.length-1].style=`transform:translateY(-100px)`;
(list=>((listener)=>list.forEach(it=>window.addEventListener(it,listener,false)))(e=>{
  e.preventDefault();e.stopPropagation();if(e.dataTransfer.files.length) onDrop(e.dataTransfer.files.item(0));
}))(['drop','paste']);
const input=document.querySelector('input[type="file"]');
input.addEventListener('change',e=>{
  if(e.dataTransfer.files.length) onDrop(e.dataTransfer.files.item(0));
});
document.querySelector('#sample_wasm').addEventListener('click',async(e)=>{
  e.preventDefault();
  const bytes=new Uint8Array(await(await fetch('../lib/brotli_enc.wasm')).arrayBuffer());
  await onDrop({bytes,name:'brotli_enc.wasm',size:bytes.length});
});
document.querySelector('#sample_html').addEventListener('click',async(e)=>{
  e.preventDefault();
  const bytes=new Uint8Array(await(await fetch('.')).arrayBuffer());
  await onDrop({bytes,name:'http-compression.html',size:bytes.length});
});
function read(file){
  if(file.bytes) return file.bytes;
  return new Promise(r=>{
    const reader=new FileReader();
    reader.onloadend=()=>r(new Uint8Array(reader.result));
    reader.readAsArrayBuffer(file);
  });
}
async function onDrop(file){
  window.scroll({top:graph.parentElement.offsetTop,left:0,behavior:'smooth'});
  graph.classList.remove('empty');
  topBars.forEach((it,i,arr)=>{if(i!==arr.length-1){it.classList.add('pending');it.style='';}});
  bottomBars.forEach((it,i,arr)=>{if(i!==arr.length-1){it.classList.add('pending');it.style=''}});
  topLabels.forEach((it,i,arr)=>{it.textContent="";if(i!==arr.length-1){
    it.classList.add('pending');it.style="";it.onclick=null;
  }});
  bottomLabels.forEach(it=>{if(it){it.classList.add('pending');it.textContent='';it.style=''}});
  spinners.forEach((it,i,arr)=>{if(i!==arr.length-1)it.classList.add('pending')});
  const uncompressed=await read(file);
  topLabels[topLabels.length-1].textContent=formatSize(uncompressed.length);
  await Promise.all(Object.values(imports));
  const durations=await Promise.all(compressors.map(async(it,i)=>{
    const fn=(await imports[it]).default;
    const t=Date.now();
    const bytes=await fn(uncompressed,...params[i]);
    const length=bytes.length;
    const duration=Date.now()-t;
    spinners[i].classList.remove('pending');
    topBars[i].classList.remove('pending');
    topBars[i].style=`transform:scaleY(${length/uncompressed.length})`;
    topLabels[i].style=`transform:translateY(${length*-100/uncompressed.length}px)`;
    topLabels[i].textContent=formatSize(length);
    topLabels[i].classList.remove('pending');
    topLabels[i].parentElement.setAttribute('href',`${file.name}${suffixes[i]}`);
    const blob=new Blob([bytes],{type:'octet/stream'});
    const url=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.addEventListener('load',e=>resolve(e.target.result));
      reader.addEventListener('error',reject);
      reader.readAsDataURL(blob);
    });
    topLabels[i].onclick=_=>{
      a.download=`${file.name}${suffixes[i]}`;
      a.href=url;
      a.click();
    };
    if(bottomLabels[i]){
      bottomLabels[i].classList.remove('pending');
      bottomLabels[i].textContent=formatDuration(duration);
    }
    return duration;
  }));
  const max=durations.reduce((max,it)=>(it||0)>max?it:max,0);
  durations.forEach((it,i)=>{
    if(bottomBars[i])bottomBars[i].style=`transform:scaleY(${it/max})`;
    if(bottomLabels[i]){
      bottomLabels[i].classList.remove('pending');
      bottomLabels[i].style=`transform:translateY(${it*100/max}px)`;
    }
  });
}