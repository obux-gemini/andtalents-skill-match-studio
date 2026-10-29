(() => {
  'use strict';
  const defaults={pass:'#c6e6d2',close:'#e8f5ed',open:'#f3e4e5',extra:'#e9edf1',openBar:'#d8a4a7',fire:'#b96312',accent:'#008f85',score:'#f39a28'};
  const fields=[{key:'pass',label:'Passt'},{key:'close',label:'Ähnlich'},{key:'open',label:'Fehlt im Profil'},{key:'extra',label:'Zusätzlich'},{key:'openBar',label:'Fehlt · Leiste',secondary:true},{key:'fire',label:'Fire Skills',secondary:true},{key:'score',label:'Match-Score',secondary:true},{key:'accent',label:'Markenfarbe & Akzent',secondary:true}];
  const storageKey='andtalents-skill-studio-v1';
  const fontStorageKey='andtalents-skill-studio-font-scale-v3';let fontScale=1.4;
  try{const saved=Number(localStorage.getItem(fontStorageKey));if(Number.isFinite(saved)&&saved>=1&&saved<=2)fontScale=saved;}catch{}
  const validHex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
  let palette={...defaults};
  try{const saved=JSON.parse(localStorage.getItem(storageKey));for(const key of Object.keys(defaults))if(validHex(saved?.[key]))palette[key]=saved[key].toLowerCase();}catch{}
  const query=new URLSearchParams(location.search);
  const extremeJobs=['finanzbuchhaltung','bilanzbuchhaltung','softwareentwicklung'];
  const filters={role:['candidate','recruiter','all'].includes(query.get('role'))?query.get('role'):'candidate',format:['pills','list','all'].includes(query.get('format'))?query.get('format'):'pills',job:['buchhaltung','debitoren','controlling','extreme',...extremeJobs].includes(query.get('job'))?query.get('job'):'all',special:false};
  let applicationLayout=query.get('layout')==='applications'?'applications':'comparison';
  const jobNames={buchhaltung:'Buchhaltung',debitoren:'Debitorenbuchhaltung',controlling:'Controlling',finanzbuchhaltung:'Finanzbuchhaltung',bilanzbuchhaltung:'Bilanzbuchhaltung',softwareentwicklung:'Softwareentwicklung'};
  const views=[];
  for(const role of ['candidate','recruiter'])for(const format of ['pills','list'])for(const job of Object.keys(jobNames))views.push({id:`${role}-${format}-${job}`,role,format,job,title:jobNames[job],file:`views/${role}-${format}-${job}.html`});
  views.push({id:'candidate-pills-no-similar',role:'candidate',format:'pills',job:'buchhaltung',title:'Ohne ähnliche Skills',special:true,file:'views/candidate-pills-no-similar.html'},{id:'candidate-pills-no-open',role:'candidate',format:'pills',job:'buchhaltung',title:'Keine fehlenden Skills',special:true,file:'views/candidate-pills-no-open.html'});
  const grid=document.getElementById('view-grid'),feedback=document.getElementById('palette-feedback');
  const controls=new Map(),frames=new Map();
  for(const field of fields){
    const row=document.createElement('div');row.className='color-field';
    const picker=document.createElement('input');picker.type='color';picker.className='color-picker';picker.id='color-'+field.key;picker.value=palette[field.key];picker.setAttribute('aria-label',field.label+' auswählen');picker.dataset.color=field.key;
    const group=document.createElement('div'),label=document.createElement('label');label.htmlFor=picker.id;label.textContent=field.label;
    const text=document.createElement('input');text.type='text';text.className='color-code';text.value=palette[field.key];text.maxLength=7;text.spellcheck=false;text.autocomplete='off';text.setAttribute('aria-label',field.label+' als Hex-Farbcode');text.dataset.hex=field.key;
    group.append(label,text);row.append(picker,group);document.getElementById(field.secondary?'secondary-colors':'primary-colors').append(row);controls.set(field.key,{picker,text});
    picker.addEventListener('input',()=>setColor(field.key,picker.value));
    text.addEventListener('input',()=>{const v=text.value.trim();if(validHex(v)){text.removeAttribute('aria-invalid');setColor(field.key,v);}else text.setAttribute('aria-invalid','true');});
    text.addEventListener('change',()=>{if(!validHex(text.value.trim())){text.value=palette[field.key];text.removeAttribute('aria-invalid');feedback.textContent='Bitte einen gültigen Farbcode eingeben, z. B. #C6E6D2.';}});
  }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(palette));}catch{feedback.textContent='Die Palette kann in diesem Browser nicht gespeichert werden.';}}
  function syncControls(){for(const [key,control] of controls){control.picker.value=palette[key];control.text.value=palette[key];control.text.removeAttribute('aria-invalid');}}
  const targetOrigin=location.protocol==='file:'?'*':location.origin;
  const allowedOrigin=origin=>location.protocol==='file:'?(origin==='null'||origin===location.origin):origin===location.origin;
  function sendPalette(frame){if(frame.contentWindow){frame.contentWindow.postMessage({type:'andtalents:palette',palette},targetOrigin);frame.contentWindow.postMessage({type:'andtalents:font-scale',scale:fontScale},targetOrigin);if(window.STUDIO_JOB_MAP)frame.contentWindow.postMessage({type:'andtalents:job-map',src:window.STUDIO_JOB_MAP},targetOrigin);if(window.STUDIO_LOGO)frame.contentWindow.postMessage({type:'andtalents:logo',src:window.STUDIO_LOGO},targetOrigin);}}
  function setFontScale(value){fontScale=Math.min(2,Math.max(1,Math.round(value*100)/100));document.getElementById('font-scale').value=String(Math.round(fontScale*100));document.getElementById('font-scale-value').textContent=Math.round(fontScale*100)+' %';document.getElementById('font-smaller').disabled=fontScale<=1;document.getElementById('font-larger').disabled=fontScale>=2;document.getElementById('font-scale').setAttribute('aria-valuetext',Math.round(fontScale*100)+' Prozent');try{localStorage.setItem(fontStorageKey,String(fontScale));}catch{}globalThis.StudioTextScale?.apply(fontScale);for(const frame of frames.values())frame.contentWindow?.postMessage({type:'andtalents:font-scale',scale:fontScale},targetOrigin);}
  function broadcast(){document.documentElement.style.setProperty('--teal',palette.accent);for(const frame of frames.values())sendPalette(frame);}
  function setColor(key,value){palette[key]=value.toLowerCase();if(key==='open')palette.openBar=palette.open;syncControls();persist();broadcast();feedback.textContent='Palette für alle Ansichten aktualisiert.';}
  for(const view of views){
    const card=document.createElement('article');card.className='view-card';card.dataset.view=view.id;if(view.role==='recruiter')card.classList.add('is-recruiter');
    const header=document.createElement('header'),copy=document.createElement('div'),title=document.createElement('h2'),meta=document.createElement('p'),tag=document.createElement('span');
    title.textContent=view.title;meta.textContent=(view.role==='candidate'?'Kandidaten-Perspektive':'Recruiter-Perspektive')+' · '+(view.format==='pills'?'Pillen':'Liste');tag.className='view-tag';tag.textContent=view.special?'Sonderfall':'iPhone 16';
    copy.append(title,meta);header.append(copy,tag);const frame=document.createElement('iframe');frame.title=view.title+' – '+meta.textContent;frame.loading='lazy';if(window.STUDIO_DOCUMENTS?.[view.file])frame.srcdoc=window.STUDIO_DOCUMENTS[view.file];else frame.src=view.file+'?v=score-anchor-20261029-14';frame.dataset.view=view.id;frame.addEventListener('load',()=>sendPalette(frame));
    card.append(header,frame);grid.append(card);view.card=card;frames.set(view.id,frame);
  }
  window.addEventListener('message',event=>{
    if(!allowedOrigin(event.origin))return;
    const frame=[...frames.values()].find(f=>f.contentWindow===event.source);if(!frame)return;
    if(event.data?.type==='andtalents:ready')sendPalette(frame);
    if(event.data?.type==='andtalents:height'&&Number.isFinite(event.data.height)&&event.data.height>100&&event.data.height<4000)frame.style.height=Math.ceil(event.data.height)+'px';
  });
  function filterViews(){
    document.body.classList.toggle('is-recruiter-view',filters.role==='recruiter');
    const stacked=filters.role==='recruiter'&&applicationLayout==='applications';grid.classList.toggle('is-application-list',stacked);document.getElementById('application-layout').hidden=filters.role!=='recruiter';document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===applicationLayout)));
    let visible=0;for(const view of views){const show=(filters.role==='all'||view.role===filters.role)&&(filters.format==='all'||view.format===filters.format)&&(filters.job==='all'||view.job===filters.job||(filters.job==='extreme'&&extremeJobs.includes(view.job)))&&(!view.special||filters.special);view.card.hidden=!show;if(show)visible++;}
    document.getElementById('result-count').textContent=`${visible} von ${views.length} Ansichten`;
    document.getElementById('empty-state').hidden=visible>0;
    document.querySelectorAll('[data-role]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.role===filters.role)));
    document.querySelectorAll('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===filters.format)));
    document.getElementById('job-filter').value=filters.job;document.getElementById('special-filter').checked=filters.special;
  }
  document.getElementById('role-filter').addEventListener('click',e=>{const b=e.target.closest('[data-role]');if(b){filters.role=b.dataset.role;filterViews();}});
  document.getElementById('format-filter').addEventListener('click',e=>{const b=e.target.closest('[data-format]');if(b){filters.format=b.dataset.format;filterViews();}});
  document.getElementById('job-filter').addEventListener('change',e=>{filters.job=e.target.value;filterViews();});
  document.getElementById('application-layout-filter').addEventListener('click',e=>{const button=e.target.closest('[data-layout]');if(button){applicationLayout=button.dataset.layout;filterViews();}});
  document.getElementById('special-filter').addEventListener('change',e=>{filters.special=e.target.checked;filterViews();});
  function showAll(){Object.assign(filters,{role:'all',format:'all',job:'all',special:true});filterViews();}
  document.getElementById('show-all').addEventListener('click',showAll);document.getElementById('empty-show-all').addEventListener('click',showAll);
  document.getElementById('reset-palette').addEventListener('click',()=>{palette={...defaults};syncControls();persist();broadcast();feedback.textContent='Ursprüngliche Farben wiederhergestellt.';});
  document.getElementById('copy-palette').addEventListener('click',async()=>{const text=fields.map(f=>f.label+': '+palette[f.key].toUpperCase()).join('\n');try{await navigator.clipboard.writeText(text);feedback.textContent='Farbcodes kopiert.';}catch{feedback.textContent='Kopieren nicht verfügbar. Die Hex-Codes können direkt markiert werden.';}});
  document.getElementById('font-scale').addEventListener('input',e=>setFontScale(Number(e.target.value)/100));document.getElementById('font-smaller').addEventListener('click',()=>setFontScale(fontScale-.05));document.getElementById('font-larger').addEventListener('click',()=>setFontScale(fontScale+.05));document.getElementById('font-reset').addEventListener('click',()=>setFontScale(1.4));
  filterViews();broadcast();setFontScale(fontScale);
})();
