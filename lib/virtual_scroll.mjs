class VirtualScrollerElement extends HTMLElement{
  #window=null;
  #placeholder=null;
  #template=null;
  #model=null;
  #height=0;
  #rowHeight=0;
  #rowCount=0;
  #itemCount=0;
  #colCount=1;
  #clones=[];
  #rowIndices=[];

  constructor(){
    super();
    this.attachShadow({mode:'open'}).innerHTML=`<style>
:host{position:relative;display:block;overflow:auto}
:host>div>div{position:relative;margin:0;padding:0;overflow:hidden}
:host>div>div:nth-child(2)>div{position:absolute;top:0;right:0;left:0;margin:0;padding:0;display:grid;grid-auto-rows:auto}
div[style]:not([style="height: 0px;"])+div{display:none}
/*div>div>div{scale:1 10}*/
div>div:nth-child(3){position:absolute;inset:0;display:grid}
</style>
<div>
  <div><slot name="header"></slot></div>
  <div>
    <div>
      <slot name="rows"></slot>
    </div>
  </div>
  <div><slot name="placeholder"></slot></div>
  <div><slot name="footer"></div>
</div>`;
  }

  connectedCallback(){
    this.#placeholder=this.shadowRoot.querySelectorAll(':host>div>div')[1];
    this.#window=this.#placeholder.querySelector('div');
    this.#template=this.querySelector('template');
    if(!this.#template){
      this.#template=document.createElement('template');
      this.#template.innerHTML='<div style="display:flex;height:1.5em;justify-content:center;align-items:center"></div>';
    }
    if(this.#model) this.#layout();
    this.shadowRoot.host.addEventListener('scroll',this.#render.bind(this));
    if(window.ResizeObserver){
      let id=0;
      const cb=this.#layout.bind(this);
      new ResizeObserver(_=>{
        cancelAnimationFrame(id);
        id=requestAnimationFrame(cb);
      }).observe(this);
    }
  }

  set model(model){
    if(this.#model!==model){
      this.#model=model;
    }
    if(this.isConnected) this.#layout();
  }

  get model(){
    return this.#model;
  }

  #layout(){
    const count=this.#count();
    if(count===0){
      this.#placeholder.style.height='0px';
      while(this.#clones.length>0) this.#removeRow();
      return;
    }
    this.shadowRoot.host.style.height='100dvh';
    this.shadowRoot.host.style.overflow='hidden';
    const colCount=this.#cols();
    const firstRow=this.#clones.length?this.#clones[this.#clones.length-1]:this.#addRow(colCount);
    const rowHeight=this.#rowHeight=this.#heights(firstRow).reduce((sum,cur)=>sum+cur,0);
    const heights=this.#heights(this.shadowRoot.host);
    const viewportHeight=this.shadowRoot.host.getBoundingClientRect().height-heights[0]-heights[2];
    if(colCount!==this.#colCount){
      this.#colCount=colCount;
      while(this.#clones.length>0) this.#removeRow();
    }
    const itemCount=this.#itemCount=this.#count();
    const rowCount=this.#rowCount=Math.ceil(itemCount/colCount);
    this.#placeholder.style.height=`${rowCount*rowHeight}px`;
    const windowRowCount=Math.min(rowCount,Math.ceil(viewportHeight/rowHeight)*3);
    while(this.#clones.length<windowRowCount) this.#addRow(colCount);
    while(this.#clones.length>windowRowCount) this.#removeRow();
    this.#rowIndices.fill(-1);
    this.shadowRoot.host.style.height='auto';
    this.shadowRoot.host.style.overflow='auto';
    this.#render();
    this.#height=this.clientHeight;
  }

  #render(){
    const scrollTop=this.scrollTop;
    const rowHeight=this.#rowHeight;
    let offset=scrollTop-scrollTop%rowHeight;
    let firstWindowRowIndex=Math.trunc(scrollTop/rowHeight);
    let max=this.#clones.length/3;
    while(firstWindowRowIndex>0&&max-->0){
      --firstWindowRowIndex;
      offset-=rowHeight;
    }
    const colCount=this.#colCount;
    const rowCount=this.#rowCount;
    const itemCount=this.#itemCount;
    this.#window.style.top=`${offset}px`;
    const model=this.#model;
    const render=model.render||(Array.isArray(model)?(el,i)=>el.textContent=model[i]:_=>{});
    this.#clones.forEach((row,i)=>{
      const rowIndex=i+firstWindowRowIndex;
      if(i>rowCount){
        row.style.visibility='hidden';
        this.#rowIndices[i]=-1;
      }else{
        row.style.visibility='visible';
        if(this.#rowIndices[i]!==rowIndex){
          this.#rowIndices[i]=rowIndex;
          if(colCount===1) render(row,rowIndex,rowIndex,0);
          else{
            const cells=row.children;
            for(let colIndex=0; colIndex<colCount; ++colIndex){
              const cell=cells.item(colIndex);
              const itemIndex=rowIndex*colCount+colIndex;
              if(itemIndex>=itemCount) cell.style.visibility='hidden';
              else{
                cell.style.visibility='visible';
                render(cell,itemIndex,rowIndex,colIndex);
              }
            }
          }
        }
      }
    });
  }

  #cols(){
    const t=typeof (this.#model||{}).cols;
    if(t==='function') return this.#model.cols();
    if(t==='number') return this.#model.cols;
    return 1;
  }

  #count(){
    const t=typeof (this.#model||{}).count;
    if(t==='function') return this.#model.count();
    if(t==='number') return this.#model.count;
    return this.#model.length||0;
  }

  #heights(el){
    const style=getComputedStyle(el);
    return [Math.ceil(parseFloat(style.marginTop)),Math.ceil(parseFloat(style.height)),Math.ceil(parseFloat(style.marginBottom))];
  }

  #clone(){
    const el=document.importNode(this.#template.content,true);
    if(el.children.length===1){
      const it=el.children.item(0);
      it.slot='rows';
      return it;
    }
    const div=document.createElement('div');
    div.style.position='relative';
    div.style.display='grid';
    div.appendChild(el);
    div.slot='rows';
    return div;
  }

  #row(colCount){
    if(colCount===1) return this.#clone();
    const div=document.createElement('div');
    for(let i=0;i<colCount;++i){
      div.appendChild(this.#clone());
    }
    div.style.position='relative';
    div.style.display='grid';
    div.style.gridTemplateColumns=`repeat(${colCount},1fr)`;
    return div;
  }

  #addRow(colCount){
    const row=this.#row(colCount);
    this.appendChild(row);
    this.#clones.push(row);
    this.#rowIndices.push(-1);
    return row;
  }

  #removeRow(){
    const el=this.#clones.pop();
    this.#rowIndices.pop();
    el.parentElement.removeChild(el);
  }
}

customElements.define('virtual-scroller', VirtualScrollerElement);

export default VirtualScrollerElement;
export { VirtualScrollerElement };