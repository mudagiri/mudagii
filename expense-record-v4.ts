import type { Category } from './mudagiri-diagnosis-v2';
import type { EducationStageV2 } from './comparable-resolver-v2';

export type ExpenseApplicabilityV4='applicable'|'na';
export type ComparisonQualityV4='exact'|'reference'|'none';
export type ExpenseAmountScopeV4='personal'|'household'|'property'|'contract'|'child';

export interface ExpenseMetadataV4 {
 sharedWithHousehold?:boolean;
 comparisonEligible?:boolean;
 comparisonEligibleAmount?:number|null;
 mobileIncludes?:('mobile'|'home_internet'|'device'|'family_lines'|'other')[];
 mobileEngineEligible?:boolean;
 carIncludes?:('loan'|'fuel'|'insurance'|'parking'|'maintenance'|'tax'|'tolls'|'other')[];
 housingAmountKind?:'rent_total'|'mortgage_payment'|'family_contribution'|'company_housing'|'other';
 educationChildren?:{stage:EducationStageV2}[];
 beautySex?:'male'|'female'|'preferNot';
 [key:string]:unknown;
}

export interface ExpenseRecordV4 {
 category:Category;
 diagnosisAmount:number|null;
 personalBurden:number|null;
 householdTotal:number|null;
 comparisonAmount:number|null;
 comparisonBenchmark:number|null;
 comparisonQuality:ComparisonQualityV4;
 known:boolean;
 applicability:ExpenseApplicabilityV4;
 metadata:ExpenseMetadataV4;
}

export type ExpenseRecordsV4=Record<Category,ExpenseRecordV4>;

export const V4_CATEGORIES:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];

export function emptyExpenseRecordV4(category:Category):ExpenseRecordV4{
 return {category,diagnosisAmount:null,personalBurden:null,householdTotal:null,comparisonAmount:null,comparisonBenchmark:null,comparisonQuality:'none',known:false,applicability:'applicable',metadata:{}};
}

export function emptyExpenseRecordsV4():ExpenseRecordsV4{
 return Object.fromEntries(V4_CATEGORIES.map(category=>[category,emptyExpenseRecordV4(category)])) as ExpenseRecordsV4;
}

const assertAmount=(name:string,v:number|null)=>{
 if(v!==null&&(!Number.isFinite(v)||v<0))throw new Error(`INVALID_${name}`);
};

export function assertExpenseRecordV4(x:ExpenseRecordV4){
 assertAmount('DIAGNOSIS_AMOUNT',x.diagnosisAmount);
 assertAmount('PERSONAL_BURDEN',x.personalBurden);
 assertAmount('HOUSEHOLD_TOTAL',x.householdTotal);
 assertAmount('COMPARISON_AMOUNT',x.comparisonAmount);
 assertAmount('COMPARISON_BENCHMARK',x.comparisonBenchmark);
 if(x.applicability==='na'){
  if(x.known||x.diagnosisAmount!==null||x.personalBurden!==null||x.householdTotal!==null)throw new Error('NA_MUST_NOT_HAVE_DIAGNOSIS_DATA');
  return;
 }
 if(!x.known&&x.diagnosisAmount!==null)throw new Error('UNKNOWN_MUST_HAVE_NULL_DIAGNOSIS_AMOUNT');
 if(x.known&&(x.diagnosisAmount===null||!Number.isFinite(x.diagnosisAmount)))throw new Error('KNOWN_REQUIRES_DIAGNOSIS_AMOUNT');
 if(x.comparisonQuality==='none'&&x.comparisonBenchmark!==null)throw new Error('NONE_COMPARISON_MUST_NOT_HAVE_BENCHMARK');
}

export function toLegacyRawExpenseV4(x:ExpenseRecordV4){
 assertExpenseRecordV4(x);
 return {amount:x.diagnosisAmount,known:x.known,applicability:x.applicability} as const;
}

export const EXPENSE_RECORD_V4_VERSION='MUDAGIRI_EXPENSE_RECORD_V4_0';
