(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ── reveal-on-scroll + counters ── */
let io;
function anim(){
 io&&io.disconnect();
 io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');if(e.target.matches('[data-count]'))count(e.target);io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 $$('.rv,.w,[data-count]').forEach((el,i)=>{el.style.transitionDelay=(el.closest('.hero,.dhero')?i*45:Math.min(i%6*60,300))+'ms';io.observe(el)});
 requestAnimationFrame(()=>$$('.hero .w,.hero .rv,.dhero .w,.dhero .rv').forEach(el=>el.classList.add('on')));
 tilt();
}
function count(el){const raw=el.dataset.count,num=parseInt(raw,10)||0,suf=raw.replace(/[0-9]/g,''),pad=/^0\d/.test(raw);
 if(!num){el.textContent=raw;return}
 let s=null;const dur=1100;
 const step=ts=>{s||(s=ts);const p=Math.min((ts-s)/dur,1),v=Math.round(num*(1-Math.pow(1-p,3)));
  el.textContent=(pad&&v<10?'0':'')+v+suf;if(p<1)requestAnimationFrame(step)};
 requestAnimationFrame(step)}

/* ── tilt on screenshot stacks ── */
function tilt(){
 if(!fine||reduce)return;
 $$('.shot.tilt').forEach(el=>{
  const wrap=el.closest('.slab-shots,.gal-track,.dhero-shots')||el.parentElement;
  if(wrap.dataset.tilt)return;wrap.dataset.tilt='1';
  wrap.addEventListener('pointermove',e=>{
   const r=wrap.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   $$('.shot.tilt',wrap).forEach(s=>{const d=+s.dataset.d||0;
    s.style.transform=`rotateY(${x*17}deg) rotateX(${-y*13}deg) translateZ(${20-d*8}px) translateY(${d*6}px) scale(1.02)`})});
  wrap.addEventListener('pointerleave',()=>$$('.shot.tilt',wrap).forEach(s=>{const d=+s.dataset.d||0;
   s.style.transform=`rotateY(0deg) rotateX(0deg) translateY(${d*10}px)`}));
  wrap.dispatchEvent(new PointerEvent('pointerleave'))});
}

/* ── orbiting hero icons ── */
function orbit(){
 const stage=$('.orbit');if(!stage)return;
 const icons=$$('.orbit-i',stage);if(!icons.length)return;
 const mq=matchMedia('(min-width:960px)');
 const period=18000,minScale=.5,maxScale=1,minOp=.16,maxOp=.95;
 let radius=Math.min(stage.clientWidth,stage.clientHeight)/2*.74,radiusY=Math.min(radius*.32,170);
 addEventListener('resize',()=>{radius=Math.min(stage.clientWidth,stage.clientHeight)/2*.74;radiusY=Math.min(radius*.32,170)});
 function place(a,el){
  const v=(1-Math.cos(a))/2,x=Math.cos(a)*radius,y=Math.sin(a)*radiusY;
  const scale=minScale+(maxScale-minScale)*v;
  el.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) rotateX(36deg) scale(${scale})`;
  el.style.opacity=String(minOp+(maxOp-minOp)*v);
  el.style.zIndex=String(Math.round(v*10));
 }
 function clearInline(){
  icons.forEach(el=>{el.style.transform='';el.style.opacity='';el.style.zIndex=''});
 }
 if(reduce){
  if(mq.matches)icons.forEach((el,i)=>place((i/icons.length)*Math.PI*2,el));
  return;
 }
 let running=false;
 const start=performance.now();
 function frame(now){
  if(!mq.matches){running=false;return;}
  const t=((now-start)%period)/period;
  icons.forEach((el,i)=>place(t*Math.PI*2+(i/icons.length)*Math.PI*2,el));
  requestAnimationFrame(frame);
 }
 function ensureRunning(){
  if(mq.matches&&!running){running=true;requestAnimationFrame(frame);}
  else if(!mq.matches){clearInline();}
 }
 mq.addEventListener?mq.addEventListener('change',ensureRunning):mq.addListener(ensureRunning);
 ensureRunning();
}

/* ── parallax + progress + sticky nav ── */
let par=[],raf=0;
function collect(){par=$$('.par').map(el=>({el,p:+el.dataset.p||.1}))}
function frame(){
 const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
 const prog=$('#prog');if(prog)prog.style.width=(h>0?y/h*100:0)+'%';
 const nav=$('.nav');if(nav)nav.classList.toggle('stuck',y>24);
 if(!reduce)par.forEach(o=>{o.el.style.transform=`translate3d(0,${y*o.p}px,0) rotate(${y*o.p*.05}deg)`});
 const m=$('.mesh');if(m)m.style.opacity=String(Math.max(.12,.55-y/2600));
 raf=0}
addEventListener('scroll',()=>{raf||(raf=requestAnimationFrame(frame))},{passive:true});

/* ── cursor + magnetic ── */
function cursor(){
 if(!fine||reduce)return;
 document.body.classList.add('cursor-on');
 const d=$('.cur'),r=$('.cur-r');if(!d||!r)return;let tx=0,ty=0,rx=0,ry=0;
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;d.style.transform=`translate(${tx}px,${ty}px)`},{passive:true});
 (function loop(){rx+=(tx-rx)*.16;ry+=(ty-ry)*.16;r.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})();
 document.addEventListener('pointerover',e=>{
  const h=e.target.closest('a,button,.shot,.prin-item,.feat');
  document.body.classList.toggle('cur-hot',!!h)});
}
function magnets(){
 if(!fine||reduce)return;
 $$('.mag').forEach(el=>{if(el.dataset.mag)return;el.dataset.mag='1';
  el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();
   el.style.transform=`translate(${(e.clientX-b.left-b.width/2)*.22}px,${(e.clientY-b.top-b.height/2)*.3}px)`});
  el.addEventListener('pointerleave',()=>{el.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';el.style.transform='';setTimeout(()=>el.style.transition='',500)})});
}

/* ── cross-page wipe transition ── */
function isInternal(a){
 if(!a||!a.href)return false;
 if(a.target&&a.target!=='_self')return false;
 if(a.hasAttribute('download'))return false;
 const u=new URL(a.href,location.href);
 if(u.origin!==location.origin)return false;
 if(u.pathname===location.pathname&&u.hash)return false; // same-page anchor
 if(a.href.startsWith('mailto:')||a.href.startsWith('tel:'))return false;
 return true;
}
function wireTransitions(){
 const wipe=$('.wipe');
 if(!wipe||reduce)return;
 document.addEventListener('click',e=>{
  const a=e.target.closest('a');
  if(!a||!isInternal(a))return;
  e.preventDefault();
  const href=a.href;
  wipe.classList.remove('in');wipe.classList.add('out');
  setTimeout(()=>{location.href=href},420);
 });
}
function playWipeIn(){
 const wipe=$('.wipe');
 if(!wipe||reduce)return;
 wipe.classList.remove('out');
 void wipe.offsetWidth;
 wipe.classList.add('in');
}

/* ── boot ── */
function boot(){
 collect();anim();magnets();cursor();frame();wireTransitions();playWipeIn();orbit();
 const pre=$('#pre');
 if(!pre){document.body.classList.remove('locked');return}
 const bar=$('.pre-bar i'),num=$('.pre-num');let p=0;
 const tick=()=>{p=Math.min(100,p+Math.random()*22+10);if(bar)bar.style.width=p+'%';if(num)num.textContent=String(Math.round(p)).padStart(3,'0')+' %';
  if(p<100)setTimeout(tick,70);else setTimeout(()=>{pre.classList.add('gone');document.body.classList.remove('locked')},220)};
 setTimeout(tick,90);
}
document.readyState==='loading'?addEventListener('DOMContentLoaded',boot):boot();
})();
