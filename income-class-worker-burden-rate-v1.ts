import type {AnnualIncomeBandV4,ProfileV4} from './mudagiri-profile-v4';
import type {SingleIncomeFoodOptionV1} from './income-class-food-reference-v1';

/**
 * 2025 FIES 家計収支編 — observed, SAME-POPULATION worker-household
 * monthly spending and monthly disposable income in gross annual-income cells.
 *
 * Two-or-more worker households: Table 2-3, sheet 勤労・全国,
 * 2025 annual public release on 2026-02-06, e-Stat 000040409526.
 * Single worker households: Table 5, section 単身世帯のうち勤労者世帯,
 * e-Stat 000040409819.
 *
 * Exact monthly rows from each sheet: 集計世帯数, 可処分所得, 食料,
 * 光熱・水道, 家事雑貨, 家事用消耗品.
 * "日用品"=家事雑貨+家事用消耗品 (an explicitly constructed sum).
 *
 * Dividing worker expenses by worker disposable income in the SAME bracket
 * is valid as a reference ratio. It is NOT the average of individuals'
 * expense ratios, and there is no age×income×household-size cross.
 *
 * This display-only lens MUST NOT change frozen primary comparables,
 * V5 statuses, confirmed saving A, candidate cUpper, or future scenario.
 */
export const WORKER_BURDEN_VERSION='FIES_2025_WORKER_INCOME_BURDEN_V1' as const;
export const WORKER_BURDEN_SOURCE={
 multi:{year:2025,table:'第2-3表',population:'全国・二人以上の勤労者世帯',
  sourceUrl:'https://www.e-stat.go.jp/stat-search/files?stat_infid=000040409526',
  sourceTableId:'000040409526',sheet:'勤労・全国'},
 single:{year:2025,table:'第5表',population:'全国・単身の勤労者世帯',
  sourceUrl:'https://www.e-stat.go.jp/stat-search/files?stat_infid=000040409819',
  sourceTableId:'000040409819',sheet:'単身：勤労者世帯'},
} as const;
/** Protect visitors from very small published cells (n<30 is a product
 * presentation cutoff, NOT an official statistical-significance threshold). */
export const MIN_WORKER_BURDEN_SAMPLE=30;
export type WorkerBurdenCategory='food'|'energy'|'daily';
type Raw={
 min:number;max:number|null;label:string;
 sample:number;disposable:number;food:number;energy:number;daily:number
};
const MULTI:readonly Raw[]=[
 {min:0,max:200,label:'200万円未満',sample:29,disposable:156497,food:59436,energy:20392,daily:4699},
 {min:200,max:250,label:'200～250万円',sample:54,disposable:211738,food:63542,energy:20535,daily:4588},
 {min:250,max:300,label:'250～300万円',sample:58,disposable:290184,food:68539,energy:21714,daily:5027},
 {min:300,max:350,label:'300～350万円',sample:89,disposable:278764,food:66960,energy:22810,daily:4807},
 {min:350,max:400,label:'350～400万円',sample:122,disposable:300549,food:69964,energy:22450,daily:5130},
 {min:400,max:450,label:'400～450万円',sample:155,disposable:339777,food:75081,energy:24761,daily:5607},
 {min:450,max:500,label:'450～500万円',sample:197,disposable:348740,food:78563,energy:22408,daily:5907},
 {min:500,max:550,label:'500～550万円',sample:249,disposable:370307,food:78411,energy:23128,daily:6130},
 {min:550,max:600,label:'550～600万円',sample:260,disposable:401408,food:82570,energy:24038,daily:6107},
 {min:600,max:650,label:'600～650万円',sample:268,disposable:434227,food:83624,energy:23206,daily:6367},
 {min:650,max:700,label:'650～700万円',sample:275,disposable:448621,food:87664,energy:23331,daily:6502},
 {min:700,max:750,label:'700～750万円',sample:287,disposable:470221,food:90944,energy:23678,daily:6741},
 {min:750,max:800,label:'750～800万円',sample:246,disposable:501895,food:91307,energy:24550,daily:6852},
 {min:800,max:900,label:'800～900万円',sample:461,disposable:550199,food:98739,energy:24636,daily:7589},
 {min:900,max:1000,label:'900～1,000万円',sample:319,disposable:593766,food:100601,energy:24185,daily:7582},
 {min:1000,max:1250,label:'1,000～1,250万円',sample:471,disposable:706395,food:109711,energy:26283,daily:7663},
 {min:1250,max:1500,label:'1,250～1,500万円',sample:206,disposable:828507,food:114725,energy:24946,daily:8108},
 {min:1500,max:null,label:'1,500万円以上',sample:169,disposable:1064358,food:138858,energy:26395,daily:8608},
] as const;
const SINGLE:readonly Raw[]=[
 {min:0,max:100,label:'100万円未満',sample:4,disposable:168206,food:33259,energy:12006,daily:1996},
 {min:100,max:200,label:'100～200万円',sample:19,disposable:173426,food:33895,energy:11540,daily:3084},
 {min:200,max:300,label:'200～300万円',sample:45,disposable:202183,food:38779,energy:11875,daily:2404},
 {min:300,max:400,label:'300～400万円',sample:52,disposable:251367,food:43717,energy:11559,daily:3165},
 {min:400,max:500,label:'400～500万円',sample:39,disposable:322112,food:46856,energy:11094,daily:3466},
 {min:500,max:600,label:'500～600万円',sample:27,disposable:356412,food:46629,energy:10606,daily:3450},
 {min:600,max:null,label:'600万円以上',sample:39,disposable:477915,food:57180,energy:10927,daily:3396},
] as const;
const MULTI_OPTIONS:Record<Exclude<AnnualIncomeBandV4,'unknown'>,{min:number;max:number|null;label:string}>={
 under500:{min:0,max:500,label:'500万円未満'},
 '500_599':{min:500,max:600,label:'500～599万円'},
 '600_699':{min:600,max:700,label:'600～699万円'},
 '700_799':{min:700,max:800,label:'700～799万円'},
 '800_999':{min:800,max:1000,label:'800～999万円'},
 '1000plus':{min:1000,max:null,label:'1,000万円以上'},
};
const SINGLE_INDEX:Record<SingleIncomeFoodOptionV1,number>={
 under100:0,'100_199':1,'200_299':2,'300_399':3,'400_499':4,'500_599':5,'600plus':6
};
export type WorkerBurdenCellV1={
 label:string;sample:number;
 monthlyDisposableIncomeYen:number;
 monthlyExpenseYen:number;
 /** ratio of reported class means, NEVER mean of household-level percentages */
 expenseToDisposableRate:number;
};
export type WorkerBurdenCategoryV1={
 category:WorkerBurdenCategory;
 ratePctLow:number;ratePctHigh:number;
 monthlyExpenseLowYen:number;monthlyExpenseHighYen:number;
 /** Preserve each published cell; no synthetic weighted aggregation. */
 cells:WorkerBurdenCellV1[];
};
export type WorkerBurdenReferenceV1={
 version:typeof WORKER_BURDEN_VERSION;
 available:boolean;
 reason:'OK'|'INCOME_BAND_MISSING'|'SMALL_SAMPLE'|'NO_MATCHED_CELL'|'INVALID_SCOPE';
 population:'multi'|'single'|null;
 label:string|null;
 source:typeof WORKER_BURDEN_SOURCE.multi|typeof WORKER_BURDEN_SOURCE.single|null;
 sampleMinimum:number|null;
 matchedPublishedCells:number;
 /** The reference is conditional on worker-household population, not on
  * visitor employment; the profile has no proven employment flag. */
 populationMatchesVisitorEmployment:'UNVERIFIED';
 ratioDefinition:'CLASS_MEAN_EXPENSE_DIVIDED_BY_SAME_CLASS_MEAN_DISPOSABLE_INCOME';
 meanOfHouseholdIndividualRates:false;
 neverUseForSavings:true;
 categories:Partial<Record<WorkerBurdenCategory,WorkerBurdenCategoryV1>>;
 note:string;
};
const empty=(reason:Exclude<WorkerBurdenReferenceV1['reason'],'OK'>,pop:'multi'|'single'|null,label:string|null):WorkerBurdenReferenceV1=>({
 version:WORKER_BURDEN_VERSION,available:false,reason,population:pop,label,
 source:pop?WORKER_BURDEN_SOURCE[pop]:null,sampleMinimum:null,
 matchedPublishedCells:0,populationMatchesVisitorEmployment:'UNVERIFIED',
 ratioDefinition:'CLASS_MEAN_EXPENSE_DIVIDED_BY_SAME_CLASS_MEAN_DISPOSABLE_INCOME',
 meanOfHouseholdIndividualRates:false,neverUseForSavings:true,categories:{},
 note:reason==='SMALL_SAMPLE'
  ?'該当年収階級に集計世帯数30未満の区分があるため、参考負担率を非表示にしています。'
  :'同じ対象世帯・年収階級の支出と可処分所得を確認できないため、率を表示しません。'
});
const pct1=(rate:number)=>Math.round(rate*1000)/10;
/** All matched source cells must satisfy the sample floor; never hide small
 * cells and then pretend the remaining observations cover the full band. */
function build(pop:'multi'|'single',selected:{min:number;max:number|null;label:string},rows:readonly Raw[]):WorkerBurdenReferenceV1{
 const matched=rows.filter(row=>(row.max===null||row.max>selected.min)
   &&(selected.max===null||row.min<selected.max));
 if(!matched.length)return empty('NO_MATCHED_CELL',pop,selected.label);
 if(matched.some(r=>r.sample<MIN_WORKER_BURDEN_SAMPLE||r.disposable<=0))
  return empty('SMALL_SAMPLE',pop,selected.label);
 const categories={} as Record<WorkerBurdenCategory,WorkerBurdenCategoryV1>;
 for(const category of ['food','energy','daily'] as const){
  const cells=matched.map(r=>({
   label:r.label,sample:r.sample,monthlyDisposableIncomeYen:r.disposable,
   monthlyExpenseYen:r[category],expenseToDisposableRate:r[category]/r.disposable
  }));
  categories[category]={
   category,
   ratePctLow:pct1(Math.min(...cells.map(c=>c.expenseToDisposableRate))),
   ratePctHigh:pct1(Math.max(...cells.map(c=>c.expenseToDisposableRate))),
   monthlyExpenseLowYen:Math.min(...cells.map(c=>c.monthlyExpenseYen)),
   monthlyExpenseHighYen:Math.max(...cells.map(c=>c.monthlyExpenseYen)),
   cells
  };
 }
 return {
  version:WORKER_BURDEN_VERSION,available:true,reason:'OK',
  population:pop,label:selected.label,source:WORKER_BURDEN_SOURCE[pop],
  sampleMinimum:Math.min(...matched.map(r=>r.sample)),
  matchedPublishedCells:matched.length,populationMatchesVisitorEmployment:'UNVERIFIED',
  ratioDefinition:'CLASS_MEAN_EXPENSE_DIVIDED_BY_SAME_CLASS_MEAN_DISPOSABLE_INCOME',
  meanOfHouseholdIndividualRates:false,neverUseForSavings:true,categories,
  note:'全国の勤労者世帯の支出平均 ÷ 同じ年収階級・同じ勤労者世帯の可処分所得平均。'
   +'年齢・地域・世帯人数のクロス平均や、各個人の負担率の単純平均ではありません。'
   +'賞与も含む年間平均の月換算であり、あなたの実際の月手取りとは定義が異なります。'
   +(matched.length>1?' 表示幅は公表された複数年収階級の比率の最小～最大で、世帯ごとの変動幅ではありません。':'')
   +(pop==='single'&&selected.min===600?' 単身600万円以上は高額所得をまとめた広い公表階級です。':'')
 };
}
export function workerBurdenReferenceForProfileV1(
 profile:Pick<ProfileV4,'diagnosisScope'|'householdSize'|'annualIncomeBand'>|null|undefined,
 explicitSingleGrossBand:SingleIncomeFoodOptionV1|null=null
):WorkerBurdenReferenceV1{
 if(!profile||!(Number(profile.householdSize)>=1))return empty('INVALID_SCOPE',null,null);
 const single=profile.householdSize===1;
 if(single){
  if(!explicitSingleGrossBand)return empty('INCOME_BAND_MISSING','single',null);
  const row=SINGLE[SINGLE_INDEX[explicitSingleGrossBand]];
  if(!row)return empty('NO_MATCHED_CELL','single',null);
  return build('single',row,SINGLE);
 }
 if(profile.diagnosisScope!=='household')return empty('INVALID_SCOPE','multi',null);
 const band=profile.annualIncomeBand;
 if(!band||band==='unknown')return empty('INCOME_BAND_MISSING','multi',null);
 return build('multi',MULTI_OPTIONS[band],MULTI);
}
export function workerBurdenRateGapV1(params:{
 ownMonthlySpendingYen:number|null|undefined;
 ownMonthlyTakeHomeYen:number|null|undefined;
 reference:WorkerBurdenCategoryV1|null|undefined;
 primaryReferenceYen:number|null|undefined;
 sameExpenseScope:boolean;
}){
 const {ownMonthlySpendingYen:own,ownMonthlyTakeHomeYen:takeHome,
  reference,primaryReferenceYen:primary,sameExpenseScope:sameScope}=params;
 const valid=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
 if(!sameScope||!valid(own)||!valid(takeHome)||takeHome<=0||!reference)
  return {available:false,reason:'NO_VALID_SAME_SCOPE_REFERENCE' as const,ownRatePct:null,rateGapPoints:null,
   counterfactualLowYen:null,counterfactualHighYen:null,excessAboveHighestRateYen:null,
   overlapWithPrimaryYen:null};
 // Use unrounded source ratios for the counterfactual and buffer; one-decimal
 // UI rates are presentation only and must not shift the underlying amount.
 const rates=reference.cells.map(c=>c.expenseToDisposableRate);
 const low=Math.min(...rates),high=Math.max(...rates);
 const expectedLow=Math.round(takeHome*low),expectedHigh=Math.round(takeHome*high);
 const ownRatePct=Math.round(own/takeHome*1000)/10;
 const excess=Math.max(0,Math.round(own)-expectedHigh);
 const primaryGap=valid(primary)?Math.max(0,Math.round(own)-Math.round(primary)):null;
 return {
  available:true,reason:'OK' as const,ownRatePct,
  rateGapPoints:Math.round((own/takeHome-high)*1000)/10,
  counterfactualLowYen:expectedLow,counterfactualHighYen:expectedHigh,
  excessAboveHighestRateYen:excess,
  overlapWithPrimaryYen:primaryGap===null?null:Math.min(excess,primaryGap)
 };
}
