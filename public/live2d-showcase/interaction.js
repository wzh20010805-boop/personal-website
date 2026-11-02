import {EXPRESSIONS} from './expressions.js';

export const ACTION_CHOICES = [
 {id:'wave',motion:'挥手',label:'挥手'},
 {id:'hips',motion:'双手叉腰',label:'双手叉腰'},
 {id:'cheer',motion:'Cheer',label:'欢呼'},
 {id:'shy',motion:'Shy',label:'害羞'},
 {id:'tilt',motion:'HeadTilt',label:'歪头'},
 {id:'nod',motion:'轻点头确认 6 秒',label:'点头'},
 {id:'shake',motion:'轻摇头 6 秒',label:'摇头'},
 {id:'look',motion:'左右观察 12 秒',label:'左右观察'},
];

export function createInteractionController({sample:programme,duration,actions}) {
 let mode='paused',playhead=0,selection=null,action=null,serial=0,enteredAt=0;
 const limit=duration-1/30;
 function enter(time) {
  if(mode==='interactive')return;
  const current=programme(playhead);
  selection=Object.fromEntries(['expression','outfit','irisColorL','irisColorR','view'].map(k=>[k,current[k]]));
  enteredAt=time;action=null;mode='interactive';
 }
 function interact(patch,time) {
  for(const [key,value] of Object.entries(patch)) {
   const valid=key==='expression'?EXPRESSIONS.some(e=>e.id===value):key==='view'?['full','face'].includes(value):['outfit','irisColorL','irisColorR'].includes(key)&&[0,1].includes(value);
   if(!valid)throw new Error(`Invalid interaction: ${key}`);
  }
  enter(time);Object.assign(selection,patch);
 }
 function sample(time) {
  if(mode!=='interactive')return {...programme(playhead),motionKey:`programme:${programme(playhead).start}`};
  const running=action&&time-action.startedAt<action.duration;
  return {...selection,time:playhead,idleTime:playhead+Math.max(0,time-enteredAt),
   motion:running?action.motion:null,motionTime:running?Math.max(0,time-action.startedAt):0,
   motionKey:running?`interaction:${action.serial}`:'interaction:idle',
   actionLabel:running?action.label:'自然待机',actorX:960,speechMouth:null,subtitleLine:'',still:false};
 }
 return {
  inspect:()=>({mode,playhead,selection:selection&&{...selection}}),sample,interact,
  action(id,time){const item=actions.find(a=>a.id===id);if(!item)throw new Error(`Unknown action: ${id}`);enter(time);selection.view='full';action={...item,startedAt:time,serial:++serial};},
  idle(time){enter(time);action=null;},
  reset(time){enter(time);selection={expression:'neutral',outfit:0,irisColorL:0,irisColorR:0,view:'full'};action=null;},
  play(){if(playhead>=limit)playhead=0;mode='playing';selection=null;action=null;},
  pause(){if(mode==='playing')mode='paused';},
  seek(time){if(!Number.isFinite(time))throw new Error('Invalid seek');playhead=Math.max(0,Math.min(limit,time));mode='paused';selection=null;action=null;},
  syncTime(time){playhead=Math.max(0,Math.min(limit,time));if(time>=limit)mode='ended';},
 };
}
