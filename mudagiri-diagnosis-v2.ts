export type Category = 'mobile'|'energy'|'sub'|'car'|'food'|'daily'|'fun'|'beautyFashion'|'rent'|'insurance'|'childEducation'|'selfDevelopment';
export type Satisfaction = 'waste'|'inertia'|'satisfied'|'verySatisfied';
export type Policy = 'optimization'|'reference_guardrail'|'lifestyle'|'needs_review';
export type DiagnosticState = 'NORMAL'|'CHECK'|'DETAIL'|'AUDIT'|'CONFIRMED';

export interface CategoryInput { category: Category; actual: number; comparable: number|null; satisfaction?: Satisfaction; unusedAmount?: number; }
export interface DiagnosisInput { monthlyTakeHomeIncome:number; monthlySavingInvestment:number; freeCashFlow:number; emergencyMonths:number; categories:CategoryInput[]; }
export interface CategoryResult { category:Category; policy:Policy; state:DiagnosticState; actual:number; comparable:number|null; comparisonDifference:number|null; reducible:number; confirmedSaving:number|null; needsReview:boolean; actionability:number; risk:number; reasonCodes:string[]; }

const POLICY:Record<Category,Policy>={mobile:'optimization',energy:'optimization',sub:'optimization',car:'reference_guardrail',food:'lifestyle',daily:'reference_guardrail',fun:'lifestyle',beautyFashion:'lifestyle',rent:'lifestyle',insurance:'needs_review',childEducation:'needs_review',selfDevelopment:'needs_review'};
const clamp=(x:number,a=0,b=100)=>Math.max(a,Math.min(b,x));
const lerp=(x:number, pts:[number,number][])=>{ if(x<=pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++){const [x1,y1]=pts[i-1],[x2,y2]=pts[i]; if(x<=x2)return y1+(y2-y1)*(x-x1)/(x2-x1);} return pts[pts.length-1][1]; };
const money=(x:number)=>Math.max(0,Math.round(Number.isFinite(x)?x:0));

/**
 * V2.1 evidence contract:
 * - benchmark gap is a screening signal, never "waste"
 * - only a concrete, verified avoidable amount becomes confirmedSaving/reducible
 * - the current lightweight flow can confirm subscription unused amount; other categories remain review/audit until detail evidence exists
 */
export function categoryDiagnosis(c:CategoryInput):CategoryResult{
  if(!Number.isFinite(c.actual)||c.actual<0) throw new Error(`INVALID_ACTUAL:${c.category}`);
  if(c.comparable!==null && (!Number.isFinite(c.comparable)||c.comparable<0)) throw new Error(`INVALID_COMPARABLE:${c.category}`);
  const policy=POLICY[c.category];
  const diff=c.comparable===null?null:c.actual-c.comparable;
  const reasonCodes:string[]=[];
  let state:DiagnosticState='NORMAL', confirmedSaving:number|null=null, actionability=35;

  if(c.actual===0){
    state='NORMAL';
  } else if(c.category==='sub' && typeof c.unusedAmount==='number' && c.unusedAmount>0){
    confirmedSaving=money(Math.min(c.actual,Math.max(0,c.unusedAmount)));
    state=confirmedSaving>0?'CONFIRMED':'NORMAL';
    if(confirmedSaving>0) reasonCodes.push('CONFIRMED_UNUSED_AMOUNT');
    actionability=95;
  } else if(c.category==='insurance'||c.category==='car'||c.category==='selfDevelopment'){
    state='AUDIT';
    reasonCodes.push('AMOUNT_ALONE_INSUFFICIENT');
    actionability=25;
  } else if(c.category==='rent'){
    state='DETAIL';
    reasonCodes.push('HOUSING_CONTEXT_REQUIRED');
    actionability=25;
  } else if(c.category==='childEducation'){
    state=c.comparable!==null && c.actual>c.comparable?'CHECK':'DETAIL';
    reasonCodes.push(c.comparable!==null && c.actual>c.comparable?'MATCHED_REFERENCE_EXCESS':'EDUCATION_CONTEXT_REQUIRED');
    actionability=25;
  } else if(c.comparable!==null && c.actual>c.comparable){
    state='CHECK';
    reasonCodes.push('BENCHMARK_SCREEN_ONLY');
    actionability=c.category==='mobile'?70:c.category==='energy'?55:40;
  }

  const reducible=confirmedSaving??0; // legacy compatibility: reducible means confirmed saving only from V2.1 onward.
  const needsReview=state==='CHECK'||state==='DETAIL'||state==='AUDIT';
  const risk=state==='CONFIRMED'?clamp((reducible/Math.max(c.actual,1))*100):needsReview?35:0;
  return {category:c.category,policy,state,actual:c.actual,comparable:c.comparable,comparisonDifference:diff,reducible,confirmedSaving,needsReview,actionability,risk,reasonCodes};
}

export function battleScore(i:DiagnosisInput, _cr:CategoryResult[]){
  if(i.monthlyTakeHomeIncome<=0) throw new Error('INVALID_INCOME');
  const sr=i.monthlySavingInvestment/i.monthlyTakeHomeIncome;
  const savings=clamp(lerp(sr,[[-.05,0],[0,5],[.05,15],[.10,24],[.15,30],[.20,35]]),0,35);
  const fcfRate=i.freeCashFlow/i.monthlyTakeHomeIncome;
  const balance=clamp(lerp(fcfRate,[[-.10,0],[-.05,6],[0,15]]),0,15);
  // V2.1: do not infer "fixed-cost efficiency" from fabricated reducible estimates.
  // Keep this entertainment-only component neutral until a separately validated score model is frozen.
  const fixedEfficiency=12.5;
  const resilience=clamp(lerp(Math.max(0,i.emergencyMonths),[[0,0],[1,7],[3,15],[6,21],[12,25]]),0,25);
  let penalty=0;
  if(fcfRate<0) penalty+=Math.min(15,Math.abs(fcfRate)*150);
  if(i.emergencyMonths<1) penalty+=5;
  const base=savings+balance+fixedEfficiency+resilience;
  return {score:Math.round(clamp(base-penalty)),components:{savings:+savings.toFixed(2),balance:+balance.toFixed(2),fixedEfficiency, resilience:+resilience.toFixed(2)},penalty:+penalty.toFixed(2)};
}

export function runDiagnosisV2(i:DiagnosisInput){
  const categories=i.categories.map(categoryDiagnosis);
  const monthly=categories.reduce((s,x)=>s+(x.confirmedSaving??0),0);
  const enemies=[...categories].filter(x=>x.state==='CONFIRMED'&&(x.confirmedSaving??0)>0).map(x=>({ ...x, priority:((x.confirmedSaving??0)/Math.max(monthly,1))*50+x.actionability*.30+x.risk*.20 })).sort((a,b)=>b.priority-a.priority);
  return {methodologyVersion:'MUDAGIRI_DIAGNOSIS_V2.1_FROZEN',battle:battleScore(i,categories),improvement:{monthly,annual:monthly*12,fiveYear:monthly*60,excludedCategories:categories.filter(x=>x.needsReview).map(x=>x.category)},needsReview:categories.filter(x=>x.needsReview),enemies,categories};
}
