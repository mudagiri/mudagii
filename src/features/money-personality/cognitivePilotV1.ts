import type {JobCode,StyleId} from './classifierV1';

export const MONEY_COGNITIVE_PILOT_VERSION='MUDAGIRI_MONEY_COGNITIVE_PILOT_V1' as const;
export const MONEY_COGNITIVE_STORAGE_KEY='mudagiri_money_type_cognitive_v1' as const;
export const MONEY_COGNITIVE_LAST_PAYLOAD_KEY='mudagiri_money_type_cognitive_last_payload_v1' as const;

export type CognitiveFlag='UNCLEAR'|'BOTH_FIT'|'NEITHER_FIT'|'REPETITIVE';
export const COGNITIVE_FLAG_LABEL:Record<CognitiveFlag,string>={
  UNCLEAR:'意味が取りづらい',
  BOTH_FIT:'両方当てはまる',
  NEITHER_FIT:'どちらも合わない',
  REPETITIVE:'似た質問に感じる',
};

export type CognitiveItemNote={
  itemId:string;
  kind:'trait'|'separator';
  flags:CognitiveFlag[];
  visitCount:number;
  totalViewMs:number;
  firstSeenAt:string;
  lastSeenAt:string;
};

export type ScreenshotTarget='JOB'|'WEAPON'|'STRENGTH'|'BLIND_SPOT'|'STYLE'|'AXES'|'NEXT_MOVE'|'OTHER';
export const SCREENSHOT_TARGET_LABEL:Record<ScreenshotTarget,string>={
  JOB:'JOB名・一言コピー',
  WEAPON:'WEAPON',
  STRENGTH:'強み',
  BLIND_SPOT:'死角',
  STYLE:'主属性・副属性',
  AXES:'3軸ステータス',
  NEXT_MOVE:'YOUR NEXT MOVE',
  OTHER:'その他',
};

export type CognitiveDebrief={
  jobFit:number|null;
  resultFit:number|null;
  questionClarity:number|null;
  lengthComfort:number|null;
  separatorNaturalness:number|null;
  shareIntent:number|null;
  householdIntent:number|null;
  screenshotTargets:ScreenshotTarget[];
  bestFitText:string;
  mismatchText:string;
  comment:string;
};

export function emptyCognitiveDebrief():CognitiveDebrief{
  return {
    jobFit:null,resultFit:null,questionClarity:null,lengthComfort:null,separatorNaturalness:null,
    shareIntent:null,householdIntent:null,screenshotTargets:[],bestFitText:'',mismatchText:'',comment:'',
  };
}

export function isCognitiveDebriefComplete(x:CognitiveDebrief,separatorCount:number){
  const ratings=[x.jobFit,x.resultFit,x.questionClarity,x.lengthComfort,x.shareIntent,x.householdIntent];
  if(ratings.some(v=>v==null||v<1||v>5))return false;
  if(separatorCount>0&&(x.separatorNaturalness==null||x.separatorNaturalness<1||x.separatorNaturalness>5))return false;
  return true;
}

export function toggleCognitiveFlag(flags:readonly CognitiveFlag[],flag:CognitiveFlag){
  const set=new Set(flags);
  if(set.has(flag))set.delete(flag);else set.add(flag);
  return [...set] as CognitiveFlag[];
}

export type CognitivePayloadInput={
  parentSessionId:string;
  anonymousUserId:string;
  participantId:string;
  startedAt:string;
  completedAt:string;
  itemNotes:Record<string,CognitiveItemNote>;
  debrief:CognitiveDebrief;
  jobCode:JobCode;
  jobName:string;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
  separatorCount:number;
  resultContentVersion:string;
  userAgent:string;
  sourceUrl:string;
};

export function buildCognitiveDebriefPayload(input:CognitivePayloadInput){
  if(!input.parentSessionId)throw new Error('parentSessionId required');
  if(!input.anonymousUserId)throw new Error('anonymousUserId required');
  if(!input.participantId)throw new Error('participantId required');
  if(!isCognitiveDebriefComplete(input.debrief,input.separatorCount))throw new Error('cognitive debrief incomplete');
  const notes=Object.values(input.itemNotes).sort((a,b)=>a.firstSeenAt.localeCompare(b.firstSeenAt));
  const flagged=notes.filter(x=>x.flags.length>0);
  const flagCounts:Record<CognitiveFlag,number>={UNCLEAR:0,BOTH_FIT:0,NEITHER_FIT:0,REPETITIVE:0};
  flagged.forEach(note=>note.flags.forEach(flag=>{flagCounts[flag]++}));
  const completedAt=input.completedAt||new Date().toISOString();
  const debriefRows=[
    ['JOB_FIT',input.debrief.jobFit],['RESULT_FIT',input.debrief.resultFit],['QUESTION_CLARITY',input.debrief.questionClarity],
    ['LENGTH_COMFORT',input.debrief.lengthComfort],['SEPARATOR_NATURALNESS',input.debrief.separatorNaturalness],
    ['SHARE_INTENT',input.debrief.shareIntent],['HOUSEHOLD_INTENT',input.debrief.householdIntent],
    ['SCREENSHOT_TARGETS',input.debrief.screenshotTargets],['BEST_FIT_TEXT',input.debrief.bestFitText],
    ['MISMATCH_TEXT',input.debrief.mismatchText],['COMMENT',input.debrief.comment],
  ].map(([item_id,final_response],index)=>({item_id,factor:'COGNITIVE_DEBRIEF',item_format:'pilot_feedback',position:index+1,final_response,normalized_trait_score:null}));
  const itemRows=notes.map((note,index)=>({
    item_id:note.itemId,
    factor:'COGNITIVE_ITEM_NOTE',
    item_format:note.kind,
    position:100+index,
    final_response:{flags:note.flags,visitCount:note.visitCount,totalViewMs:note.totalViewMs},
    normalized_trait_score:null,
  }));
  return {
    kind:'money_personality_pilot_v1' as const,
    schemaVersion:MONEY_COGNITIVE_PILOT_VERSION,
    pilotVersion:MONEY_COGNITIVE_PILOT_VERSION,
    sessionId:`${input.parentSessionId}__cognitive`,
    anonymousUserId:input.anonymousUserId,
    participantId:input.participantId,
    formId:'PUBLIC_COGNITIVE_DEBRIEF',
    startedAt:input.startedAt,
    completedAt,
    durationMs:input.startedAt?Math.max(0,Date.parse(completedAt)-Date.parse(input.startedAt)):0,
    responseCount:debriefRows.length+itemRows.length,
    answerCount:debriefRows.length+itemRows.length,
    item_responses:[...debriefRows,...itemRows],
    quality:{
      cognitiveMode:true,
      variant:'PUBLIC_COGNITIVE_DEBRIEF',
      parentSessionId:input.parentSessionId,
      jobCode:input.jobCode,
      jobName:input.jobName,
      primaryStyle:input.primaryStyle,
      secondaryStyle:input.secondaryStyle,
      separatorCount:input.separatorCount,
      resultContentVersion:input.resultContentVersion,
      flaggedItemCount:flagged.length,
      flagCounts,
      userAgent:input.userAgent,
      sourceUrl:input.sourceUrl,
    },
  };
}
