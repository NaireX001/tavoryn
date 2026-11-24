(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const small=matchMedia('(max-width: 720px)').matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const narrow=()=>innerWidth<900;
let mx=innerWidth/2,my=innerHeight/2;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;},{passive:true});

/* ---------- smooth scroll ---------- */
let lenis=null;
if(!reduce&&window.Lenis){try{lenis=new Lenis({lerp:.09,wheelMultiplier:.95});}catch(e){lenis=null;}}
window.__lenis=lenis;

/* ---------- page transitions ---------- */
const wipe=$('#wipe');
const A=[{clipPath:'polygon(0% 0%,100% 0%,100% 0%,50% 0%,0% 0%)'},{clipPath:'polygon(0% 0%,100% 0%,100% 110%,50% 175%,0% 110%)'}];
const B=[{clipPath:'polygon(0% -70%,50% 0%,100% -70%,100% 180%,0% 180%)'},{clipPath:'polygon(0% 110%,50% 180%,100% 110%,100% 180%,0% 180%)'}];
const EASE='cubic-bezier(.7,0,.3,1)';
(function enter(){const root=document.documentElement;if(!root.classList.contains('wiping'))return;try{sessionStorage.removeItem('vwipe');}catch(e){}
  if(reduce||!wipe.animate){root.classList.remove('wiping');return;}
  wipe.style.visibility='visible';const an=wipe.animate(B,{duration:760,easing:EASE,fill:'forwards',delay:80});root.classList.remove('wiping');
  an.finished.then(()=>{wipe.style.visibility='hidden';}).catch(()=>{});})();
function leave(href){if(reduce||!wipe.animate){location.href=href;return;}wipe.style.visibility='visible';
  wipe.animate(A,{duration:520,easing:EASE,fill:'forwards'}).finished.then(()=>{try{sessionStorage.setItem('vwipe','1');}catch(e){}location.href=href;});}
addEventListener('pageshow',e=>{if(e.persisted){wipe.getAnimations().forEach(a=>a.cancel());wipe.style.visibility='hidden';}});

function scrollToEl(el,offset){if(!el)return;if(lenis)lenis.scrollTo(el,{offset:offset||-80,duration:1.3});else el.scrollIntoView({behavior:reduce?'auto':'smooth'});}
document.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
  if(a.hasAttribute('data-soon')){e.preventDefault();toast(`${a.dataset.soon} will be added before launch.`);return;}
  const href=a.getAttribute('href')||'';
  if(href.startsWith('#')){if(href.length>1){e.preventDefault();closeMenu();scrollToEl($(href));}return;}
  if(/^[\w-]+\.html(#[\w-]+)?$/.test(href)){e.preventDefault();closeMenu();
    const here=location.pathname.split('/').pop()||'index.html';const [file,hash]=href.split('#');
    if(file===here&&hash){scrollToEl($('#'+hash));return;}
    leave(href);}
});

/* ---------- toast / menu / chat / additions ---------- */
let tt;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),3200);}
const menu=$('#menu'),menuBtn=$('#menuBtn');
function openMenu(){menu.classList.add('open');menu.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');lenis&&lenis.stop();}
function closeMenu(){if(!menu.classList.contains('open'))return;menu.classList.remove('open');menu.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');lenis&&lenis.start();}
menuBtn.addEventListener('click',openMenu);$('#menuX').addEventListener('click',closeMenu);
const fab=$('#chatFab'),panel=$('#chatPanel');
function closeChat(){panel.classList.remove('open');fab.setAttribute('aria-expanded','false');}
fab.addEventListener('click',()=>{const o=!panel.classList.contains('open');panel.classList.toggle('open',o);fab.setAttribute('aria-expanded',o);});
$$('[data-talk]').forEach(b=>b.addEventListener('click',()=>{fab.classList.add('show');panel.classList.add('open');fab.setAttribute('aria-expanded','true');}));
addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeChat();}});

/* ---------- magnets, tilt, cursor ---------- */
if(fine&&!reduce){
  $$('.magnet').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${((e.clientX-r.left)/r.width-.5)*14}px,${((e.clientY-r.top)/r.height-.5)*12}px)`;});b.addEventListener('pointerleave',()=>{b.style.transform='';});});
  $$('.tilt').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*7}deg) translateY(-4px)`;});c.addEventListener('pointerleave',()=>{c.style.transform='';});});
}
const ring=$('#cRing'),dot=$('#cDot');let rx=mx,ry=my;
if(fine&&!reduce){ring.hidden=false;dot.hidden=false;addEventListener('pointerover',e=>{ring.classList.toggle('hov',!!e.target.closest('a,button,label,.val'));},{passive:true});}

/* ---------- headline split ---------- */
$$('.ph-h').forEach(h=>{if(reduce)return;const nodes=[...h.childNodes];h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());h.textContent='';let i=0;
  nodes.forEach(n=>{const isEm=n.nodeType===1&&n.tagName==='EM';const target=isEm?document.createElement('em'):null;if(target)h.appendChild(target);
    n.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){(target||h).appendChild(document.createTextNode(' '));return;}
      const w=document.createElement('span');w.className='wd';w.setAttribute('aria-hidden','true');const s=document.createElement('span');s.textContent=part;s.style.setProperty('--i',i++);w.appendChild(s);(target||h).appendChild(w);});});});

/* ---------- reveal on scroll ---------- */
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.remove('rv-pre');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
  $$('.rv').forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.top>innerHeight*0.95){el.classList.add('rv-pre');el.style.transitionDelay=((i%4)*70)+'ms';io.observe(el);}});
}

/* ---------- word scrub ---------- */
const scrubs=$$('.scrub').map(el=>{const nodes=[...el.childNodes];const words=[];el.setAttribute('aria-label',el.textContent);el.textContent='';
  nodes.forEach(n=>{const gold=n.nodeType===1;n.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){el.appendChild(document.createTextNode(' '));return;}const s=document.createElement('span');s.className='w'+(gold?' g':'');s.textContent=part;el.appendChild(s);words.push(s);});});
  return {el,words};});
function updateScrubs(){scrubs.forEach(({el,words})=>{const r=el.getBoundingClientRect();const p=reduce?1:clamp((innerHeight*0.88-r.top)/(innerHeight*0.5+r.height));const n=words.length;
  words.forEach((w,i)=>{const v=(0.14+0.86*clamp(p*(n+3)-i)).toFixed(2);if(w._o!==v){w.style.opacity=v;w._o=v;}});});}
const lightps=$$('.lightp');
function updateLight(){if(reduce)return;const c=innerHeight*0.55;lightps.forEach(p=>{const r=p.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-c);p.style.opacity=(0.22+0.78*clamp(1-d/(innerHeight*0.42))).toFixed(2);});}
const lits=$$('.giant-row');
function updateLits(){lits.forEach(row=>{const r=row.getBoundingClientRect();const q=clamp((innerHeight*0.9-r.top)/(innerHeight*0.5));const sp=$$('span',row);sp.forEach((s,i)=>s.classList.toggle('lit',q>(i+1)/(sp.length+1)));});}

/* ---------- V field canvas ---------- */
const fields=$$('canvas.vfield').map(cv=>{const ctx=cv.getContext('2d');let w=0,h=0;const cx=parseFloat(cv.dataset.cx||'0.72'),cy=parseFloat(cv.dataset.cy||'0.44');const n=small?16:26;
  const zs=Array.from({length:n},(_,i)=>i/n);let speed=0.05;
  function size(){const d=Math.min(devicePixelRatio||1,1.75);w=cv.clientWidth;h=cv.clientHeight;cv.width=Math.round(w*d);cv.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);}
  size();addEventListener('resize',size);
  function draw(t,vel){const r=cv.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;ctx.clearRect(0,0,w,h);
    const ox=w*(narrow()?0.5:cx)-(mx/innerWidth-.5)*40,oy=h*(narrow()?0.36:cy)-(my/innerHeight-.5)*28;
    speed=lerp(speed,0.05+Math.min(0.5,Math.abs(vel)*0.012),0.06);
    const g=ctx.createRadialGradient(ox,oy+h*0.05,0,ox,oy,Math.max(w,h)*0.45);g.addColorStop(0,'rgba(255,190,130,.16)');g.addColorStop(1,'rgba(15,14,13,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    const order=zs.map((z,i)=>i);if(!reduce)for(let i=0;i<n;i++)zs[i]=(zs[i]+speed*0.012)%1;order.sort((a,b)=>zs[a]-zs[b]);
    order.forEach(i=>{const z=zs[i];const s=Math.pow(z,2.3)*Math.max(w,h)*1.25+6;const a=Math.sin(z*Math.PI)*0.6;if(a<0.01)return;
      ctx.save();ctx.translate(ox,oy);ctx.rotate((z-0.5)*0.5+Math.sin(t*0.2+i)*0.02);
      ctx.strokeStyle=`rgba(236,122,34,${a.toFixed(3)})`;ctx.lineWidth=0.8+z*1.6;ctx.beginPath();
      ctx.moveTo(-s*0.22,-s*0.62);ctx.lineTo(-s,-s*0.62);ctx.lineTo(0,s*0.95);ctx.lineTo(s,-s*0.62);ctx.lineTo(s*0.22,-s*0.62);ctx.stroke();
      if(i%3===0){ctx.strokeStyle=`rgba(255,190,130,${(a*0.5).toFixed(3)})`;ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(-s*0.62,-s*0.5);ctx.lineTo(0,s*0.62);ctx.lineTo(s*0.62,-s*0.5);ctx.stroke();}
      ctx.restore();});}
  return draw;});

/* ---------- orbit ---------- */
const orbit=$('.orbit-ring');
/* ---------- ecosystem ---------- */
const eco=$('#eco');
if(eco){const items=JSON.parse(eco.dataset.items);const svg=eco.querySelector('svg');const NS='http://www.w3.org/2000/svg';const R=40;
  const ringC=document.createElementNS(NS,'circle');ringC.setAttribute('cx',50);ringC.setAttribute('cy',50);ringC.setAttribute('r',R);ringC.setAttribute('class','ring');ringC.setAttribute('vector-effect','non-scaling-stroke');svg.appendChild(ringC);
  const pts=items.map((it,i)=>{const a=-Math.PI/2+i*2*Math.PI/items.length;return {x:50+R*Math.cos(a),y:50+R*Math.sin(a),it};});
  const flows=[];
  pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];
    const l=document.createElementNS(NS,'path');l.setAttribute('d',`M50 50 L${p.x} ${p.y}`);l.setAttribute('class','ln');l.setAttribute('vector-effect','non-scaling-stroke');svg.appendChild(l);
    const f=document.createElementNS(NS,'path');f.setAttribute('d',`M50 50 L${p.x} ${p.y}`);f.setAttribute('class','fl');f.setAttribute('vector-effect','non-scaling-stroke');f.style.animationDelay=(i*-0.3)+'s';svg.appendChild(f);flows.push(f);
    const a=document.createElement('a');a.className='eco-node';a.href=p.it[1];a.textContent=p.it[0];a.style.left=p.x+'%';a.style.top=p.y+'%';eco.appendChild(a);
    a.addEventListener('pointerenter',()=>f.classList.add('hi'));a.addEventListener('pointerleave',()=>f.classList.remove('hi'));});
  if('IntersectionObserver' in window){new IntersectionObserver(es=>es.forEach(en=>eco.classList.toggle('live',en.isIntersecting)),{threshold:.3}).observe(eco);}else eco.classList.add('live');}

/* ---------- values accordion (touch) ---------- */
$$('.val').forEach(v=>v.addEventListener('click',()=>{$$('.val').forEach(x=>x.classList.toggle('on',x===v));}));

/* ---------- marquees ---------- */
const mqs=$$('.mq').map((el,i)=>{const html=el.innerHTML;el.innerHTML=html+html+html+html;return {el,x:0,dir:el.classList.contains('alt')?-1:1,w:0};});
function measureMq(){mqs.forEach(m=>{m.w=m.el.scrollWidth/4;});}
function updateMq(vel){if(reduce)return;const boost=Math.min(14,Math.abs(vel)*0.35);mqs.forEach(m=>{m.x-=(0.55+boost)*m.dir;if(m.w){if(m.x<=-m.w)m.x+=m.w;if(m.x>0)m.x-=m.w;}m.el.style.transform=`translate3d(${m.x.toFixed(1)}px,0,0)`;});}

/* ---------- faq ---------- */
$$('.faq-list').forEach(l=>l.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.setAttribute('aria-expanded',b.getAttribute('aria-expanded')!=='true');}));

/* ---------- steps line ---------- */
const stepsEls=$$('.steps4');
function updateSteps(){stepsEls.forEach(s=>{const r=s.getBoundingClientRect();const q=reduce?1:clamp((innerHeight*0.8-r.top)/(innerHeight*0.45));const f=s.querySelector('.fill');if(f)f.style.width=(q*100).toFixed(1)+'%';
  $$('.st',s).forEach((st,i,arr)=>st.classList.toggle('on',q>=(i/arr.length)+0.02));});}

/* ---------- gold band V ---------- */
const gvs=$$('.goldband .gv');
function updateGv(){gvs.forEach(g=>{const r=g.parentElement.getBoundingClientRect();const q=clamp((innerHeight-r.top)/(innerHeight+r.height));g.style.setProperty('--r',((q-.5)*24).toFixed(2)+'deg');});}

/* ---------- work filters ---------- */
const pgrid=$('#pgrid');
if(pgrid){const chips=$('#chips');
  function apply(k){$$('.chip',chips).forEach(c=>c.setAttribute('aria-pressed',c.dataset.k===k));$$('.pcard',pgrid).forEach(c=>c.classList.toggle('out',k!=='all'&&!c.dataset.k.split(' ').includes(k)));}
  chips.addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;apply(c.dataset.k);});
  const h=location.hash.slice(1);if(h&&$(`.chip[data-k="${h}"]`,chips))apply(h);}

/* ---------- mock previews ---------- */
function mock(kind,v){v=+v||0;const c=document.createElement('canvas');c.width=700;c.height=500;const g=c.getContext('2d');
  const rr=(x,y,w,h,r,f)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fillStyle=f;g.fill();};
  const G='#ec7a22',H='#f6f0e6',D='rgba(236,122,34,.22)',E='rgba(255,190,130,.1)';
  const grd=g.createLinearGradient(0,0,700,500);grd.addColorStop(0,'#1f1b14');grd.addColorStop(1,'#0f0e0d');g.fillStyle=grd;g.fillRect(0,0,700,500);
  g.strokeStyle='rgba(236,122,34,.08)';g.lineWidth=1;for(let x=0;x<700;x+=35){g.beginPath();g.moveTo(x,0);g.lineTo(x,500);g.stroke();}for(let y=0;y<500;y+=35){g.beginPath();g.moveTo(0,y);g.lineTo(700,y);g.stroke();}
  if(v){g.save();g.translate(350,250);g.rotate(((v%5)-2)*0.05);const k=1+(v%4)*0.08;g.scale(k,k);g.translate(-350+((v%3)-1)*34,-250+(v%2?22:-12));}
  if(kind==='brand'){rr(60,70,260,260,22,E);g.fillStyle=G;g.beginPath();g.moveTo(120,130);g.lineTo(260,130);g.lineTo(190,270);g.closePath();g.fill();g.fillStyle='#1f1b14';g.beginPath();g.moveTo(160,150);g.lineTo(220,150);g.lineTo(190,210);g.closePath();g.fill();
    ['#ec7a22','#f6f0e6','#d4561a','#16140f','#f7f3eb'].forEach((col,i)=>rr(360+i*62,70,52,150,10,col));rr(360,250,300,18,6,D);rr(360,280,220,18,6,D);rr(60,360,600,90,16,E);g.fillStyle=H;g.font='600 46px Poppins, Arial';g.fillText('Aa',90,422);rr(200,392,300,14,6,D);rr(200,416,200,14,6,D);}
  else if(kind==='web'||kind==='shop'){rr(50,40,600,420,18,'#16140f');rr(50,40,600,40,18,E);[0,1,2].forEach(i=>{g.fillStyle=D;g.beginPath();g.arc(78+i*22,60,6,0,7);g.fill();});
    if(kind==='web'){rr(90,120,300,40,8,G);rr(90,175,250,40,8,'rgba(236,122,34,.55)');rr(90,240,220,14,6,D);rr(90,264,180,14,6,D);rr(90,310,150,46,23,G);rr(420,110,190,250,16,D);g.strokeStyle=G;g.lineWidth=4;g.beginPath();g.moveTo(440,320);g.lineTo(490,240);g.lineTo(530,280);g.lineTo(590,170);g.stroke();rr(90,390,520,40,10,E);}
    else{for(let i=0;i<3;i++){rr(90+i*175,110,150,150,14,D);rr(90+i*175,275,120,14,6,'rgba(255,190,130,.5)');rr(90+i*175,298,70,14,6,G);rr(90+i*175,330,150,40,20,i===1?G:E);}rr(90,395,520,36,10,E);}}
  else if(kind==='seo'){rr(60,60,580,54,27,E);rr(90,80,240,14,6,D);for(let i=0;i<3;i++){rr(60,140+i*80,380,16,6,i===0?G:'rgba(255,190,130,.45)');rr(60,166+i*80,340,12,6,D);rr(60,186+i*80,280,12,6,D);}
    rr(470,140,170,300,16,E);g.strokeStyle=G;g.lineWidth=4;g.beginPath();g.moveTo(490,410);g.lineTo(530,370);g.lineTo(565,385);g.lineTo(600,300);g.lineTo(625,250);g.stroke();}
  else if(kind==='social'){rr(240,30,220,440,30,'#16140f');g.strokeStyle='rgba(236,122,34,.4)';g.lineWidth=2;g.stroke();g.fillStyle=G;g.beginPath();g.arc(285,80,18,0,7);g.fill();rr(312,70,100,12,6,D);
    for(let i=0;i<9;i++)rr(258+(i%3)*64,120+Math.floor(i/3)*64,58,58,8,i%4===0?G:D);rr(258,330,184,40,10,E);rr(60,120,140,90,14,E);rr(500,250,150,90,14,E);g.fillStyle=H;g.font='600 30px Poppins, Arial';g.fillText('♥ 2.4k',512,305);}
  else if(kind==='ai'){const nd=[[120,250],[290,140],[290,360],[460,250],[600,250]];g.strokeStyle='rgba(236,122,34,.5)';g.lineWidth=2;[[0,1],[0,2],[1,3],[2,3],[3,4]].forEach(([a,b])=>{g.beginPath();g.moveTo(...nd[a]);g.bezierCurveTo(nd[a][0]+80,nd[a][1],nd[b][0]-80,nd[b][1],...nd[b]);g.stroke();});
    nd.forEach(([x,y],i)=>{rr(x-55,y-34,110,68,14,i===4?G:'#1f1b14');g.strokeStyle='rgba(236,122,34,.55)';g.stroke();rr(x-35,y-6,70,12,6,i===4?'#16140f':D);});}
  else if(kind==='support'){[[80,80,320,'l'],[300,170,320,'r'],[80,260,280,'l'],[340,350,280,'r']].forEach(([x,y,w,s],i)=>{rr(x,y,w,64,22,s==='r'?G:'#1f1b14');if(s!=='r'){g.strokeStyle='rgba(236,122,34,.4)';g.lineWidth=1.5;g.stroke();}rr(x+22,y+20,w*0.6,10,5,s==='r'?'rgba(15,14,13,.4)':D);rr(x+22,y+36,w*0.4,10,5,s==='r'?'rgba(15,14,13,.3)':D);});}
  else if(kind==='crm'){['Leads','Contacted','Proposal','Won'].forEach((t,i)=>{rr(40+i*160,60,145,380,16,E);g.fillStyle=H;g.font='600 16px Montserrat, Arial';g.fillText(t.toUpperCase(),56+i*160,92);for(let k=0;k<4-i+1;k++)rr(52+i*160,110+k*66,121,54,10,i===3?G:D);});}
  else{rr(60,50,580,300,18,'#16140f');g.fillStyle=G;g.beginPath();g.moveTo(325,160);g.lineTo(385,200);g.lineTo(325,240);g.closePath();g.fill();for(let i=0;i<10;i++)rr(60+i*58,380,52,60,8,i===4?G:D);rr(60,455,580,6,3,E);rr(60,455,250,6,3,G);}
  if(v)g.restore();
  return c.toDataURL('image/jpeg',.85);}
$$('img[data-mock]').forEach(im=>{im.src=mock(im.dataset.mock,im.dataset.v);});
const peek=$('#peek'),peekImg=$('#peekImg');let peekOn=false,px=mx,py=my;const cache={};
if(peek&&fine){$$('[data-peek]').forEach(r=>{r.addEventListener('pointerenter',()=>{const k=r.dataset.peek;cache[k]=cache[k]||mock(k);peekImg.src=cache[k];peekOn=true;});r.addEventListener('pointerleave',()=>{peekOn=false;});});}

/* ---------- forms ---------- */
const SVC_HASH={"svc-branding":"Branding & Visual Identity","svc-websites":"Website Design & Development","svc-seo":"SEO","svc-social":"Social Media Management","svc-ai":"AI & Automation","svc-video":"Video Editing & AI Video","svc-support":"Customer Support","svc-crm":"CRM Solutions","audit":"Not Sure Yet"};
const msf=$('#msf');
if(msf){const steps=$$('.msf-step',msf),prog=$$('.msf-prog div',msf);let cur=0;
  function show(i){cur=i;steps.forEach((s,k)=>s.classList.toggle('cur',k===i));prog.forEach((p,k)=>{p.classList.toggle('cur',k===i);p.classList.toggle('done',k<i);});}
  function valid(i){const req=$$('[required]',steps[i]);const bad=req.find(x=>!x.value.trim()||(x.type==='email'&&!/^\S+@\S+\.\S+$/.test(x.value)));if(bad){bad.focus();toast(bad.type==='email'?'Please enter a valid email address.':'Please fill in the required fields.');return false;}return true;}
  $$('[data-next]',msf).forEach(b=>b.addEventListener('click',()=>{if(valid(cur)){show(cur+1);scrollToEl(msf,-110);}}));
  $$('[data-back]',msf).forEach(b=>b.addEventListener('click',()=>{show(cur-1);scrollToEl(msf,-110);}));
  msf.addEventListener('submit',e=>{e.preventDefault();if(!valid(cur))return;const name=$('#f-name').value.trim().split(' ')[0];
    msf.innerHTML=`<div class="sent"><svg viewBox="0 0 660 346" width="54" aria-hidden="true"><use href="#vmark"/></svg><b>Thank you, ${esc(name)}.</b><p class="body">Thank you for reaching out to TAVORYN. Your enquiry has been received. We'll review your project details and get back to you shortly.</p><p class="note">Preview only: nothing was sent.</p></div>`;scrollToEl(msf,-110);});
  const h=location.hash.slice(1);
  if(SVC_HASH[h]){const box=$$('input[name="services"]',msf).find(x=>x.value===SVC_HASH[h]);if(box)box.checked=true;}
  if(h==='audit'){$('#f-msg').value="I'd like a free website & brand audit. My website or social pages: ";}
  if(h==='feedback'){$('#f-msg').value="I've worked with TAVORYN and I'd like to share my experience.";}
  show(0);}

/* ---------- header tone + loop ---------- */
const toneEls=$$('[data-tone]');
function updateHeader(){const probe=40+(parseFloat(getComputedStyle(document.documentElement).paddingTop)||0);let tone='dark',top=false;
  for(const el of toneEls){const r=el.getBoundingClientRect();if(r.top<=probe&&r.bottom>probe){tone=el.dataset.tone;top=el.classList.contains('ph')&&r.top>-40;break;}}
  document.body.classList.toggle('hdr-light',tone==='light');document.body.classList.toggle('hdr-band',!top);fab.classList.toggle('show',scrollY>240);}
const ftTag=$('#ftTag');
function updateFooter(){if(!ftTag)return;const r=ftTag.getBoundingClientRect();const q=reduce?1:clamp((innerHeight-r.top)/(innerHeight*0.7));ftTag.style.setProperty('--fill',(q*100).toFixed(1)+'%');}
addEventListener('resize',()=>{clearTimeout(measureMq._t);measureMq._t=setTimeout(measureMq,120);});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measureMq);measureMq();

let lastY=scrollY;const t0=performance.now();
function frame(now){if(lenis)lenis.raf(now);const vel=scrollY-lastY;lastY=scrollY;const t=(now-t0)/1000;
  fields.forEach(d=>d(t,vel));
  if(orbit&&!reduce)orbit.style.setProperty('--ry',(t*9+scrollY*0.08).toFixed(2)+'deg');
  updateHeader();updateScrubs();updateLight();updateLits();updateSteps();updateGv();updateMq(vel);updateFooter();
  if(fine&&peek){px=lerp(px,mx,0.16);py=lerp(py,my,0.16);const rot=clamp((mx-px)*0.12,-14,14);peek.style.opacity=peekOn?1:0;peek.style.transform=`translate(${px.toFixed(1)}px,${py.toFixed(1)}px) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${peekOn?1:0.6})`;}
  if(fine&&!reduce){rx=lerp(rx,mx,0.2);ry=lerp(ry,my,0.2);ring.style.transform=`translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;dot.style.transform=`translate(${mx}px,${my}px)`;}
  requestAnimationFrame(frame);}
requestAnimationFrame(frame);
})();

/* ================= NICHE PORTFOLIO ENGINE ================= */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const grid=$('#pfGrid');if(!grid)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const items=$$('.pf-item',grid);
/* reveal: wipe up + settle, only for tiles below the fold */
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const el=en.target;setTimeout(()=>el.classList.remove('pf-pre'),(+el.dataset.col||0)*90);io.unobserve(el);}}),{rootMargin:'0px 0px -6% 0px'});
  items.forEach((el,i)=>{el.dataset.col=i%3;if(el.getBoundingClientRect().top>innerHeight*0.92){el.classList.add('pf-pre');io.observe(el);}});
}
/* filters */
const chips=$('#pfChips');
if(chips)chips.addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;const k=c.dataset.k;
  $$('.chip',chips).forEach(x=>x.setAttribute('aria-pressed',x===c));
  items.forEach(it=>{const show=k==='all'||it.dataset.type===k;it.classList.toggle('out',!show);if(show&&!reduce&&it.animate)it.animate([{opacity:0,transform:'translateY(24px) scale(.97)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.2,.7,.2,1)'});});});
/* viewer */
const lb=$('#lb'),stage=$('#lbMedia'),cnt=$('#lbCount'),capB=$('#lbTitle'),capS=$('#lbDesc');
let cur=-1,lastFocus=null;
const visible=()=>items.filter(i=>!i.classList.contains('out'));
function ratio(it){const ar=(it.querySelector('.pf-media').style.aspectRatio||'4/3').split('/').map(Number);return ar[0]/(ar[1]||1);}
function targetRect(it){const ar=ratio(it);const maxW=innerWidth*(innerWidth<700?0.94:0.8),maxH=innerHeight*0.7;let w=maxW,h=w/ar;if(h>maxH){h=maxH;w=h*ar;}
  return {left:(innerWidth-w)/2,top:Math.max(16,(innerHeight-130-h)/2),width:w,height:h};}
function fill(it){const img=it.querySelector('img');const vsrc=it.dataset.src;stage.innerHTML='';
  if(it.dataset.type==='video'&&vsrc){const v=document.createElement('video');v.src=vsrc;v.controls=true;v.playsInline=true;v.autoplay=true;if(img&&img.src)v.poster=img.src;stage.appendChild(v);}
  else{const im=document.createElement('img');im.src=img?img.src:'';im.alt=it.querySelector('.pf-cap b').textContent;stage.appendChild(im);
    if(it.dataset.type==='video'){const o=document.createElement('div');o.className='vph';o.innerHTML='<i></i>Video placeholder';stage.appendChild(o);}}
  if(it.hasAttribute('data-ph')){const t=document.createElement('span');t.className='ph-tag';t.textContent='Placeholder';stage.appendChild(t);}
  const r=targetRect(it);Object.assign(stage.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  const vis=visible();cnt.textContent=String(vis.indexOf(it)+1).padStart(2,'0')+' / '+String(vis.length).padStart(2,'0');
  capB.textContent=it.querySelector('.pf-cap b').textContent;capS.textContent=it.querySelector('.pf-cap span').textContent;
  const old=capS.parentNode.querySelector('a');if(old)old.remove();if(it.dataset.link){const a=document.createElement('a');a.href=it.dataset.link;a.target='_blank';a.rel='noopener';a.textContent='Visit live site \u2197';capS.parentNode.appendChild(a);}return r;}
function flipFrom(el,r){const t=el.getBoundingClientRect();return `translate(${t.left-r.left}px,${t.top-r.top}px) scale(${t.width/r.width},${t.height/r.height})`;}
function open(it){lastFocus=document.activeElement;cur=items.indexOf(it);const r=fill(it);lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';
  if(window.__lenis)window.__lenis.stop();
  if(!reduce&&stage.animate)stage.animate([{transform:flipFrom(it.querySelector('.pf-media'),r),borderRadius:'20px'},{transform:'none',borderRadius:'18px'}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'});
  setTimeout(()=>$('#lbClose').focus(),80);}
function close(){if(!lb.classList.contains('open'))return;const it=items[cur];const v=stage.querySelector('video');if(v)v.pause();
  const done=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';if(window.__lenis)window.__lenis.start();stage.innerHTML='';lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true});};
  if(!reduce&&stage.animate&&it){const m=it.querySelector('.pf-media');const t=m.getBoundingClientRect();if(t.bottom>0&&t.top<innerHeight){const r=stage.getBoundingClientRect();
    lb.querySelector('.lb-bg').style.opacity=0;stage.animate([{transform:'none'},{transform:flipFrom(m,r)}],{duration:520,easing:'cubic-bezier(.7,0,.3,1)'}).finished.then(()=>{lb.querySelector('.lb-bg').style.opacity='';done();});return;}}
  done();}
function step(d){const vis=visible();let i=vis.indexOf(items[cur]);i=(i+d+vis.length)%vis.length;const it=vis[i];cur=items.indexOf(it);
  if(reduce||!stage.animate){fill(it);return;}
  stage.animate([{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-d*60}px)`}],{duration:220,easing:'ease-in'}).finished.then(()=>{fill(it);stage.animate([{opacity:0,transform:`translateX(${d*60}px)`},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});});}
items.forEach(it=>it.querySelector('.pf-media').addEventListener('click',()=>open(it)));
$('#lbClose').addEventListener('click',close);$('#lbPrev').addEventListener('click',()=>step(-1));$('#lbNext').addEventListener('click',()=>step(1));
lb.querySelector('.lb-bg').addEventListener('click',close);
addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);});
let sx=null;stage.addEventListener('pointerdown',e=>{sx=e.clientX;});stage.addEventListener('pointerup',e=>{if(sx!==null&&Math.abs(e.clientX-sx)>50)step(e.clientX<sx?1:-1);sx=null;});
addEventListener('resize',()=>{if(lb.classList.contains('open'))fill(items[cur]);});
})();

/* ================= BLOG ================= */
(function(){
const bar=document.getElementById('readbar'),art=document.getElementById('article');
if(bar&&art){const tick=()=>{const r=art.getBoundingClientRect();const q=Math.min(1,Math.max(0,(innerHeight*0.3-r.top)/(r.height-innerHeight*0.4)));bar.style.width=(q*100).toFixed(1)+'%';requestAnimationFrame(tick);};requestAnimationFrame(tick);}
const t=document.getElementById('toast');const say=m=>{if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);};
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const u=location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>say('Link copied.')).catch(()=>say('Copy this link from the address bar.'));}));
const nf=document.getElementById('newsForm');
if(nf)nf.addEventListener('submit',e=>{e.preventDefault();const i=nf.querySelector('input');if(!/^\S+@\S+\.\S+$/.test(i.value)){i.focus();say('Please enter a valid email address.');return;}nf.innerHTML='<p class="body" style="color:var(--gold-hi)">You’re on the list. Thanks for subscribing.</p><p class="note">Preview only: nothing was saved.</p>';});
})();
