import type {AnnualIncomeBandV4,ProfileV4} from './mudagiri-profile-v4';

/**
 * 2025 FIES, official, observed food expenditure by annual-income class.
 *
 * IMPORTANT: a separate SECONDARY income lens only. 2025 FIES single Table 12
 * and multi-person Table 4-2 publish annual item spending per household.
 * These observations must never multiply/replace household-size/age benchmarks,
 * trigger a V5 status, or enter confirmed/possible savings arithmetic.
 *
 * Annual food yen and counts below were transcribed from the official downloaded
 * workbook, row "食料", as published 2026-02-06.
 * Multi Table 4-2: "二人" sheet, row 22 annual food, row 12 sample size.
 * Single Table 12: "単身" sheet, food row and row 11 sample size.
 */
export const INCOME_CLASS_FOOD_SOURCE_VERSION='FIES_2025_INCOME_CLASS_FOOD_V1' as const;
export type FoodIncomePopulation='multi_all'|'single_all';
type SourceBand={
 minAnnualIncomeYen:number;maxAnnualIncomeYen:number|null;
 label:string;foodAnnualYen:number;sampleHouseholds:number;
};
const MULTI_ALL:readonly SourceBand[]=[
 {minAnnualIncomeYen:0,maxAnnualIncomeYen:2_000_000,label:'200万円未満',foodAnnualYen:745871,sampleHouseholds:199},
 {minAnnualIncomeYen:2_000_000,maxAnnualIncomeYen:2_500_000,label:'200～250万円',foodAnnualYen:842350,sampleHouseholds:309},
 {minAnnualIncomeYen:2_500_000,maxAnnualIncomeYen:3_000_000,label:'250～300万円',foodAnnualYen:900820,sampleHouseholds:488},
 {minAnnualIncomeYen:3_000_000,maxAnnualIncomeYen:3_500_000,label:'300～350万円',foodAnnualYen:978696,sampleHouseholds:631},
 {minAnnualIncomeYen:3_500_000,maxAnnualIncomeYen:4_000_000,label:'350～400万円',foodAnnualYen:1028998,sampleHouseholds:564},
 {minAnnualIncomeYen:4_000_000,maxAnnualIncomeYen:4_500_000,label:'400～450万円',foodAnnualYen:1051682,sampleHouseholds:476},
 {minAnnualIncomeYen:4_500_000,maxAnnualIncomeYen:5_000_000,label:'450～500万円',foodAnnualYen:1069837,sampleHouseholds:431},
 {minAnnualIncomeYen:5_000_000,maxAnnualIncomeYen:5_500_000,label:'500～550万円',foodAnnualYen:1082985,sampleHouseholds:416},
 {minAnnualIncomeYen:5_500_000,maxAnnualIncomeYen:6_000_000,label:'550～600万円',foodAnnualYen:1076110,sampleHouseholds:390},
 {minAnnualIncomeYen:6_000_000,maxAnnualIncomeYen:6_500_000,label:'600～650万円',foodAnnualYen:1106871,sampleHouseholds:368},
 {minAnnualIncomeYen:6_500_000,maxAnnualIncomeYen:7_000_000,label:'650～700万円',foodAnnualYen:1152652,sampleHouseholds:348},
 {minAnnualIncomeYen:7_000_000,maxAnnualIncomeYen:7_500_000,label:'700～750万円',foodAnnualYen:1147356,sampleHouseholds:353},
 {minAnnualIncomeYen:7_500_000,maxAnnualIncomeYen:8_000_000,label:'750～800万円',foodAnnualYen:1169268,sampleHouseholds:298},
 {minAnnualIncomeYen:8_000_000,maxAnnualIncomeYen:9_000_000,label:'800～900万円',foodAnnualYen:1254092,sampleHouseholds:544},
 {minAnnualIncomeYen:9_000_000,maxAnnualIncomeYen:10_000_000,label:'900～1,000万円',foodAnnualYen:1267172,sampleHouseholds:387},
 {minAnnualIncomeYen:10_000_000,maxAnnualIncomeYen:12_500_000,label:'1,000～1,250万円',foodAnnualYen:1394821,sampleHouseholds:571},
 {minAnnualIncomeYen:12_500_000,maxAnnualIncomeYen:15_000_000,label:'1,250～1,500万円',foodAnnualYen:1468948,sampleHouseholds:249},
 {minAnnualIncomeYen:15_000_000,maxAnnualIncomeYen:null,label:'1,500万円以上',foodAnnualYen:1731530,sampleHouseholds:240},
];
const SINGLE_ALL:readonly SourceBand[]=[
 {minAnnualIncomeYen:0,maxAnnualIncomeYen:1_000_000,label:'100万円未満',foodAnnualYen:453078,sampleHouseholds:42},
 {minAnnualIncomeYen:1_000_000,maxAnnualIncomeYen:2_000_000,label:'100～200万円',foodAnnualYen:483780,sampleHouseholds:219},
 {minAnnualIncomeYen:2_000_000,maxAnnualIncomeYen:3_000_000,label:'200～300万円',foodAnnualYen:585050,sampleHouseholds:177},
 {minAnnualIncomeYen:3_000_000,maxAnnualIncomeYen:4_000_000,label:'300～400万円',foodAnnualYen:605088,sampleHouseholds:78},
 {minAnnualIncomeYen:4_000_000,maxAnnualIncomeYen:5_000_000,label:'400～500万円',foodAnnualYen:641156,sampleHouseholds:49},
 {minAnnualIncomeYen:5_000_000,maxAnnualIncomeYen:6_000_000,label:'500～600万円',foodAnnualYen:655075,sampleHouseholds:32},
 {minAnnualIncomeYen:6_000_000,maxAnnualIncomeYen:null,label:'600万円以上',foodAnnualYen:832953,sampleHouseholds:49},
];
export const SINGLE_INCOME_FOOD_OPTIONS=[
 {value:'under100',label:'100万円未満'},
 {value:'100_199',label:'100～199万円'},
 {value:'200_299',label:'200～299万円'},
 {value:'300_399',label:'300～399万円'},
 {value:'400_499',label:'400～499万円'},
 {value:'500_599',label:'500～599万円'},
 {value:'600plus',label:'600万円以上'},
] as const;
export type SingleIncomeFoodOptionV1=typeof SINGLE_INCOME_FOOD_OPTIONS[number]['value'];
export const FOOD_INCOME_SOURCE={
  multi_all:{year:2025,table:'第4-2表',population:'全国・二人以上の世帯（就業状態を限定しない）',
    sheet:'二人',category:'食料',annualIncomeSource:'年間収入',annualFoodYen:true,
    sourceUrl:'https://www.e-stat.go.jp/stat-search/files?layout=dataset&stat_infid=000040409547',
    downloadUrl:'https://www.e-stat.go.jp/stat-search/file-download?fileKind=0&statInfId=000040409547'},
  single_all:{year:2025,table:'第12表',population:'全国・単身世帯（就業状態を限定しない）',
    sheet:'単身',category:'食料',annualIncomeSource:'年間収入',annualFoodYen:true,
    sourceUrl:'https://www.e-stat.go.jp/stat-search/files?layout=dataset&stat_infid=000040409846',
    downloadUrl:'https://www.e-stat.go.jp/stat-search/file-download?fileKind=0&statInfId=000040409846'},
} as const;
const PUBLIC_BANDS:Record<Exclude<AnnualIncomeBandV4,'unknown'>,{min:number;max:number|null;label:string}>={
 under500:{min:0,max:5_000_000,label:'500万円未満'},
 '500_599':{min:5_000_000,max:6_000_000,label:'500～599万円'},
 '600_699':{min:6_000_000,max:7_000_000,label:'600～699万円'},
 '700_799':{min:7_000_000,max:8_000_000,label:'700～799万円'},
 '800_999':{min:8_000_000,max:10_000_000,label:'800～999万円'},
 '1000plus':{min:10_000_000,max:null,label:'1,000万円以上'},
};
export type IncomeClassFoodReferenceV1={
 available:boolean;
 reason:'OK'|'UNKNOWN_INCOME_BAND'|'SCOPE_MISMATCH'|'SOURCE_BAND_UNAVAILABLE';
 version:typeof INCOME_CLASS_FOOD_SOURCE_VERSION;
 source:typeof FOOD_INCOME_SOURCE.multi_all|typeof FOOD_INCOME_SOURCE.single_all|null;
 profileBand:AnnualIncomeBandV4;
 profileBandLabel:string|null;
 household:'multi'|'single';
 monthlyMeanLowYen:number|null;
 monthlyMeanHighYen:number|null;
 matchedIncomeCells:number;
 minCellSampleHouseholds:number|null;
 incomeBandLabels:string[];
 rangeOfObservedCellMeans:true;
 modelEstimate:false;
 neverUseForSaving:true;
 /** Income is NOT crossed with household size, age, prefecture, or take-home. */
 scopeWarning:string;
};
const yenMonthly=(annual:number)=>Math.round(annual/12);
const overlaps=(r:SourceBand,b:{min:number;max:number|null})=>
 (r.maxAnnualIncomeYen===null||r.maxAnnualIncomeYen>b.min)
 &&(b.max===null||r.minAnnualIncomeYen<b.max);
export function foodIncomeBandFromOfficial2025(population:FoodIncomePopulation,band:AnnualIncomeBandV4):IncomeClassFoodReferenceV1{
 const source=FOOD_INCOME_SOURCE[population];
 const household=population==='single_all'?'single':'multi';
 const empty=(reason:IncomeClassFoodReferenceV1['reason']):IncomeClassFoodReferenceV1=>({
  available:false,reason,version:INCOME_CLASS_FOOD_SOURCE_VERSION,source,
  profileBand:band,profileBandLabel:band==='unknown'?null:PUBLIC_BANDS[band].label,household,
  monthlyMeanLowYen:null,monthlyMeanHighYen:null,matchedIncomeCells:0,minCellSampleHouseholds:null,
  incomeBandLabels:[],rangeOfObservedCellMeans:true,modelEstimate:false,neverUseForSaving:true,
  scopeWarning:'年間収入階級別の全国参考。年齢・地域・世帯人数を掛け合わせた平均ではありません。',
 });
 if(band==='unknown')return empty('UNKNOWN_INCOME_BAND');
 const observed=(population==='multi_all'?MULTI_ALL:SINGLE_ALL).filter(r=>overlaps(r,PUBLIC_BANDS[band]));
 if(observed.length===0)return empty('SOURCE_BAND_UNAVAILABLE');
 const min=Math.min(...observed.map(r=>yenMonthly(r.foodAnnualYen)));
 const max=Math.max(...observed.map(r=>yenMonthly(r.foodAnnualYen)));
 const sourceBroader=observed.some(r=>r.minAnnualIncomeYen<PUBLIC_BANDS[band].min||
  (r.maxAnnualIncomeYen===null&&PUBLIC_BANDS[band].max!==null)
  ||(r.maxAnnualIncomeYen!==null&&PUBLIC_BANDS[band].max!==null&&r.maxAnnualIncomeYen>PUBLIC_BANDS[band].max!));
 return {
  available:true,reason:'OK',version:INCOME_CLASS_FOOD_SOURCE_VERSION,source,
  profileBand:band,profileBandLabel:PUBLIC_BANDS[band].label,household,
  monthlyMeanLowYen:min,monthlyMeanHighYen:max,
  matchedIncomeCells:observed.length,
  minCellSampleHouseholds:Math.min(...observed.map(r=>r.sampleHouseholds)),
  incomeBandLabels:observed.map(r=>r.label),
  rangeOfObservedCellMeans:true,modelEstimate:false,neverUseForSaving:true,
  scopeWarning:sourceBroader
   ?'公表区分が入力の年収帯より広いため、さらに粗い目安です。年齢・地域・世帯人数は一致しません。'
   :'同じ年収帯に含まれる公表サブ階級の平均額の範囲です。世帯人数・年齢・地域を掛け合わせた平均ではありません。',
 };
}
/** Optional single-person UI only: direct table 12 official bracket, not imputed from net pay.
 * This local choice is not part of the frozen diagnosis or persistent profile.
 */
export function singleFoodReferenceForExplicitAnnualBracketV1(key:SingleIncomeFoodOptionV1):IncomeClassFoodReferenceV1|null{
 const i=SINGLE_INCOME_FOOD_OPTIONS.findIndex(x=>x.value===key);
 if(i<0)return null;
 const b=SINGLE_ALL[i],base=foodIncomeBandFromOfficial2025('single_all','unknown');
 const monthly=yenMonthly(b.foodAnnualYen);
 return {
  ...base,available:true,reason:'OK',
  profileBandLabel:b.label,monthlyMeanLowYen:monthly,monthlyMeanHighYen:monthly,
  matchedIncomeCells:1,minCellSampleHouseholds:b.sampleHouseholds,incomeBandLabels:[b.label],
  scopeWarning:'2025年の全国単身世帯の年収階級別平均。年齢・都道府県を重ねた平均ではありません。'
   +(key==='600plus'?' 「600万円以上」は高所得者をすべて含む広い階級で、1,000万円以上に固有の平均ではありません。':''),
 };
}
/** Never infer annual gross household income from user-entered net pay. */
export function resolveFoodIncomeReferenceForProfileV1(profile:Pick<ProfileV4,'diagnosisScope'|'householdSize'|'annualIncomeBand'>|null|undefined):IncomeClassFoodReferenceV1|null{
 if(!profile)return null;
 const population=profile.householdSize===1?'single_all':'multi_all';
 if(profile.diagnosisScope!=='household' && profile.householdSize!==1)return null;
 // The V4 single-person flow does NOT ask annual gross income. Do not repurpose
 // household income band, net monthly pay, or lifetime earnings in its place.
 if(profile.householdSize===1 && profile.annualIncomeBand==='unknown')return null;
 const x=foodIncomeBandFromOfficial2025(population,profile.annualIncomeBand);
 return x.available?x:null;
}
