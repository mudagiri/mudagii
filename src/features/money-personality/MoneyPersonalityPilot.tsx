import React,{useEffect,useMemo,useRef,useState} from 'react';
import {CORE_SCALE_LABELS,PILOT_VERSION} from './pilotData';
import {assignPilotForm,behaviorOptions,buildPilotOrder,getOrCreatePilotParticipantId,newPilotSessionId,parseSwitchItem,type PilotItem} from './pilotLogic';
import './pilot.css';

type AnswerChoice={value:number;label:string};

type PilotResponse={
  itemId:string;
  family:string;
  construct:string;
  position:number;
  shownAt:string;
  answeredAt:string;
  firstResponse:number;
  finalResponse:number;
  answerLabel:string;
  changed:boolean;
  responseTimeMs:number;
  cognitiveFlags:string[];
  scaleType?:string;
  similarityContext:string[];
};

type PilotPayload={
  kind:'money_personality_pilot_v1';
  schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PILOT_V1';
  pilotVersion:string;
  sessionId:string;
  participantId:string;
  formId:string;
  startedAt:string;
  completedAt:string;
  durationMs:number;
  responseCount:number;
  responses:PilotResponse[];
  quality:{
    cognitiveMode:boolean;
    debugMode:boolean;
    userAgent:string;
    sourceUrl:string;
  };
};

function nowIso(){return new Date().toISOString()}

function saveLocal(payload:PilotPayload){
  const key='mudagiri_money_personality_pilot_sessions_v1';
  try{
    const current=JSON.parse(localStorage.getItem(key)||'[]');
    const xs=Array.isArray(current)?current:[];
    const next=[...xs.filter((x:any)=>x?.sessionId!==payload.sessionId),payload].slice(-100);
    localStorage.setItem(key,JSON.stringify(next));
  }catch{
    localStorage.setItem(key,JSON.stringify([payload]));
  }
}

async function saveRemote(payload:PilotPayload){
  const url=(import.meta as any).env?.VITE_MUDAGIRI_GAS_URL as string|undefined;
  if(!url)return;
  try{
    await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload),
      keepalive:true,
      mode:'no-cors'
    });
  }catch{}
}

function itemKindLabel(item:PilotItem){
  if(item.family==='SWITCH')return 'SCENE';
  if(item.family==='BEHAVIOR')return 'ACTION';
  return 'QUESTION';
}

export default function MoneyPersonalityPilot(){
  const params=useMemo(()=>new URLSearchParams(window.location.search),[]);
  const debugMode=params.get('debug')==='1';
  const cognitiveMode=debugMode||params.get('cognitive')==='1';
  const forcedParticipant=params.get('participant');
  const participantId=useMemo(()=>forcedParticipant||getOrCreatePilotParticipantId(),[forcedParticipant]);
  const formId=useMemo(()=>assignPilotForm(participantId,params.get('form')),[participantId,params]);
  const questions=useMemo(()=>buildPilotOrder(formId,participantId),[formId,participantId]);

  const [stage,setStage]=useState<'intro'|'questions'|'done'>('intro');
  const [sessionId,setSessionId]=useState(()=>newPilotSessionId());
  const [startedAt,setStartedAt]=useState<string>('');
  const [index,setIndex]=useState(0);
  const [responses,setResponses]=useState<PilotResponse[]>([]);
  const [selected,setSelected]=useState<AnswerChoice|null>(null);
  const [firstResponse,setFirstResponse]=useState<number|null>(null);
  const [changeCount,setChangeCount]=useState(0);
  const [flags,setFlags]=useState<string[]>([]);
  const [completedPayload,setCompletedPayload]=useState<PilotPayload|null>(null);
  const shownPerf=useRef(0);
  const shownIso=useRef('');

  const question=questions[index];

  useEffect(()=>{
    if(stage!=='questions')return;
    shownPerf.current=performance.now();
    shownIso.current=nowIso();
    setSelected(null);
    setFirstResponse(null);
    setChangeCount(0);
    setFlags([]);
  },[stage,index]);

  const start=()=>{
    const t=nowIso();
    setStartedAt(t);
    setStage('questions');
    setIndex(0);
    window.scrollTo({top:0,behavior:'auto'});
  };

  const choose=(choice:AnswerChoice)=>{
    if(firstResponse===null)setFirstResponse(choice.value);
    if(selected&&selected.value!==choice.value)setChangeCount(x=>x+1);
    setSelected(choice);
  };

  const toggleFlag=(flag:string)=>{
    setFlags(xs=>xs.includes(flag)?xs.filter(x=>x!==flag):[...xs,flag]);
  };

  const next=()=>{
    if(!selected||!question)return;
    const answeredAt=nowIso();
    const record:PilotResponse={
      itemId:question.item_id,
      family:question.family,
      construct:question.construct,
      position:index+1,
      shownAt:shownIso.current||answeredAt,
      answeredAt,
      firstResponse:firstResponse??selected.value,
      finalResponse:selected.value,
      answerLabel:selected.label,
      changed:changeCount>0,
      responseTimeMs:Math.max(0,Math.round(performance.now()-shownPerf.current)),
      cognitiveFlags:flags.slice(),
      scaleType:question.family==='CORE'?question.scale_type:undefined,
      similarityContext:flags.includes('similar_to_previous')?[...questions.slice(Math.max(0,index-10),index).map(q=>q.item_id),question.item_id]:[]
    };
    const nextResponses=[...responses,record];
    if(index<questions.length-1){
      setResponses(nextResponses);
      setIndex(i=>i+1);
      window.scrollTo({top:0,behavior:'auto'});
      return;
    }

    const completedAt=nowIso();
    const payload:PilotPayload={
      kind:'money_personality_pilot_v1',
      schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PILOT_V1',
      pilotVersion:PILOT_VERSION,
      sessionId,
      participantId,
      formId,
      startedAt:startedAt||completedAt,
      completedAt,
      durationMs:Math.max(0,Date.parse(completedAt)-Date.parse(startedAt||completedAt)),
      responseCount:nextResponses.length,
      responses:nextResponses,
      quality:{
        cognitiveMode,
        debugMode,
        userAgent:navigator.userAgent,
        sourceUrl:window.location.href
      }
    };
    setResponses(nextResponses);
    setCompletedPayload(payload);
    saveLocal(payload);
    void saveRemote(payload);
    setStage('done');
    window.scrollTo({top:0,behavior:'auto'});
  };

  const restart=()=>{
    setSessionId(newPilotSessionId());
    setStartedAt('');
    setResponses([]);
    setIndex(0);
    setCompletedPayload(null);
    setStage('intro');
    window.scrollTo({top:0,behavior:'auto'});
  };

  const copyPayload=async()=>{
    if(!completedPayload)return;
    try{await navigator.clipboard.writeText(JSON.stringify(completedPayload,null,2))}catch{}
  };

  if(stage==='intro'){
    return <main className="mp-page">
      <section className="mp-card mp-intro">
        <div className="mp-kicker">MONEY PERSONALITY / PILOT</div>
        <h1>お金の性格診断<br/><span>検証版</span></h1>
        <p className="mp-lead">正解・不正解はありません。普段の感覚に一番近いものを選んでください。</p>
        <div className="mp-notice">
          <strong>50問</strong>
          <span>この検証では、診断結果はまだ表示しません。</span>
        </div>
        <div className="mp-points">
          <div><b>01</b><span>考えすぎず、最初に近いと思った回答でOK</span></div>
          <div><b>02</b><span>迷うときは中間を選んでもOK</span></div>
          <div><b>03</b><span>回答時間も検証データとして記録します</span></div>
        </div>
        {debugMode&&<div className="mp-debug">DEBUG / FORM {formId}<br/>{participantId}</div>}
        <button className="mp-primary" onClick={start}>診断をはじめる</button>
      </section>
    </main>;
  }

  if(stage==='done'){
    return <main className="mp-page">
      <section className="mp-card mp-done">
        <div className="mp-complete-mark">✓</div>
        <div className="mp-kicker">PILOT COMPLETE</div>
        <h1>回答完了</h1>
        <p className="mp-lead">ありがとう。現在は検証期間のため、タイプ結果はまだ表示していません。</p>
        <div className="mp-summary">
          <span>FORM</span><b>{formId}</b>
          <span>回答数</span><b>{responses.length}</b>
        </div>
        {cognitiveMode&&<button className="mp-secondary" onClick={copyPayload}>回答JSONをコピー</button>}
        {debugMode&&<button className="mp-ghost" onClick={restart}>同じ条件でもう一度テスト</button>}
      </section>
    </main>;
  }

  if(!question)return null;

  const progress=((index+1)/questions.length)*100;

  return <main className="mp-page">
    <section className="mp-shell">
      <header className="mp-header">
        <div>
          <span>{itemKindLabel(question)}</span>
          {debugMode&&<em>{question.item_id} / {question.construct} / FORM {formId}</em>}
        </div>
        <b>{index+1}<small> / {questions.length}</small></b>
      </header>
      <div className="mp-progress"><i style={{width:progress+'%'}}/></div>

      <article className="mp-question-card">
        {question.family==='CORE'&&<CoreQuestion item={question} selected={selected} onChoose={choose}/>}
        {question.family==='SWITCH'&&<SwitchQuestion item={question} selected={selected} onChoose={choose}/>}
        {question.family==='BEHAVIOR'&&<BehaviorQuestion item={question} selected={selected} onChoose={choose}/>}
      </article>

      {cognitiveMode&&<div className="mp-cognitive">
        <span>開発メモ（任意）</span>
        <button className={flags.includes('hard_to_understand')?'active':''} onClick={()=>toggleFlag('hard_to_understand')}>わかりにくい</button>
        <button className={flags.includes('neither_fits')?'active':''} onClick={()=>toggleFlag('neither_fits')}>どちらも違う</button>
        <button className={flags.includes('similar_to_previous')?'active':''} onClick={()=>toggleFlag('similar_to_previous')}>さっきと似ている</button>
      </div>}

      <button className="mp-primary mp-next" disabled={!selected} onClick={next}>
        {index===questions.length-1?'回答を送信':'次へ'}
      </button>
      <p className="mp-footnote">回答後も「次へ」を押すまでは変更できます。</p>
    </section>
  </main>;
}

function CoreQuestion({item,selected,onChoose}:{item:PilotItem;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void}){
  const labels=CORE_SCALE_LABELS[item.scale_type as 'A'|'B'];
  return <>
    <div className="mp-scenario">{item.scenario}</div>
    <h2>{item.prompt}</h2>
    <div className="mp-answer-list">
      {labels.map((label,i)=>{
        const value=i+1;
        return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}>
          <b>{value}</b><span>{label}</span>
        </button>;
      })}
    </div>
  </>;
}

function BehaviorQuestion({item,selected,onChoose}:{item:PilotItem;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void}){
  const options=behaviorOptions(item);
  return <>
    <div className="mp-family-label">実際の行動について</div>
    <h2>{'text' in item?item.text:''}</h2>
    <div className="mp-answer-list">
      {options.map((label,i)=><button key={label} className={selected?.value===i+1?'selected':''} onClick={()=>onChoose({value:i+1,label})}>
        <b>{i+1}</b><span>{label}</span>
      </button>)}
    </div>
  </>;
}

function SwitchQuestion({item,selected,onChoose}:{item:PilotItem;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void}){
  const sw=parseSwitchItem('text' in item?item.text:'');
  const opts=[
    {value:1,label:'A'},
    {value:2,label:'ややA'},
    {value:3,label:'中間'},
    {value:4,label:'ややB'},
    {value:5,label:'B'},
  ];
  return <>
    <div className="mp-family-label">場面による選び方</div>
    <h2>{sw.prompt}</h2>
    <div className="mp-switch-poles">
      <div><b>A</b><span>{sw.a}</span></div>
      <div><b>B</b><span>{sw.b}</span></div>
    </div>
    <div className="mp-switch-scale">
      {opts.map(x=><button key={x.value} className={selected?.value===x.value?'selected':''} onClick={()=>onChoose(x)}>
        <b>{x.value}</b><span>{x.label}</span>
      </button>)}
    </div>
  </>;
}
