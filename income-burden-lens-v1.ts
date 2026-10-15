import type { ProfileV4 } from './mudagiri-profile-v4';

/**
 * Separate from the frozen comparable/saving engine.
 * A burden rate is the participant's own monthly spend / own monthly take-home,
 * NOT the 2025 Household Survey's income-bracket mean burden rate.
 */
export const INCOME_BURDEN_LENS_VERSION='MUDAGIRI_INCOME_BURDEN_LENS_V1' as const;
type RowLike={category:string;label?:string;known?:boolean;applicability?:string;amount?:number|null;diagnosisAmount?:number|null};
type BurdenProfile=Pick<ProfileV4,'diagnosisScope'|'monthlyTakeHome'|'householdContributionMode'|'bundledContributionAmount'>;
export type BurdenCategoryV1={category:string;label:string;monthlyAmount:number;shareOfTakeHomePct:number};
export type IncomeBurdenLensV1={
 version:typeof INCOME_BURDEN_LENS_VERSION;
 available:boolean;
 reason:'OK'|'UNKNOWN_MONTHLY_TAKE_HOME'|'INVALID_SCOPE';
 denominatorSource:'USER_INPUT_MONTHLY_TAKE_HOME'|'NONE';
 scope:'personal'|'household'|null;
 monthlyTakeHome:number|null;
 knownMonthlyExpenses:number;
 knownCategoryCount:number;
 missingCategoryCount:number;
 excludedCategoryCount:number;
 expenseShareOfTakeHomePct:number|null;
 categories:BurdenCategoryV1[];
 /** No official mean/target can be inferred from this participant-side ratio. */
 benchmarkAverageRatePct:null;
 bundledContributionExcluded:boolean;
};
const validAmount=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const percent=(a:number,b:number)=>Math.round(a/b*1000)/10;
export function buildIncomeBurdenLensV1(profile:BurdenProfile|null|undefined,rows:ReadonlyArray<RowLike>):IncomeBurdenLensV1{
 const scope=profile?.diagnosisScope==='personal'||profile?.diagnosisScope==='household'?profile.diagnosisScope:null;
 const takeHome=profile?.monthlyTakeHome;
 const validTakeHome=validAmount(takeHome)&&takeHome>0;
 const reason=!scope?'INVALID_SCOPE':!validTakeHome?'UNKNOWN_MONTHLY_TAKE_HOME':'OK';
 const observed=new Set<string>();
 const categories:{category:string;label:string;monthlyAmount:number}[]=[];
 let missing=0,excluded=0;
 for(const row of rows){
  if(!row||typeof row.category!=='string'||observed.has(row.category))continue;
  observed.add(row.category);
  if(row.applicability==='na'||row.applicability==='notApplicable'){excluded++;continue;}
  // Only diagnosis-scope amounts, never borrowed whole-household comparison amounts.
  // An amount of zero can be a known valid amount.
  const amount=row.diagnosisAmount===undefined?row.amount:row.diagnosisAmount;
  if(row.known!==true||!validAmount(amount)){missing++;continue;}
  categories.push({category:row.category,label:row.label??row.category,monthlyAmount:amount});
 }
 const total=categories.reduce((sum,row)=>sum+row.monthlyAmount,0);
 return {
  version:INCOME_BURDEN_LENS_VERSION,
  available:reason==='OK',reason,
  denominatorSource:reason==='OK'?'USER_INPUT_MONTHLY_TAKE_HOME':'NONE',
  scope,monthlyTakeHome:validTakeHome?takeHome:null,
  knownMonthlyExpenses:total,knownCategoryCount:categories.length,
  missingCategoryCount:missing,excludedCategoryCount:excluded,
  expenseShareOfTakeHomePct:reason==='OK'?percent(total,takeHome!):null,
  categories:reason==='OK'?categories.map(r=>({...r,shareOfTakeHomePct:percent(r.monthlyAmount,takeHome!)})):[],
  benchmarkAverageRatePct:null,
  bundledContributionExcluded:profile?.householdContributionMode==='bundled'
 };
}
