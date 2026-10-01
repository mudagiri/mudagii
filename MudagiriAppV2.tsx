import React,{useCallback,useEffect,useMemo,useState} from 'react';
import RpgBlock1,{type FamilyProfile} from './RpgBlock1';
import ResultScreenV4 from './ResultScreenV4';
import type {ToneMode} from './tone-mode-v3';
import {TYPE_CONTENT_V31} from './type-content-v3.1';
import {scoreTypeAnswersV31,type TypeAnswersV31} from './type-questionnaire-v3.1';
import {newDiagnosisId,getOrCreateAnonymousUserId,acquisitionFromLocation} from './persistence-v1';
import {LocalPersistenceV3,productionPersistenceV3,eventV3,type PersistenceV3} from './persistence-v3';
import {buildResultViewModelV3} from './result-view-model-v3';
import {buildResultViewModelV4} from './result-view-model-v4';
import {readActiveResultV1,writeActiveResultV1,readJourneyDraftV1,clearResumeStateV1,clearJourneyDraftV1} from './resume-state-v1';
import type {AnnualIncomeBand,RawExpenses,FinalCategoryV3,AppraisalV3} from './mudagiri-integration-v3';
import type {ProfileV4} from './mudagiri-profile-v4';
import type {ExpenseRecordsV4} from './expense-record-v4';
import type {ComparisonFactsV4} from './benchmark-router-v4';
import type {FinalCategoryV4} from './final-judgement-v4';
import {buildPersistencePayloadV4} from './persistence-v4';

export type CompletedV3={
 profile:{prefecture:string;age:number;household:FamilyProfile;householdSize:number;workStyle:string;housingType:string;monthlyTakeHome:number};
 annualIncomeBand:AnnualIncomeBand;
 annualIncomeResolverInput:number|null;
 rawExpenses:RawExpenses;
 typeAnswers:TypeAnswersV31;
 appraisal:Partial<Record<keyof RawExpenses,AppraisalV3>>;
 finalJudgements:FinalCategoryV3[];
 methodologyVersion:string;
 resolverVersion:string;
 scopeV4?:{profile:ProfileV4;expenseRecords:ExpenseRecordsV4;comparisons:ComparisonFactsV4;finalJudgements:FinalCategoryV4[];confirmedMonthly:number;diagnosisMethodology:string|null};
};

export default function MudagiriAppV2({onLine,onEvent,persistence}:{onLine?:(x?:Record<string,unknown>)=>void;onEvent?:(n:string,p?:Record<string,unknown>)=>void;persistence?:PersistenceV3}){
 const [toneMode,setToneMode]=useState<ToneMode>('serious');
 const [restored,setRestored]=useState(()=>typeof window==='undefined'?null:readActiveResultV1());
 const [draft,setDraft]=useState(()=>typeof window==='undefined'?null:readJourneyDraftV1());
 const [resumeChoice,setResumeChoice]=useState(()=>!restored&&!!draft);
 const [resumeOffered]=useState(()=>!restored&&!!draft);
 const [result,setResult]=useState<any>(null);
 const [diagnosisId,setDiagnosisId]=useState(()=>restored?.diagnosisId??draft?.diagnosisId??(typeof window==='undefined'?'server':newDiagnosisId()));
 const [anonymousUserId]=useState(()=>restored?.anonymousUserId??draft?.anonymousUserId??(typeof window==='undefined'?'server':getOrCreateAnonymousUserId()));
 const store=useMemo(()=>persistence??(typeof window!=='undefined'?productionPersistenceV3(new LocalPersistenceV3()):undefined),[persistence]);

 const emit=useCallback((name:string,data?:Record<string,unknown>)=>{
   onEvent?.(name,data);
   store?.appendEvent(eventV3(anonymousUserId,diagnosisId,name,data));
 },[onEvent,store,anonymousUserId,diagnosisId]);

 useEffect(()=>{if(resumeOffered&&draft)emit('journey_resume_offered',{scene:draft.scene})},[resumeOffered,draft,emit]);

 useEffect(()=>{
   if(typeof window==='undefined')return;
   const q=new URLSearchParams(window.location.search);
   if(q.get('ref')!=='share')return;
   const typeCode=q.get('type')??undefined;
   emit('share_referral_landed',{source:'type_share',...(typeCode?{typeCode}:{})});
 },[emit]);

 useEffect(()=>{
   if(!restored||result)return;
   const v=restored.completed as CompletedV3;
   try{
     const scored=scoreTypeAnswersV31(v.typeAnswers);
     const content=TYPE_CONTENT_V31[scored.code];
     const typeVm={code:scored.code,name:content.name,description:content.summary,catchphrase:content.catchphrase,strengthLabel:content.strength,blindSpot:content.blindSpot,shareHook:content.shareHook,axes:scored.axes,axisStrength:scored.strength,nearMiddle:scored.nearMiddle};
     const vm=v.scopeV4?buildResultViewModelV4({
       diagnosisId:restored.diagnosisId,toneMode:restored.completed.toneMode??'serious',profile:v.scopeV4.profile,
       type:typeVm,finalCategories:v.scopeV4.finalJudgements,annualIncomeBand:v.annualIncomeBand
     }):buildResultViewModelV3({
       diagnosisId:restored.diagnosisId,toneMode:restored.completed.toneMode??'serious',profile:v.profile,
       type:typeVm,finalCategories:v.finalJudgements,monthlyImprovement:v.finalJudgements.reduce((sum,x)=>sum+x.reducible,0),annualIncomeBand:v.annualIncomeBand
     });
     setToneMode(restored.completed.toneMode??'serious');setResult(vm);
     emit('result_restored',{source:'reload_or_return'});
   }catch{}
 },[restored,result]);

 const complete=async(v:CompletedV3)=>{
   const scored=scoreTypeAnswersV31(v.typeAnswers);
   const content=TYPE_CONTENT_V31[scored.code];
   const typeVm={code:scored.code,name:content.name,description:content.summary,catchphrase:content.catchphrase,strengthLabel:content.strength,blindSpot:content.blindSpot,shareHook:content.shareHook,axes:scored.axes,axisStrength:scored.strength,nearMiddle:scored.nearMiddle};
   const vm=v.scopeV4?buildResultViewModelV4({
     diagnosisId,toneMode,profile:v.scopeV4.profile,type:typeVm,finalCategories:v.scopeV4.finalJudgements,annualIncomeBand:v.annualIncomeBand
   }):buildResultViewModelV3({
     diagnosisId,toneMode,profile:v.profile,type:typeVm,finalCategories:v.finalJudgements,
     monthlyImprovement:v.finalJudgements.reduce((sum,x)=>sum+x.reducible,0),annualIncomeBand:v.annualIncomeBand
   });
   const persistenceV4=v.scopeV4?buildPersistencePayloadV4({
     diagnosisId,anonymousUserId,profile:v.scopeV4.profile,finalCategories:v.scopeV4.finalJudgements
   }):null;
   const savedFinalStatuses=v.scopeV4
     ?Object.fromEntries(v.scopeV4.finalJudgements.map(x=>[x.category,{status:x.status==='cut'?'battle':x.status,attentionFlag:x.attentionFlag,reducible:x.confirmedSaving}]))
     :Object.fromEntries(v.finalJudgements.map(x=>[x.category,{status:x.status,attentionFlag:x.attentionFlag,reducible:x.reducible}]));
   const savedFinalDetails=v.scopeV4
     ?Object.fromEntries(v.scopeV4.finalJudgements.map(x=>[x.category,{comparable:x.comparison.benchmark,comparisonAmount:x.comparison.amount,comparisonAmountScope:x.comparison.amountScope,comparisonQuality:x.comparison.quality,comparisonDifference:x.comparison.difference,confirmedSaving:x.confirmedSaving,battleBasis:x.status==='cut'?'confirmed':'none',sourceVersion:x.comparison.sourceVersion,benchmarkMeta:x.comparison.benchmarkMeta}]))
     :Object.fromEntries(v.finalJudgements.map(x=>[x.category,{comparable:x.comparable,comparisonDifference:x.comparisonDifference,confirmedSaving:x.reducible,battleBasis:x.battleBasis,sourceVersion:x.benchmarkMeta?.sourceVersion??null,benchmarkMeta:x.benchmarkMeta??null}]));
   const snapshot={
     schemaVersion:'MUDAGIRI_SHEET_V3' as const,
     diagnosisId,anonymousUserId,createdAt:new Date().toISOString(),
     acquisition:typeof window!=='undefined'?acquisitionFromLocation():undefined,
     toneMode,profile:v.profile,annualIncomeBand:v.annualIncomeBand,annualIncomeResolverInput:v.annualIncomeResolverInput,scopeV4:v.scopeV4??null,persistenceV4,
     rawExpenses:v.rawExpenses,typeAnswers:v.typeAnswers,appraisal:v.appraisal,
     methodology:{diagnosis:v.scopeV4?.diagnosisMethodology??v.methodologyVersion,resolver:v.resolverVersion,type:'TYPE_MODEL_V3_1_8'},
     result:{typeCode:scored.code,typeName:content.name,typeAxes:scored.axes,typeStrength:scored.strength,typeNearMiddle:scored.nearMiddle,counts:vm.counts,improvement:vm.improvement,
       finalStatuses:savedFinalStatuses,
       finalDetails:savedFinalDetails,
       battleTargets:vm.battleTargets.map((x:any)=>x.category),encounterTargets:vm.encounterTargets.map((x:any)=>x.category),secondaryReviewTargets:vm.secondaryReviewTargets.map((x:any)=>x.category)}
   };
   // RESULT must feel instant. Persist the resumable result locally first, render,
   // then send the heavier diagnosis snapshot without blocking navigation.
   if(typeof window!=='undefined'){
     writeActiveResultV1({schemaVersion:'MUDAGIRI_ACTIVE_RESULT_V1',diagnosisId,anonymousUserId,completedAt:new Date().toISOString(),methodology:{diagnosis:v.methodologyVersion,resolver:v.resolverVersion,type:'TYPE_MODEL_V3_1_8'},completed:{...v,toneMode}});
     clearJourneyDraftV1();
   }
   setResult(vm);
   if(typeof window!=='undefined')window.scrollTo({top:0,behavior:'auto'});
   queueMicrotask(()=>{
     emit('diagnosis_completed',{typeCode:scored.code,typeAxes:scored.axes,typeStrength:scored.strength,toneMode});
     void Promise.resolve(store?.saveDiagnosis(snapshot)).catch(()=>{});
   });
 };

 if(resumeChoice&&draft)return <main style={{minHeight:'100dvh',display:'grid',placeItems:'center',background:'#070d14',color:'#fff',fontFamily:'system-ui',padding:24}}><section style={{width:'min(100%,390px)',padding:24,border:'1px solid #293644',borderRadius:16,background:'#0d1721',textAlign:'center'}}><div style={{color:'#f5cc39',fontWeight:900,fontSize:12,letterSpacing:'.12em'}}>QUEST DATA FOUND</div><h2>冒険の続きが残っています</h2><p style={{color:'#aeb8c2',lineHeight:1.7}}>前回の入力内容を使って、途中から再開できます。</p><button style={{width:'100%',minHeight:54,borderRadius:12,border:0,fontWeight:900,background:'#f5cc39'}} onClick={()=>{setResumeChoice(false);emit('journey_resumed',{scene:draft.scene})}}>▶ 続きから再開</button><button style={{marginTop:16,border:0,background:'transparent',color:'#aeb8c2',textDecoration:'underline'}} onClick={()=>{clearResumeStateV1();onEvent?.('journey_restarted',{from:'draft'});store?.appendEvent(eventV3(anonymousUserId,diagnosisId,'journey_restarted',{from:'draft'}));setDraft(null);setResumeChoice(false);setDiagnosisId(newDiagnosisId())}}>最初から</button></section></main>;

 if(result)return <ResultScreenV4 vm={result} onEvent={emit} onBeforeExternal={()=>{const active=typeof window!=='undefined'?readActiveResultV1():null;if(!active||active.diagnosisId!==diagnosisId)throw new Error('active result missing before external navigation')}} onRestart={()=>{const nextId=typeof window==='undefined'?'server':newDiagnosisId();if(typeof window!=='undefined')clearResumeStateV1();onEvent?.('journey_restarted',{from:'result'});store?.appendEvent(eventV3(anonymousUserId,diagnosisId,'journey_restarted',{from:'result'}));setRestored(null);setResult(null);setToneMode('serious');setDiagnosisId(nextId);window.scrollTo({top:0,behavior:'auto'})}} onLine={async(ctx)=>{
   const payload={...ctx,anonymousUserId,diagnosisId};
   try{await store?.saveLead?.({leadId:'lead_'+diagnosisId+(ctx?.handoffCode?'_'+ctx.handoffCode:''),anonymousUserId,diagnosisId,createdAt:new Date().toISOString(),stage:'anonymous',source:'result_line_cta',toneMode,typeCode:result.type.code,typeName:result.type.name,typeAxes:result.type.axes,typeStrength:result.type.axisStrength,annualIncomeBand:result.annualIncomeBand,profile:result.profile??null,rawExpenses:Object.fromEntries(result.rows.map((x:any)=>[x.category,{known:x.known,amount:x.amount,applicability:x.applicability}])),appraisal:Object.fromEntries(result.rows.filter((x:any)=>x.appraisal).map((x:any)=>[x.category,x.appraisal])),finalStatuses:Object.fromEntries(result.rows.map((x:any)=>[x.category,{status:x.status,reducible:x.reducible,attentionFlag:x.attentionFlag}])),needsReview:result.rows.filter((x:any)=>x.status==='review').map((x:any)=>x.category),protectedCategories:result.rows.filter((x:any)=>x.status==='protect').map((x:any)=>x.category),battleTargets:result.battleTargets.map((x:any)=>x.category),monthlyImprovement:result.improvement.monthly,firstQuest:ctx?.firstQuest??null,ctaPlacement:ctx?.placement??null,handoffCode:ctx?.handoffCode??null,consultPrimary:ctx?.consultPrimary??result.consultRoute?.primary??'lifeplan',consultSelectedTopic:ctx?.consultSelectedTopic??ctx?.consultPrimary??result.consultRoute?.primary??'lifeplan',insuranceReview:ctx?.insuranceReview??result.consultRoute?.insuranceReview??false,homeStructure:ctx?.homeStructure??null,solarEligible:ctx?.solarEligible??false,consultRoute:result.consultRoute??null});}catch{}
   if(onLine)onLine(payload); else window.location.href='https://lin.ee/ZeLu7i6';
 }}/>;

 return <RpgBlock1
   key={diagnosisId}
   step="intro"
   toneMode={toneMode}
   onBegin={(mode)=>{setToneMode(mode);emit('diagnosis_started',{mode,...(typeof window!=='undefined'?acquisitionFromLocation():{})})}}
   onFamilySelect={()=>{}}
   onCompleteV3={complete}
   onEvent={emit}
   resumeDraft={draft}
   diagnosisId={diagnosisId}
   anonymousUserId={anonymousUserId}
 />;
}
