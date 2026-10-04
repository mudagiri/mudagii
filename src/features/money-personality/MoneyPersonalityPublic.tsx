import React,{useEffect,useMemo,useRef,useState} from 'react';
import {LIKERT_SCALE_LABELS} from './pilotData';
import {itemById,type PilotItem} from './pilotLogic';
import {evaluateMoneyPersonality,type SeparatorAnswers,type TraitAnswers} from './classifierV1';
import {AXIS_SEPARATOR_ITEMS,buildStyleSeparator,separatorPresentation,type SeparatorId} from './separatorDataV1';
import {
  buildCoreTraitSideMap,buildPublicCoreOrder,displayScore,FACTOR_PUBLIC_LABEL,getOrCreatePublicParticipantId,
  JOB_NUMBER,JOB_ONE_LINERS,newPublicSessionId,normalizePublicBipolarResponse,orderAdaptiveItemIds,
  publicBipolarPresentation,publicPhaseLabel,publicProgress,PUBLIC_MONEY_TYPE_VERSION,STYLE_META,
} from './publicFlowV1';
import {buildMoneyResultContent} from './resultContentV1';
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import {CLASS_UNLOCK_SEQUENCE,NEXT_QUEST_SEQUENCE,PERSONALITY_SCENE_VISUALS,measurementVisual} from './mudagiri-personality-visual-v1';
import './publicMoney.css';
import './mudagiri-motion.css';
import './personality-mudagiri.css';

type HistoryEntry={kind:'trait'|'separator';id:string};
type StoredState={
  version:string;sessionId:string;startedAt:string;answers:TraitAnswers;separators:SeparatorAnswers;history:HistoryEntry[];screenCount:number;
};
type Choice={value:number;label:string};

const STORAGE_KEY='mudagiri_money_type_public_state_v1';
const BIPOLAR_PUBLIC_LABELS=['Aにかなり近い','ややAに近い','半々','ややBに近い','Bにかなり近い'] as const;
const blankState=():StoredState=>({version:PUBLIC_MONEY_TYPE_VERSION,sessionId:newPublicSessionId(),startedAt:'',answers:{},separators:{},history:[],screenCount:0});
function loadState():StoredState{
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(x&&x.version===PUBLIC_MONEY_TYPE_VERSION&&x.answers&&x.separators){
      return {...blankState(),...x,history:Array.isArray(x.history)?x.history:[]} as StoredState;
    }
  }catch{}
  return blankState();
}
function saveState(x:StoredState){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(x))}catch{}}
function householdUrl(){
  const path=window.location.pathname.replace(/\/(?:pilot\/money-type|money-type)\/?$/,'/');
  return path||'/';
}

const MUDAGIRI_LINE:Record<string,string>={
  FDM:'その選択、頭の中で何ターン先まで計算してんだ？',
  FDP:'節目が来ると、作戦会議の解像度が一気に上がるな。',
  FNM:'現在地は見えてるのに、最後の一手は自分の感覚なんだな。',
  FNP:'行き先は決める。でも航路はその時の風で選ぶ派だな。',
  IDM:'今の状況を見ながら、ちゃんと納得できる一手を選びたいんだな。',
  IDP:'狙いが定まると、急に照準合わせが細かくなるな。',
  INM:'今どこにいるか分かってるから、自分の感覚にも乗れるんだな。',
  INP:'その場の風で動くけど、節目じゃちゃんと構え直すんだな。',
};

export default function MoneyPersonalityPublic(){
  const params=useMemo(()=>new URLSearchParams(window.location.search),[]);
  const debug=params.get('debug')==='1';
  const participantId=useMemo(()=>getOrCreatePublicParticipantId(),[]);
  const coreOrder=useMemo(()=>buildPublicCoreOrder(participantId),[participantId]);
  const coreSideMap=useMemo(()=>buildCoreTraitSideMap(participantId,coreOrder),[participantId,coreOrder]);
  const [state,setState]=useState<StoredState>(()=>loadState());
  const [active,setActive]=useState(false);
  const [selected,setSelected]=useState<Choice|null>(null);
  const [separatorSelected,setSeparatorSelected]=useState<string|null>(null);
  const [committing,setCommitting]=useState(false);
  const timerRef=useRef<number|null>(null);

  const evaluation=useMemo(()=>evaluateMoneyPersonality(state.answers,state.separators),[state.answers,state.separators]);
  const pendingCore=coreOrder.find(q=>state.answers[q.item_id]===undefined)??null;
  const adaptiveIds=useMemo(()=>orderAdaptiveItemIds(evaluation.adaptive.nextItemIds.filter(id=>state.answers[id]===undefined),participantId),[evaluation.adaptive.nextItemIds,state.answers,participantId]);
  const pendingAdaptiveId=!pendingCore?(adaptiveIds[0]??null):null;
  const pendingSeparatorId=!pendingCore&&!pendingAdaptiveId?evaluation.adaptive.separatorIds.find(id=>state.separators[id as keyof SeparatorAnswers]===undefined)??null:null;
  const targetItem=pendingCore??(pendingAdaptiveId?itemById(pendingAdaptiveId):null);
  const done=!pendingCore&&!pendingAdaptiveId&&!pendingSeparatorId&&evaluation.complete;
  const targetKey=targetItem?.item_id??pendingSeparatorId??(done?'RESULT':'NONE');

  const coreAnswered=coreOrder.filter(x=>state.answers[x.item_id]!==undefined).length;
  const adaptiveAnswered=Math.max(0,Object.keys(state.answers).length-coreAnswered);
  const separatorAnswered=Object.keys(state.separators).length;
  const progress=publicProgress(coreAnswered,adaptiveAnswered,separatorAnswered,done);

  useEffect(()=>{saveState(state)},[state]);
  useEffect(()=>{
    if(timerRef.current)window.clearTimeout(timerRef.current);
    setSelected(null);setSeparatorSelected(null);setCommitting(false);window.scrollTo({top:0,behavior:'auto'});
    return ()=>{if(timerRef.current)window.clearTimeout(timerRef.current)};
  },[targetKey]);

  const hasSavedProgress=state.history.length>0||Object.keys(state.answers).length>0||Object.keys(state.separators).length>0;
  const startNew=()=>{setState({...blankState(),startedAt:new Date().toISOString()});setActive(true)};
  const resume=()=>{setState(s=>({...s,startedAt:s.startedAt||new Date().toISOString()}));setActive(true)};
  const goBack=()=>{
    if(committing||state.history.length===0)return;
    const last=state.history[state.history.length-1];
    setState(s=>{
      const history=s.history.slice(0,-1);
      if(last.kind==='trait'){
        const answers={...s.answers};delete answers[last.id];
        return {...s,answers,history,screenCount:Math.max(0,s.screenCount-1)};
      }
      const separators={...s.separators};delete (separators as Record<string,unknown>)[last.id];
      return {...s,separators,history,screenCount:Math.max(0,s.screenCount-1)};
    });
  };

  const commitTrait=(choice:Choice)=>{
    if(!targetItem||committing)return;
    setSelected(choice);setCommitting(true);
    const presentation=targetItem.family==='BIPOLAR'?publicBipolarPresentation(targetItem,participantId,coreSideMap):null;
    const traitValue=targetItem.family==='BIPOLAR'?normalizePublicBipolarResponse(choice.value,presentation!):choice.value;
    timerRef.current=window.setTimeout(()=>{
      setState(s=>({...s,answers:{...s.answers,[targetItem.item_id]:traitValue},history:[...s.history,{kind:'trait',id:targetItem.item_id}],screenCount:s.screenCount+1}));
    },130);
  };

  const commitSeparator=(id:SeparatorId,value:string)=>{
    if(committing)return;
    setSeparatorSelected(value);setCommitting(true);
    timerRef.current=window.setTimeout(()=>{
      setState(s=>({...s,separators:{...s.separators,[id]:value} as SeparatorAnswers,history:[...s.history,{kind:'separator',id}],screenCount:s.screenCount+1}));
    },130);
  };

  if(!active)return <Intro hasResume={hasSavedProgress} onStart={startNew} onResume={resume}/>;
  if(done)return <Result evaluation={evaluation} onRestart={startNew} debug={debug}/>;
  if(pendingSeparatorId)return <SeparatorScreen id={pendingSeparatorId as SeparatorId} participantId={participantId} evaluation={evaluation} selected={separatorSelected} onSelect={(v)=>commitSeparator(pendingSeparatorId as SeparatorId,v)} onBack={goBack} canBack={state.history.length>0} progress={progress} debug={debug}/>;
  if(!targetItem)return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-card"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.finalAnalysis} alt=""/><p style={{textAlign:'center'}}>お金タイプを解析しています…</p></section></main>;

  const presentation=targetItem.family==='BIPOLAR'?publicBipolarPresentation(targetItem,participantId,coreSideMap):null;
  return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-shell">
    <QuestionHeader phase={publicPhaseLabel(coreAnswered)} progress={progress} onBack={goBack} canBack={state.history.length>0}/>
    {debug&&<div className="mpp-debug">{targetItem.item_id} / {targetItem.factor} / core {coreAnswered} / adaptive {adaptiveAnswered}</div>}
    <div className="mpp-measurement-companion"><MoneyPersonalityMudagiri visual={measurementVisual(state.screenCount)} alt=""/></div>
    <article className="mpp-question-card">
      {targetItem.family==='BIPOLAR'&&presentation&&<Bipolar item={targetItem} presentation={presentation} selected={selected} onChoose={commitTrait}/>} 
      {targetItem.family==='LIKERT'&&<Likert item={targetItem} selected={selected} onChoose={commitTrait}/>} 
    </article>
    <p className="mpp-footnote">選ぶとそのまま次へ進みます。迷ったら真ん中でOK。</p>
  </section></main>;
}

function QuestionHeader({phase,progress,onBack,canBack}:{phase:string;progress:number;onBack:()=>void;canBack:boolean}){
  return <><header className="mpp-header"><button className="mpp-back" disabled={!canBack} onClick={onBack} aria-label="1つ前の質問に戻る">←</button><div><span>{phase}</span><small>{progress<84?'お金タイプの輪郭を読み取り中':'あなたに合わせて最終解析中'}</small></div><b>{Math.round(progress)}%</b></header><div className="mpp-progress"><i style={{width:progress+'%'}}/></div></>;
}

function Intro({hasResume,onStart,onResume}:{hasResume:boolean;onStart:()=>void;onResume:()=>void}){
  return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-card mpp-intro">
    <div className="mpp-kicker">CHAPTER 1 / MONEY PERSONALITY</div>
    <MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.intro} alt="ムダギリくん"/>
    <h1>お金の<br/><span>性格診断</span></h1>
    <p className="mpp-lead">お金の「使い方・決め方・把握のクセ」から、あなたのお金タイプを見つけます。</p>
    <div className="mpp-meta"><div><b>約5分</b><span>基本30問＋必要な分だけ</span></div><div><b>回答適応型</b><span>あなたに合わせて進行</span></div></div>
    <div className="mpp-points"><p><i>01</i> 正解・不正解なし</p><p><i>02</i> 似た傾向が両方強くても、そのまま残す</p><p><i>03</i> 最後にお金タイプと攻略ヒントがわかる</p></div>
    {hasResume?<><button className="mpp-primary" onClick={onResume}>続きから再開する</button><button className="mpp-secondary" onClick={onStart}>最初からやり直す</button></>:<button className="mpp-primary" onClick={onStart}>診断をはじめる</button>}
    <p className="mpp-intro-note">回答は端末内に自動保存されます。途中で閉じても続きから再開できます。</p>
  </section></main>;
}

function Bipolar({item,presentation,selected,onChoose}:{item:PilotItem;presentation:ReturnType<typeof publicBipolarPresentation>;selected:Choice|null;onChoose:(x:Choice)=>void}){
  if(item.family!=='BIPOLAR')return null;
  return <><div className="mpp-family-label">どちらのスタンスが自然に近い？</div><div className="mpp-scenario">{item.scenario}</div>
    <div className="mpp-poles"><div><b>A</b><span>{presentation.leftText}</span></div><div><b>B</b><span>{presentation.rightText}</span></div></div>
    <div className="mpp-scale">{BIPOLAR_PUBLIC_LABELS.map((label,i)=>{const value=i+1;return <button key={value} aria-label={label} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{i===0?'A':i===1?'A':i===2?'―':'B'}</b><span>{label}</span></button>})}</div></>;
}
function Likert({item,selected,onChoose}:{item:PilotItem;selected:Choice|null;onChoose:(x:Choice)=>void}){
  if(item.family!=='LIKERT')return null;
  return <><div className="mpp-family-label">普段の自分にどれくらい当てはまる？</div><h2>{item.prompt}</h2><div className="mpp-answer-list">{LIKERT_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
}

function SeparatorScreen({id,participantId,evaluation,selected,onSelect,onBack,canBack,progress,debug}:{id:SeparatorId;participantId:string;evaluation:ReturnType<typeof evaluateMoneyPersonality>;selected:string|null;onSelect:(x:string)=>void;onBack:()=>void;canBack:boolean;progress:number;debug:boolean}){
  const item=id==='SEP_STYLE'&&evaluation.style.primary&&evaluation.style.secondary?buildStyleSeparator(evaluation.style.primary,evaluation.style.secondary):id!=='SEP_STYLE'?AXIS_SEPARATOR_ITEMS[id]:null;
  if(!item)return null;
  const p=separatorPresentation(id,participantId,item.choices as any);
  return <main className="mpp-page mpp-page--guild" data-scene="guild-hall"><section className="mpp-shell"><QuestionHeader phase="FINAL / TYPE CHECK" progress={progress} onBack={onBack} canBack={canBack}/>{debug&&<div className="mpp-debug">{id} / separator / score unchanged</div>}
    <div className="mpp-measurement-companion"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.separator} alt=""/></div>
    <article className="mpp-question-card mpp-separator"><div className="mpp-family-label">かなり拮抗しているあなたへ</div><div className="mpp-scenario">{item.scenario}</div><h2>{item.prompt}</h2><div className="mpp-separator-options"><button className={separatorSelectedClass(selected,p.left.value)} onClick={()=>onSelect(p.left.value)}>{p.left.text}</button><button className={separatorSelectedClass(selected,p.right.value)} onClick={()=>onSelect(p.right.value)}>{p.right.text}</button></div></article>
    <p className="mpp-footnote">両方のスコアはそのまま残します。ここではタイプ上の表現だけを決めます。</p>
  </section></main>;
}

function separatorSelectedClass(selected:string|null,value:string){return selected===value?'selected':''}

function ClassUnlockScreen({adventurerClassName,onComplete}:{adventurerClassName:string;onComplete:()=>void}){
  const [step,setStep]=useState(0);
  const current=CLASS_UNLOCK_SEQUENCE[Math.min(step,CLASS_UNLOCK_SEQUENCE.length-1)];
  useEffect(()=>{
    const t=window.setTimeout(()=>{
      if(step<CLASS_UNLOCK_SEQUENCE.length-1)setStep(step+1);
      else{window.scrollTo({top:0,behavior:'auto'});onComplete()}
    },current.holdMs);
    return ()=>window.clearTimeout(t);
  },[step,current.holdMs,onComplete]);
  const headline=current.key==='think'?'冒険者CLASSを編成中':current.key==='unlock'?'CLASS SIGNAL FOUND':adventurerClassName;
  const sub=current.key==='think'?'お金タイプの特性をクエスト用に変換しています…':current.key==='unlock'?'家計クエストでの役割が決まりました':'ADVENTURER CLASS UNLOCKED';
  return <main className="mpp-transition-scene mpp-class-unlock" data-scene="class-unlock"><section className="mpp-transition-card">
    <MoneyPersonalityMudagiri visual={current} alt="ムダギリくん"/>
    <div className="mpp-transition-copy">{sub}</div><h2>{headline}</h2><div className="mpp-transition-scan"/>
    <p>このCLASSで第2章へ進みます。</p>
  </section></main>;
}

function NextQuestDeparture({onComplete}:{onComplete:()=>void}){
  const [step,setStep]=useState(0);
  const current=NEXT_QUEST_SEQUENCE[Math.min(step,NEXT_QUEST_SEQUENCE.length-1)];
  useEffect(()=>{
    const t=window.setTimeout(()=>{
      if(step<NEXT_QUEST_SEQUENCE.length-1)setStep(step+1);
      else onComplete();
    },current.holdMs);
    return ()=>window.clearTimeout(t);
  },[step,current.holdMs,onComplete]);
  return <main className="mpp-transition-scene mpp-next-quest-departure" data-scene="next-quest"><section className="mpp-transition-card">
    <div className="mpp-transition-copy">CHAPTER 2 / NEXT QUEST</div>
    <MoneyPersonalityMudagiri visual={current} alt="ムダギリくん"/>
    <h2>家計クエストへ出発！</h2>
    <p>次は12カテゴリをスキャンして、改善余地のある敵を探します。</p>
  </section></main>;
}

function Result({evaluation,onRestart,debug}:{evaluation:ReturnType<typeof evaluateMoneyPersonality>;onRestart:()=>void;debug:boolean}){
  const [handoff,setHandoff]=useState<'result'|'class'|'depart'>('result');
  const job=evaluation.jobCode!;const style=evaluation.style.primary!;const secondary=evaluation.style.secondary!;
  const meta=STYLE_META[style];const sub=STYLE_META[secondary];const content=buildMoneyResultContent(evaluation);
  if(handoff==='class')return <ClassUnlockScreen adventurerClassName={evaluation.jobName!} onComplete={()=>setHandoff('depart')}/>;
  if(handoff==='depart')return <NextQuestDeparture onComplete={()=>{window.location.href=householdUrl()}}/>;
  const share=async()=>{
    const text=`私のお金タイプは「${evaluation.jobName}」だった！ ${meta.label} STYLE #ムダギリ診断`;
    try{if(navigator.share){await navigator.share({title:'ムダギリ｜お金の性格診断',text,url:window.location.href});return}await navigator.clipboard.writeText(text+' '+window.location.href)}catch{}
  };
  const axes=[
    ['時間視野','FUTURE','IMMEDIATE',evaluation.axes.TIME,content.axisInsights[0]],
    ['判断根拠','DELIBERATION','INTUITION',evaluation.axes.DECISION,content.axisInsights[1]],
    ['把握リズム','MONITORING','PERIODIC',evaluation.axes.AWARENESS,content.axisInsights[2]],
  ] as const;
  return <main className="mpp-page" data-scene="result"><section className="mpp-card mpp-result"><div className="mpp-unlock-burst" aria-hidden="true"><i/><i/><i/></div><div className="mpp-kicker">お金の性格診断 / RESULT</div><div className="mpp-job-no">TYPE #{JOB_NUMBER[job]}</div><div className="mpp-result-companion"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.resultHero} alt="ムダギリくん"/></div><div className="mpp-result-label">あなたのお金タイプ</div><h1>{evaluation.jobName}</h1><p className="mpp-job-copy">「{JOB_ONE_LINERS[job]}」</p>
    <p className="mpp-result-headline">{content.headline}</p>
    <div className="mpp-result-companion mpp-result-companion--tight"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.resultDialogue} alt=""/></div>
    <div className="mpp-dialogue"><b>ムダギリくん</b><p>「{MUDAGIRI_LINE[job]}」</p></div>
    <div className="mpp-result-companion mpp-result-companion--tight"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.resultStyle} alt=""/></div>
    <div className="mpp-style-row"><div><span>主属性</span><b>{meta.icon} {meta.label} STYLE</b></div><div><span>副属性</span><b>{sub.icon} {sub.label}</b></div></div>
    <div className="mpp-style-detail"><p>{content.primaryStyleLine}</p><p>{content.secondaryStyleLine}</p></div>
    <div className="mpp-result-profile"><div><span>WEAPON</span><b>{content.weapon}</b></div><div><span>強み</span><p>{content.strength}</p></div><div><span>死角</span><p>{content.blindSpot}</p></div><div><span>攻略法</span><p>{content.strategy}</p></div></div>
    <div className="mpp-result-companion"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.resultAxes} alt=""/></div>
    <div className="mpp-axis-block"><h2>あなたの3軸ステータス</h2>{axes.map(([title,a,b,axis,insight])=>{const av=displayScore(evaluation.factors[a].score),bv=displayScore(evaluation.factors[b].score);return <div className="mpp-axis" key={title}><header><b>{title}</b><em>{insight.badge}</em></header><div className="mpp-trait"><span>{FACTOR_PUBLIC_LABEL[a]}</span><i><u style={{width:av+'%'}}/></i><strong>{av}</strong></div><div className="mpp-trait"><span>{FACTOR_PUBLIC_LABEL[b]}</span><i><u style={{width:bv+'%'}}/></i><strong>{bv}</strong></div><p className="mpp-axis-copy">{insight.text}</p></div>})}</div>
    <div className="mpp-result-companion mpp-result-companion--tight"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.nextMove} alt=""/></div>
    <div className="mpp-one-action"><span>YOUR NEXT MOVE</span><b>{content.oneAction}</b></div>
    <div className="mpp-result-companion mpp-result-companion--tight"><MoneyPersonalityMudagiri visual={PERSONALITY_SCENE_VISUALS.householdCta} alt=""/></div>
    <div className="mpp-next-quest"><span>CHAPTER 2 / NEXT QUEST</span><b>次は、実際の家計を冒険しよう。</b><p>このお金タイプをもとに、家計クエストでの「冒険者CLASS」が決まります。次は12カテゴリをスキャンして、本当に改善余地がある場所だけを探します。</p></div>
    <button className="mpp-primary" onClick={()=>setHandoff('class')}>家計クエストへ進む</button><button className="mpp-secondary" onClick={share}>この結果をシェア</button><button className="mpp-ghost" onClick={onRestart}>もう一度診断する</button>
    {debug&&<pre className="mpp-result-debug">{JSON.stringify({job:evaluation.jobCode,style:evaluation.style,axes:evaluation.axes,factors:evaluation.factors,resultContentVersion:content.version},null,2)}</pre>}
  </section></main>;
}
