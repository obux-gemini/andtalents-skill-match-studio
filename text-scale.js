(() => {
  'use strict';
  // Scale typography only, never card widths, icons, or the matching bar.
  const originals=new WeakMap();let current=1,queued=false;
  function apply(scale){
    if(typeof scale!=='number'||!Number.isFinite(scale)||scale<1||scale>2)return;
    current=scale;
    const elements=[document.body,...document.body.querySelectorAll('*')].filter(el=>el instanceof HTMLElement&&!['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(el.tagName));
    for(const el of elements){
      if(!originals.has(el))originals.set(el,{value:el.style.getPropertyValue('font-size'),priority:el.style.getPropertyPriority('font-size'),modified:false});
      const original=originals.get(el);if(original.modified){if(original.value)el.style.setProperty('font-size',original.value,original.priority);else el.style.removeProperty('font-size');original.modified=false;}
    }
    {
      const sizes=elements.map(el=>parseFloat(getComputedStyle(el).fontSize));
      elements.forEach((el,index)=>{const reduced=el.closest('.sm-score-wrap,.os-score-wrap,.jd-summary,.ra-decision'),factor=scale*(reduced?1.2/1.35:1);if(Number.isFinite(sizes[index])&&Math.abs(factor-1)>.000001){el.style.setProperty('font-size',(sizes[index]*factor)+'px','important');originals.get(el).modified=true;}});
    }
    document.body.dataset.fontScale=String(scale);
    document.dispatchEvent(new CustomEvent('andtalents:typography-updated'));
  }
  window.addEventListener('resize',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply(current);});});
  globalThis.StudioTextScale={apply};
})();
