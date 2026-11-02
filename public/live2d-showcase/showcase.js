import {sampleTimeline,previewTime,clamp} from './timeline.js';
import {createShowcaseActor} from './renderer.js';
import {EXPRESSIONS} from './expressions.js';
import {ACTION_CHOICES,createInteractionController} from './interaction.js';

const $=id=>document.getElementById(id);
const renderMode=new URLSearchParams(location.search).has('render');
document.body.classList.toggle('render',renderMode);
const [data,audio]=await Promise.all(['./timeline.json','./audio/audio-manifest.json'].map(async url=>{
 const r=await fetch(url);if(!r.ok)throw new Error(`素材加载失败：${url}`);return r.json();
}));
const programme=t=>sampleTimeline(data,t,audio),end=data.duration-1/30;
const mix=new Audio('./audio/showcase-mix.wav');mix.preload=renderMode?'none':'auto';
let actor,controller,last=0,playRequest=0,previousMode='',disposed=false;
const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;

function resize(){
 const box=$('viewport'),interactive=document.body.classList.contains('interactive');
 const height=box.clientHeight-(interactive?62:0);
 const scale=Math.min(box.clientWidth/(interactive&&innerWidth<=900?1080:1920),height/1080);
 $('film').style.transform=`scale(${scale})`;
 $('film').style.left=`${(box.clientWidth-1920*scale)/2}px`;
 $('film').style.top=`${(height-1080*scale)/2}px`;
}
new ResizeObserver(resize).observe($('viewport'));addEventListener('resize',resize);resize();

function paint(t,s){
 $('chapter').textContent=s.chapter||'';$('title').textContent=s.title||'';
 $('subtitle').textContent=s.subtitle||'';$('tag').textContent=s.tag||'';$('detail').textContent=s.detail||'';
 const enter=clamp((t-(s.labelStart||0))/.3);$('tag').style.opacity=String(.3+.7*enter);$('tag').style.translate=`${(1-enter)*16}px 0`;
 $('voice-caption').textContent=s.subtitleLine||'';$('progress').style.width=`${t/data.duration*1920}px`;
 $('number').textContent=String(data.chapters.findIndex(c=>t>=c.start&&t<c.end)+1).padStart(2,'0');
 $('ambient').style.filter=(s.actionLabel?s.outfit:t>=48)?'hue-rotate(12deg)':'none';
 $('seek').value=String(t);$('time').textContent=`${format(t)} / ${format(data.duration)}`;
 document.body.dataset.time=t.toFixed(4);
}
function pressed(button,value){const v=String(value);if(button.getAttribute('aria-pressed')!==v)button.setAttribute('aria-pressed',v);}
function syncUI(){
 const {mode,playhead}=controller.inspect(),s=controller.sample(actor.inspect().liveTime||0),interactive=mode==='interactive';
 if(previousMode!==mode){
  previousMode=mode;document.body.dataset.mode=mode;document.body.classList.toggle('interactive',interactive);
  $('mode-status').textContent={playing:'正在展示',paused:'展示已暂停',interactive:'自由互动中',ended:'展示已结束'}[mode];
  $('play').textContent=interactive?'继续展示':mode==='playing'?'暂停展示':mode==='ended'?'再看一遍':'播放展示';
  $('live-caption').hidden=!interactive;resize();
 }
 $('live-action').textContent=s.actionLabel||'自然待机';
 const expression=EXPRESSIONS.find(e=>e.id===s.expression);
 $('live-look').textContent=`${expression?.label||'自然'} · ${s.outfit?'冬装':'女仆装'} · ${s.irisColorR?'紫':'蓝'}/${s.irisColorL?'紫':'蓝'}瞳`;
 document.querySelectorAll('[data-expression]').forEach(b=>pressed(b,b.dataset.expression===s.expression));
 document.querySelectorAll('[data-action]').forEach(b=>pressed(b,interactive&&b.dataset.motion===s.motion));
 document.querySelectorAll('[data-outfit]').forEach(b=>pressed(b,Number(b.dataset.outfit)===s.outfit));
 document.querySelectorAll('[data-view]').forEach(b=>pressed(b,b.dataset.view===s.view));
 $('iris-r').value=String(s.irisColorR);$('iris-l').value=String(s.irisColorL);
 paint(playhead,interactive?s:programme(playhead));
}
function stopSound(){playRequest++;mix.pause();}
function takeControl(change){
 if(!actor||renderMode)return;
 if(controller.inspect().mode==='playing')controller.syncTime(mix.currentTime);
 stopSound();change(actor.inspect().liveTime||0);
 actor.advanceLive(0,controller.sample);last=performance.now();
 $('playback-note').textContent='展示和声音已暂停。你的选择会保留；点击“继续展示”返回原来的表演。';syncUI();
}
async function play(){
 await ready;if(renderMode)return;
 const request=++playRequest;
 controller.play();mix.currentTime=controller.inspect().playhead;last=performance.now();syncUI();
 $('playback-note').textContent='正在播放原展示与原音轨。随时点击选项，接管角色。';
 try{await mix.play();if(request!==playRequest&&controller.inspect().mode!=='playing')mix.pause();}
 catch{if(request===playRequest){controller.pause();$('playback-note').textContent='声音暂时无法播放，请再次点击播放；也可先体验互动。';syncUI();}}
}
function pause(){if(controller.inspect().mode==='playing')controller.syncTime(mix.currentTime);stopSound();controller.pause();syncUI();}
function seek(t){stopSound();controller.seek(t);mix.currentTime=controller.inspect().playhead;actor.renderAt(controller.inspect().playhead);last=performance.now();$('playback-note').textContent='已定位并暂停。播放后继续展示，也可直接与角色互动。';syncUI();}
function choice(parent,label,attributes,handler){const b=document.createElement('button');b.textContent=label;for(const [k,v] of Object.entries(attributes))b.dataset[k]=v;b.setAttribute('aria-pressed','false');b.addEventListener('click',handler);parent.append(b);}
async function loadActions(){
 const base=new URL('./model/seethrough_parts_v2.model3.json',import.meta.url);
 const index=await fetch(base).then(r=>r.json());
 return Promise.all(ACTION_CHOICES.map(async item=>{
  const reference=index.FileReferences.Motions[item.motion]?.[0];if(!reference)throw new Error(`动作缺失：${item.label}`);
  const clip=await fetch(new URL(reference.File,base)).then(r=>r.json());
  return {...item,duration:clip.Meta.Duration};
 }));
}
const ready=Promise.all([createShowcaseActor($('actor'),programme),renderMode?[]:loadActions()]).then(([result,actions])=>{
 actor=result;controller=createInteractionController({sample:programme,duration:data.duration,actions});
 for(const item of actions)choice($('actions'),item.label,{action:item.id,motion:item.motion},()=>takeControl(t=>controller.action(item.id,t)));
 for(const item of EXPRESSIONS)choice($('expressions'),item.label,{expression:item.id},()=>takeControl(t=>controller.interact({expression:item.id},t)));
 $('loading').hidden=true;$('loading').style.display='none';
 $('interaction-fields').disabled=false;for(const id of ['play','restart','seek','sound'])$(id).disabled=false;
 syncUI();parent.postMessage({type:'showcase-ready'},location.origin);return true;
}).catch(error=>{$('loading').textContent=`角色加载失败：${error.message}`;$('mode-status').textContent='加载失败，请刷新重试';parent.postMessage({type:'showcase-error',message:error.message},location.origin);throw error;});
window.showcase={ready,renderAt:async t=>{await ready;seek(clamp(t,0,end));return {state:programme(controller.inspect().playhead),...actor.inspect()};},inspect:()=>({...actor.inspect(),playback:controller.inspect(),audio:{paused:mix.paused,time:mix.currentTime,muted:mix.muted}}),sample:programme,previewTime:t=>previewTime(data,t)};
addEventListener('message',async event=>{
 if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='showcase-render')return;
 try{await ready;const t=clamp(event.data.preview?previewTime(data,event.data.time):event.data.time,0,end);seek(t);parent.postMessage({type:'showcase-frame',frame:event.data.frame},location.origin);}
 catch(error){parent.postMessage({type:'showcase-error',message:error.message},location.origin);}
});
$('play').onclick=()=>controller.inspect().mode==='playing'?pause():play();
$('restart').onclick=()=>{seek(0);play();};
$('seek').oninput=e=>seek(Number(e.target.value));
$('sound').onclick=()=>{mix.muted=!mix.muted;pressed($('sound'),mix.muted);$('sound').textContent=mix.muted?'开启声音':'静音';};
$('idle').onclick=()=>takeControl(t=>controller.idle(t));
$('reset').onclick=()=>takeControl(t=>controller.reset(t));
for(const button of document.querySelectorAll('[data-outfit]'))button.onclick=()=>takeControl(t=>controller.interact({outfit:Number(button.dataset.outfit)},t));
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>takeControl(t=>controller.interact({view:button.dataset.view},t));
for(const [id,key] of [['iris-r','irisColorR'],['iris-l','irisColorL']])$(id).onchange=e=>takeControl(t=>controller.interact({[key]:Number(e.target.value)},t));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&controller?.inspect().mode==='playing')pause();last=performance.now();});
mix.addEventListener('ended',()=>{controller.syncTime(data.duration);stopSound();syncUI();});
function tick(now){
 if(disposed)return;
 const delta=last?Math.max(0,Math.min(.1,(now-last)/1000)):0;last=now;
 if(actor&&!renderMode&&!document.hidden){
  const mode=controller.inspect().mode;
  if(mode==='playing'||mode==='interactive'){
   if(mode==='playing'){controller.syncTime(mix.currentTime);if(controller.inspect().mode==='ended')stopSound();}
   actor.advanceLive(delta,controller.sample);syncUI();
  }
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
addEventListener('pagehide',e=>{stopSound();controller?.pause();if(!e.persisted){disposed=true;actor?.destroy();}else if(actor)syncUI();});
