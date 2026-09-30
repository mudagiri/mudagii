import type { Category, CategoryResult, Satisfaction } from './mudagiri-diagnosis-v2';
import type { ComparisonFactV4, ComparisonFactsV4 } from './benchmark-router-v4';
import type { ExpenseRecordV4, ExpenseRecordsV4 } from './expense-record-v4';
import { V4_CATEGORIES } from './expense-record-v4';

export type FinalStatusV4='cut'|'review'|'protect'|'safe'|'na';

export interface FinalAppraisalV4 {
 satisfaction?:Satisfaction;
 subUnusedAmount?:number|null;
 subCancellationConfirmed?:boolean;
 subUsage?:'none'|'one'|'several'|'unknown';
 energyPersistence?:'persistent'|'temporary'|'unknown';
 dailyPersistence?:'persistent'|'temporary'|'unknown';
 carNeed?:'essential'|'useful'|'burden'|'notNeeded';
 insurancePurpose?:'clear'|'mostly'|'unclear';
 insuranceLastReview?:'within1y'|'1to3y'|'over3y'|'never'|'unknown';
 rentPreference?:'burdenHigh'|'burdenSome'|'reasonable'|'protect';
 educationPreference?:'reviewHigh'|'reviewSome'|'necessary'|'protect';
 selfDevelopmentValue?:'inertia'|'unclear'|'purpose'|'results';
 mobileContractReviewed?:boolean;
}

export type FinalAppraisalsV4=Partial<Record<Category,FinalAppraisalV4>>;

export interface FinalCategoryV4 {
 category:Category;
 record:ExpenseRecordV4;
 comparison:ComparisonFactV4;
 engine:CategoryResult|null;
 status:FinalStatusV4;
 confirmedSaving:number;
 screeningDelta:number|null;
 attentionFlag:boolean;
 reasonCode:string;
 appraisal:FinalAppraisalV4|null;
}

const engineMap=(diagnosis:ReturnType<typeof import('./mudagiri-diagnosis-v2').runDiagnosisV2>|null,categoryResults?:CategoryResult[])=>{
 const map=new Map<Category,CategoryResult>();
 for(const x of categoryResults??diagnosis?.categories??[])map.set(x.category,x);
 return map;
};

function decide(category:Category,record:ExpenseRecordV4,comparison:ComparisonFactV4,engine:CategoryResult|null,ap?:FinalAppraisalV4):Omit<FinalCategoryV4,'category'|'record'|'comparison'|'engine'|'confirmedSaving'|'screeningDelta'>{
 if(record.applicability==='na')return {status:'na',attentionFlag:false,reasonCode:'NOT_APPLICABLE'};
 if(!record.known||record.diagnosisAmount===null)return {status:'review',attentionFlag:true,reasonCode:'AMOUNT_UNKNOWN'};
 if(record.diagnosisAmount===0)return {status:'safe',attentionFlag:false,reasonCode:'ZERO_SPEND'};
 if(engine?.state==='CONFIRMED'&&(engine.confirmedSaving??0)>0)return {status:'cut',attentionFlag:false,reasonCode:'CONFIRMED_AVOIDABLE_AMOUNT'};

 if(category==='mobile'){
  return {status:'review',attentionFlag:true,reasonCode:ap?.mobileContractReviewed?'MOBILE_PLAN_REVIEWED_NO_CONFIRMED_SAVING':'MOBILE_SCOPE_REQUIRES_CONTRACT_REVIEW'};
 }
 if(category==='sub'){
  if(ap?.subUsage==='none')return {status:'safe',attentionFlag:false,reasonCode:'SUBSCRIPTIONS_IN_USE'};
  if((ap?.subUnusedAmount??0)>0)return {status:'review',attentionFlag:true,reasonCode:'UNUSED_SUBSCRIPTION_NOT_CONFIRMED_CANCELLABLE'};
  return {status:'review',attentionFlag:true,reasonCode:'SUBSCRIPTION_USAGE_REVIEW'};
 }
 if(category==='insurance'){
  if(ap?.insurancePurpose==='clear'&&(ap?.insuranceLastReview==='within1y'||ap?.insuranceLastReview==='1to3y'))return {status:'protect',attentionFlag:false,reasonCode:'INSURANCE_PURPOSE_UNDERSTOOD'};
  return {status:'review',attentionFlag:true,reasonCode:'INSURANCE_CONTENT_REVIEW_REQUIRED'};
 }
 if(category==='car'){
  if(ap?.carNeed==='essential'||ap?.carNeed==='useful')return {status:'protect',attentionFlag:false,reasonCode:'CAR_NECESSITY_CONFIRMED'};
  return {status:'review',attentionFlag:true,reasonCode:'CAR_COST_DETAIL_REVIEW'};
 }
 if(category==='selfDevelopment'){
  if(ap?.selfDevelopmentValue==='purpose'||ap?.selfDevelopmentValue==='results')return {status:'protect',attentionFlag:false,reasonCode:'SELF_INVESTMENT_VALUE_CONFIRMED'};
  return {status:'review',attentionFlag:true,reasonCode:'SELF_INVESTMENT_VALUE_REVIEW'};
 }
 if(category==='childEducation'){
  if(ap?.educationPreference==='necessary'||ap?.educationPreference==='protect')return {status:'protect',attentionFlag:comparison.difference!==null&&comparison.difference>0,reasonCode:'EDUCATION_PRIORITY_PROTECTED'};
  return {status:'review',attentionFlag:true,reasonCode:'EDUCATION_CONTEXT_REVIEW'};
 }
 if(category==='rent'){
  if(ap?.rentPreference==='protect'||ap?.rentPreference==='reasonable')return {status:'protect',attentionFlag:comparison.difference!==null&&comparison.difference>0,reasonCode:'HOUSING_VALUE_PROTECTED'};
  if(ap?.rentPreference==='burdenHigh'||ap?.rentPreference==='burdenSome')return {status:'review',attentionFlag:true,reasonCode:'HOUSING_BURDEN_REVIEW'};
  if(comparison.difference!==null&&comparison.difference>0)return {status:'review',attentionFlag:true,reasonCode:'HOUSING_MARKET_POSITION_REVIEW'};
  return {status:'safe',attentionFlag:false,reasonCode:'HOUSING_NO_PRIORITY_SIGNAL'};
 }
 if(category==='energy'){
  if(comparison.difference!==null&&comparison.difference>0){
   if(ap?.energyPersistence==='temporary')return {status:'safe',attentionFlag:false,reasonCode:'ENERGY_TEMPORARY_SPIKE'};
   return {status:'review',attentionFlag:true,reasonCode:ap?.energyPersistence==='persistent'?'ENERGY_PERSISTENT_ABOVE_REFERENCE':'ENERGY_PERSISTENCE_UNKNOWN'};
  }
  return {status:'safe',attentionFlag:false,reasonCode:'ENERGY_WITHIN_REFERENCE'};
 }
 if(category==='daily'){
  if(comparison.difference!==null&&comparison.difference>0){
   if(ap?.dailyPersistence==='temporary')return {status:'safe',attentionFlag:false,reasonCode:'DAILY_TEMPORARY_SPIKE'};
   return {status:'review',attentionFlag:true,reasonCode:ap?.dailyPersistence==='persistent'?'DAILY_PERSISTENT_ABOVE_REFERENCE':'DAILY_PERSISTENCE_UNKNOWN'};
  }
  return {status:'safe',attentionFlag:false,reasonCode:'DAILY_WITHIN_REFERENCE'};
 }
 if(category==='food'||category==='fun'||category==='beautyFashion'){
  if(ap?.satisfaction==='verySatisfied'||ap?.satisfaction==='satisfied')return {status:'protect',attentionFlag:comparison.difference!==null&&comparison.difference>0,reasonCode:'VALUE_SPEND_PROTECTED'};
  if(ap?.satisfaction==='waste'||ap?.satisfaction==='inertia')return {status:'review',attentionFlag:true,reasonCode:'USER_WANTS_REVIEW'};
  if(comparison.difference!==null&&comparison.difference>0)return {status:'review',attentionFlag:true,reasonCode:'REFERENCE_ABOVE_REQUIRES_VALUE_CHECK'};
  return {status:'safe',attentionFlag:false,reasonCode:'NO_REVIEW_SIGNAL'};
 }
 return {status:engine?.needsReview?'review':'safe',attentionFlag:!!engine?.needsReview,reasonCode:engine?.needsReview?'ENGINE_REVIEW':'NO_REVIEW_SIGNAL'};
}

export function buildFinalJudgementsV4(a:{records:ExpenseRecordsV4;comparisons:ComparisonFactsV4;diagnosis:ReturnType<typeof import('./mudagiri-diagnosis-v2').runDiagnosisV2>|null;categoryResults?:CategoryResult[];appraisal?:FinalAppraisalsV4}){
 const byEngine=engineMap(a.diagnosis,a.categoryResults);
 const categories:FinalCategoryV4[]=V4_CATEGORIES.map(category=>{
  const record=a.records[category];
  const comparison=a.comparisons[category];
  const engine=byEngine.get(category)??null;
  const choice=decide(category,record,comparison,engine,a.appraisal?.[category]);
  return {
   category,
   record,
   comparison,
   engine,
   status:choice.status,
   confirmedSaving:engine?.confirmedSaving??0,
   screeningDelta:comparison.difference,
   attentionFlag:choice.attentionFlag,
   reasonCode:choice.reasonCode,
   appraisal:a.appraisal?.[category]??null,
  };
 });
 const cuts=categories.filter(x=>x.status==='cut'&&x.confirmedSaving>0).sort((a,b)=>b.confirmedSaving-a.confirmedSaving);
 const reviews=categories.filter(x=>x.status==='review');
 const protectedItems=categories.filter(x=>x.status==='protect');
 const safe=categories.filter(x=>x.status==='safe');
 const na=categories.filter(x=>x.status==='na');
 const confirmedMonthly=cuts.reduce((sum,x)=>sum+x.confirmedSaving,0);
 return {categories,cuts,reviews,protected:protectedItems,safe,na,confirmedMonthly,confirmedAnnual:confirmedMonthly*12};
}

export const FINAL_JUDGEMENT_V4_VERSION='MUDAGIRI_FINAL_JUDGEMENT_V4_0';
