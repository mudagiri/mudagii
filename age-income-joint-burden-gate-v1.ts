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
export const AGE_INCOME_JOINT_MIN_SAMPLE=30;
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
  eligibleForReviewBuffer:true as const,
 };
}
/** Data-pipeline sentinel: there are ZERO approved cross-tab cells yet. */
export const VERIFIED_2024_JOINT_BURDEN_CELLS_V1:readonly JointAgeIncomeRowV1[]=[];
