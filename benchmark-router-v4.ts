import type { Category } from './mudagiri-diagnosis-v2';
import { resolveComparableV2, type ComparableV2 } from './comparable-resolver-v2';
import type { ExpenseAmountScopeV4, ExpenseRecordV4, ExpenseRecordsV4, ComparisonQualityV4 } from './expense-record-v4';
import { V4_CATEGORIES, assertExpenseRecordV4 } from './expense-record-v4';
import type { ProfileV4 } from './mudagiri-profile-v4';
import { assertProfileV4, resolverAnnualIncomeV4, resolverHouseholdV4, resolverHousingTypeV4 } from './mudagiri-profile-v4';

export interface ComparisonFactV4 {
 category:Category;
 amount:number|null;
 benchmark:number|null;
 quality:ComparisonQualityV4;
 amountScope:ExpenseAmountScopeV4;
 sourceVersion:string|null;
 difference:number|null;
 engineComparableAllowed:boolean;
 autoSavingAllowed:false;
 benchmarkMeta:ComparableV2|null;
 reason:string;
}

export type ComparisonFactsV4=Record<Category,ComparisonFactV4>;

const SHARED_HOUSEHOLD_CATEGORIES=new Set<Category>(['energy','food','daily','rent','childEducation']);

function diagnosisScopeForCategory(category:Category,profile:ProfileV4):ExpenseAmountScopeV4{
 if(category==='rent')return 'property';
 if(category==='mobile')return 'contract';
 if(category==='childEducation')return 'child';
 return profile.diagnosisScope;
}

function comparisonCandidate(category:Category,profile:ProfileV4,record:ExpenseRecordV4){
 if(record.applicability!=='applicable'||!record.known||record.diagnosisAmount===null)return {amount:null,scope:diagnosisScopeForCategory(category,profile),fromDiagnosis:false,reason:'NO_KNOWN_AMOUNT'};

 if(typeof record.metadata.comparisonEligibleAmount==='number'&&Number.isFinite(record.metadata.comparisonEligibleAmount)&&record.metadata.comparisonEligibleAmount>=0){
  return {amount:record.metadata.comparisonEligibleAmount,scope:diagnosisScopeForCategory(category,profile),fromDiagnosis:record.metadata.comparisonEligibleAmount===record.diagnosisAmount,reason:'EXPLICIT_COMPARISON_ELIGIBLE_AMOUNT'};
 }

 if(profile.householdSize===1){
  return {amount:record.diagnosisAmount,scope:diagnosisScopeForCategory(category,profile),fromDiagnosis:true,reason:'SINGLE_PERSON_SCOPE_MATCH'};
 }

 if(profile.diagnosisScope==='household'){
  return {amount:record.diagnosisAmount,scope:diagnosisScopeForCategory(category,profile),fromDiagnosis:true,reason:'HOUSEHOLD_DIAGNOSIS_SCOPE_MATCH'};
 }

 if(SHARED_HOUSEHOLD_CATEGORIES.has(category)&&typeof record.householdTotal==='number'){
  const scope:ExpenseAmountScopeV4=category==='rent'?'property':category==='childEducation'?'child':'household';
  return {amount:record.householdTotal,scope,fromDiagnosis:false,reason:'PERSONAL_DIAGNOSIS_WITH_HOUSEHOLD_COMPARISON_TOTAL'};
 }

 return {amount:null,scope:diagnosisScopeForCategory(category,profile),fromDiagnosis:false,reason:'PERSONAL_MULTI_SCOPE_MISMATCH'};
}

function qualityFor(meta:ComparableV2|null,amount:number|null):ComparisonQualityV4{
 if(amount===null||meta?.value===null||meta?.value===undefined)return 'none';
 if(meta.confidence==='DIRECT')return 'exact';
 if(meta.confidence==='MODEL')return 'reference';
 return 'none';
}

export function buildComparisonFactsV4(a:{profile:ProfileV4;records:ExpenseRecordsV4;month?:number}):ComparisonFactsV4{
 assertProfileV4(a.profile);
 for(const category of V4_CATEGORIES)assertExpenseRecordV4(a.records[category]);

 const childMeta=a.records.childEducation.metadata;
 const beautyMeta=a.records.beautyFashion.metadata;
 const resolved=resolveComparableV2({
  household:resolverHouseholdV4(a.profile),
  householdSize:a.profile.householdSize,
  age:a.profile.age,
  annualIncome:resolverAnnualIncomeV4(a.profile),
  prefecture:a.profile.prefecture,
  month:a.month??new Date().getMonth()+1,
  housingType:resolverHousingTypeV4(a.profile),
  educationChildren:childMeta.educationChildren,
  beautySex:beautyMeta.beautySex,
 });

 return Object.fromEntries(V4_CATEGORIES.map(category=>{
  const record=a.records[category];
  const candidate=comparisonCandidate(category,a.profile,record);
  const meta=resolved[category]??null;
  const quality=qualityFor(meta,candidate.amount);
  const benchmark=quality==='none'?null:meta?.value??null;
  const amount=quality==='none'?candidate.amount:candidate.amount;
  const difference=amount!==null&&benchmark!==null?amount-benchmark:null;
  const engineComparableAllowed=quality!=='none'&&candidate.fromDiagnosis&&benchmark!==null&&category!=='mobile';
  const fact:ComparisonFactV4={
   category,
   amount,
   benchmark,
   quality,
   amountScope:candidate.scope,
   sourceVersion:meta?.sourceVersion??null,
   difference,
   engineComparableAllowed,
   autoSavingAllowed:false,
   benchmarkMeta:meta,
   reason:quality==='none'?(meta?.confidence==='AUDIT'?'BENCHMARK_AUDIT_ONLY':candidate.reason):candidate.reason,
  };
  return [category,fact];
 })) as ComparisonFactsV4;
}

export const BENCHMARK_ROUTER_V4_VERSION='MUDAGIRI_BENCHMARK_ROUTER_V4_0';
