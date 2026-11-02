export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function sampleTimeline(data,seconds,audio={narration:[]}){
 const t=clamp(seconds,0,data.duration-1e-6);
 const chapter=data.chapters.find(c=>t>=c.start&&t<c.end)||data.chapters.at(-1);
 const expression=t>=10&&t<27?data.expressions.findLast(e=>e.start<=t):null;
 // Appearance cues persist independently of chapter/motion changes.
 const outfit=data.outfits.findLast(cue=>cue.start<=t)?.value??0;
 const speech=(audio.narration||[]).find(s=>t>=s.start&&t<s.start+s.duration);
 let speechMouth=null;
 if(speech){const values=speech.envelope||[];const p=(t-speech.start)*(speech.envelope_fps||30),i=Math.floor(p);speechMouth=clamp((values[i]||0)*(1-p+i)+(values[i+1]||0)*(p-i));}
 return {...chapter,time:t,motion:chapter.motion||null,motionTime:(t-chapter.start)*(chapter.speed||1),
  expression:expression?.id||chapter.expression,tag:expression?.label||(t>=54.5&&t<56?'紫蓝异色瞳':chapter.tag),
  detail:expression?.note||(t>=53&&t<56?(t<54.5?'画面左蓝 / 右紫':'画面左紫 / 右蓝'):''),outfit,irisColorL:t>=53? (t<54.5?1:(t<56?0:1)) : (chapter.irisColorL||0),irisColorR:t>=54.5&&t<56?1:0,
  actorX:chapter.view==='face'?1300:1290,speechMouth,subtitleLine:speech?.text||'',
  labelStart:expression?.start||(t>=54.5&&t<56?54.5:chapter.start)};
}
export function previewTime(data,t){let cursor=0;for(const cut of data.previewCuts){const duration=cut.to-cut.from;if(t<cursor+duration)return cut.from+t-cursor;cursor+=duration;}return data.previewCuts.at(-1).to-1/30;}
