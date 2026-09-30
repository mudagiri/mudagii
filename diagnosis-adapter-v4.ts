import type { Category, DiagnosisInput, Satisfaction } from './mudagiri-diagnosis-v2';
import { runDiagnosisV2 } from './mudagiri-diagnosis-v2';
import type { ExpenseRecordsV4 } from './expense-record-v4';
import { V4_CATEGORIES, assertExpenseRecordV4 } from './expense-record-v4';
import type { ComparisonFactsV4 } from './benchmark-router-v4';
import type { ProfileV4 } from './mudagiri-profile-v4';
import { assertProfileV4 } from './mudagiri-profile-v4';

export interface DiagnosisAppraisalV4 {
 satisfaction?:Satisfaction;
 subUnusedAmount?:number|null;
 subCancellationConfirmed?:boolean;
}

export type DiagnosisAppraisalsV4=Partial<Record<Category,DiagnosisAppraisalV4>>;

export interface DiagnosisAdapterV4Result {
 input:DiagnosisInput|null;
 diagnosis:ReturnType<typeof runDiagnosisV2>|null;
 skippedReason:'monthly_take_home_unknown_or_zero'|null;
}

export function buildDiagnosisInputV4(a:{profile:ProfileV4;records:ExpenseRecordsV4;comparisons:ComparisonFactsV4;appraisal?:DiagnosisAppraisalsV4;monthlySavingInvestment?:number;emergencyMonths?:number}):DiagnosisInput|null{
 assertProfileV4(a.profile);
 const income=a.profile.monthlyTakeHome;
 if(income===null||!(income>0))return null;

 const categories:DiagnosisInput['categories']=[];
 for(const category of V4_CATEGORIES){
  const record=a.records[category];
  assertExpenseRecordV4(record);
  if(record.applicability!=='applicable'||!record.known||record.diagnosisAmount===null)continue;
  const comparison=a.comparisons[category];
  const ap=a.appraisal?.[category];
  categories.push({
   category,
   actual:record.diagnosisAmount,
   comparable:comparison?.engineComparableAllowed?comparison.benchmark:null,
   satisfaction:ap?.satisfaction,
   unusedAmount:category==='sub'&&typeof ap?.subUnusedAmount==='number'?Math.max(0,Math.min(record.diagnosisAmount,ap.subUnusedAmount)):undefined,
   cancellationConfirmed:category==='sub'?ap?.subCancellationConfirmed:undefined,
  });
 }

 const saving=Math.max(0,a.monthlySavingInvestment??0);
 const knownSpend=categories.reduce((sum,x)=>sum+x.actual,0);
 return {
  monthlyTakeHomeIncome:income,
  monthlySavingInvestment:saving,
  freeCashFlow:income-knownSpend-saving,
  emergencyMonths:Math.max(0,a.emergencyMonths??0),
  categories,
 };
}

export function runDiagnosisAdapterV4(a:{profile:ProfileV4;records:ExpenseRecordsV4;comparisons:ComparisonFactsV4;appraisal?:DiagnosisAppraisalsV4;monthlySavingInvestment?:number;emergencyMonths?:number}):DiagnosisAdapterV4Result{
 const input=buildDiagnosisInputV4(a);
 if(!input)return {input:null,diagnosis:null,skippedReason:'monthly_take_home_unknown_or_zero'};
 return {input,diagnosis:runDiagnosisV2(input),skippedReason:null};
}

export const DIAGNOSIS_ADAPTER_V4_VERSION='MUDAGIRI_DIAGNOSIS_ADAPTER_V4_0';
