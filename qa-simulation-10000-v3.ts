import {emptyRawExpenses,runDiagnosisAdapterV3,buildFinalJudgementsV3,buildComparableV3,type AppraisalV3,type RawExpenses} from './mudagiri-integration-v3';
import type {EducationStageV2} from './comparable-resolver-v2';
import type {Category,Satisfaction} from './mudagiri-diagnosis-v2';

const CATS:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
let seed=20260929;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const pick=<T>(a:T[])=>a[Math.floor(rnd()*a.length)];
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const money=(base:number,spread=.55)=>Math.round(clamp(base*(1+(rnd()*2-1)*spread),0,base*3)/100)*100;
const satisfaction=():Satisfaction=>pick(['verySatisfied','satisfied','inertia','waste'] as Satisfaction[]);

type Metrics={cases:number;battles:number;zeroBattle:number;over3Battle:number;protect:number;review:number;safe:number;confirmedCases:number;confirmedYen:number;violations:number};
const m:Metrics={cases:0,battles:0,zeroBattle:0,over3Battle:0,protect:0,review:0,safe:0,confirmedCases:0,confirmedYen:0,violations:0};
const failures:string[]=[];
const byCategory=Object.fromEntries(CATS.map(c=>[c,{battle:0,protect:0,review:0,safe:0,confirmed:0}])) as Record<Category,{battle:number;protect:number;review:number;safe:number;confirmed:number}>;
const byBasis:Record<string,number>={confirmed:0,appraisal_review:0,benchmark_check:0,none:0};
const battleHistogram=Array.from({length:13},()=>0);
const reviewHistogram=Array.from({length:13},()=>0);
const actionableHistogram=Array.from({length:13},()=>0);

for(let id=1;id<=10000;id++){
 const household=pick(['single','multi'] as const);
 const householdSize=household==='single'?1:pick([2,3,4,5,6]);
 const prefecture=pick(['北海道','宮城県','東京都','神奈川県','新潟県','愛知県','大阪府','広島県','福岡県','沖縄県']);
 const age=pick([25,32,41,55,67]);
 const month=pick([1,2,4,7,10,12]);
 const housingType=pick(['賃貸','持ち家（ローンあり）','持ち家（ローンなし）'] as const);
 const income=money(household==='single'?340000:520000,.65)||180000;
 const bases:Record<Category,number>={mobile:household==='single'?6000:9500,energy:household==='single'?12000:23000,sub:5000,car:35000,food:household==='single'?52000:90000,daily:household==='single'?8000:13000,fun:household==='single'?18000:26000,beautyFashion:household==='single'?12000:18000,rent:household==='single'?95000:145000,insurance:household==='single'?12000:28000,childEducation:45000,selfDevelopment:18000};
 const raw=emptyRawExpenses();
 let comparable:Partial<Record<Category,number|null>>={};
 const appraisal:Partial<Record<Category,AppraisalV3>>={};
 for(const c of CATS){
   const applicable=c!=='childEducation'||(household==='multi'&&rnd()<.55);
   if(!applicable){raw[c]={amount:null,known:false,applicability:'na'};continue}
   if(rnd()<.035){raw[c]={amount:null,known:false,applicability:'applicable'};continue}
   const zero=rnd()<.08;
   const amount=zero?0:money(bases[c],.8);
   raw[c]={amount,known:true,applicability:'applicable'};
   if(c==='food'||c==='fun'||c==='beautyFashion')appraisal[c]={satisfaction:satisfaction()};
   if(c==='sub'&&amount>0){
     const usage=pick(['none','one','several','unknown'] as const);
     const unused=(usage==='one'||usage==='several')&&rnd()<.62?Math.round(amount*(.15+rnd()*.55)):undefined;
     appraisal[c]={subUsage:usage,subUnusedAmount:unused,subCancellationConfirmed:unused!==undefined?rnd()<.55:undefined};
   }
   if(c==='car'&&amount>0)appraisal[c]={carNeed:pick(['essential','useful','burden','notNeeded'] as const)};
   if(c==='rent'&&amount>0)appraisal[c]={rentPreference:pick(['burdenHigh','burdenSome','reasonable','protect'] as const)};
   if(c==='insurance'&&amount>0){
     const strong=rnd()<.35;
     appraisal[c]=strong?{insurancePurpose:'clear',insuranceLastReview:'within1y'}:
       {insurancePurpose:pick(['mostly','unclear'] as const),insuranceLastReview:pick(['1to3y','over3y','never','unknown'] as const)};
   }
   if(c==='childEducation'&&amount>0){const stages:EducationStageV2[]=['publicKindergarten','privateKindergarten','publicElementary','privateElementary','publicJuniorHigh','privateJuniorHigh','publicHigh','privateHigh'];const count=Math.max(1,Math.min(6,householdSize));appraisal[c]={educationPreference:pick(['reviewHigh','reviewSome','necessary','protect'] as const),educationChildCount:count,educationChildren:Array.from({length:count},()=>({stage:pick(stages)}))};}
   if(c==='selfDevelopment'&&amount>0)appraisal[c]={selfDevelopmentValue:pick(['inertia','unclear','purpose','results'] as const)};
 }
 try{
   const bundle=buildComparableV3({household,householdSize,age,annualIncomeBand:'unknown',prefecture,month,housingType,raw,educationChildren:appraisal.childEducation?.educationChildren});
   comparable=bundle.comparable;
   const d=runDiagnosisAdapterV3({monthlyTakeHome:Math.max(120000,income),raw,comparable,appraisal});
   const f=buildFinalJudgementsV3({raw,comparable,diagnosis:d.diagnosis,appraisal});
   const battle=f.categories.filter(x=>x.status==='battle');
   const confirmed=f.categories.reduce((s,x)=>s+x.reducible,0);
   const review=f.categories.filter(x=>x.status==='review');
   const actionable=f.categories.filter(x=>x.status==='review'||x.status==='battle');
   reviewHistogram[Math.min(12,review.length)]++;
   actionableHistogram[Math.min(12,actionable.length)]++;
   m.cases++;m.battles+=battle.length;if(!battle.length)m.zeroBattle++;if(battle.length>3)m.over3Battle++;battleHistogram[Math.min(12,battle.length)]++;
   for(const x of f.categories){if(x.status==='battle'){byCategory[x.category].battle++;byBasis[x.battleBasis]=(byBasis[x.battleBasis]??0)+1}else if(x.status==='protect')byCategory[x.category].protect++;else if(x.status==='review')byCategory[x.category].review++;else if(x.status==='safe')byCategory[x.category].safe++;if(x.reducible>0)byCategory[x.category].confirmed++;}
   m.protect+=f.categories.filter(x=>x.status==='protect').length;m.review+=f.categories.filter(x=>x.status==='review').length;m.safe+=f.categories.filter(x=>x.status==='safe').length;
   if(confirmed>0){m.confirmedCases++;m.confirmedYen+=confirmed}
   for(const x of f.categories){
     if(x.reducible>0&&x.engine?.state!=='CONFIRMED'){m.violations++;failures.push(`#${id} ${x.category}: saving without CONFIRMED`)}
     if(x.engine?.comparisonDifference!==null&&x.engine?.comparisonDifference!==undefined&&x.engine.comparisonDifference>0&&x.reducible===x.engine.comparisonDifference&&x.engine.state!=='CONFIRMED'){m.violations++;failures.push(`#${id} ${x.category}: benchmark gap leaked into saving`)}
     if(x.status==='protect'&&x.reducible>0){m.violations++;failures.push(`#${id} ${x.category}: protected spend has saving`)}
   }
 }catch(e){m.violations++;failures.push(`#${id}: ${e instanceof Error?e.message:String(e)}`)}
}
console.log(JSON.stringify({...m,byBasis,battleHistogram,reviewHistogram,actionableHistogram,zeroReviewRate:reviewHistogram[0]/m.cases,zeroActionableRate:actionableHistogram[0]/m.cases,avgReviews:m.review/m.cases,byCategory,avgBattles:m.battles/m.cases,zeroBattleRate:m.zeroBattle/m.cases,over3BattleRate:m.over3Battle/m.cases,confirmedCaseRate:m.confirmedCases/m.cases,avgConfirmedWhenPositive:m.confirmedCases?Math.round(m.confirmedYen/m.confirmedCases):0},null,2));
if(failures.length){console.error(failures.slice(0,30).join('\n'));throw new Error(`10k simulation violations: ${failures.length}`)}
console.log('10,000-case deterministic simulation: PASS');
