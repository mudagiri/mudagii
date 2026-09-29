import type { Category, Satisfaction, DiagnosisInput, CategoryResult } from './mudagiri-diagnosis-v2';
import { runDiagnosisV2 } from './mudagiri-diagnosis-v2';
import type { EducationStage } from './comparable-resolver-v1';
import { resolveComparableV2, type EducationStageV2, type ComparableV2 } from './comparable-resolver-v2';

export type AnnualIncomeBand='under500'|'500_599'|'600_699'|'700_799'|'800_999'|'1000plus'|'unknown';
export type Applicability='applicable'|'na';
export type FinalStatus='battle'|'protect'|'safe'|'review'|'na';
export interface RawExpense { amount:number|null; known:boolean; applicability:Applicability }
export type RawExpenses=Record<Category,RawExpense>;
export interface HousingScreenV3 { p50Upper:number|null; p75Lower:number|null; p90Lower:number|null; band:'standard'|'higher'|'check'|'detail'|'audit' }
export interface AppraisalV3 { satisfaction?:Satisfaction; rentPreference?:'burdenHigh'|'burdenSome'|'reasonable'|'protect'; insurancePurpose?:'clear'|'mostly'|'unclear'; insuranceLastReview?:'within1y'|'1to3y'|'over3y'|'never'|'unknown'; insuranceLifeChange?:'none'|'reviewed'|'notReviewed'|'unknown'; insurancePublicBenefits?:'considered'|'maybe'|'not'|'unknown'; insuranceDuplicate?:'none'|'intentional'|'possible'|'unknown'; educationPreference?:'reviewHigh'|'reviewSome'|'necessary'|'protect'; selfDevelopmentValue?:'inertia'|'unclear'|'purpose'|'results'; subUnusedAmount?:number|null; subUsage?:'none'|'one'|'several'|'unknown'; subCancellationConfirmed?:boolean; educationStage?:EducationStage; educationChildren?:{stage:EducationStageV2}[]; educationChildCount?:number; carNeed?:'essential'|'useful'|'burden'|'notNeeded'; mobileCarrier?:'major'|'mvno'|'unknown'; energyPersistence?:'persistent'|'temporary'|'unknown'; dailyPersistence?:'persistent'|'temporary'|'unknown' }
export type BattleBasis='confirmed'|'appraisal_review'|'benchmark_check'|'none';
export interface FinalCategoryV3 { category:Category; raw:RawExpense; engine:CategoryResult|null; comparable:number|null; status:FinalStatus; attentionFlag:boolean; reducible:number; priority:number; battleBasis:BattleBasis; comparisonDifference:number|null; appraisal:AppraisalV3|null }

export const ALL_CATEGORIES:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
export const ANNUAL_INCOME_REPRESENTATIVE_YEN:Record<Exclude<AnnualIncomeBand,'unknown'>,number>={under500:4_990_000,'500_599':5_500_000,'600_699':6_500_000,'700_799':7_500_000,'800_999':9_000_000,'1000plus':10_000_000};
export const resolverAnnualIncome=(band:AnnualIncomeBand)=>band==='unknown'?null:ANNUAL_INCOME_REPRESENTATIVE_YEN[band];
export function emptyRawExpenses():RawExpenses{return Object.fromEntries(ALL_CATEGORIES.map(c=>[c,{amount:null,known:false,applicability:'applicable'}])) as RawExpenses}
export function normalizeApplicability(raw:RawExpenses,household:'single'|'couple'|'children'|'other'):RawExpenses{const out={...raw};if(household!=='children')out.childEducation={amount:null,known:false,applicability:'na'};return out}
export function assertRawExpense(x:RawExpense){if(x.applicability==='na'&&(x.amount!==null||x.known))throw new Error('NA_MUST_NOT_HAVE_AMOUNT');if(!x.known&&x.amount!==null)throw new Error('UNKNOWN_MUST_HAVE_NULL_AMOUNT');if(x.known&&(x.amount===null||!Number.isFinite(x.amount)||x.amount<0))throw new Error('KNOWN_REQUIRES_NONNEGATIVE_AMOUNT')}
function knownAmounts(raw:RawExpenses){const out:Partial<Record<Category,number>>={};for(const c of ALL_CATEGORIES){const x=raw[c];assertRawExpense(x);if(x.applicability==='applicable'&&x.known&&x.amount!==null)out[c]=x.amount}return out}

export function buildComparableV3(a:{household:'single'|'multi';householdSize?:number;age:number;annualIncomeBand:AnnualIncomeBand;prefecture:string;month?:number;housingType?:string;raw:RawExpenses;educationStage?:EducationStage;educationChildren?:{stage:EducationStageV2}[]}){const annual=resolverAnnualIncome(a.annualIncomeBand);const resolved=resolveComparableV2({household:a.household,householdSize:a.householdSize,age:a.age,prefecture:a.prefecture,month:a.month??new Date().getMonth()+1,housingType:a.housingType,educationChildren:a.educationChildren});const comparable=Object.fromEntries(Object.entries(resolved).map(([k,v])=>[k,v?.value??null])) as Partial<Record<Category,number|null>>;return {comparable,benchmarkMeta:resolved,annualIncomeResolverInput:annual,incomeCorrectionApplied:false}}

const bandLower=(s:unknown)=>{const m=String(s??'').replace(/,/g,'').match(/(\d+)～/);return m?Number(m[1]):null};
const bandUpper=(s:unknown)=>{const m=String(s??'').replace(/,/g,'').match(/～(\d+)円未満/);return m?Number(m[1]):null};
export function housingScreenV3(actual:number,meta?:ComparableV2):HousingScreenV3{
 const p50Upper=bandUpper(meta?.meta?.p50Band),p75Lower=bandLower(meta?.meta?.p75Band),p90Lower=bandLower(meta?.meta?.p90Band);
 if(meta?.meta?.reason!=='PRIVATE_RENT_DISTRIBUTION'||p50Upper===null||p75Lower===null||p90Lower===null)return {p50Upper,p75Lower,p90Lower,band:'audit'};
 if(actual>=p90Lower)return {p50Upper,p75Lower,p90Lower,band:'detail'};
 if(actual>=p75Lower)return {p50Upper,p75Lower,p90Lower,band:'check'};
 if(actual<p50Upper)return {p50Upper,p75Lower,p90Lower,band:'standard'};
 return {p50Upper,p75Lower,p90Lower,band:'higher'};
}

export function runDiagnosisAdapterV3(a:{monthlyTakeHome:number;monthlySavingInvestment?:number;emergencyMonths?:number;raw:RawExpenses;comparable:Partial<Record<Category,number|null>>;appraisal?:Partial<Record<Category,AppraisalV3>>}){if(!(a.monthlyTakeHome>0))throw new Error('INVALID_MONTHLY_TAKE_HOME');const categories:DiagnosisInput['categories']=[];for(const category of ALL_CATEGORIES){const raw=a.raw[category];assertRawExpense(raw);if(raw.applicability!=='applicable'||!raw.known||raw.amount===null)continue;const ap=a.appraisal?.[category];categories.push({category,actual:raw.amount,comparable:a.comparable[category]??null,satisfaction:ap?.satisfaction,unusedAmount:category==='sub'&&typeof ap?.subUnusedAmount==='number'?Math.max(0,Math.min(raw.amount,ap.subUnusedAmount)):undefined,cancellationConfirmed:category==='sub'?ap?.subCancellationConfirmed:undefined})}const saving=Math.max(0,a.monthlySavingInvestment??0);const knownSpend=categories.reduce((s,x)=>s+x.actual,0);const input:DiagnosisInput={monthlyTakeHomeIncome:a.monthlyTakeHome,monthlySavingInvestment:saving,freeCashFlow:a.monthlyTakeHome-knownSpend-saving,emergencyMonths:Math.max(0,a.emergencyMonths??0),categories};return {input,diagnosis:runDiagnosisV2(input)}}

function statusFor(category:Category,raw:RawExpense,engine:CategoryResult|null,ap?:AppraisalV3,benchmark?:ComparableV2):{status:FinalStatus;attentionFlag:boolean;battleBasis:BattleBasis}{
 if(raw.applicability==='na')return {status:'na',attentionFlag:false,battleBasis:'none'};
 if(!raw.known||raw.amount===null)return {status:'review',attentionFlag:category==='insurance'||category==='sub',battleBasis:'none'};
 if(raw.amount===0)return {status:'safe',attentionFlag:false,battleBasis:'none'};

 // CONFIRMED is the strongest battle basis. CHECK may also become an RPG review quest, but never a confirmed saving.
 if(engine?.state==='CONFIRMED'&&(engine.confirmedSaving??0)>0)return {status:'battle',attentionFlag:false,battleBasis:'confirmed'};

 if(category==='mobile'){
   if(ap?.mobileCarrier==='major'||ap?.mobileCarrier==='mvno'){
     // Direct survey bands are retained as bands; no pseudo-average or confirmed saving is created.
     return {status:'review',attentionFlag:true,battleBasis:'none'};
   }
   return {status:'review',attentionFlag:true,battleBasis:'none'};
 }
 if(category==='energy'){
   if(engine?.comparisonDifference!==null&&(engine?.comparisonDifference??0)>0){
     if(ap?.energyPersistence==='persistent')return {status:'review',attentionFlag:true,battleBasis:'benchmark_check'};
     if(ap?.energyPersistence==='temporary')return {status:'safe',attentionFlag:false,battleBasis:'none'};
     return {status:'review',attentionFlag:true,battleBasis:'none'};
   }
   return {status:'safe',attentionFlag:false,battleBasis:'none'};
 }
 if(category==='daily'){
   if(engine?.comparisonDifference!==null&&(engine?.comparisonDifference??0)>0){
     if(ap?.dailyPersistence==='persistent')return {status:'review',attentionFlag:true,battleBasis:'benchmark_check'};
     if(ap?.dailyPersistence==='temporary')return {status:'safe',attentionFlag:false,battleBasis:'none'};
     return {status:'review',attentionFlag:true,battleBasis:'none'};
   }
   return {status:'safe',attentionFlag:false,battleBasis:'none'};
 }
 if(category==='sub'){
   if(engine?.state==='CONFIRMED'&&(engine.confirmedSaving??0)>0)return {status:'battle',attentionFlag:false,battleBasis:'confirmed'};
   if(ap?.subUsage==='none')return {status:'safe',attentionFlag:false,battleBasis:'none'};
   if(ap?.subUsage==='one'||ap?.subUsage==='several')return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   return {status:'review',attentionFlag:true,battleBasis:'none'};
 }
 if(category==='insurance'){
   // Lightweight audit: the main diagnosis asks at most two questions.
   // Missing public-benefit / duplicate / life-event evidence is never inferred.
   // Insurance can be protected as a user-understood expense, or flagged for review,
   // but it never creates confirmed savings in this lightweight flow.
   if(ap?.insurancePurpose==='clear')return {status:'protect',attentionFlag:false,battleBasis:'none'};
   if(ap?.insurancePurpose==='unclear'||ap?.insuranceLastReview==='over3y'||ap?.insuranceLastReview==='never'||ap?.insuranceLastReview==='unknown')
     return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   return {status:'review',attentionFlag:true,battleBasis:'none'};
 }
 if(category==='car'){
   if(ap?.carNeed==='essential'||ap?.carNeed==='useful')return {status:'protect',attentionFlag:false,battleBasis:'none'};
   if(ap?.carNeed==='burden'||ap?.carNeed==='notNeeded')return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   return {status:'review',attentionFlag:true,battleBasis:'none'};
 }
 if(category==='rent'){
   const screen=housingScreenV3(raw.amount,benchmark);
   if(screen.band==='audit')return {status:'review',attentionFlag:true,battleBasis:'none'};
   if(screen.band==='standard'||screen.band==='higher')return {status:'safe',attentionFlag:false,battleBasis:'none'};
   if(ap?.rentPreference==='protect'||ap?.rentPreference==='reasonable')return {status:'protect',attentionFlag:true,battleBasis:'none'};
   if(ap?.rentPreference==='burdenHigh'||ap?.rentPreference==='burdenSome')return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   return {status:'review',attentionFlag:true,battleBasis:'benchmark_check'};
 }
 if(category==='childEducation'){
   if(ap?.educationPreference==='necessary'||ap?.educationPreference==='protect')return {status:'protect',attentionFlag:!!engine?.needsReview,battleBasis:'none'};
   if(ap?.educationPreference==='reviewHigh'||ap?.educationPreference==='reviewSome')return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   return {status:'review',attentionFlag:true,battleBasis:'none'};
 }
 if(category==='selfDevelopment'){
   if(ap?.selfDevelopmentValue==='purpose'||ap?.selfDevelopmentValue==='results')return {status:'protect',attentionFlag:false,battleBasis:'none'};
   if(ap?.selfDevelopmentValue==='inertia'||ap?.selfDevelopmentValue==='unclear')return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   return {status:'review',attentionFlag:true,battleBasis:'none'};
 }
 if((category==='food'||category==='fun'||category==='beautyFashion')){
   if(ap?.satisfaction==='verySatisfied')return {status:'protect',attentionFlag:!!engine?.needsReview,battleBasis:'none'};
   if(engine?.needsReview&&(ap?.satisfaction==='waste'||ap?.satisfaction==='inertia'))return {status:'review',attentionFlag:true,battleBasis:'appraisal_review'};
   if(ap?.satisfaction==='satisfied')return {status:'protect',attentionFlag:!!engine?.needsReview,battleBasis:'none'};
 }
 // Benchmark-only CHECK is information, not an enemy. Averages never create an RPG battle by themselves.
 if(engine?.needsReview)return {status:'review',attentionFlag:true,battleBasis:'none'};
 return {status:'safe',attentionFlag:false,battleBasis:'none'};
}

export function buildFinalJudgementsV3(a:{raw:RawExpenses;comparable:Partial<Record<Category,number|null>>;benchmarkMeta?:Partial<Record<Category,ComparableV2>>;diagnosis:ReturnType<typeof runDiagnosisV2>;appraisal?:Partial<Record<Category,AppraisalV3>>}){const byEngine=new Map(a.diagnosis.categories.map(x=>[x.category,x]));const priority=new Map(a.diagnosis.enemies.map(x=>[x.category,x.priority]));const categories:FinalCategoryV3[]=ALL_CATEGORIES.map(category=>{const engine=byEngine.get(category)??null;const s=statusFor(category,a.raw[category],engine,a.appraisal?.[category],a.benchmarkMeta?.[category]);return {category,raw:a.raw[category],engine,comparable:a.comparable[category]??null,status:s.status,attentionFlag:s.attentionFlag,reducible:engine?.confirmedSaving??0,priority:priority.get(category)??0,battleBasis:s.battleBasis,comparisonDifference:engine?.comparisonDifference??null,appraisal:a.appraisal?.[category]??null}});return {categories,battleTargets:categories.filter(x=>x.status==='battle'&&x.battleBasis==='confirmed'&&x.reducible>0).sort((x,y)=>(y.battleBasis==='confirmed'?2:1)-(x.battleBasis==='confirmed'?2:1)||(y.comparisonDifference??0)-(x.comparisonDifference??0)).slice(0,3)}}
