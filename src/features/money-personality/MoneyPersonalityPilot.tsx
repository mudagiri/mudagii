import React,{useEffect,useMemo,useRef,useState} from 'react';
import {BIPOLAR_SCALE_LABELS,LIKERT_SCALE_LABELS,PILOT_VERSION} from './pilotData';
import {behaviorOptions,bipolarPresentation,buildPilotOrder,getOrCreatePilotParticipantId,newPilotSessionId,normalizeTraitScore,type PilotItem} from './pilotLogic';
import './pilot.css';

type AnswerChoice={value:number;label:string};

type PilotResponse={
  session_id:string;
  participant_id:string;
  pilot_version:string;
  item_id:string;
  factor:string;
  item_format:'bipolar_5'|'likert_5'|'categorical';
  position:number;
  display_order:number;
  shown_at:string;
  answered_at:string;
  rt_ms:number;
  displayed_left_pole:string;
  displayed_right_pole:string;
  displayed_left_pole_id:string;
  displayed_right_pole_id:string;
  trait_pole:string;
  is_reversed:boolean;
  first_response:number;
  final_response:number;
  changed:boolean;
  raw_response:number;
  normalized_trait_score:number|null;
  answer_label:string;
  behavior_followup_prompt?:string;
  behavior_followup_first_response?:number;
  behavior_followup_final_response?:number;
  behavior_followup_changed?:boolean;
  behavior_followup_label?:string;
  quality_flags:{fast_response_flag:boolean};
  cognitive_feedback:{similar_to_previous:boolean;hard_to_understand:boolean;neither_fits:boolean};
  similarity_context:string[];
};

type PilotPayload={
  kind:'money_personality_pilot_v1';
  schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PILOT_V3';
  pilotVersion:string;
  sessionId:string;
  participantId:string;
  formId:'ALL_54';
  startedAt:string;
  completedAt:string;
  durationMs:number;
  responseCount:number;
  answerCount:number;
  item_responses:PilotResponse[];
  quality:{cognitiveMode:boolean;debugMode:boolean;userAgent:string;sourceUrl:string};
};

function nowIso(){return new Date().toISOString()}

function saveLocal(payload:PilotPayload){
  const key='mudagiri_money_personality_pilot_sessions_v1';
  try{
    const current=JSON.parse(localStorage.getItem(key)||'[]');
    const xs=Array.isArray(current)?current:[];
    const next=[...xs.filter((x:any)=>x?.sessionId!==payload.sessionId),payload].slice(-100);
    localStorage.setItem(key,JSON.stringify(next));
  }catch{localStorage.setItem(key,JSON.stringify([payload]))}
}

async function saveRemote(payload:PilotPayload){
  const url=(import.meta as any).env?.VITE_MUDAGIRI_GAS_URL as string|undefined;
  if(!url)return;
  try{await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),keepalive:true,mode:'no-cors'})}catch{}
}

function itemKindLabel(item:PilotItem){
  if(item.family==='BIPOLAR')return 'CHOICE';
  if(item.family==='LIKERT')return 'CHECK';
  return 'ACTION';
}

function hasBehaviorFollowup(item:PilotItem){
  return item.family==='BEHAVIOR'&&'behavior_followup' in item;
}

export default function MoneyPersonalityPilot(){
  const params=useMemo(()=>new URLSearchParams(window.location.search),[]);
  const debugMode=params.get('debug')==='1';
  const cognitiveMode=debugMode||params.get('cognitive')==='1';
  const forcedParticipant=params.get('participant');
  const participantId=useMemo(()=>forcedParticipant||getOrCreatePilotParticipantId(),[forcedParticipant]);
  const questions=useMemo(()=>buildPilotOrder(participantId),[participantId]);

  const [stage,setStage]=useState<'intro'|'questions'|'done'>('intro');
  const [sessionId,setSessionId]=useState(()=>newPilotSessionId());
  const [startedAt,setStartedAt]=useState('');
  const [index,setIndex]=useState(0);
  const [responses,setResponses]=useState<PilotResponse[]>([]);
  const [selected,setSelected]=useState<AnswerChoice|null>(null);
  const [firstResponse,setFirstResponse]=useState<number|null>(null);
  const [changeCount,setChangeCount]=useState(0);
  const [followupSelected,setFollowupSelected]=useState<AnswerChoice|null>(null);
  const [followupFirstResponse,setFollowupFirstResponse]=useState<number|null>(null);
  const [followupChangeCount,setFollowupChangeCount]=useState(0);
  const [flags,setFlags]=useState<string[]>([]);
  const [completedPayload,setCompletedPayload]=useState<PilotPayload|null>(null);
  const shownPerf=useRef(0);
  const shownIso=useRef('');
  const question=questions[index];

  useEffect(()=>{
    if(stage!=='questions')return;
    shownPerf.current=performance.now();
    shownIso.current=nowIso();
    setSelected(null);setFirstResponse(null);setChangeCount(0);
    setFollowupSelected(null);setFollowupFirstResponse(null);setFollowupChangeCount(0);
    setFlags([]);
  },[stage,index]);

  const start=()=>{setStartedAt(nowIso());setStage('questions');setIndex(0);window.scrollTo({top:0,behavior:'auto'})};
  const choose=(choice:AnswerChoice)=>{if(firstResponse===null)setFirstResponse(choice.value);if(selected&&selected.value!==choice.value)setChangeCount(x=>x+1);setSelected(choice)};
  const chooseFollowup=(choice:AnswerChoice)=>{if(followupFirstResponse===null)setFollowupFirstResponse(choice.value);if(followupSelected&&followupSelected.value!==choice.value)setFollowupChangeCount(x=>x+1);setFollowupSelected(choice)};
  const toggleFlag=(flag:string)=>setFlags(xs=>xs.includes(flag)?xs.filter(x=>x!==flag):[...xs,flag]);

  const next=()=>{
    if(!selected||!question)return;
    const hasFollowup=hasBehaviorFollowup(question);
    if(hasFollowup&&!followupSelected)return;
    const answeredAt=nowIso();
    const rtMs=Math.max(0,Math.round(performance.now()-shownPerf.current));
    const bipolar=question.family==='BIPOLAR'?bipolarPresentation(question,participantId):null;
    const rawResponse=selected.value;
    const followup=hasFollowup&&question.family==='BEHAVIOR'&&'behavior_followup' in question?question.behavior_followup:null;
    const record:PilotResponse={
      session_id:sessionId,participant_id:participantId,pilot_version:PILOT_VERSION,item_id:question.item_id,factor:question.factor,
      item_format:question.family==='BIPOLAR'?'bipolar_5':question.family==='LIKERT'?'likert_5':'categorical',position:index+1,display_order:index+1,
      shown_at:shownIso.current||answeredAt,answered_at:answeredAt,rt_ms:rtMs,
      displayed_left_pole:bipolar?.leftText||'',displayed_right_pole:bipolar?.rightText||'',displayed_left_pole_id:bipolar?.leftPoleId||'',displayed_right_pole_id:bipolar?.rightPoleId||'',trait_pole:bipolar?.traitPole||'',is_reversed:bipolar?.isReversed||false,
      first_response:firstResponse??rawResponse,final_response:rawResponse,changed:changeCount>0,raw_response:rawResponse,
      normalized_trait_score:question.family==='BIPOLAR'?normalizeTraitScore(rawResponse,bipolar!.isReversed):question.family==='LIKERT'?rawResponse:null,
      answer_label:selected.label,
      ...(followup&&followupSelected?{
        behavior_followup_prompt:followup.prompt,
        behavior_followup_first_response:followupFirstResponse??followupSelected.value,
        behavior_followup_final_response:followupSelected.value,
        behavior_followup_changed:followupChangeCount>0,
        behavior_followup_label:followupSelected.label,
      }:{}),
      quality_flags:{fast_response_flag:rtMs<1200},
      cognitive_feedback:{similar_to_previous:flags.includes('similar_to_previous'),hard_to_understand:flags.includes('hard_to_understand'),neither_fits:flags.includes('neither_fits')},
      similarity_context:flags.includes('similar_to_previous')?[...questions.slice(Math.max(0,index-10),index).map(q=>q.item_id),question.item_id]:[]
    };
    const nextResponses=[...responses,record];
    if(index<questions.length-1){setResponses(nextResponses);setIndex(i=>i+1);window.scrollTo({top:0,behavior:'auto'});return}
    const completedAt=nowIso();
    const payload:PilotPayload={kind:'money_personality_pilot_v1',schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PILOT_V3',pilotVersion:PILOT_VERSION,sessionId,participantId,formId:'ALL_54',startedAt:startedAt||completedAt,completedAt,durationMs:Math.max(0,Date.parse(completedAt)-Date.parse(startedAt||completedAt)),responseCount:nextResponses.length,answerCount:nextResponses.length+nextResponses.filter(x=>x.behavior_followup_final_response!=null).length,item_responses:nextResponses,quality:{cognitiveMode,debugMode,userAgent:navigator.userAgent,sourceUrl:window.location.href}};
    setResponses(nextResponses);setCompletedPayload(payload);saveLocal(payload);void saveRemote(payload);setStage('done');window.scrollTo({top:0,behavior:'auto'});
  };

  const restart=()=>{setSessionId(newPilotSessionId());setStartedAt('');setResponses([]);setIndex(0);setCompletedPayload(null);setStage('intro');window.scrollTo({top:0,behavior:'auto'})};
  const copyPayload=async()=>{if(!completedPayload)return;try{await navigator.clipboard.writeText(JSON.stringify(completedPayload,null,2))}catch{}};

  if(stage==='intro')return <main className="mp-page"><section className="mp-card mp-intro"><div className="mp-kicker">MONEY PERSONALITY / V4.5.2 PILOT</div><h1>お金の性格診断<br/><span>検証版</span></h1><p className="mp-lead">正解・不正解はありません。普段の自分に自然に近い方を選んでください。</p><div className="mp-notice"><strong>54画面</strong><span>実質55回答。検証中のため結果はまだ表示しません。</span></div><div className="mp-points"><div><b>01</b><span>どちらが良い・悪いではありません</span></div><div><b>02</b><span>迷うときは真ん中でもOK</span></div><div><b>03</b><span>回答時間や変更も検証データとして記録します</span></div></div>{debugMode&&<div className="mp-debug">DEBUG / ALL_54<br/>{participantId}</div>}<button className="mp-primary" onClick={start}>診断をはじめる</button></section></main>;

  if(stage==='done')return <main className="mp-page"><section className="mp-card mp-done"><div className="mp-complete-mark">✓</div><div className="mp-kicker">PILOT COMPLETE</div><h1>回答完了</h1><p className="mp-lead">ありがとう。現在は検証期間のため、タイプ結果はまだ表示していません。</p><div className="mp-summary"><span>VERSION</span><b>V4.5.2</b><span>画面数</span><b>{responses.length}</b><span>回答数</span><b>{completedPayload?.answerCount??responses.length}</b></div>{cognitiveMode&&<button className="mp-secondary" onClick={copyPayload}>回答JSONをコピー</button>}{debugMode&&<button className="mp-ghost" onClick={restart}>同じ条件でもう一度テスト</button>}</section></main>;

  if(!question)return null;
  const progress=((index+1)/questions.length)*100;
  const needFollowup=hasBehaviorFollowup(question);
  return <main className="mp-page"><section className="mp-shell"><header className="mp-header"><div><span>{itemKindLabel(question)}</span>{debugMode&&<em>{question.item_id} / {question.factor} / V4.5.2</em>}</div><b>{index+1}<small> / {questions.length}</small></b></header><div className="mp-progress"><i style={{width:progress+'%'}}/></div><article className="mp-question-card">
    {question.family==='BIPOLAR'&&<BipolarQuestion item={question} participantId={participantId} selected={selected} onChoose={choose}/>} 
    {question.family==='LIKERT'&&<LikertQuestion item={question} selected={selected} onChoose={choose}/>} 
    {question.family==='BEHAVIOR'&&<BehaviorQuestion item={question} selected={selected} onChoose={choose} followupSelected={followupSelected} onChooseFollowup={chooseFollowup}/>} 
  </article>{cognitiveMode&&<div className="mp-cognitive"><span>開発メモ（任意）</span><button className={flags.includes('hard_to_understand')?'active':''} onClick={()=>toggleFlag('hard_to_understand')}>わかりにくい</button><button className={flags.includes('neither_fits')?'active':''} onClick={()=>toggleFlag('neither_fits')}>どちらも違う</button><button className={flags.includes('similar_to_previous')?'active':''} onClick={()=>toggleFlag('similar_to_previous')}>さっきと似ている</button></div>}<button className="mp-primary mp-next" disabled={!selected||(needFollowup&&!followupSelected)} onClick={next}>{index===questions.length-1?'回答を送信':'次へ'}</button><p className="mp-footnote">回答後も「次へ」を押すまでは変更できます。</p></section></main>;
}

function BipolarQuestion({item,participantId,selected,onChoose}:{item:PilotItem;participantId:string;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void}){
  if(item.family!=='BIPOLAR')return null;const p=bipolarPresentation(item,participantId);
  return <><div className="mp-family-label">どちらのスタンスが自然に近い？</div><div className="mp-scenario">{item.scenario}</div><div className="mp-bipolar-poles"><div><b>左</b><span>{p.leftText}</span></div><div><b>右</b><span>{p.rightText}</span></div></div><div className="mp-bipolar-scale">{BIPOLAR_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
}

function LikertQuestion({item,selected,onChoose}:{item:PilotItem;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void}){
  if(item.family!=='LIKERT')return null;
  return <><div className="mp-family-label">普段のお金の把握について</div><h2>{item.prompt}</h2><div className="mp-answer-list">{LIKERT_SCALE_LABELS.map((label,i)=>{const value=i+1;return <button key={value} className={selected?.value===value?'selected':''} onClick={()=>onChoose({value,label})}><b>{value}</b><span>{label}</span></button>})}</div></>;
}

function BehaviorQuestion({item,selected,onChoose,followupSelected,onChooseFollowup}:{item:PilotItem;selected:AnswerChoice|null;onChoose:(x:AnswerChoice)=>void;followupSelected:AnswerChoice|null;onChooseFollowup:(x:AnswerChoice)=>void}){
  if(item.family!=='BEHAVIOR')return null;
  const options=behaviorOptions(item);
  const followup='behavior_followup' in item?item.behavior_followup:null;
  return <><div className="mp-family-label">実際の行動について</div><h2>{item.prompt}</h2><div className="mp-answer-list">{options.map((label,i)=><button key={label} className={selected?.value===i+1?'selected':''} onClick={()=>onChoose({value:i+1,label})}><b>{i+1}</b><span>{label}</span></button>)}</div>{followup&&selected&&<div className="mp-followup"><div className="mp-family-label">続けてもう1つ</div><h2>{followup.prompt}</h2><div className="mp-answer-list">{followup.options.map((label,i)=><button key={label} className={followupSelected?.value===i+1?'selected':''} onClick={()=>onChooseFollowup({value:i+1,label})}><b>{i+1}</b><span>{label}</span></button>)}</div></div>}</>;
}
