import React,{useEffect,useMemo,useRef,useState} from 'react';
import {evaluateMoneyPersonality,type SeparatorAnswers,type TraitAnswers} from './classifierV1';
import {MONEY_TYPE_STATE_KEY} from './MoneyPersonalityTelemetry';
import {buildPublicCoreOrder,getOrCreatePublicParticipantId,orderAdaptiveItemIds} from './publicFlowV1';
import {MONEY_RESULT_CONTENT_VERSION} from './resultContentV1';
import {getOrCreateAnonymousUserId} from '../../../persistence-v1';
import {
  buildCognitiveDebriefPayload,COGNITIVE_FLAG_LABEL,emptyCognitiveDebrief,isCognitiveDebriefComplete,
  MONEY_COGNITIVE_LAST_PAYLOAD_KEY,MONEY_COGNITIVE_PILOT_VERSION,MONEY_COGNITIVE_STORAGE_KEY,
  SCREENSHOT_TARGET_LABEL,toggleCognitiveFlag,type CognitiveDebrief,type CognitiveFlag,type CognitiveItemNote,type ScreenshotTarget,
} from './cognitivePilotV1';
import './cognitivePilot.css';

type HistoryEntry={kind:'trait'|'separator';id:string};
type PublicState={
  version:string;sessionId:string;startedAt:string;answers:TraitAnswers;separators:SeparatorAnswers;history:HistoryEntry[];screenCount:number;
};
type LocalState={version:string;sessionId:string;notes:Record<string,CognitiveItemNote>;debrief:CognitiveDebrief;submittedAt:string};
type CurrentTarget={id:string;kind:'trait'|'separator'}|null;

function readPublicState():PublicState|null{
  try{
    const x=JSON.parse(localStorage.getItem(MONEY_TYPE_STATE_KEY)||'null') as PublicState|null;
    return x&&x.sessionId&&x.answers&&x.separators?x:null;
  }catch{return null;}
}
function emptyLocal(sessionId:string):LocalState{return {version:MONEY_COGNITIVE_PILOT_VERSION,sessionId,notes:{},debrief:emptyCognitiveDebrief(),submittedAt:''}}
function loadLocal(sessionId:string):LocalState{
  try{
    const x=JSON.parse(localStorage.getItem(MONEY_COGNITIVE_STORAGE_KEY)||'null') as LocalState|null;
    if(x&&x.version===MONEY_COGNITIVE_PILOT_VERSION&&x.sessionId===sessionId)return {...emptyLocal(sessionId),...x};
  }catch{}
  return emptyLocal(sessionId);
}
function persistLocal(x:LocalState){try{localStorage.setItem(MONEY_COGNITIVE_STORAGE_KEY,JSON.stringify(x))}catch{}}

function deriveCurrentTarget(state:PublicState,participantId:string):{target:CurrentTarget;done:boolean;evaluation:ReturnType<typeof evaluateMoneyPersonality>}{
  const evaluation=evaluateMoneyPersonality(state.answers,state.separators);
  const core=buildPublicCoreOrder(participantId);
  const pendingCore=core.find(x=>state.answers[x.item_id]===undefined);
  if(pendingCore)return {target:{id:pendingCore.item_id,kind:'trait'},done:false,evaluation};
  const adaptive=orderAdaptiveItemIds(evaluation.adaptive.nextItemIds.filter(id=>state.answers[id]===undefined),participantId);
  if(adaptive[0])return {target:{id:adaptive[0],kind:'trait'},done:false,evaluation};
  const sep=evaluation.adaptive.separatorIds.find(id=>(state.separators as Record<string,unknown>)[id]===undefined);
  if(sep)return {target:{id:sep,kind:'separator'},done:false,evaluation};
  return {target:null,done:evaluation.complete,evaluation};
}

async function postPayload(payload:unknown){
  const url=(import.meta as any).env?.VITE_MONEY_PERSONALITY_GAS_URL as string|undefined;
  if(!url)return;
  try{await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),keepalive:true,mode:'no-cors'})}catch{}
}

export default function MoneyPersonalityCognitivePilot(){
  const participantId=useMemo(()=>getOrCreatePublicParticipantId(),[]);
  const anonymousUserId=useMemo(()=>getOrCreateAnonymousUserId(),[]);
  const [publicState,setPublicState]=useState<PublicState|null>(()=>readPublicState());
  const [local,setLocal]=useState<LocalState>(()=>emptyLocal(readPublicState()?.sessionId||''));
  const [open,setOpen]=useState(false);
  const currentRef=useRef<{id:string;kind:'trait'|'separator';started:number}|null>(null);
  const rawRef=useRef('');

  useEffect(()=>{
    const poll=()=>{
      const raw=localStorage.getItem(MONEY_TYPE_STATE_KEY)||'';
      if(raw===rawRef.current)return;
      rawRef.current=raw;
      setPublicState(readPublicState());
    };
    poll();
    const timer=window.setInterval(poll,200);
    return ()=>window.clearInterval(timer);
  },[]);

  useEffect(()=>{
    if(!publicState?.sessionId)return;
    setLocal(prev=>prev.sessionId===publicState.sessionId?prev:loadLocal(publicState.sessionId));
  },[publicState?.sessionId]);

  useEffect(()=>{if(local.sessionId)persistLocal(local)},[local]);

  const derived=useMemo(()=>publicState?deriveCurrentTarget(publicState,participantId):null,[publicState,participantId]);
  const target=derived?.target??null;
  const done=Boolean(derived?.done&&publicState?.startedAt);
  const separatorCount=publicState?Object.keys(publicState.separators).length:0;

  useEffect(()=>{
    const now=performance.now();
    const prev=currentRef.current;
    const nextKey=target?`${target.kind}:${target.id}`:'';
    const prevKey=prev?`${prev.kind}:${prev.id}`:'';
    if(prev&&prevKey!==nextKey){
      const elapsed=Math.max(0,Math.round(now-prev.started));
      setLocal(s=>{
        const old=s.notes[prev.id];if(!old)return s;
        return {...s,notes:{...s.notes,[prev.id]:{...old,totalViewMs:old.totalViewMs+elapsed,lastSeenAt:new Date().toISOString()}}};
      });
      currentRef.current=null;
    }
    if(target&&prevKey!==nextKey){
      const iso=new Date().toISOString();
      setLocal(s=>{
        const old=s.notes[target.id];
        const note:CognitiveItemNote=old
          ?{...old,visitCount:old.visitCount+1,lastSeenAt:iso}
          :{itemId:target.id,kind:target.kind,flags:[],visitCount:1,totalViewMs:0,firstSeenAt:iso,lastSeenAt:iso};
        return {...s,notes:{...s.notes,[target.id]:note}};
      });
      currentRef.current={id:target.id,kind:target.kind,started:now};
    }
  },[target?.id,target?.kind]);

  const toggleFlag=(flag:CognitiveFlag)=>{
    if(!target)return;
    setLocal(s=>{
      const old=s.notes[target.id]||{itemId:target.id,kind:target.kind,flags:[],visitCount:1,totalViewMs:0,firstSeenAt:new Date().toISOString(),lastSeenAt:new Date().toISOString()};
      return {...s,notes:{...s.notes,[target.id]:{...old,flags:toggleCognitiveFlag(old.flags,flag)}}};
    });
  };

  if(!publicState?.startedAt)return null;
  if(!done&&target){
    const note=local.notes[target.id];
    return <aside className="mpp-cog-note" aria-label="Cognitive Pilot question notes">
      <b>テスト用メモ</b><small>気になった時だけ押してください</small>
      <div>{(Object.keys(COGNITIVE_FLAG_LABEL) as CognitiveFlag[]).map(flag=><button type="button" key={flag} className={note?.flags.includes(flag)?'on':''} onClick={()=>toggleFlag(flag)}>{COGNITIVE_FLAG_LABEL[flag]}</button>)}</div>
    </aside>;
  }
  if(!done||!derived?.evaluation.complete||!derived.evaluation.jobCode||!derived.evaluation.style.primary||!derived.evaluation.style.secondary)return null;

  const evaluation=derived.evaluation;
  const complete=isCognitiveDebriefComplete(local.debrief,separatorCount);
  const submitted=Boolean(local.submittedAt);
  const setDebrief=<K extends keyof CognitiveDebrief>(key:K,value:CognitiveDebrief[K])=>setLocal(s=>({...s,debrief:{...s.debrief,[key]:value}}));
  const submit=async()=>{
    if(!complete||submitted)return;
    const completedAt=new Date().toISOString();
    const payload=buildCognitiveDebriefPayload({
      parentSessionId:publicState.sessionId,anonymousUserId,participantId,startedAt:publicState.startedAt,completedAt,itemNotes:local.notes,debrief:local.debrief,
      jobCode:evaluation.jobCode!,jobName:evaluation.jobName||'',primaryStyle:evaluation.style.primary!,secondaryStyle:evaluation.style.secondary!,
      separatorCount,resultContentVersion:MONEY_RESULT_CONTENT_VERSION,userAgent:navigator.userAgent,sourceUrl:window.location.href,
    });
    try{localStorage.setItem(MONEY_COGNITIVE_LAST_PAYLOAD_KEY,JSON.stringify(payload))}catch{}
    setLocal(s=>({...s,submittedAt:completedAt}));
    await postPayload(payload);
  };

  return <>
    <button className="mpp-cog-open" type="button" onClick={()=>setOpen(true)}>{submitted?'Pilot回答済み ✓':'テスト用フィードバック'}</button>
    {open&&<div className="mpp-cog-backdrop" role="dialog" aria-modal="true" aria-label="Cognitive Pilot feedback">
      <section className="mpp-cog-panel">
        <header><div><b>Cognitive Pilot</b><span>診断そのものではなく、テスト用の感想です</span></div><button type="button" onClick={()=>setOpen(false)}>×</button></header>
        {submitted?<div className="mpp-cog-thanks"><b>回答を保存しました</b><p>ありがとう。このデータは質問文・Result・導線の改善にだけ使います。</p></div>:<>
          <Rating title="JOB名は自分っぽい？" value={local.debrief.jobFit} onChange={v=>setDebrief('jobFit',v)} left="全く違う" right="かなり自分っぽい"/>
          <Rating title="Result全体は当たってる？" value={local.debrief.resultFit} onChange={v=>setDebrief('resultFit',v)} left="違う" right="かなり当たる"/>
          <Rating title="質問は理解しやすかった？" value={local.debrief.questionClarity} onChange={v=>setDebrief('questionClarity',v)} left="分かりづらい" right="分かりやすい"/>
          <Rating title="診断の長さはどうだった？" value={local.debrief.lengthComfort} onChange={v=>setDebrief('lengthComfort',v)} left="長すぎる" center="ちょうどいい" right="短すぎる"/>
          {separatorCount>0&&<Rating title="最後の拮抗質問は自然だった？" value={local.debrief.separatorNaturalness} onChange={v=>setDebrief('separatorNaturalness',v)} left="不自然" right="自然"/>}
          <Rating title="この結果、誰かに見せたい？" value={local.debrief.shareIntent} onChange={v=>setDebrief('shareIntent',v)} left="見せない" right="見せたい"/>
          <Rating title="このまま家計診断もやってみたい？" value={local.debrief.householdIntent} onChange={v=>setDebrief('householdIntent',v)} left="進まない" right="進みたい"/>
          <fieldset className="mpp-cog-screenshot"><legend>スクショするならどこ？（複数OK）</legend>{(Object.keys(SCREENSHOT_TARGET_LABEL) as ScreenshotTarget[]).map(x=><label key={x}><input type="checkbox" checked={local.debrief.screenshotTargets.includes(x)} onChange={()=>{const set=new Set(local.debrief.screenshotTargets);if(set.has(x))set.delete(x);else set.add(x);setDebrief('screenshotTargets',[...set])}}/>{SCREENSHOT_TARGET_LABEL[x]}</label>)}</fieldset>
          <label className="mpp-cog-text">一番「自分っぽい」と思ったところ<textarea value={local.debrief.bestFitText} onChange={e=>setDebrief('bestFitText',e.target.value)} placeholder="例：強みのこの部分"/></label>
          <label className="mpp-cog-text">一番「違う」と思ったところ<textarea value={local.debrief.mismatchText} onChange={e=>setDebrief('mismatchText',e.target.value)} placeholder="なければ空欄でOK"/></label>
          <label className="mpp-cog-text">その他、気になったこと<textarea value={local.debrief.comment} onChange={e=>setDebrief('comment',e.target.value)} placeholder="質問が似ていた、長く感じた、など"/></label>
          <p className="mpp-cog-summary">設問メモ：{Object.values(local.notes).filter(x=>x.flags.length).length}問 / 追加質問：{Math.max(0,Object.keys(publicState.answers).length-30)}問 / 拮抗質問：{separatorCount}問</p>
          <button className="mpp-cog-submit" type="button" disabled={!complete} onClick={submit}>フィードバックを保存</button>
          {!complete&&<small className="mpp-cog-required">上の7段階評価{separatorCount>0?'＋拮抗質問評価':''}を入力すると保存できます。</small>}
        </>}
      </section>
    </div>}
  </>;
}

function Rating({title,value,onChange,left,center,right}:{title:string;value:number|null;onChange:(v:number)=>void;left:string;center?:string;right:string}){
  return <div className="mpp-cog-rating"><b>{title}</b><div>{[1,2,3,4,5].map(v=><button type="button" key={v} className={value===v?'on':''} onClick={()=>onChange(v)}>{v}</button>)}</div><small><span>{left}</span>{center&&<span>{center}</span>}<span>{right}</span></small></div>;
}
