import type { Category, Satisfaction } from './mudagiri-diagnosis-v2';
import type { FutureGoal, TypeCode } from './result-payload-v2';
import type { ToneMode } from './tone-mode-v3';

export const DATA_SCHEMA_VERSION='MUDAGIRI_DATA_V1.0' as const;
export type FamilyProfile='single'|'couple'|'children'|'other';
export type AmountState='known'|'zero'|'unknown';
export type DiagnosisOutcome='cut'|'protected'|'unreviewed'|'clear';
export type LeadStage='anonymous'|'line_connected'|'appointment_intent'|'booked'|'attended'|'qualified'|'won'|'lost';

export interface DiagnosisFactV1 {
 schemaVersion:typeof DATA_SCHEMA_VERSION;
 diagnosisId:string;
 createdAt:string;
 consent:{analytics:boolean;crm:boolean;benchmark:boolean};
 profile:{prefecture:string;age:number;ageBand:string;familyProfile:FamilyProfile;household:'single'|'multi';annualIncome:number;incomeBand:string};
 finance:{monthlyTakeHomeIncome:number;monthlySavingInvestment:number;freeCashFlow:number;emergencyMonths:number;savingRate:number|null};
 experience:{toneMode:ToneMode;futureGoal?:FutureGoal;globalSatisfaction:1|2|3|4|5};
 type:{code:TypeCode;axes:Record<'fv'|'pi'|'au'|'se',number>};
 battle:{score:number;monthlyImprovement:number;annualImprovement:number;fiveYearImprovement:number};
 categories:Array<{category:Category;amount:number|null;amountState:AmountState;comparable:number|null;difference:number|null;satisfaction?:Satisfaction;outcome:DiagnosisOutcome;monthlyImprovement:number}>;
 methodologyVersion:string;
}

export interface LeadProfileV1 {
 leadId:string;
 diagnosisId:string;
 createdAt:string;
 stage:LeadStage;
 lineUserId?:string;
 source?:string;
 campaign?:string;
 futureGoal?:FutureGoal;
 typeCode:TypeCode;
 annualIncomeBand:string;
 familyProfile:FamilyProfile;
 needsReview:Category[];
 unknownCategories:Category[];
 monthlyImprovement:number;
 appointment?:{ctaClickedAt?:string;bookedAt?:string;attendedAt?:string;qualified?:boolean;outcome?:'won'|'lost'|'pending'};
}

export interface BenchmarkCellV1 {
 key:string; category:Category; n:number; mean:number; median:number; p25:number; p75:number; p90:number; stddev:number;
 dimensions:{household?:'single'|'multi';familyProfile?:FamilyProfile;ageBand?:string;incomeBand?:string;prefecture?:string;region?:string};
 quality:'hidden'|'reference_only'|'publishable'|'strong'; updatedAt:string;
}

export function ageBand(age:number){if(age<30)return '20s_or_younger'; if(age<40)return '30s'; if(age<50)return '40s'; if(age<60)return '50s'; if(age<70)return '60s'; return '70plus';}
export function incomeBand(annual:number){const m=annual/10000; if(m<300)return '<300'; if(m<500)return '300-499'; if(m<700)return '500-699'; if(m<1000)return '700-999'; if(m<1500)return '1000-1499'; return '1500+';}
export function benchmarkQuality(n:number):BenchmarkCellV1['quality']{return n<30?'hidden':n<100?'reference_only':n<500?'publishable':'strong';}
export function percentile(sorted:number[],p:number){if(!sorted.length)return 0; const x=(sorted.length-1)*p,lo=Math.floor(x),hi=Math.ceil(x); return sorted[lo]+(sorted[hi]-sorted[lo])*(x-lo);}
export function aggregateBenchmark(values:number[], category:Category, dimensions:BenchmarkCellV1['dimensions'], now=new Date().toISOString()):BenchmarkCellV1{
 const a=values.filter(Number.isFinite).sort((x,y)=>x-y); const n=a.length; const mean=n?a.reduce((s,x)=>s+x,0)/n:0; const variance=n?a.reduce((s,x)=>s+(x-mean)**2,0)/n:0;
 const key=JSON.stringify({category,...dimensions});
 return {key,category,n,mean:Math.round(mean),median:Math.round(percentile(a,.5)),p25:Math.round(percentile(a,.25)),p75:Math.round(percentile(a,.75)),p90:Math.round(percentile(a,.9)),stddev:Math.round(Math.sqrt(variance)),dimensions,quality:benchmarkQuality(n),updatedAt:now};
}

// Sparse-cell fallback: exact -> remove prefecture -> remove region -> remove age -> remove family detail.
export function benchmarkFallbacks(d:BenchmarkCellV1['dimensions']){
 const out:BenchmarkCellV1['dimensions'][]=[]; const push=(x:BenchmarkCellV1['dimensions'])=>{if(!out.some(y=>JSON.stringify(y)===JSON.stringify(x)))out.push(x)};
 push({...d}); const noPref={...d}; delete noPref.prefecture; push(noPref); const noRegion={...noPref}; delete noRegion.region; push(noRegion); const noAge={...noRegion}; delete noAge.ageBand; push(noAge); const broad={...noAge}; delete broad.familyProfile; push(broad); return out;
}
