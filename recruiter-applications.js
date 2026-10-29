(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
    const main=document.querySelector('.jp-main,.os-main'),header=document.querySelector('.sm-jobbar,.os-jobbar'),meta=document.querySelector('.sm-meta,.os-meta');
    if(!main||!header||!meta)return;
    const shell=document.querySelector('.ip-shell'),screen=document.querySelector('.ip-screen');shell.classList.add('ra-application');shell.setAttribute('aria-label','Bewerbung von Alex M.');shell.setAttribute('role','article');
    const context=document.createElement('header');context.className='ra-job-context';context.setAttribute('aria-label','Zugehöriger Job');
    const label=document.createElement('div');label.className='ra-job-context-label';label.textContent='Bewerbung auf';
    const job=document.createElement('h3');job.className='ra-job-title';job.textContent=meta.textContent.replace(/\u00ad/g,'');context.append(label,job);screen.prepend(context);
    meta.textContent='Hamburg';meta.setAttribute('aria-label','Wohnort: Hamburg');
    main.querySelectorAll('.jd-summary,.jm-card').forEach(el=>el.remove());
    const dock=document.querySelector('.jm-dock');if(!dock)return;
    dock.classList.add('ra-dock');dock.setAttribute('aria-label','Bewerbung entscheiden');
    const actions=document.createElement('div');actions.className='ra-decisions';actions.setAttribute('role','group');actions.setAttribute('aria-label','Bewerbungsaktionen – Designvorschau');
    const feedback=document.createElement('p');feedback.className='jm-feedback';feedback.setAttribute('role','status');feedback.hidden=true;
    for(const [key,text,path] of [['reject','Ablehnen','M18 6 6 18M6 6l12 12'],['accept','Annehmen (15 €)','m5 12 4 4L19 6']]){
      const button=document.createElement('button');button.type='button';button.className='ra-decision ra-'+key;button.dataset.action=key;button.setAttribute('aria-pressed','false');button.title=text+' – Designvorschau';
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',path);svg.append(line);
      button.append(svg,document.createTextNode(text));
      button.addEventListener('click',()=>{
        const active=button.getAttribute('aria-pressed')!=='true';actions.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed',String(active));
        feedback.textContent=active?'Vorschau: Bewerbung '+(key==='accept'?'angenommen.':'abgelehnt.')+' Keine echte Entscheidung übermittelt.':'Vorschau: Entscheidung aufgehoben.';feedback.hidden=false;
      });actions.append(button);
    }
    dock.replaceChildren(actions,feedback);
  });
})();
