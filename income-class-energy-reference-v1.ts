import type {AnnualIncomeBandV4,ProfileV4} from './mudagiri-profile-v4';
import {FOOD_INCOME_SOURCE,SINGLE_INCOME_FOOD_OPTIONS,type SingleIncomeFoodOptionV1,type FoodIncomePopulation} from './income-class-food-reference-v1';

/** Official 2025 FIES observed marginal-income data. 2025 annual total
 * "光熱・水道" (electricity, gas, other fuel, tap/sewer) / 12, NOT modelled
 * income × household-size × prefecture × month. Display-only secondary lens.
 *
 * Source: Table 4-2 2025, row 光熱・水道 (multi, all employments);
 *         Table 12 2025, row 光熱・水道 (single, all employments).
 * Income ranges and sample counts align with the FIES food reference source.
 */
export const INCOME_CLASS_ENERGY_SOURCE_VERSION='FIES_2025_INCOME_CLASS_ENERGY_V1' as const;
type SourceBand={min:number;max:number|null;label:string;energyAnnualYen:number;sampleHouseholds:number};
const MULTI:readonly SourceBand[]=[
 {min:0,max:2000000,label:'200万円未満',energyAnnualYen:249406,sampleHouseholds:199},
 {min:2000000,max:2500000,label:'200～250万円',energyAnnualYen:257935,sampleHouseholds:309},
 {min:2500000,max:3000000,label:'250～300万円',energyAnnualYen:270833,sampleHouseholds:488},
 {min:3000000,max:3500000,label:'300～350万円',energyAnnualYen:289742,sampleHouseholds:631},
 {min:3500000,max:4000000,label:'350～400万円',energyAnnualYen:290710,sampleHouseholds:564},
 {min:4000000,max:4500000,label:'400～450万円',energyAnnualYen:304017,sampleHouseholds:476},
 {min:4500000,max:5000000,label:'450～500万円',energyAnnualYen:285320,sampleHouseholds:431},
 {min:5000000,max:5500000,label:'500～550万円',energyAnnualYen:299574,sampleHouseholds:416},
 {min:5500000,max:6000000,label:'550～600万円',energyAnnualYen:297541,sampleHouseholds:390},
 {min:6000000,max:6500000,label:'600～650万円',energyAnnualYen:288823,sampleHouseholds:368},
 {min:6500000,max:7000000,label:'650～700万円',energyAnnualYen:290125,sampleHouseholds:348},
 {min:7000000,max:7500000,label:'700～750万円',energyAnnualYen:290040,sampleHouseholds:353},
 {min:7500000,max:8000000,label:'750～800万円',energyAnnualYen:297305,sampleHouseholds:298},
 {min:8000000,max:9000000,label:'800～900万円',energyAnnualYen:300698,sampleHouseholds:544},
 {min:9000000,max:10000000,label:'900～1,000万円',energyAnnualYen:293815,sampleHouseholds:387},
 {min:10000000,max:12500000,label:'1,000～1,250万円',energyAnnualYen:318814,sampleHouseholds:571},
 {min:12500000,max:15000000,label:'1,250～1,500万円',energyAnnualYen:318965,sampleHouseholds:249},
 {min:15000000,max:null,label:'1,500万円以上',energyAnnualYen:334036,sampleHouseholds:240},
];
const SINGLE:readonly SourceBand[]=[
 {min:0,max:1000000,label:'100万円未満',energyAnnualYen:158919,sampleHouseholds:42},
 {min:1000000,max:2000000,label:'100～200万円',energyAnnualYen:164490,sampleHouseholds:219},
 {min:2000000,max:3000000,label:'200～300万円',energyAnnualYen:177786,sampleHouseholds:177},
 {min:3000000,max:4000000,label:'300～400万円',energyAnnualYen:158379,sampleHouseholds:78},
 {min:4000000,max:5000000,label:'400～500万円',energyAnnualYen:148253,sampleHouseholds:49},
 {min:5000000,max:6000000,label:'500～600万円',energyAnnualYen:134453,sampleHouseholds:32},
 {min:6000000,max:null,label:'600万円以上',energyAnnualYen:148099,sampleHouseholds:49},
];
const PUBLIC_BANDS:Record<Exclude<AnnualIncomeBandV4,'unknown'>,{min:number;max:number|null;label:string}>={
 under500:{min:0,max:5000000,label:'500万円未満'},
 '500_599':{min:5000000,max:6000000,label:'500～599万円'},
 '600_699':{min:6000000,max:7000000,label:'600～699万円'},
 '700_799':{min:7000000,max:8000000,label:'700～799万円'},
 '800_999':{min:8000000,max:10000000,label:'800～999万円'},
 '1000plus':{min:10000000,max:null,label:'1,000万円以上'},
};
export type EnergyIncomeReferenceV1={
 available:true;
 source:{year:2025;table:'第4-2表'|'第12表';category:'光熱・水道';population:string;downloadUrl:string};
 bracketLabel:string;
 monthlyLowYen:number;monthlyHighYen:number;
 coveredPublishedBrackets:string[];
 matchedCells:number;minSampleHouseholds:number;
 widerThanChosenBracket:boolean;
 sourceVersion:typeof INCOME_CLASS_ENERGY_SOURCE_VERSION;
 modelEstimate:false;
 impactsSaving:false;
};
/** This range spans the *means of published classes*, not an expense distribution. */
function observed(cells:readonly SourceBand[],selection:{min:number;max:number|null;label:string},population:FoodIncomePopulation):EnergyIncomeReferenceV1|null{
 const rows=cells.filter(row=>(row.max===null||row.max>selection.min)&&(selection.max===null||row.min<selection.max));
 if(!rows.length)return null;
 const monthly=rows.map(r=>Math.round(r.energyAnnualYen/12));
 const wider=rows.some(r=>r.min<selection.min||(r.max===null&&selection.max!==null)||(r.max!==null&&selection.max!==null&&r.max>selection.max));
 const source=FOOD_INCOME_SOURCE[population];
 return {
  available:true,source:{year:2025,table:source.table,category:'光熱・水道',population:source.population,downloadUrl:source.downloadUrl},
  bracketLabel:selection.label,
  monthlyLowYen:Math.min(...monthly),monthlyHighYen:Math.max(...monthly),
  coveredPublishedBrackets:rows.map(x=>x.label),matchedCells:rows.length,
  minSampleHouseholds:Math.min(...rows.map(x=>x.sampleHouseholds)),
  widerThanChosenBracket:wider,
  sourceVersion:INCOME_CLASS_ENERGY_SOURCE_VERSION,modelEstimate:false,impactsSaving:false,
 };
}
export function energyIncomeReferenceForProfileV1(profile:Pick<ProfileV4,'diagnosisScope'|'householdSize'|'annualIncomeBand'>|null|undefined):EnergyIncomeReferenceV1|null{
 if(!profile||profile.householdSize<=1||profile.diagnosisScope!=='household'||profile.annualIncomeBand==='unknown')return null;
 return observed(MULTI,PUBLIC_BANDS[profile.annualIncomeBand],'multi_all');
}
export function singleEnergyReferenceForExplicitAnnualBracketV1(key:SingleIncomeFoodOptionV1):EnergyIncomeReferenceV1|null{
 const idx=SINGLE_INCOME_FOOD_OPTIONS.findIndex(x=>x.value===key);
 if(idx<0)return null;
 const row=SINGLE[idx];
 return observed(SINGLE,{min:row.min,max:row.max,label:row.label},'single_all');
}
