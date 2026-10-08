import React,{useEffect,useMemo,useRef,useState} from 'react';
import {LIKERT_SCALE_LABELS} from './pilotData';
import {itemById,type PilotItem} from './pilotLogic';
import {evaluateMoneyPersonality,type JobCode,type SeparatorAnswers,type StyleId,type TraitAnswers} from './classifierV1';
import {AXIS_SEPARATOR_ITEMS,buildStyleSeparator,separatorPresentation,type SeparatorId} from './separatorDataV1';
import {
  buildCoreTraitSideMap,buildPublicCoreOrder,displayScore,FACTOR_PUBLIC_LABEL,getOrCreatePublicParticipantId,
  newPublicSessionId,normalizePublicBipolarResponse,orderAdaptiveItemIds,
  publicBipolarPresentation,publicPhaseLabel,publicProgress,PUBLIC_MONEY_TYPE_VERSION,
} from './publicFlowV1';
import ResultV17 from './ResultV17';
import AdventurerClassUnlockV1 from './AdventurerClassUnlockV1';
import {resultV9For} from './resultV9Content';
import {resultV10InsightFor} from './resultV10Insight';
import JobEncyclopediaV1 from './JobEncyclopediaV1';
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import {PERSONALITY_SCENE_VISUALS,measurementVisual} from './mudagiri-personality-visual-v1';
import './publicMoney.css';
import './mudagiri-motion.css';
import './personality-mudagiri.css';
import './money-personality-polish-v3.css';
import './money-personality-device-final-v6.css';
import './money-result-v4.css';
import './money-personality-human-design-v1.css';

type HistoryEntry={kind:'trait'|'separator';id:string};
type StoredState={version:string;sessionId:string;startedAt:string;answers:TraitAnswers;separators:SeparatorAnswers;history:HistoryEntry[];screenCount:number};
type Choice={value:number;label:string};
type MudagiriVisual=React.ComponentProps<typeof MoneyPersonalityMudagiri>['visual'];

const STORAGE_KEY='mudagiri_money_type_public_state_v1';
const REVEAL_KEY='mudagiri_money_personality_seen_reveal_v1';
const BIPOLAR_PUBLIC_LABELS=['Aにかなり近い','ややAに近い','半々','ややBに近い','Bにかなり近い'] as const;
const blankState=():StoredState=>({version:PUBLIC_MONEY_TYPE_VERSION,sessionId:newPublicSessionId(),startedAt:'',answers:{},separators:{},history:[],screenCount:0});
function loadState():StoredState{try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(x&&x.version===PUBLIC_MONEY_TYPE_VERSION&&x.answers&&x.separators)return {...blankState(),...x,history:Array.isArray(x.history)?x.history:[]} as StoredState}catch{}return blankState()}
function saveState(x:StoredState){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(x))}catch{}}
function householdUrl(){const path=window.location.pathname.replace(/\/(?:pilot\/money-type|money-type)\/?$/,'/');return path||'/'}
const BOOK_JOBS=new Set<JobCode>(['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP']);
const BOOK_STYLES=new Set<StyleId>(['DRIVE','ENJOY','SECURE','OPTIMIZE']);
function moneyTypeBookUrl(job:JobCode,style:StyleId){
 const url=new URL(window.location.href);
 url.searchParams.set('book','1');
 url.searchParams.set('job',job);
 url.searchParams.set('style',style);
 url.searchParams.delete('resumeResult');
 return url.pathname+'?'+url.searchParams.toString();
}
function moneyTypeReturnUrl(){
 const url=new URL(window.location.href);
 url.searchParams.delete('book');
 url.searchParams.delete('job');
 url.searchParams.delete('style');
 url.searchParams.set('resumeResult','1');
 return url.pathname+'?'+url.searchParams.toString();
}
function progressComment(screenCount:number,coreAnswered:number,adaptiveAnswered:number){if(adaptiveAnswered===1)return 'あと少し！ここからは、迷ったところだけ確認していくぞ。';if(coreAnswered===27)return 'あともう少し！考えすぎず、いつもの自分でいこう。';if(coreAnswered===20)return 'ここまで来た！お金のクセがかなり見えてきたぞ。';if(coreAnswered===10)return 'いい感じ！だいぶ輪郭が見えてきたぞ。';if(screenCount===0)return '正解はないぞ。理想より、普段の自分で選んでくれ！';return ''}
function QuestionCompanion({visual,line}:{visual:MudagiriVisual;line?:string}){return <div className={`mpp-measurement-companion${line?' has-talk':''}`}><MoneyPersonalityMudagiri visual={visual} alt=""/>{line&&<div className="mpp-progress-talk">{line}</div>}</div>}

export default function MoneyPersonalityPublic(){
 const params=useMemo(()=>new URLSearchParams(window.location.search),[]);const debug=params.get('debug')==='1';const requestedBookJob=params.get('job') as JobCode|null;const requestedBookStyle=params.get('style') as StyleId|null;const standaloneBook=params.get('book')==='1'&&!!requestedBookJob&&!!requestedBookStyle&&BOOK_JOBS.has(requestedBookJob)&&BOOK_STYLES.has(requestedBookStyle);
 useEffect(()=>{
   if(!standaloneBook)return;
   const html=document.documentElement;
   const body=document.body;
   const root=document.getElementById('root');
   const prevHtml=html.style.cssText;
   const prevBody=body.style.cssText;
   const prevRoot=root?.style.cssText||'';

   for(const el of [html,body]){
     el.style.setProperty('position','static','important');
     el.style.setProperty('inset','auto','important');
     el.style.setProperty('width','100%','important');
     el.style.setProperty('height','100%','important');
     el.style.setProperty('min-height','100%','important');
     el.style.setProperty('max-height','100%','important');
     el.style.setProperty('overflow','hidden','important');
     el.style.setProperty('overscroll-behavior','none','important');
     el.style.setProperty('touch-action','auto','important');
   }
   if(root){
     root.style.setProperty('position','static','important');
     root.style.setProperty('inset','auto','important');
     root.style.setProperty('display','block','important');
     root.style.setProperty('width','100%','important');
     root.style.setProperty('height','100dvh','important');
     root.style.setProperty('min-height','100dvh','important');
     root.style.setProperty('max-height','100dvh','important');
     root.style.setProperty('overflow','hidden','important');
     root.style.setProperty('touch-action','auto','important');
   }
   html.classList.add('mpp-book-native-scroll-active');
   body.classList.add('mpp-book-native-scroll-active');
   root?.classList.add('mpp-book-native-scroll-active');
   window.scrollTo(0,0);

   return ()=>{
     html.classList.remove('mpp-book-native-scroll-active');
     body.classList.remove('mpp-book-native-scroll-active');
     root?.classList.remove('mpp-book-native-scroll-active');
     html.style.cssText=prevHtml;
     body.style.cssText=prevBody;
     if(root)root.style.cssText=prevRoot;
   };
 },[standaloneBook]);

 const participantId=useMemo(()=>getOrCreatePublicParticipantId(),[]);const coreOrder=useMemo(()=>buildPublicCoreOrder(participantId),[participantId]);const coreSideMap=useMemo(()=>buildCoreTraitSideMap(participantId,coreOrder),[participantId,coreOrder]);
 const [state,setState]=useState<StoredState>(()=>loadState());const [active,setActive]=useState(()=>params.get('resumeResult')==='1'||Boolean(state.startedAt&&Object.keys(state.answers).length>=30&&evaluateMoneyPersonality(state.answers,state.separators).complete));const [selected,setSelected]=useState<Choice|null>(null);const [separatorSelected,setSeparatorSelected]=useState<string|null>(null);const [committing,setCommitting]=useState(false);const timerRef=useRef<number|null>(null);
 const evaluation=useMemo(()=>evaluateMoneyPersonality(state.answers,state.separators),[state.answers,state.separators]);
 const pendingCore=coreOrder.find(q=>state.answers[q.item_id]===undefined)??null;const adaptiveIds=useMemo(()=>orderAdaptiveItemIds(evaluation.adaptive.nextItemIds.filter(id=>state.answers[id]===undefined),participantId),[evaluation.adaptive.nextItemIds,state.answers,participantId]);const pendingAdaptiveId=!pendingCore?(adaptiveIds[0]??null):null;const pendingSeparatorId=!pendingCore&&!pendingAdaptiveId?evaluation.adaptive.separatorIds.find(id=>state.separators[id as keyof SeparatorAnswers]===undefined)??null:null;const targetItem=pendingCore??(pendingAdaptiveId?itemById(pendingAdaptiveId):null);const done=!pendingCore&&!pendingAdaptiveId&&!pendingSeparatorId&&evaluation.complete;const targetKey=targetItem?.item_id??pendingSeparatorId??(done?'RESULT':'NONE');
 const coreAnswered=coreOrder.filter(x=>state.answers[x.item_id]!==undefined).length;const adaptiveAnswered=Math.max(0,Object.keys(state.answers).length-coreAnswered);const separatorAnswered=Object.keys(state.separators).length;const progress=publicProgress(coreAnswered,adaptiveAnswered,separatorAnswered,done);
 useEffect(()=>{saveState(state)},[state]);useEffect(()=>{if(timerRef.current)window.clearTimeout(timerRef.current);setSelected(null);setSeparatorSelected(null);setCommitting(false);window.scrollTo({top:0,behavior:'auto'});return ()=>{if(timerRef.current)window.clearTimeout(timerRef.current)}},[targetKey]);
 if(standaloneBook)return <main className="mpp-book-standalone"><JobEncyclopediaV1 unlocked={requestedBookJob!} primaryStyle={requestedBookStyle!} onClose={()=>{window.location.href=moneyTypeReturnUrl()}}/></main>;
 const hasSavedProgress=state.history.length>0||Object.keys(state.answers).length>0||Object.keys(state.separators).length>0;const startNew=()=>{setState({...blankState(),startedAt:new Date().toISOString()});setActive(true)};const resume=()=>{setState(s=>({...s,startedAt:s.startedAt||new Date().toISOString()}));setActive(true)};
 const goBack=()=>{if(committing||state.history.length===0)return;const last=state.history[state.history.length-1];setState(s=>{const history=s.history.slice(0,-1);if(last.kind==='trait'){const answers={...s.answers};delete answers[last.id];return {...s,answers,history,screenCount:Math.max(0,s.screenCount-1)}}const separators={...s.separators};delete (separators as Record<string,unknown>)[last.id];return {...s,separators,history,screenCount:Math.max(0,s.screenCount-1)}})};
 const commitTrait=(choice:Choice)=>{if(!targetItem||committing)return;setSelected(choice);setCommitting(true);const presentation=targetItem.family==='BIPOLAR'?publicBipolarPresentation(targetItem,participantId,coreSideMap):null;const traitValue=targetItem.family==='BIPOLAR'?normalizePublicBipolarResponse(choice.value,presentation!):choice.value;timerRef.current=window.setTimeout(()=>setState(s=>({...s,answers:{...s.answers,[targetItem.item_id]:traitValue},history:[...s.history,{kind:'trait',id:targetItem.item_id}],screenCount:s.screenCount+1})),130)};
 const commitSeparator=(id:SeparatorId,value:string)=>{if(committing)return;setSeparatorSelected(value);setCommitting(true);timerRef.current=window.setTimeout(()=>setState(s=>({...s,separators:{...s.separators,[id]:value} as SeparatorAnswers,history:[...s.history,{kind:'separator',id}],screenCount:s.screenCount+1})),130)};
 if(!active)return <Intro hasResume={hasSavedProgress} onStart={startNew} onResume={resume}/>;if(done)return <Result evaluation={evaluation} sessionId={state.sessionId} onRestart={startNew} debug={debug}/>;if(pendingSeparatorId)return <SeparatorScreen id={pendingSeparatorId as SeparatorId} participantId={participantId} evaluation={evaluation} selected={separatorSelected} onSelect={v=>commitSeparator(pendingSeparatorId as SeparatorId,v)} onBack={goBack} canBack={state.history.length>0} progress={progress} debug={debug}/>;if(!targetItem)return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-card"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.finalAnalysis} alt=""/><p style={{textAlign:'center'}}>お金タイプを解析しています…</p></section></main>;
 const presentation=targetItem.family==='BIPOLAR'?publicBipolarPresentation(targetItem,participantId,coreSideMap):null;const companionLine=progressComment(state.screenCount,coreAnswered,adaptiveAnswered);
 return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-shell"><QuestionHeader phase={publicPhaseLabel(coreAnswered)} progress={progress} onBack={goBack} canBack={state.history.length>0}/>{debug&&<div className="mpp-debug">{targetItem.item_id} / {targetItem.factor} / core {coreAnswered} / adaptive {adaptiveAnswered}</div>}<article className="mpp-question-card"><QuestionCompanion visual={measurementVisual(state.screenCount)} line={companionLine||undefined}/>{targetItem.family==='BIPOLAR'&&presentation&&<Bipolar item={targetItem} presentation={presentation} selected={selected} onChoose={commitTrait}/>} {targetItem.family==='LIKERT'&&<Likert item={targetItem} selected={selected} onChoose={commitTrait}/>}</article><p className="mpp-footnote">選ぶとそのまま次へ進みます。迷ったら真ん中でOK。</p></section></main>
}

function QuestionHeader({phase,progress,onBack,canBack}:{phase:string;progress:number;onBack:()=>void;canBack:boolean}){return <><header className="mpp-header"><button className="mpp-back" disabled={!canBack} onClick={onBack} aria-label="1つ前の質問に戻る">←</button><div><span>{phase}</span><small>{progress<84?'お金タイプの輪郭を読み取り中':'あなたに合わせて最終解析中'}</small></div><b>{Math.round(progress)}%</b></header><div className="mpp-progress"><i style={{width:progress+'%'}}/></div></>}
function Intro({hasResume,onStart,onResume}:{hasResume:boolean;onStart:()=>void;onResume:()=>void}){return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-card mpp-intro"><div className="mpp-kicker">CHAPTER 1 / MONEY PERSONALITY</div><h1>お金の<br/><span>性格診断</span></h1><div className="mpp-intro-copy"><b>同じ収入でも、お金の使い方は人それぞれ。</b><p>まずは30問。何にお金を使いたいか、どうやって決めるか。普段の自分に答えていくと、お金のクセが見えてくるよ。必要なときだけ追加で質問するね。</p></div><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.intro} alt="ムダギリくん"/><div className="mpp-meta"><div><b>約5分</b><span>30問＋必要な追加だけ</span></div><div><b>32タイプ</b><span>8 JOB × 4 STYLE</span></div></div><div className="mpp-points"><p><i>01</i> 正解はなし。普段の自分で答える</p><p><i>02</i> 迷ったら「理想」より「実際にやりがち」を選ぶ</p><p><i>03</i> 最後に、あなたの強みと気をつけたいクセがわかる</p></div>{hasResume?<><button className="mpp-primary" onClick={onResume}>続きから再開する</button><button className="mpp-secondary" onClick={onStart}>最初からやり直す</button></>:<button className="mpp-primary" onClick={onStart}>診断をはじめる</button>}<p className="mpp-intro-note">回答は端末内に自動保存。途中で閉じても続きから再開できます。</p></section></main>}
function Bipolar({item,presentation,selected,onChoose}:{item:PilotItem;presentation:ReturnType<typeof publicBipolarPresentation>;selected:Choice|null;onChoose:(x:Choice)=>void}){if(item.family!=='BIPOLAR')return null;return <><div className="mpp-family-label">どちらのスタンスが自然に近い？</div><div className="mpp-scenario">{item.scenario}</div><div className="mpp-poles"><div><b>A</b><span>{presentation.leftText}</span></div><div><b>B</b><span>{presentation.rightText}</span></div></div><div className="mpp-scale">{BIPOLAR_PUBLIC_LABELS.map((label,i)=>{const value=i+1;return <button key={value} aria-label={label} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{i===0?'A':i===1?'A':i===2?'―':'B'}</b><span>{label}</span></button>})}</div></>}
function Likert({item,selected,onChoose}:{item:PilotItem;selected:Choice|null;onChoose:(x:Choice)=>void}){if(item.family!=='LIKERT')return null;return <><div className="mpp-family-label">普段の自分にどれくらい当てはまる？</div><h2>{item.prompt}</h2><div className="mpp-answer-list">{LIKERT_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>}
function SeparatorScreen({id,participantId,evaluation,selected,onSelect,onBack,canBack,progress,debug}:{id:SeparatorId;participantId:string;evaluation:ReturnType<typeof evaluateMoneyPersonality>;selected:string|null;onSelect:(x:string)=>void;onBack:()=>void;canBack:boolean;progress:number;debug:boolean}){const item=id==='SEP_STYLE'&&evaluation.style.primary&&evaluation.style.secondary?buildStyleSeparator(evaluation.style.primary,evaluation.style.secondary):id!=='SEP_STYLE'?AXIS_SEPARATOR_ITEMS[id]:null;if(!item)return null;const p=separatorPresentation(id,participantId,item.choices as any);return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-shell"><QuestionHeader phase="FINAL / TYPE CHECK" progress={progress} onBack={onBack} canBack={canBack}/>{debug&&<div className="mpp-debug">{id} / separator / score unchanged</div>}<article className="mpp-question-card mpp-separator"><QuestionCompanion visual={PERSONALITY_SCENE_VISUALS.separator} line="最後の確認！どっちも近ければ、より普段の自分に近い方でOK。"/><div className="mpp-family-label">かなり拮抗しているあなたへ</div><div className="mpp-scenario">{item.scenario}</div><h2>{item.prompt}</h2><div className="mpp-separator-options"><button className={separatorSelectedClass(selected,p.left.value)} onClick={()=>onSelect(p.left.value)}>{p.left.text}</button><button className={separatorSelectedClass(selected,p.right.value)} onClick={()=>onSelect(p.right.value)}>{p.right.text}</button></div></article><p className="mpp-footnote">両方の傾向は消しません。ここでは、より近い表現だけを選びます。</p></section></main>}
function separatorSelectedClass(selected:string|null,value:string){return selected===value?'selected':''}

function Result({evaluation,sessionId,onRestart,debug}:{evaluation:ReturnType<typeof evaluateMoneyPersonality>;sessionId:string;onRestart:()=>void;debug:boolean}){
 const [revealSeen,setRevealSeen]=useState(()=>{try{return localStorage.getItem(REVEAL_KEY)===sessionId}catch{return false}});
 const job=evaluation.jobCode!;
 const style=evaluation.style.primary!;
 const secondary=evaluation.style.secondary!;
 const v9=resultV9For(job,style);
 const insight=resultV10InsightFor(job,style);

 useEffect(()=>{const html=document.documentElement;const body=document.body;const root=document.getElementById('root');const previous=[html,body,root].filter(Boolean).map(el=>({el:el as HTMLElement,cssText:(el as HTMLElement).style.cssText}));for(const el of [html,body]){el.style.setProperty('height','auto','important');el.style.setProperty('min-height','100%','important');el.style.setProperty('max-height','none','important');el.style.setProperty('overflow-x','hidden','important');el.style.setProperty('overflow-y','auto','important');el.style.setProperty('touch-action','pan-y','important')}if(root){root.style.setProperty('height','auto','important');root.style.setProperty('min-height','100%','important');root.style.setProperty('max-height','none','important');root.style.setProperty('overflow','visible','important');root.style.setProperty('touch-action','pan-y','important')}window.scrollTo({top:0,behavior:'auto'});return ()=>{previous.forEach(({el,cssText})=>{el.style.cssText=cssText})}},[]);

 if(!revealSeen)return <AdventurerClassUnlockV1 jobCode={job} primaryStyle={style} onComplete={()=>{try{localStorage.setItem(REVEAL_KEY,sessionId)}catch{}setRevealSeen(true)}}/>;

 const share=async(target:'x'|'instagram'|'threads'|'line')=>{const {shareJobTypeImage}=await import('./job-share-image-v1');await shareJobTypeImage({jobCode:job,primaryStyle:style,target})};
 const axisDefs=[['時間の向き','FUTURE','IMMEDIATE'],['決め方','DELIBERATION','INTUITION'],['確認のタイミング','MONITORING','PERIODIC']] as const;
 const axes=axisDefs.map(([title,a,b])=>{const av=displayScore(evaluation.factors[a].score),bv=displayScore(evaluation.factors[b].score);const total=av+bv;const pos=total>0?Math.round((bv/total)*100):50;const left=FACTOR_PUBLIC_LABEL[a],right=FACTOR_PUBLIC_LABEL[b];const lean=pos<=25?`${left}寄り`:pos<43?`やや${left}寄り`:pos<=57?'バランス':pos<75?`やや${right}寄り`:`${right}寄り`;return {title,left,right,lean,pos}});

 return <>
  <ResultV17
   content={v9}
   insight={insight}
   jobCode={job}
   primaryStyle={style}
   secondaryStyle={secondary}
   axes={axes}
   onShare={share}
   onOpenBook={()=>{window.location.href=moneyTypeBookUrl(job,style)}}
   onHousehold={()=>{try{localStorage.setItem('mudagiri_adventurer_class_v1',job)}catch{}window.location.href=householdUrl()}}
   onRestart={onRestart}
  />
  {debug&&<pre className="mpp-result-debug">{JSON.stringify({job:evaluation.jobCode,style:evaluation.style,axes:evaluation.axes,factors:evaluation.factors,resultExperienceVersion:'MUDAGIRI_RESULT_V17_EDITORIAL'},null,2)}</pre>}
 </>;
}
