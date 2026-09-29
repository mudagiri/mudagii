import React,{useEffect,useMemo,useState} from 'react';
import RpgBlock1,{type FamilyProfile} from './RpgBlock1';
import ResultScreenV3 from './ResultScreenV3';
import type {ToneMode} from './tone-mode-v3';
import {TYPE_CONTENT_V31} from './type-content-v3.1';
import {scoreTypeAnswersV31,type TypeAnswersV31} from './type-questionnaire-v3.1';
import {newDiagnosisId,getOrCreateAnonymousUserId,acquisitionFromLocation} from './persistence-v1';
import {LocalPersistenceV3,productionPersistenceV3,eventV3,type PersistenceV3} from './persistence-v3';
import {buildResultViewModelV3} from './result-view-model-v3';
import type {AnnualIncomeBand,RawExpenses,FinalCategoryV3,AppraisalV3} from './mudagiri-integration-v3';

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
};

export default function MudagiriAppV2({onLine,onEvent,persistence}:{onLine?:(x?:Record<string,unknown>)=>void;onEvent?:(n:string,p?:Record<string,unknown>)=>void;persistence?:PersistenceV3}){
 const [toneMode,setToneMode]=useState<ToneMode>('serious');
 const [result,setResult]=useState<any>(null);
 const [diagnosisId]=useState(()=>typeof window==='undefined'?'server':newDiagnosisId());
 const [anonymousUserId]=useState(()=>typeof window==='undefined'?'server':getOrCreateAnonymousUserId());
 const store=useMemo(()=>persistence??(typeof window!=='undefined'?productionPersistenceV3(new LocalPersistenceV3()):undefined),[persistence]);

 const emit=(name:string,data?:Record<string,unknown>)=>{
   onEvent?.(name,data);
   store?.appendEvent(eventV3(anonymousUserId,diagnosisId,name,data));
 };

 useEffect(()=>{
   if(typeof window==='undefined')return;
   const q=new URLSearchParams(window.location.search);
   if(q.get('ref')!=='share')return;
   const typeCode=q.get('type')??undefined;
   emit('share_referral_landed',{source:'type_share',...(typeCode?{typeCode}:{})});
 },[]);

 const complete=async(v:CompletedV3)=>{
   const scored=scoreTypeAnswersV31(v.typeAnswers);
   const content=TYPE_CONTENT_V31[scored.code];
   const vm=buildResultViewModelV3({
     diagnosisId,toneMode,profile:v.profile,
     type:{code:scored.code,name:content.name,description:content.summary,catchphrase:content.catchphrase,strengthLabel:content.strength,blindSpot:content.blindSpot,shareHook:content.shareHook,axes:scored.axes,axisStrength:scored.strength,nearMiddle:scored.nearMiddle},
     finalCategories:v.finalJudgements,
     monthlyImprovement:v.finalJudgements.reduce((sum,x)=>sum+x.reducible,0),
     annualIncomeBand:v.annualIncomeBand
   });
   const snapshot={
     schemaVersion:'MUDAGIRI_SHEET_V3' as const,
     diagnosisId,anonymousUserId,createdAt:new Date().toISOString(),
     acquisition:typeof window!=='undefined'?acquisitionFromLocation():undefined,
     toneMode,profile:v.profile,annualIncomeBand:v.annualIncomeBand,annualIncomeResolverInput:v.annualIncomeResolverInput,
     rawExpenses:v.rawExpenses,typeAnswers:v.typeAnswers,appraisal:v.appraisal,
     methodology:{diagnosis:v.methodologyVersion,resolver:v.resolverVersion,type:'TYPE_MODEL_V3_1_8'},
     result:{typeCode:scored.code,typeName:content.name,typeAxes:scored.axes,typeStrength:scored.strength,typeNearMiddle:scored.nearMiddle,counts:vm.counts,improvement:vm.improvement,
       finalStatuses:Object.fromEntries(v.finalJudgements.map(x=>[x.category,{status:x.status,attentionFlag:x.attentionFlag,reducible:x.reducible}])),
       finalDetails:Object.fromEntries(v.finalJudgements.map(x=>[x.category,{comparable:x.comparable,comparisonDifference:x.comparisonDifference,confirmedSaving:x.reducible,battleBasis:x.battleBasis,sourceVersion:x.benchmarkMeta?.sourceVersion??null,benchmarkMeta:x.benchmarkMeta??null}])),
       battleTargets:vm.battleTargets.map((x:any)=>x.category)}
   };
   await store?.saveDiagnosis(snapshot);
   emit('diagnosis_completed',{typeCode:scored.code,typeAxes:scored.axes,typeStrength:scored.strength,monthlyImprovement:vm.improvement.monthly,toneMode});
   setResult(vm);
   window.scrollTo({top:0,behavior:'auto'});
 };

 if(result)return <ResultScreenV3 vm={result} onEvent={emit} onLine={async(ctx)=>{
   const payload={...ctx,anonymousUserId,diagnosisId};
   try{await store?.saveLead?.({leadId:'lead_'+diagnosisId,anonymousUserId,diagnosisId,createdAt:new Date().toISOString(),stage:'anonymous',source:'result_line_cta',toneMode,typeCode:result.type.code,typeName:result.type.name,typeAxes:result.type.axes,typeStrength:result.type.axisStrength,annualIncomeBand:result.annualIncomeBand,profile:result.profile??null,rawExpenses:Object.fromEntries(result.rows.map((x:any)=>[x.category,{known:x.known,amount:x.amount,applicability:x.applicability}])),appraisal:Object.fromEntries(result.rows.filter((x:any)=>x.appraisal).map((x:any)=>[x.category,x.appraisal])),finalStatuses:Object.fromEntries(result.rows.map((x:any)=>[x.category,{status:x.status,reducible:x.reducible,attentionFlag:x.attentionFlag}])),needsReview:result.rows.filter((x:any)=>x.status==='review').map((x:any)=>x.category),protectedCategories:result.rows.filter((x:any)=>x.status==='protect').map((x:any)=>x.category),battleTargets:result.battleTargets.map((x:any)=>x.category),monthlyImprovement:result.improvement.monthly,firstQuest:ctx?.firstQuest??null});}catch{}
   if(onLine)onLine(payload); else window.location.href='https://lin.ee/ZeLu7i6';
 }}/>;

 return <RpgBlock1
   step="intro"
   toneMode={toneMode}
   onBegin={(mode)=>{setToneMode(mode);emit('diagnosis_started',{mode,...(typeof window!=='undefined'?acquisitionFromLocation():{})})}}
   onFamilySelect={()=>{}}
   onCompleteV3={complete}
   onEvent={emit}
 />;
}
