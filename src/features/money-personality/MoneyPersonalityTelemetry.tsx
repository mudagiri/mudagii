import {useEffect} from 'react';
import {evaluateMoneyPersonality,type SeparatorAnswers,type TraitAnswers} from './classifierV1';
import {itemById} from './pilotLogic';
import {getOrCreatePublicParticipantId,PUBLIC_MONEY_TYPE_VERSION} from './publicFlowV1';
import {MONEY_RESULT_CONTENT_VERSION} from './resultContentV1';
import {getOrCreateAnonymousUserId} from '../../../persistence-v1';
import {attemptPublicMoneyDelivery,sanitizedPublicMoneySourceUrl,stablePublicMoneyCompletedAt} from './publicTelemetryDeliveryV1';

type HistoryEntry={kind:'trait'|'separator';id:string};
type StoredState={
  version:string;
  sessionId:string;
  startedAt:string;
  answers:TraitAnswers;
  separators:SeparatorAnswers;
  history:HistoryEntry[];
  screenCount:number;
};

export const MONEY_TYPE_STATE_KEY='mudagiri_money_type_public_state_v1';
export const MONEY_TYPE_LAST_PAYLOAD_KEY='mudagiri_money_type_public_last_payload_v1';
export const MONEY_TYPE_HANDOFF_KEY='mudagiri_money_type_handoff_v1';

function readState():StoredState|null{
  try{
    const x=JSON.parse(localStorage.getItem(MONEY_TYPE_STATE_KEY)||'null') as StoredState|null;
    if(!x||x.version!==PUBLIC_MONEY_TYPE_VERSION||!x.sessionId||!x.answers||!x.separators)return null;
    return x;
  }catch{return null;}
}

function buildResponses(state:StoredState){
  return (state.history||[]).map((entry,index)=>{
    if(entry.kind==='separator'){
      return {
        item_id:entry.id,
        factor:'SEPARATOR',
        item_format:'separator',
        position:index+1,
        final_response:(state.separators as Record<string,unknown>)[entry.id]??'',
        normalized_trait_score:null,
      };
    }
    const item=itemById(entry.id);
    return {
      item_id:entry.id,
      factor:item.factor,
      item_format:item.family==='BIPOLAR'?'bipolar_5':item.family==='LIKERT'?'likert_5':'categorical',
      position:index+1,
      final_response:state.answers[entry.id]??null,
      normalized_trait_score:state.answers[entry.id]??null,
    };
  });
}

function captureCompletedSession(){
  const state=readState();
  if(!state)return;
  const evaluation=evaluateMoneyPersonality(state.answers,state.separators);
  const traitCount=Object.keys(state.answers).length;
  if(!evaluation.complete||!evaluation.jobCode||!evaluation.style.primary||!evaluation.style.secondary||traitCount<30)return;

  const participantId=getOrCreatePublicParticipantId();
  const anonymousUserId=getOrCreateAnonymousUserId();
  let previouslySaved:unknown=null;
  try{previouslySaved=JSON.parse(localStorage.getItem(MONEY_TYPE_LAST_PAYLOAD_KEY)||'null')}catch{}
  const completedAt=stablePublicMoneyCompletedAt(previouslySaved,state.sessionId,new Date().toISOString());
  const separatorCount=Object.keys(state.separators).length;
  const params=new URLSearchParams(window.location.search);
  const cognitiveMode=params.get('cognitive')==='1';
  const debugMode=params.get('debug')==='1';
  const payload={
    kind:'money_personality_pilot_v1' as const,
    schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_V1',
    pilotVersion:PUBLIC_MONEY_TYPE_VERSION,
    sessionId:state.sessionId,
    anonymousUserId,
    participantId,
    formId:'PUBLIC_ADAPTIVE',
    startedAt:state.startedAt||completedAt,
    completedAt,
    durationMs:state.startedAt?Math.max(0,Date.parse(completedAt)-Date.parse(state.startedAt)):0,
    responseCount:traitCount+separatorCount,
    answerCount:traitCount+separatorCount,
    item_responses:buildResponses(state),
    quality:{
      cognitiveMode,
      debugMode,
      variant:cognitiveMode?'PUBLIC_ADAPTIVE_COGNITIVE':'PUBLIC_ADAPTIVE',
      resultContentVersion:MONEY_RESULT_CONTENT_VERSION,
      userAgent:navigator.userAgent,
      sourceUrl:sanitizedPublicMoneySourceUrl(window.location.href),
      coreCount:30,
      adaptiveAnswerCount:Math.max(0,traitCount-30),
      separatorCount,
      jobCode:evaluation.jobCode,
      jobName:evaluation.jobName,
      primaryStyle:evaluation.style.primary,
      secondaryStyle:evaluation.style.secondary,
      axisStates:{
        TIME:evaluation.axes.TIME.balanceState,
        DECISION:evaluation.axes.DECISION.balanceState,
        AWARENESS:evaluation.axes.AWARENESS.balanceState,
      },
    },
  };

  const handoff={
    version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',
    resultContentVersion:MONEY_RESULT_CONTENT_VERSION,
    anonymousUserId,
    participantId,
    sessionId:state.sessionId,
    completedAt,
    jobCode:evaluation.jobCode,
    jobName:evaluation.jobName,
    primaryStyle:evaluation.style.primary,
    secondaryStyle:evaluation.style.secondary,
    factors:evaluation.factors,
    axes:evaluation.axes,
  };

  try{
    localStorage.setItem(MONEY_TYPE_LAST_PAYLOAD_KEY,JSON.stringify(payload));
    localStorage.setItem(MONEY_TYPE_HANDOFF_KEY,JSON.stringify(handoff));
  }catch{}

  // GAS uses idempotent upsert by session_id. Network delivery is never
  // asserted as successful: no-cors cannot expose the server receipt.
  // If the endpoint is absent, do not mark the event as submitted.
  const url=(import.meta as any).env?.VITE_MONEY_PERSONALITY_GAS_URL as string|undefined;
  void attemptPublicMoneyDelivery({
    sessionId:state.sessionId,payload,url,store:localStorage,
  });
}

/**
 * Non-visual companion for the public adaptive flow.
 * Telemetry is sent only to the dedicated Money Personality backend.
 * Household Diagnosis remains on its frozen backend; anonymousUserId is the join key.
 */
export default function MoneyPersonalityTelemetry(){
  useEffect(()=>{
    let queued=false;
    const capture=()=>{
      if(queued)return;
      queued=true;
      queueMicrotask(()=>{queued=false;captureCompletedSession()});
    };
    capture();
    const observer=new MutationObserver(capture);
    observer.observe(document.body,{subtree:true,childList:true});
    const timer=window.setInterval(capture,1000);
    return ()=>{observer.disconnect();window.clearInterval(timer)};
  },[]);
  return null;
}
