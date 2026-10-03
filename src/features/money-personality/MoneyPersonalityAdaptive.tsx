import React,{useEffect,useMemo,useRef,useState} from 'react';
import {BIPOLAR_SCALE_LABELS,LIKERT_SCALE_LABELS} from './pilotData';
import {getOrCreatePilotParticipantId,itemById,newPilotSessionId,normalizeTraitScore,type PilotItem} from './pilotLogic';
import {
  JOBS,
  evaluateMoneyPersonality,
  publicCore30ItemIds,
  type EngineEvaluation,
  type JobCode,
  type SeparatorAnswers,
  type StyleId,
  type TraitAnswers,
} from './classifierV1';
import {AXIS_SEPARATOR_ITEMS,buildStyleSeparator,separatorPresentation,type SeparatorId} from './separatorDataV1';
import {buildCoreTraitLeftMap,buildPublicCoreOrder,publicBipolarPresentation,publicPhaseLabel,publicProgressPercent} from './adaptiveLogicV1';
import './adaptive.css';

type AnswerChoice={value:number;label:string};
type FlowEvent={id:string;kind:'core'|'adaptive'|'separator';shownAt:string;answeredAt:string;rtMs:number;rawValue:number|string;normalizedValue:number|string;isReversed?:boolean};
type ResumeState={participantId:string;sessionId:string;startedAt:string;answers:TraitAnswers;separators:SeparatorAnswers;events:FlowEvent[]};

const STORAGE_KEY='mudagiri_money_personality_adaptive_v1';

const JOB_COPY:Record<JobCode,string>={
  FDM:'先を見て、考えて決める。財布の現在地も見失わない。',
  FDP:'先を見据え、節目ごとに作戦を組み直す。',
  FNM:'現在地をつかみながら、先の気配を感覚で読む。',
  FNP:'目的地は先にある。進む道は、その時の感覚で選ぶ。',
  IDM:'いまの状況を見つめ、納得できる一手を選ぶ。',
  IDP:'目の前を見定め、節目でじっくり照準を合わせる。',
  INM:'手元の現在地をつかみながら、いましっくりくる一手を選ぶ。',
  INP:'いまの風を感覚で読み、節目ごとに構えを整える。',
};

const STYLE_LABELS:Record<StyleId,{label:string;icon:string}>= {
  DRIVE:{label:'DRIVE STYLE',icon:'⚔'},
  ENJOY:{label:'ENJOY STYLE',icon:'✦'},
  SECURE:{label:'SECURE STYLE',icon:'🛡'},
  OPTIMIZE:{label:'OPTIMIZE STYLE',icon:'⚙'},
};

const FACTOR_LABELS={
  FUTURE:'未来を考える',IMMEDIATE:'今を活かす',DELIBERATION:'比較して考える',INTUITION:'感覚を信じる',MONITORING:'普段から把握',PERIODIC:'節目で確認',
} as const;

function nowIso(){return new Date().toISOString();}
function roundDisplay(x:number|null){return x==null?0:Math.max(0,Math.min(100,Math.round(x/5)*5));}
function countSeparators(x:SeparatorAnswers){return Object.values(x).filter(Boolean).length;}
function appRoot(){
  const p=window.location.pathname;
  const marker='/pilot/';
  const i=p.indexOf(marker);
  return i>=0?p.slice(0,i+1):'/';
}

function loadResume(participantId:string):ResumeState|null{
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw) as ResumeState;
    return parsed?.participantId===participantId?parsed:null;
  }catch{return null;}
}
function saveResume(state:ResumeState){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}}
function clearResume(){try{localStorage.removeItem(STORAGE_KEY);}catch{}}

async function saveRemote(payload:unknown){
  const url=(import.meta as any).env?.VITE_MUDAGIRI_GAS_URL as string|undefined;
  if(!url)return;
  try{await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),keepalive:true,mode:'no-cors'});}catch{}
}

export default function MoneyPersonalityAdaptive(){
  const params=useMemo(()=>new URLSearchParams(window.location.search),[]);
  const debug=params.get('debug')==='1';
  const participantId=useMemo(()=>params.get('participant')||getOrCreatePilotParticipantId(),[params]);
  const coreOrder=useMemo(()=>buildPublicCoreOrder(participantId),[participantId]);
  const coreSideMap=useMemo(()=>buildCoreTraitLeftMap(participantId,coreOrder),[participantId,coreOrder]);
  const initialResume=useMemo(()=>loadResume(participantId),[participantId]);

  const [stage,setStage]=useState<'intro'|'questions'>(()=>initialResume?'intro':'intro');
  const [sessionId,setSessionId]=useState(()=>initialResume?.sessionId||newPilotSessionId());
  const [startedAt,setStartedAt]=useState(()=>initialResume?.startedAt||'');
  const [answers,setAnswers]=useState<TraitAnswers>(()=>initialResume?.answers||{});
  const [separators,setSeparators]=useState<SeparatorAnswers>(()=>initialResume?.separators||{});
  const [events,setEvents]=useState<FlowEvent[]>(()=>initialResume?.events||[]);
  const [selected,setSelected]=useState<AnswerChoice|null>(null);
  const [separatorSelected,setSeparatorSelected]=useState<string|null>(null);
  const shownPerf=useRef(0);
  const shownIso=useRef('');
  const submitted=useRef(false);

  const evaluation=useMemo(()=>evaluateMoneyPersonality(answers,separators),[answers,separators]);
  const coreSet=useMemo(()=>new Set(publicCore30ItemIds()),[]);
  const coreAnswered=coreOrder.filter(id=>answers[id]!==undefined).length;
  const adaptiveAnswered=Object.keys(answers).filter(id=>!coreSet.has(id)&&answers[id]!==undefined).length;
  const nextCoreId=coreOrder.find(id=>answers[id]===undefined)||null;
  const nextTraitId=nextCoreId||evaluation.adaptive.nextItemIds[0]||null;
  const nextSeparatorId=(!nextTraitId?evaluation.adaptive.separatorIds[0]:null) as SeparatorId|null;
  const complete=!nextTraitId&&!nextSeparatorId&&evaluation.complete;
  const currentKey=nextTraitId||nextSeparatorId||'RESULT';

  useEffect(()=>{
    if(stage!=='questions'||complete)return;
    shownPerf.current=performance.now();
    shownIso.current=nowIso();
    setSelected(null);setSeparatorSelected(null);
  },[stage,currentKey,complete]);

  useEffect(()=>{
    if(stage!=='questions')return;
    saveResume({participantId,sessionId,startedAt,answers,separators,events});
  },[stage,participantId,sessionId,startedAt,answers,separators,events]);

  useEffect(()=>{
    if(!complete||submitted.current)return;
    submitted.current=true;
    const completedAt=nowIso();
    const payload={
      kind:'money_personality_public_adaptive_v1',schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_V1',participantId,sessionId,
      startedAt:startedAt||completedAt,completedAt,durationMs:startedAt?Math.max(0,Date.parse(completedAt)-Date.parse(startedAt)):0,
      answers,separators,events,result:evaluation,questionCount:Object.keys(answers).length+countSeparators(separators),
      sourceUrl:window.location.href,userAgent:navigator.userAgent,
    };
    void saveRemote(payload);
  },[complete,participantId,sessionId,startedAt,answers,separators,events,evaluation]);

  const startNew=()=>{
    clearResume();submitted.current=false;
    setSessionId(newPilotSessionId());setStartedAt(nowIso());setAnswers({});setSeparators({});setEvents([]);setStage('questions');
    window.scrollTo({top:0,behavior:'auto'});
  };
  const continueResume=()=>{if(!startedAt)setStartedAt(nowIso());setStage('questions');window.scrollTo({top:0,behavior:'auto'});};

  const commitTrait=()=>{
    if(!nextTraitId||!selected)return;
    const item=itemById(nextTraitId);
    const answeredAt=nowIso();
    const rtMs=Math.max(0,Math.round(performance.now()-shownPerf.current));
    let normalized=selected.value;
    let reversed=false;
    if(item.family==='BIPOLAR'){
      const p=publicBipolarPresentation(item,participantId,coreSideMap);
      reversed=p.isReversed;
      normalized=normalizeTraitScore(selected.value,p.isReversed);
    }
    const kind:FlowEvent['kind']=coreSet.has(nextTraitId)?'core':'adaptive';
    setAnswers(x=>({...x,[nextTraitId]:normalized}));
    setEvents(xs=>[...xs,{id:nextTraitId,kind,shownAt:shownIso.current||answeredAt,answeredAt,rtMs,rawValue:selected.value,normalizedValue:normalized,isReversed:reversed}]);
    window.scrollTo({top:0,behavior:'auto'});
  };

  const separatorItem=useMemo(()=>{
    if(!nextSeparatorId)return null;
    if(nextSeparatorId!=='SEP_STYLE')return AXIS_SEPARATOR_ITEMS[nextSeparatorId];
    const a=evaluation.style.primary,b=evaluation.style.secondary;
    return a&&b?buildStyleSeparator(a,b):null;
  },[nextSeparatorId,evaluation.style.primary,evaluation.style.secondary]);

  const commitSeparator=()=>{
    if(!nextSeparatorId||!separatorSelected)return;
    const answeredAt=nowIso();
    const rtMs=Math.max(0,Math.round(performance.now()-shownPerf.current));
    const value=separatorSelected as any;
    setSeparators(x=>({...x,[nextSeparatorId]:value}));
    setEvents(xs=>[...xs,{id:nextSeparatorId,kind:'separator',shownAt:shownIso.current||answeredAt,answeredAt,rtMs,rawValue:value,normalizedValue:value}]);
    window.scrollTo({top:0,behavior:'auto'});
  };

  if(stage==='intro')return <Intro hasResume={!!initialResume&&Object.keys(initialResume.answers||{}).length>0} onStart={startNew} onContinue={continueResume}/>;
  if(complete)return <Result evaluation={evaluation} answerCount={Object.keys(answers).length+countSeparators(separators)} onRestart={startNew}/>;

  const hasAdaptive=!nextCoreId&&!!nextTraitId;
  const hasSeparator=!!nextSeparatorId;
  const phase=publicPhaseLabel(coreAnswered,hasAdaptive,hasSeparator);
  const progress=publicProgressPercent(coreAnswered,adaptiveAnswered,hasSeparator,false);

  return <main className="ma-page"><section className="ma-shell">
    <header className="ma-header"><div><span>{phase}</span>{debug&&<em>{currentKey}</em>}</div><b>{Math.max(1,Math.round(progress))}<small>%</small></b></header>
    <div className="ma-progress"><i style={{width:progress+'%'}}/></div>
    {hasAdaptive&&<div className="ma-tune-note"><b>解析の仕上げ中</b><span>あなたの回答に合わせて、輪郭だけもう少し確かめています。</span></div>}
    {hasSeparator&&<div className="ma-tune-note final"><b>FINAL CHECK</b><span>かなり拮抗している部分だけ、最後にひとつ選んでください。</span></div>}
    <article className="ma-question-card">
      {nextTraitId&&<TraitQuestion item={itemById(nextTraitId)} participantId={participantId} sideMap={coreSideMap} selected={selected} onChoose={setSelected}/>} 
      {nextSeparatorId&&separatorItem&&<SeparatorQuestion id={nextSeparatorId} item={separatorItem} participantId={participantId} selected={separatorSelected} onChoose={setSeparatorSelected}/>} 
    </article>
    <button className="ma-primary ma-next" disabled={nextTraitId?!selected:!separatorSelected} onClick={nextTraitId?commitTrait:commitSeparator}>次へ</button>
    <p className="ma-footnote">考えすぎず、「普段の自分」に近い方でOK。</p>
  </section></main>;
}

function Intro({hasResume,onStart,onContinue}:{hasResume:boolean;onStart:()=>void;onContinue:()=>void}){
  return <main className="ma-page"><section className="ma-intro">
    <div className="ma-kicker">MUDAGIRI LEGEND / JOB QUEST</div>
    <div className="ma-rune">✦</div>
    <h1>あなたの<br/><span>MUDAGIRI JOB</span>を解放</h1>
    <p>お金の「考え方・確認の仕方・価値の置きどころ」から、8つのRPGクラスのどれに近いかを診断します。</p>
    <div className="ma-intro-meta"><div><b>約5分</b><span>基本30問</span></div><div><b>8 JOB</b><span>4属性</span></div><div><b>無料</b><span>途中保存</span></div></div>
    <div className="ma-intro-points"><span>正解・不正解なし</span><span>真ん中回答もOK</span><span>必要な部分だけ自動で精密化</span></div>
    {hasResume&&<button className="ma-primary" onClick={onContinue}>続きから冒険する</button>}
    <button className={hasResume?'ma-secondary':'ma-primary'} onClick={onStart}>{hasResume?'最初からやり直す':'JOB診断をはじめる'}</button>
  </section></main>;
}

function TraitQuestion({item,participantId,sideMap,selected,onChoose}:{item:PilotItem;participantId:string;sideMap:Record<string,boolean>;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void}){
  if(item.family==='BIPOLAR'){
    const p=publicBipolarPresentation(item,participantId,sideMap);
    return <><div className="ma-family-label">どちらのスタンスが自然に近い？</div><div className="ma-scenario">{item.scenario}</div><div className="ma-poles"><div><b>A</b><span>{p.leftText}</span></div><div><b>B</b><span>{p.rightText}</span></div></div><div className="ma-scale">{BIPOLAR_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
  }
  if(item.family==='LIKERT')return <><div className="ma-family-label">普段の自分にどのくらい当てはまる？</div><h2>{item.prompt}</h2><div className="ma-answer-list">{LIKERT_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
  return null;
}

function SeparatorQuestion({id,item,participantId,selected,onChoose}:{id:SeparatorId;item:{scenario:string;prompt:string;choices:readonly [{value:string;text:string},{value:string;text:string}]};participantId:string;selected:string|null;onChoose:(x:string)=>void}){
  const p=separatorPresentation(id,participantId,item.choices);
  return <><div className="ma-family-label">FINAL CHECK</div><div className="ma-scenario">{item.scenario}</div><h2>{item.prompt}</h2><div className="ma-separator-grid"><button className={selected===p.left.value?'selected':''} onClick={()=>onChoose(p.left.value)}><b>A</b><span>{p.left.text}</span></button><button className={selected===p.right.value?'selected':''} onClick={()=>onChoose(p.right.value)}><b>B</b><span>{p.right.text}</span></button></div></>;
}

function Result({evaluation,answerCount,onRestart}:{evaluation:EngineEvaluation;answerCount:number;onRestart:()=>void}){
  const code=evaluation.jobCode!;
  const primary=evaluation.style.primary!;
  const secondary=evaluation.style.secondary!;
  const share=async()=>{
    const text=`私のMUDAGIRI JOBは「${JOBS[code]}」\n${STYLE_LABELS[primary].label} / ${STYLE_LABELS[secondary].label}`;
    try{if(navigator.share)await navigator.share({title:'ムダギリ伝説 JOB診断',text});else await navigator.clipboard.writeText(text);}catch{}
  };
  const goHousehold=()=>window.location.assign(appRoot()+'?from=money-job&job='+code.toLowerCase());
  return <main className="ma-page"><section className="ma-result">
    <div className="ma-unlocked">⚔ MUDAGIRI CLASS UNLOCKED</div>
    <div className="ma-emblem">{code}</div>
    <span className="ma-job-no">JOB #{Object.keys(JOBS).indexOf(code)+1}</span>
    <h1>{JOBS[code]}</h1>
    <p className="ma-job-copy">「{JOB_COPY[code]}」</p>
    <div className="ma-style-row"><span>{STYLE_LABELS[primary].icon} {STYLE_LABELS[primary].label}</span><small>副属性：{STYLE_LABELS[secondary].icon} {STYLE_LABELS[secondary].label}</small></div>
    <AxisPanel evaluation={evaluation}/>
    <div className="ma-result-note">JOBはあなたの「考え方・確認リズム」を表すクラス。支出の良し悪しや浪費度を決めつけるものではありません。</div>
    <button className="ma-primary" onClick={goHousehold}>家計クエストへ進む</button>
    <button className="ma-secondary" onClick={share}>結果をシェア</button>
    <button className="ma-ghost" onClick={onRestart}>もう一度診断する</button>
    <div className="ma-answer-count">解析回答数 {answerCount}</div>
  </section></main>;
}

function AxisPanel({evaluation}:{evaluation:EngineEvaluation}){
  const factors=evaluation.factors;
  const rows=[
    ['FUTURE','IMMEDIATE'],['DELIBERATION','INTUITION'],['MONITORING','PERIODIC'],
  ] as const;
  return <div className="ma-axis-panel"><div className="ma-axis-title">あなたの3軸ステータス</div>{rows.map(([a,b])=><div className="ma-axis-pair" key={a}><FactorBar label={FACTOR_LABELS[a]} value={roundDisplay(factors[a].score)}/><FactorBar label={FACTOR_LABELS[b]} value={roundDisplay(factors[b].score)}/><div className="ma-axis-state">{axisStateText(a,evaluation)}</div></div>)}</div>;
}

function FactorBar({label,value}:{label:string;value:number}){return <div className="ma-factor"><div><span>{label}</span><b>{value}</b></div><i><em style={{width:value+'%'}}/></i></div>;}

function axisStateText(first:'FUTURE'|'DELIBERATION'|'MONITORING',evaluation:EngineEvaluation){
  const axis=first==='FUTURE'?evaluation.axes.TIME:first==='DELIBERATION'?evaluation.axes.DECISION:evaluation.axes.AWARENESS;
  if(axis.balanceState==='BALANCED')return axis.absoluteState==='HIGH_HIGH'?'両方強く、かなり拮抗':'かなりバランス型';
  if(axis.balanceState==='LEAN')return 'やや片側寄り';
  return '傾向がはっきり';
}
