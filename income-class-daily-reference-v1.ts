import type {AnnualIncomeBandV4,ProfileV4} from './mudagiri-profile-v4';
import {FOOD_INCOME_SOURCE,SINGLE_INCOME_FOOD_OPTIONS,type SingleIncomeFoodOptionV1,type FoodIncomePopulation} from './income-class-food-reference-v1';

/** MASTER_ENGINE V1.0 日用品 = 家事雑貨(4.4) + 家事用消耗品(4.5).
 * Both are observed distinct items in the SAME 2025 FIES income-class
 * workbook, year, population, and column. Arithmetic aggregation does not
 * infer an income × family-size cross. It must not enter savings arithmetic.
 */
export const INCOME_CLASS_DAILY_SOURCE_VERSION='FIES_2025_INCOME_CLASS_DAILY_44_45_V1' as const;
type Row={min:number;max:number|null;label:string;housewareAnnualYen:number;consumablesAnnualYen:number;sample:number};
const MULTI:readonly Row[]=[
 {min:0,max:2000000,label:'200万円未満',housewareAnnualYen:14960,consumablesAnnualYen:30357,sample:199},
 {min:2000000,max:2500000,label:'200～250万円',housewareAnnualYen:15902,consumablesAnnualYen:35007,sample:309},
 {min:2500000,max:3000000,label:'250～300万円',housewareAnnualYen:17065,consumablesAnnualYen:35010,sample:488},
 {min:3000000,max:3500000,label:'300～350万円',housewareAnnualYen:18631,consumablesAnnualYen:38274,sample:631},
 {min:3500000,max:4000000,label:'350～400万円',housewareAnnualYen:21552,consumablesAnnualYen:39056,sample:564},
 {min:4000000,max:4500000,label:'400～450万円',housewareAnnualYen:22021,consumablesAnnualYen:43495,sample:476},
 {min:4500000,max:5000000,label:'450～500万円',housewareAnnualYen:25498,consumablesAnnualYen:44030,sample:431},
 {min:5000000,max:5500000,label:'500～550万円',housewareAnnualYen:28315,consumablesAnnualYen:47140,sample:416},
 {min:5500000,max:6000000,label:'550～600万円',housewareAnnualYen:26638,consumablesAnnualYen:43545,sample:390},
 {min:6000000,max:6500000,label:'600～650万円',housewareAnnualYen:28883,consumablesAnnualYen:46822,sample:368},
 {min:6500000,max:7000000,label:'650～700万円',housewareAnnualYen:31931,consumablesAnnualYen:48726,sample:348},
 {min:7000000,max:7500000,label:'700～750万円',housewareAnnualYen:32712,consumablesAnnualYen:48141,sample:353},
 {min:7500000,max:8000000,label:'750～800万円',housewareAnnualYen:31779,consumablesAnnualYen:50670,sample:298},
 {min:8000000,max:9000000,label:'800～900万円',housewareAnnualYen:39970,consumablesAnnualYen:52769,sample:544},
 {min:9000000,max:10000000,label:'900～1,000万円',housewareAnnualYen:39290,consumablesAnnualYen:52006,sample:387},
 {min:10000000,max:12500000,label:'1,000～1,250万円',housewareAnnualYen:39506,consumablesAnnualYen:53484,sample:571},
 {min:12500000,max:15000000,label:'1,250～1,500万円',housewareAnnualYen:48766,consumablesAnnualYen:53497,sample:249},
 {min:15000000,max:null,label:'1,500万円以上',housewareAnnualYen:51225,consumablesAnnualYen:56061,sample:240},
];
const SINGLE:readonly Row[]=[
 {min:0,max:1000000,label:'100万円未満',housewareAnnualYen:8468,consumablesAnnualYen:16185,sample:42},
 {min:1000000,max:2000000,label:'100～200万円',housewareAnnualYen:13041,consumablesAnnualYen:19116,sample:219},
 {min:2000000,max:3000000,label:'200～300万円',housewareAnnualYen:13490,consumablesAnnualYen:18687,sample:177},
 {min:3000000,max:4000000,label:'300～400万円',housewareAnnualYen:17202,consumablesAnnualYen:20663,sample:78},
 {min:4000000,max:5000000,label:'400～500万円',housewareAnnualYen:22950,consumablesAnnualYen:19944,sample:49},
 {min:5000000,max:6000000,label:'500～600万円',housewareAnnualYen:25919,consumablesAnnualYen:19107,sample:32},
 {min:6000000,max:null,label:'600万円以上',housewareAnnualYen:21450,consumablesAnnualYen:20267,sample:49},
];
const BAND_MAP:Record<Exclude<AnnualIncomeBandV4,'unknown'>,{min:number;max:number|null;label:string}>={
 under500:{min:0,max:5000000,label:'500万円未満'},
 '500_599':{min:5000000,max:6000000,label:'500～599万円'},
 '600_699':{min:6000000,max:7000000,label:'600～699万円'},
 '700_799':{min:7000000,max:8000000,label:'700～799万円'},
 '800_999':{min:8000000,max:10000000,label:'800～999万円'},
 '1000plus':{min:10000000,max:null,label:'1,000万円以上'},
};
export type DailyIncomeReferenceV1={
 available:true;
 source:{year:2025;table:'第4-2表'|'第12表';category:'家事雑貨＋家事用消耗品';population:string;downloadUrl:string};
 bracketLabel:string;monthlyLowYen:number;monthlyHighYen:number;
 coveredPublishedBrackets:string[];matchedCells:number;minSampleHouseholds:number;
 widerThanChosenBracket:boolean;
 observedComponentAggregate:true;modelEstimate:false;impactsSaving:false;
 sourceVersion:typeof INCOME_CLASS_DAILY_SOURCE_VERSION;
};
const annual=(r:Row)=>r.housewareAnnualYen+r.consumablesAnnualYen;
function fromPublished(cells:readonly Row[],band:{min:number;max:number|null;label:string},population:FoodIncomePopulation):DailyIncomeReferenceV1|null{
 const rows=cells.filter(r=>(r.max===null||r.max>band.min)&&(band.max===null||r.min<band.max));
 if(!rows.length)return null;
 const amounts=rows.map(r=>Math.round(annual(r)/12));
 const base=FOOD_INCOME_SOURCE[population];
 return {
  available:true,
  source:{year:2025,table:base.table,category:'家事雑貨＋家事用消耗品',population:base.population,downloadUrl:base.downloadUrl},
  bracketLabel:band.label,
  monthlyLowYen:Math.min(...amounts),monthlyHighYen:Math.max(...amounts),
  coveredPublishedBrackets:rows.map(r=>r.label),matchedCells:rows.length,
  minSampleHouseholds:Math.min(...rows.map(r=>r.sample)),
  widerThanChosenBracket:rows.some(r=>r.min<band.min||(r.max===null&&band.max!==null)||(r.max!==null&&band.max!==null&&r.max>band.max)),
  observedComponentAggregate:true,modelEstimate:false,impactsSaving:false,
  sourceVersion:INCOME_CLASS_DAILY_SOURCE_VERSION
 };
}
export function dailyIncomeReferenceForProfileV1(p:Pick<ProfileV4,'diagnosisScope'|'householdSize'|'annualIncomeBand'>|null|undefined):DailyIncomeReferenceV1|null{
 if(!p||p.householdSize<=1||p.diagnosisScope!=='household'||p.annualIncomeBand==='unknown')return null;
 return fromPublished(MULTI,BAND_MAP[p.annualIncomeBand],'multi_all');
}
export function singleDailyReferenceForExplicitAnnualBracketV1(key:SingleIncomeFoodOptionV1):DailyIncomeReferenceV1|null{
 const idx=SINGLE_INCOME_FOOD_OPTIONS.findIndex(x=>x.value===key);
 if(idx<0)return null;
 const r=SINGLE[idx];
 return fromPublished(SINGLE,{min:r.min,max:r.max,label:r.label},'single_all');
}
