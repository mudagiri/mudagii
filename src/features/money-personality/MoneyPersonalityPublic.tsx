import React,{useEffect,useMemo,useRef,useState} from 'react';
import {BIPOLAR_SCALE_LABELS,LIKERT_SCALE_LABELS} from './pilotData';
import {itemById,type PilotItem} from './pilotLogic';
import {evaluateMoneyPersonality,type SeparatorAnswers,type TraitAnswers} from './classifierV1';
import {AXIS_SEPARATOR_ITEMS,buildStyleSeparator,separatorPresentation,type SeparatorId} from './separatorDataV1';
import {buildCoreTraitSideMap,buildPublicCoreOrder,getOrCreatePublicParticipantId,JOB_NUMBER,JOB_ONE_LINERS,newPublicSessionId,normalizePublicBipolarResponse,publicBipolarPresentation,PUBLIC_MONEY_TYPE_VERSION,STYLE_META} from './publicFlowV1';
import './publicMoney.css';

type StoredState={
  version:string;sessionId:string;startedAt:string;answers:TraitAnswers;separators:SeparatorAnswers;screenCount:number;
};
type Choice={value:number;label:string};

const STORAGE_KEY='mudagiri_money_type_public_state_v1';
const blankState=():StoredState=>({version:PUBLIC_MONEY_TYPE_VERSION,sessionId:newPublicSessionId(),startedAt:'',answers:{},separators:{},screenCount:0});
function loadState():StoredState{
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(x&&x.version===PUBLIC_MONEY_TYPE_VERSION&&x.answers&&x.separators)return x as StoredState;
  }catch{}
  return blankState();
}
function saveState(x:StoredState){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(x))}catch{}}
function householdUrl(){
  const path=window.location.pathname.replace(/\/(?:pilot\/money-type|money-type)\/?$/,'/');
  return path||'/';
}
function n(x:number|null){return x===null?0:Math.round(x/5)*5;}

export default function MoneyPersonalityPublic(){
  const participantId=useMemo(()=>getOrCreatePublicParticipantId(),[]);
  const coreOrder=useMemo(()=>buildPublicCoreOrder(participantId),[participantId]);
  const coreSideMap=useMemo(()=>buildCoreTraitSideMap(participantId,coreOrder),[participantId,coreOrder]);
  const [state,setState]=useState<StoredState>(()=>loadState());
  const [active,setActive]=useState(false);
  const [selected,setSelected]=useState<Choice|null>(null);
  const [separatorSelected,setSeparatorSelected]=useState<string|null>(null);
  const shownAt=useRef(0);

  const evaluation=useMemo(()=>evaluateMoneyPersonality(state.answers,state.separators),[state.answers,state.separators]);
  const pendingCore=coreOrder.find(q=>state.answers[q.item_id]===undefined)??null;
  const pendingAdaptiveId=!pendingCore?evaluation.adaptive.nextItemIds.find(id=>state.answers[id]===undefined)??null:null;
  const pendingSeparatorId=!pendingCore&&!pendingAdaptiveId?evaluation.adaptive.separatorIds.find(id=>state.separators[id as keyof SeparatorAnswers]===undefined)??null:null;
  const targetItem=pendingCore??(pendingAdaptiveId?itemById(pendingAdaptiveId):null);
  const done=!pendingCore&&!pendingAdaptiveId&&!pendingSeparatorId&&evaluation.complete;
  const targetKey=targetItem?.item_id??pendingSeparatorId??(done?'RESULT':'NONE');

  useEffect(()=>{saveState(state)},[state]);
  useEffect(()=>{setSelected(null);setSeparatorSelected(null);shownAt.current=performance.now();window.scrollTo({top:0,behavior:'auto'})},[targetKey]);

  const hasSavedProgress=Object.keys(state.answers).length>0||Object.keys(state.separators).length>0;
  const startNew=()=>{const next={...blankState(),startedAt:new Date().toISOString()};setState(next);setActive(true)};
  const resume=()=>{setState(s=>({...s,startedAt:s.startedAt||new Date().toISOString()}));setActive(true)};

  if(!active)return <Intro hasResume={hasSavedProgress} onStart={startNew} onResume={resume}/>;
  if(done)return <Result evaluation={evaluation} onRestart={startNew}/>;
  if(pendingSeparatorId)return <SeparatorScreen id={pendingSeparatorId as SeparatorId} participantId={participantId} evaluation={evaluation} selected={separatorSelected} onSelect={setSeparatorSelected} onNext={()=>{
    if(!separatorSelected)return;
    setState(s=>({...s,separators:{...s.separators,[pendingSeparatorId]:separatorSelected},screenCount:s.screenCount+1} as StoredState));
  }}/>;
  if(!targetItem)return <main className="mpp-page"><section className="mpp-card"><p>判定を準備しています…</p></section></main>;

  const coreAnswered=coreOrder.filter(x=>state.answers[x.item_id]!==undefined).length;
  const adaptiveAnswered=Math.max(0,Object.keys(state.answers).length-coreAnswered);
  const phase=pendingCore?'QUEST':'FOCUS';
  const progress=pendingCore?Math.min(84,(coreAnswered/30)*84):Math.min(95,86+adaptiveAnswered*1.7);
  const presentation=targetItem.family==='BIPOLAR'?publicBipolarPresentation(targetItem,participantId,coreSideMap):null;
  const commit=()=>{
    if(!selected)return;
    const traitValue=targetItem.family==='BIPOLAR'?normalizePublicBipolarResponse(selected.value,presentation!):selected.value;
    setState(s=>({...s,answers:{...s.answers,[targetItem.item_id]:traitValue},screenCount:s.screenCount+1}));
  };

  return <main className="mpp-page"><section className="mpp-shell">
    <header className="mpp-header"><div><span>{phase}</span><small>{pendingCore?'自分のお金のクセを読み取り中':'あなたに合わせて最終調整中'}</small></div><b>{Math.round(progress)}%</b></header>
    <div className="mpp-progress"><i style={{width:progress+'%'}}/></div>
    <article className="mpp-question-card">
      {targetItem.family==='BIPOLAR'&&presentation&&<Bipolar item={targetItem} presentation={presentation} selected={selected} onChoose={setSelected}/>} 
      {targetItem.family==='LIKERT'&&<Likert item={targetItem} selected={selected} onChoose={setSelected}/>} 
    </article>
    <button className="mpp-primary mpp-next" disabled={!selected} onClick={commit}>次へ</button>
    <p className="mpp-footnote">直感でOK。迷ったら「どちらともいえない」でも大丈夫です。</p>
  </section></main>;
}

function Intro({hasResume,onStart,onResume}:{hasResume:boolean;onStart:()=>void;onResume:()=>void}){
  return <main className="mpp-page"><section className="mpp-card mpp-intro">
    <div className="mpp-kicker">MUDAGIRI LEGEND / JOB DIAGNOSIS</div>
    <div className="mpp-rune">✦</div>
    <h1>あなたの<br/><span>MUDAGIRI JOB</span>を解放</h1>
    <p className="mpp-lead">お金の「先を見るか・今を見るか」「考えるか・感覚か」「どう把握するか」から、8つのRPGクラスを解放します。</p>
    <div className="mpp-meta"><div><b>約3〜4分</b><span>サクサク回答</span></div><div><b>基本30問</b><span>必要な時だけ自動調整</span></div></div>
    <div className="mpp-points"><p>正解・不正解なし</p><p>未来と今、両方強くてもOK</p><p>最後にJOB＋属性まで解放</p></div>
    {hasResume&&<button className="mpp-secondary" onClick={onResume}>続きから再開する</button>}
    <button className="mpp-primary" onClick={onStart}>{hasResume?'最初からやり直す':'JOB診断をはじめる'}</button>
  </section></main>;
}

function Bipolar({item,presentation,selected,onChoose}:{item:PilotItem;presentation:ReturnType<typeof publicBipolarPresentation>;selected:Choice|null;onChoose:(x:Choice)=>void}){
  if(item.family!=='BIPOLAR')return null;
  return <><div className="mpp-family-label">どちらのスタンスが自然に近い？</div><div className="mpp-scenario">{item.scenario}</div>
    <div className="mpp-poles"><div><b>A</b><span>{presentation.leftText}</span></div><div><b>B</b><span>{presentation.rightText}</span></div></div>
    <div className="mpp-scale">{BIPOLAR_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
}
function Likert({item,selected,onChoose}:{item:PilotItem;selected:Choice|null;onChoose:(x:Choice)=>void}){
  if(item.family!=='LIKERT')return null;
  return <><div className="mpp-family-label">普段の自分にどれくらい当てはまる？</div><h2>{item.prompt}</h2><div className="mpp-answer-list">{LIKERT_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
}

function SeparatorScreen({id,participantId,evaluation,selected,onSelect,onNext}:{id:SeparatorId;participantId:string;evaluation:ReturnType<typeof evaluateMoneyPersonality>;selected:string|null;onSelect:(x:string)=>void;onNext:()=>void}){
  const item=id==='SEP_STYLE'&&evaluation.style.primary&&evaluation.style.secondary?buildStyleSeparator(evaluation.style.primary,evaluation.style.secondary):id!=='SEP_STYLE'?AXIS_SEPARATOR_ITEMS[id]:null;
  if(!item)return null;
  const p=separatorPresentation(id,participantId,item.choices as any);
  return <main className="mpp-page"><section className="mpp-shell"><header className="mpp-header"><div><span>FINAL SYNC</span><small>かなり拮抗している部分だけ最終確認</small></div><b>97%</b></header><div className="mpp-progress"><i style={{width:'97%'}}/></div>
    <article className="mpp-question-card mpp-separator"><div className="mpp-family-label">どちらも当てはまるあなたへ</div><div className="mpp-scenario">{item.scenario}</div><h2>{item.prompt}</h2><div className="mpp-separator-options"><button className={selected===p.left.value?'selected':''} onClick={()=>onSelect(p.left.value)}>{p.left.text}</button><button className={selected===p.right.value?'selected':''} onClick={()=>onSelect(p.right.value)}>{p.right.text}</button></div></article>
    <button className="mpp-primary mpp-next" disabled={!selected} onClick={onNext}>JOBを確定する</button><p className="mpp-footnote">この質問はスコアを変えず、拮抗した特徴をどちらのJOBとして表現するかだけに使います。</p>
  </section></main>;
}

function Result({evaluation,onRestart}:{evaluation:ReturnType<typeof evaluateMoneyPersonality>;onRestart:()=>void}){
  const job=evaluation.jobCode!;const style=evaluation.style.primary!;const secondary=evaluation.style.secondary!;
  const meta=STYLE_META[style];const sub=STYLE_META[secondary];
  const share=async()=>{
    const text=`私のMUDAGIRI JOBは「${evaluation.jobName}」だった！ ${meta.icon} ${meta.label} STYLE #ムダギリ診断`;
    try{if(navigator.share){await navigator.share({title:'ムダギリ診断',text,url:window.location.href});return}await navigator.clipboard.writeText(text+' '+window.location.href)}catch{}
  };
  const axes=[
    ['時間視野','未来を考える',evaluation.factors.FUTURE.score,'今を活かす',evaluation.factors.IMMEDIATE.score,evaluation.axes.TIME.balanceState],
    ['判断根拠','比較して考える',evaluation.factors.DELIBERATION.score,'感覚を信じる',evaluation.factors.INTUITION.score,evaluation.axes.DECISION.balanceState],
    ['把握リズム','普段から把握',evaluation.factors.MONITORING.score,'節目で確認',evaluation.factors.PERIODIC.score,evaluation.axes.AWARENESS.balanceState],
  ] as const;
  return <main className="mpp-page"><section className="mpp-card mpp-result"><div className="mpp-kicker">⚔ MUDAGIRI CLASS UNLOCKED</div><div className="mpp-job-no">JOB #{JOB_NUMBER[job]}</div><div className="mpp-emblem">✦</div><h1>{evaluation.jobName}</h1><p className="mpp-job-copy">「{JOB_ONE_LINERS[job]}」</p>
    <div className="mpp-style-row"><div><span>属性</span><b>{meta.icon} {meta.label} STYLE</b></div><div><span>副属性</span><b>{sub.icon} {sub.label}</b></div></div>
    <div className="mpp-style-copy">{meta.copy}</div>
    <div className="mpp-axis-block"><h2>あなたの3軸ステータス</h2>{axes.map(([title,a,as,b,bs,state])=><div className="mpp-axis" key={title}><header><b>{title}</b>{state==='BALANCED'&&<em>バランス型</em>}</header><div className="mpp-trait"><span>{a}</span><i><u style={{width:n(as)+'%'}}/></i><strong>{n(as)}</strong></div><div className="mpp-trait"><span>{b}</span><i><u style={{width:n(bs)+'%'}}/></i><strong>{n(bs)}</strong></div></div>)}</div>
    <div className="mpp-next-quest"><span>NEXT QUEST</span><b>実際の家計には、どんな敵が潜んでいる？</b><p>JOBは「攻略の仕方」。次は12カテゴリをスキャンして、本当に改善余地がある場所だけを探します。</p></div>
    <button className="mpp-primary" onClick={()=>{window.location.href=householdUrl()}}>家計クエストへ進む</button><button className="mpp-secondary" onClick={share}>このJOBをシェア</button><button className="mpp-ghost" onClick={onRestart}>もう一度診断する</button>
  </section></main>;
}
