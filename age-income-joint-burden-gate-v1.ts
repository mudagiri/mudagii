/**
 * Source contract for the ONLY acceptable peer rate:
 * 2024 Survey of Household Economy 1-29-1, e-Stat 0004039867
 * age group × GROSS annual household income class × single/multi household
 * × worker/other classification × same-cell average monthly disposable
 * income × same-cell monthly category expense.
 *
 * Never infer a cell from separate 2025 income-only and age-only marginals.
 * No cells are bundled before the 2024 raw cross-tab figures and sample counts
 * have been independently validated. Fail CLOSED until then.
 */
export const AGE_INCOME_JOINT_SOURCE_V1={
 year:2024,
 published:'2025-12-19',
 table:'1-29-1',
 statsDataId:'0004039867',
 fileIds:{single:'000040379262',multi:'000040379261'},
 url:'https://www.e-stat.go.jp/dbview?sid=0004039867',
 ageVariable:'世帯主の年齢階級32区分',
 incomeVariable:'年間収入階級44区分',
 denominator:'可処分所得',
 sampleVariable:'集計世帯数（概数）',
 } as const;
// Approximate sample counts are rounded to tens in this 2024 release.
// Require >=50 approximate sampled households for each narrow original
// age×income class; stricter than our previous 2025 income-only n>=30.
import {OBSERVED_2024_MULTI_WORKER_CELLS} from './age-income-joint-multi-2024-official-v1';
import {OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2} from './official-2024-50man-aligned-worker-v2';
import {OBSERVED_2024_HIGH_MULTI_WORKER_CELLS} from './age-income-joint-high-2024-official-v1';

export const AGE_INCOME_JOINT_MIN_SAMPLE=50;
export type JointBurdenExpense='food'|'energy'|'daily';
export type JointHouseholdType='single'|'multi';
export type JointAgeIncomeRowV1={
 household:JointHouseholdType;
 workStatus:'worker'|'non_worker'|'all';
 ageBand:string;grossAnnualIncomeBand:string;
 /** published approximate sampled-household count, not expansion weights */
 approximateSample: number|'X'|'-'|null;
 averageMonthlyDisposableYen:number|null;
 expenseYen:{food:number|null;energy:number|null;daily:number|null};
 sourceStatsDataId:typeof AGE_INCOME_JOINT_SOURCE_V1.statsDataId;
 /**
  * Original Japanese row labels, downloaded source hash and reviewer checksum
  * must be completed before any data can be moved into a deployable matrix.
  */
 verifiedOfficialCell:boolean;
};
export type JointBurdenInputV1={
 household:JointHouseholdType;
 workStatus:'worker'|'non_worker'|'all';
 ageBand:string;
 publishedGrossIncomeBands:string[];
 expense:JointBurdenExpense;
 /** respondent is head by definition if single; require verification if multi */
 respondentAgeIsHouseholdHead:boolean;
};
export function resolveJointBurdenV1(input:JointBurdenInputV1,rows:readonly JointAgeIncomeRowV1[]){
 const missing=(reason:string)=>({
  available:false as const,reason,
  ratePctLow:null as number|null,ratePctHigh:null as number|null,
  sourceStatsDataId:null as string|null,usedCells:0,
  eligibleForReviewBuffer:false as const,
 });
 if(!input.respondentAgeIsHouseholdHead)return missing('HOUSEHOLD_HEAD_AGE_NOT_VERIFIED');
 if(!input.publishedGrossIncomeBands.length||new Set(input.publishedGrossIncomeBands).size!==input.publishedGrossIncomeBands.length)
  return missing('INCOME_CLASSES_NOT_PROVEN');
 if(!input.ageBand||!['worker','non_worker','all'].includes(input.workStatus))return missing('SCOPE_NOT_PROVEN');
 const selected=input.publishedGrossIncomeBands.map(band=>rows.filter(row=>
  row.household===input.household&&row.workStatus===input.workStatus&&row.ageBand===input.ageBand
  &&row.grossAnnualIncomeBand===band&&row.sourceStatsDataId===AGE_INCOME_JOINT_SOURCE_V1.statsDataId));
 // All relevant published sub-brackets must exist and be independently
 // signed off. Suppressed X/dashes and even one low-n row fail closed.
 if(selected.some(items=>items.length!==1))return missing('JOINT_SOURCE_CELL_MISSING');
 const cells=selected.map(items=>items[0]);
 if(cells.some(row=>!row.verifiedOfficialCell))return missing('RAW_CELLS_NOT_VERIFIED');
 if(cells.some(row=>typeof row.approximateSample!=='number'||
  !Number.isFinite(row.approximateSample)||row.approximateSample<AGE_INCOME_JOINT_MIN_SAMPLE))
  return missing('JOINT_CELL_SMALL_OR_SUPPRESSED');
 const valid=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
 if(cells.some(row=>!valid(row.averageMonthlyDisposableYen)||row.averageMonthlyDisposableYen<=0||
  !valid(row.expenseYen[input.expense])))return missing('DISPOSABLE_OR_EXPENSE_UNVERIFIED');
 const exactRates=cells.map(row=>row.expenseYen[input.expense]!/row.averageMonthlyDisposableYen!);
 return {
  available:true as const,reason:'OK',
  ratePctLow:Math.round(Math.min(...exactRates)*1000)/10,
  ratePctHigh:Math.round(Math.max(...exactRates)*1000)/10,
  sourceStatsDataId:AGE_INCOME_JOINT_SOURCE_V1.statsDataId,
  usedCells:cells.length,
  // A same-cell official peer ratio does not by itself prove matching work
  // status, costs, contracts or achievable savings for a participant.
  eligibleForReviewBuffer:false as const,
 };
}
/**
 * 2024 e-Stat 0004039867 table 1-29-1: independently read using the
 * PUBLIC official DB grid (世帯の種類=単身世帯, 世帯区分=勤労者世帯,
 * 10歳階級2: individual age, 2024年, 全国, published 50万円 income columns).
 *
 * Each row, strictly in order:
 * [headAgeClass, annualGrossClass, sampleApprox, meanMonthlyDisposable,
 *  meanMonthlyFood, meanMonthlyEnergy, meanMonthlyHousewares,
 *  meanMonthlyHouseholdConsumables]
 *
 * Provenance: read official grid's category rows
 * 集計世帯数（概数）/食料/光熱・水道/家事雑貨/家事用消耗品/可処分所得.
 * No interpolation, redistribution or postulated values.
 * "日用品" is a CONTRACT-DEFINED sum of published two household categories.
 *
 * For multi-family households, head age may not match respondent's age;
 * those official cross cells are NOT in this dataset.
 */
const OBSERVED_2024_SINGLE_WORKER_CELLS:readonly (readonly [string,string,number,number,number,number,number,number])[]=
 OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2
  .filter(row=>row[0]==='single')
  .map(row=>[row[1],row[2],row[3],row[4],row[5],row[6],row[7],row[8]] as const);
export const VERIFIED_2024_JOINT_BURDEN_CELLS_V1:readonly JointAgeIncomeRowV1[]=
 [
 ...OBSERVED_2024_SINGLE_WORKER_CELLS.map(([ageBand,grossAnnualIncomeBand,approximateSample,
   averageMonthlyDisposableYen,food,energy,houseware,consumables])=>({
  household:'single' as const,workStatus:'worker' as const,ageBand,grossAnnualIncomeBand,
  approximateSample,averageMonthlyDisposableYen,
  expenseYen:{food,energy,daily:houseware+consumables},
  sourceStatsDataId:AGE_INCOME_JOINT_SOURCE_V1.statsDataId,
  verifiedOfficialCell:true,
 })),
 ...OBSERVED_2024_MULTI_WORKER_CELLS.map(([ageBand,grossAnnualIncomeBand,approximateSample,
   averageMonthlyDisposableYen,food,energy,houseware,consumables])=>({
  household:'multi' as const,workStatus:'worker' as const,ageBand,grossAnnualIncomeBand,
  approximateSample,averageMonthlyDisposableYen,
  expenseYen:{food,energy,daily:houseware+consumables},
  sourceStatsDataId:AGE_INCOME_JOINT_SOURCE_V1.statsDataId,
  verifiedOfficialCell:true,
 })),
 ];
export const AGE_INCOME_SUPPORTED_SINGLE_GROSS_BANDS={
 '400_499':['400～450万円','450～500万円'],
 '500_599':['500～550万円','550～600万円'],
} as const;
export function ageBandForObserved2024V1(age:number):string|null{
 if(!Number.isInteger(age)||age<18||age>120)return null;
 if(age<30)return '30歳未満（10歳階級2）';
 if(age<40)return '30～39（10歳階級2）';
 if(age<50)return '40～49（10歳階級2）';
 if(age<60)return '50～59（10歳階級2）';
 if(age<70)return '60～69（10歳階級2）';
 if(age<80)return '70～79（10歳階級2）';
 return null;
}
export function resolve2024SingleWorkerPeerBurdenV1(
 age:number|null|undefined,
 grossBand:string|null|undefined,
 expense:JointBurdenExpense
){
 const ageBand=typeof age==='number'?ageBandForObserved2024V1(age):null;
 const incomeBands=grossBand==='400_499'||grossBand==='500_599'
  ?AGE_INCOME_SUPPORTED_SINGLE_GROSS_BANDS[grossBand]:null;
 if(!ageBand||!incomeBands)return {
  available:false as const,reason:!ageBand?'AGE_CLASS_UNSUPPORTED':'GROSS_INCOME_CLASS_UNSUPPORTED',
  ratePctLow:null as number|null,ratePctHigh:null as number|null,
  sourceStatsDataId:null as string|null,usedCells:0,eligibleForReviewBuffer:false as const,
 };
 return resolveJointBurdenV1({
  household:'single',workStatus:'worker',ageBand,
  publishedGrossIncomeBands:[...incomeBands],expense,
  respondentAgeIsHouseholdHead:true,
 },VERIFIED_2024_JOINT_BURDEN_CELLS_V1);
}


/** Household gross-income selection, no inference from take-home. */
export const AGE_INCOME_SUPPORTED_MULTI_GROSS_BANDS={
 '500_599':['500～550万円','550～600万円'],
 '600_699':['600～650万円','650～700万円'],
 '700_799':['700～750万円','750～800万円'],
 '800_999':['800～850万円','850～900万円','900～950万円','950～1000万円'],
} as const;

/**
 * Multi-person tables classify age by HEAD of household, not respondent.
 * Confirm head-age equivalence explicitly in a lightweight optional UI before
 * showing a same-age reference; worker cohort is labelled, not inferred.
 */
export function resolve2024MultiWorkerPeerBurdenV1(
 age:number|null|undefined,
 annualGrossBand:string|null|undefined,
 expense:JointBurdenExpense,
 headAgeConfirmed:boolean,
){
 const ageBand=typeof age==='number'?ageBandForObserved2024V1(age):null;
 const gross=annualGrossBand==='500_599'||annualGrossBand==='600_699'||
  annualGrossBand==='700_799'||annualGrossBand==='800_999'
  ?AGE_INCOME_SUPPORTED_MULTI_GROSS_BANDS[annualGrossBand]:null;
 if(!ageBand||!gross)return {
  available:false as const,reason:!ageBand?'AGE_CLASS_UNSUPPORTED':'GROSS_INCOME_CLASS_UNSUPPORTED',
  ratePctLow:null as number|null,ratePctHigh:null as number|null,
  sourceStatsDataId:null as string|null,usedCells:0,eligibleForReviewBuffer:false as const,
 };
 return resolveJointBurdenV1({
  household:'multi',workStatus:'worker',ageBand,
  publishedGrossIncomeBands:[...gross],expense,
  respondentAgeIsHouseholdHead:headAgeConfirmed,
 },VERIFIED_2024_JOINT_BURDEN_CELLS_V1);
}

/**
 * A respondent's age and gross income matching published cells is NOT enough
 * to assert membership in the published wage/salary-worker population.
 * Multi-person households additionally require confirmation that profile age
 * belongs to their household head. Display-only evidence gate, never savings.
 */
export function resolve2024DeclaredWorkerPeerV1(params:{
 household:JointHouseholdType;age:number|null|undefined;
 grossBand:string|null|undefined;expense:JointBurdenExpense;
 headAgeConfirmed:boolean;headWorkerConfirmed:boolean;
}){
 if(!params.headWorkerConfirmed)return {
  available:false as const,reason:'HOUSEHOLD_HEAD_WORK_STATUS_NOT_VERIFIED' as const,
  ratePctLow:null as number|null,ratePctHigh:null as number|null,
  sourceStatsDataId:null as string|null,usedCells:0,eligibleForReviewBuffer:false as const,
 };
 return params.household==='multi'
  ?resolve2024MultiWorkerPeerBurdenV1(params.age,params.grossBand,params.expense,params.headAgeConfirmed)
  :resolve2024SingleWorkerPeerBurdenV1(params.age,params.grossBand,params.expense);
}

/** Optional display-only gross-income refinement of the frozen 1000plus profile. */
export const AGE_INCOME_HIGH_MULTI_GROSS_BANDS={
 '1000_1249':['（再掲）1000～1250万円'],
 '1250_1499':['（再掲）1250～1500万円'],
 '1500plus':['（再掲）1500万円以上'],
} as const;
export type HighGrossBand2024V1=keyof typeof AGE_INCOME_HIGH_MULTI_GROSS_BANDS;
export const VERIFIED_2024_HIGH_MULTI_WORKER_CELLS_V1:readonly JointAgeIncomeRowV1[]=
 OBSERVED_2024_HIGH_MULTI_WORKER_CELLS.map(([ageBand,grossAnnualIncomeBand,approximateSample,
  averageMonthlyDisposableYen,food,energy,houseware,consumables])=>({
  household:'multi' as const,workStatus:'worker' as const,ageBand,grossAnnualIncomeBand,
  approximateSample,averageMonthlyDisposableYen,
  expenseYen:{food,energy,daily:houseware+consumables},
  sourceStatsDataId:AGE_INCOME_JOINT_SOURCE_V1.statsDataId,
  verifiedOfficialCell:true,
 }));

/**
 * A previously selected frozen annual-income bucket of 1000plus is not enough
 * to choose one original grouped e-Stat high-income column. The visitor must
 * separately opt in to a precise gross-income option, plus both scope gates.
 */
export function resolve2024HighMultiWorkerPeerBurdenV1(
 age:number|null|undefined,
 grossBand:HighGrossBand2024V1|null|undefined,
 expense:JointBurdenExpense,
 headAgeConfirmed:boolean,
 headWorkerConfirmed:boolean,
){
 const missing=(reason:string)=>({
  available:false as const,reason,ratePctLow:null as number|null,
  ratePctHigh:null as number|null,sourceStatsDataId:null as string|null,
  usedCells:0,eligibleForReviewBuffer:false as const,
 });
 if(!headWorkerConfirmed)return missing('HOUSEHOLD_HEAD_WORK_STATUS_NOT_VERIFIED');
 if(!headAgeConfirmed)return missing('HOUSEHOLD_HEAD_AGE_NOT_VERIFIED');
 if(!grossBand||!Object.prototype.hasOwnProperty.call(AGE_INCOME_HIGH_MULTI_GROSS_BANDS,grossBand))
  return missing('HIGH_GROSS_INCOME_CLASS_NOT_SELECTED');
 const ageBand=typeof age==='number'?ageBandForObserved2024V1(age):null;
 if(!ageBand)return missing('AGE_CLASS_UNSUPPORTED');
 return resolveJointBurdenV1({
  household:'multi',workStatus:'worker',ageBand,expense,
  publishedGrossIncomeBands:[...AGE_INCOME_HIGH_MULTI_GROSS_BANDS[grossBand]],
  respondentAgeIsHouseholdHead:true,
 },VERIFIED_2024_HIGH_MULTI_WORKER_CELLS_V1);
}
