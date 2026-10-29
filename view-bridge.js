(() => {
  'use strict';
  const fields=['pass','close','open','extra','openBar','fire','accent','score'];
  const baseURL=new URL(document.baseURI),localFile=baseURL.protocol==='file:';
  const expectedOrigin=localFile?'null':baseURL.origin;
  const targetOrigin=localFile?'*':expectedOrigin;
  const allowedOrigin=origin=>localFile?(origin==='null'||origin==='file://'):origin===expectedOrigin;
  function apply(palette){if(!palette||!fields.every(k=>/^#[0-9a-f]{6}$/i.test(palette[k])))return;for(const key of fields)document.body.style.setProperty('--studio-'+key,palette[key]);}
  window.addEventListener('message',event=>{
    if(event.source!==parent||!allowedOrigin(event.origin))return;
    if(event.data?.type==='andtalents:palette')apply(event.data.palette);
    if(event.data?.type==='andtalents:font-scale'&&typeof event.data.scale==='number')globalThis.StudioTextScale?.apply(event.data.scale);
    if(event.data?.type==='andtalents:job-map'&&typeof event.data.src==='string'&&/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(event.data.src)&&event.data.src.length<500000){const img=document.querySelector('.jm-card img');if(img&&img.src!==event.data.src)img.src=event.data.src;}
    if(event.data?.type==='andtalents:logo'&&typeof event.data.src==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(event.data.src)&&event.data.src.length<250000){const img=document.querySelector('.studio-logo');if(img&&img.src!==event.data.src)img.src=event.data.src;}
  });
  function report(){parent.postMessage({type:'andtalents:height',height:document.querySelector('.ip-shell')?.getBoundingClientRect().height||document.documentElement.scrollHeight},targetOrigin);}
  function fireItems(){
    if(document.querySelector('.jp-pill'))return [...document.querySelectorAll('.jp-pill')].map(el=>({kind:el.dataset.kind,state:el.dataset.fire||'none',name:el.querySelector('.jp-own-name')?.textContent||el.textContent}));
    return [...document.querySelectorAll('.os-row,.os-extras li')].map(el=>({kind:el.dataset.status==='open'?'gap':el.dataset.status||'extra',state:el.querySelector('.os-fire')?.dataset.fire||'none',name:el.querySelector('.os-name')?.textContent||el.textContent}));
  }
  function flame(filled){const el=document.createElement('i');el.dataset.lucide='flame';el.className='fs-flame'+(filled?' is-filled':'');el.setAttribute('aria-hidden','true');return el;}
  function fitMap(){
    const app=document.querySelector('.jp-app,.os-app');if(app)document.body.classList.toggle('jm-scrollable',app.scrollHeight>app.clientHeight+1);
  }
  function fitPreview(){const shell=document.querySelector('.ip-shell'),width=document.body.dataset.perspective==='candidate'?405:393;if(shell)shell.style.zoom=String(Math.min(1,innerWidth/width));fitMap();report();}
  window.addEventListener('resize',fitPreview);
  document.addEventListener('andtalents:typography-updated',()=>requestAnimationFrame(fitPreview));
  function renderFire(){
    document.body.dataset.fireMode='bar';fitPreview();
    document.querySelectorAll('.fs-panel,.fs-bar-marker').forEach(el=>el.remove());
    const coverage=document.querySelector('.sm-coverage,.os-coverage');
    if(!coverage)return;
    coverage.classList.add('fs-marked-bar');
    const items=fireItems();
    const ordered=['pass','close','gap'].flatMap(kind=>items.filter(s=>s.kind===kind));
      [...coverage.children].forEach((unit,index)=>{
        const item=ordered[index];if(!item||!['both','job','own'].includes(item.state))return;
        const marker=document.createElement('span');marker.className='fs-bar-marker';marker.dataset.fire=item.state;marker.append(flame(item.state==='both'));
        marker.title=item.name+': '+(item.state==='both'?'Fire Skill auf beiden Seiten':item.state==='job'?'Nur im Job als Fire Skill markiert':'Nur im Kandidatenprofil als Fire Skill markiert');unit.append(marker);
      });
    globalThis.lucide?.createIcons({attrs:{width:14,height:14}});report();
  }
  function enhance(){
    const industries={buchhaltung:'Handel',debitoren:'Logistik',controlling:'Industrie',finanzbuchhaltung:'Finanzdienstleistungen',bilanzbuchhaltung:'Wirtschaftsprüfung',softwareentwicklung:'IT & Software'};
    const rootId=document.querySelector('.ip-shell')?.parentElement.id||'',job=Object.keys(industries).find(key=>rootId.endsWith('-'+key))||'buchhaltung';
    const candidateMeta=document.querySelector('.sm-meta,.os-meta');if(candidateMeta?.textContent.trim()==='Hamburg'){candidateMeta.textContent='Hamburg · '+industries[job];candidateMeta.dataset.industry=industries[job];}
    const title=document.querySelector('.sm-title,.os-job'),meta=document.querySelector('.sm-meta,.os-meta');document.body.classList.toggle('has-long-job-title',(title?.textContent.length||0)>45||(meta?.textContent.length||0)>45);
    const brand=document.querySelector('.jp-brandbar,.os-brand');if(brand){const logo=document.createElement('img');logo.className='studio-logo';logo.alt='&TALENTS';logo.width=136;logo.height=22;logo.addEventListener('load',fitPreview);if(location.href!=='about:srcdoc')logo.src=new URL('../assets/andtalents-logo.jpg',document.baseURI).href;brand.replaceChildren(logo);}
    document.querySelectorAll('.rc-skills-head,.os-list-heading,.studio-priority').forEach(el=>{if(el.classList.contains('os-list-heading')){el.parentElement.removeAttribute('aria-labelledby');el.parentElement.setAttribute('aria-label','Skill-Abgleich');}el.remove();});
    document.querySelectorAll('.sm-score,.os-score').forEach(el=>{const value=Number(el.textContent.trim().replace(',','.'));if(Number.isFinite(value)&&value>=0&&value<=1){const percent=Math.round(value*100);el.dataset.scoreValue=String(value);el.textContent=percent+' %';el.setAttribute('aria-label','Match-Score: '+percent+' Prozent');}});
    document.querySelectorAll('.sm-counts > span,.os-counts > span').forEach(group=>{const count=Number(group.querySelector('strong')?.textContent);group.hidden=count===0;if(/\b(?:offen|fehlen|fehlt)\b/.test(group.textContent)){for(const node of group.childNodes)if(node.nodeType===Node.TEXT_NODE)node.textContent=count===1?' fehlt':' fehlen';}});
    const extras=document.querySelector('.os-extras');if(extras)extras.closest('section').hidden=extras.children.length===0;
  }
  function renderDescription(){
    const main=document.querySelector('.jp-main,.os-main');if(!main||main.querySelector('.jd-summary'))return;
    const descriptions={
      buchhaltung:'Du prüfst Belege und buchst Geschäftsvorfälle. Für den Monatsabschluss stimmst du Konten ab und klärst Rückfragen mit deinem Team.',
      debitoren:'Du prüfst Zahlungseingänge und betreust offene Kundenposten. Bei Rückfragen zur Abrechnung sprichst du mit Kunden und dem Vertrieb.',
      controlling:'Du wertest Kennzahlen aus und planst Budgets mit den Fachbereichen. Deine Reports helfen dem Team, Kosten zu prüfen und Investitionen abzuwägen.',
      finanzbuchhaltung:'Du kümmerst dich um Zahlungen und Reisekosten und bereitest Monatsabschlüsse vor. Geschäftsvorfälle buchst du in DATEV, Auswertungen erstellst du mit Excel.',
      bilanzbuchhaltung:'Du erstellst Jahresabschlüsse und Steuerbilanzen. Bei der Konzernrechnungslegung nach IFRS stimmst du dich mit dem Team und den Wirtschaftsprüfern ab.',
      softwareentwicklung:'Du entwickelst Webanwendungen mit TypeScript und React. Mit deinem Team setzt du Schnittstellen um, prüfst Code und schreibst automatisierte Tests.'
    };
    const rootId=document.querySelector('.ip-shell')?.parentElement.id||'';const job=Object.keys(descriptions).find(key=>rootId.endsWith('-'+key))||'buchhaltung';
    const summary=document.createElement('blockquote');summary.className='jd-summary';summary.setAttribute('aria-label','Kurzbeschreibung des Beispieljobs');summary.textContent='„'+descriptions[job]+'“';main.append(summary);
  }
  function renderMap(){
    const main=document.querySelector('.jp-main,.os-main');if(!main||main.querySelector('.jm-card'))return;
    const card=document.createElement('section');card.className='jm-card';card.setAttribute('aria-label','Jobadresse – Beispieladresse in Hamburg');
    const head=document.createElement('div');head.className='jm-heading';const title=document.createElement('h3');title.textContent='Arbeitsort';
    const address=document.createElement('address');address.className='jm-address';address.textContent='Rathausmarkt 1, 20095 Hamburg';address.title='Beispieladresse – kein echter Arbeitgeberstandort';address.setAttribute('aria-label','Beispieladresse: Rathausmarkt 1, 20095 Hamburg');head.append(title,address);
    const map=document.createElement('div');map.className='jm-map';const link=document.createElement('a');link.className='jm-map-open';link.href='https://www.openstreetmap.org/?mlat=53.550364&mlon=9.992346#map=17/53.550364/9.992346';link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Beispieladresse Rathausmarkt 1 auf OpenStreetMap öffnen');
    const img=document.createElement('img');img.alt='Straßenausschnitt Hamburg-Altstadt rund um den Rathausmarkt';img.width=760;img.height=220;img.addEventListener('load',fitPreview);
    if(location.href!=='about:srcdoc')img.src=new URL('../assets/job-location-hamburg.svg',document.baseURI).href;
    const pin=document.createElement('span');pin.className='jm-pin';pin.setAttribute('aria-hidden','true');link.append(img,pin);
    const attribution=document.createElement('a');attribution.className='jm-attribution';attribution.href='https://www.openstreetmap.org/copyright';attribution.target='_blank';attribution.rel='noopener noreferrer';attribution.textContent='© OpenStreetMap contributors';
    const icon=name=>{const i=document.createElement('i');i.dataset.lucide=name;return i;};
    const zoom=document.createElement('div');zoom.className='jm-zoom';zoom.setAttribute('role','group');zoom.setAttribute('aria-label','Kartenzoom');let scale=1;
    for(const [name,label,step] of [['plus','Karte vergrößern',.25],['minus','Karte verkleinern',-.25]]){const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label);button.title=label;button.textContent=name==='plus'?'+':'−';button.addEventListener('click',()=>{scale=Math.min(2.5,Math.max(1,scale+step));img.style.transform='scale('+scale+')';map.dataset.zoom=String(scale);zoom.querySelector('button:last-child').disabled=scale===1;zoom.querySelector('button:first-child').disabled=scale===2.5;});zoom.append(button);}
    zoom.lastElementChild.disabled=true;map.dataset.zoom='1';map.append(link,zoom,attribution);
    const actions=document.createElement('div');actions.className='jm-actions';actions.setAttribute('role','group');actions.setAttribute('aria-label','Jobaktionen – Designvorschau');
    const feedback=document.createElement('p');feedback.className='jm-feedback';feedback.setAttribute('role','status');feedback.hidden=true;
    for(const [key,label,name] of [['reject','Ablehnen','x'],['save','Speichern','bookmark'],['apply','Bewerben','send']]){
      const button=document.createElement('button');button.type='button';button.className='jm-action jm-'+key;button.dataset.action=key;button.setAttribute('aria-label',label);button.title=label+' – Designvorschau';if(key!=='apply')button.setAttribute('aria-pressed','false');button.append(icon(name));
      button.addEventListener('click',()=>{if(key!=='apply'){const active=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(active));feedback.textContent=key==='save'?(active?'Vorschau: Job gespeichert.':'Vorschau: Speicherung aufgehoben.'):(active?'Vorschau: Job abgelehnt.':'Vorschau: Ablehnung aufgehoben.');}else feedback.textContent='Designvorschau – keine Bewerbung versendet.';feedback.hidden=false;fitPreview();});actions.append(button);
    }
    card.append(head,map);main.append(card);
    const dock=document.createElement('footer');dock.className='jm-dock';dock.setAttribute('aria-label','Feste Jobaktionen');dock.append(actions,feedback);document.querySelector('.ip-home').before(dock);fitPreview();
  }
  function pinCandidateHeader(){
    if(document.body.dataset.perspective!=='candidate')return;
    const screen=document.querySelector('.ip-screen'),app=document.querySelector('.jp-app,.os-app'),brand=app?.querySelector('.jp-brandbar,.os-brand'),jobbar=app?.querySelector('.sm-jobbar,.os-jobbar'),overview=app?.querySelector('.sm-overview,.os-overview');
    if(!screen||!app||!brand||!jobbar||!overview)return;
    document.querySelector('.ip-shell').setAttribute('aria-label','iPhone 16 – Display 393 mal 852 Bildpunkte');
    const pinned=document.createElement('div');pinned.className='candidate-fixed-header';pinned.setAttribute('aria-label','Angepinnter Job und Skill-Match');
    const appStyle=getComputedStyle(app);for(const property of appStyle)if(/^--(?:jp|os)-/.test(property))pinned.style.setProperty(property,appStyle.getPropertyValue(property));
    const summary=document.createElement('div');summary.className='candidate-fixed-summary';summary.append(jobbar,overview);pinned.append(brand,summary);app.before(pinned);fitPreview();
  }
  document.addEventListener('DOMContentLoaded',()=>{enhance();renderFire();renderDescription();renderMap();pinCandidateHeader();globalThis.lucide?.createIcons({attrs:{width:14,height:14}});new ResizeObserver(report).observe(document.body);parent.postMessage({type:'andtalents:ready'},targetOrigin);report();});
})();
