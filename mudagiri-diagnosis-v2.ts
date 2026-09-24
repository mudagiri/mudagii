export type Category = 'mobile'|'energy'|'sub'|'car'|'food'|'daily'|'fun'|'beautyFashion'|'rent'|'insurance'|'childEducation'|'selfDevelopment';
export type Satisfaction = 'waste'|'inertia'|'satisfied'|'verySatisfied';
export type Policy = 'optimization'|'reference_guardrail'|'lifestyle'|'needs_review';

export interface CategoryInput { category: Category; actual: number; comparable: number|null; satisfaction?: Satisfaction; unusedAmount?: number; }
export interface DiagnosisInput { monthlyTakeHomeIncome:number; monthlySavingInvestment:number; freeCashFlow:number; emergencyMonths:number; categories:CategoryInput[]; }
export interface CategoryResult { category:Category; policy:Policy; actual:number; comparable:number|null; comparisonDifference:number|null; reducible:number; needsReview:boolean; actionability:number; risk:number; }

const SAT:Record<Satisfaction,number>={waste:1,inertia:.75,satisfied:.30,verySatisfied:0};
const POLICY:Record<Category,Policy>={mobile:'optimization',energy:'optimization',sub:'optimization',car:'reference_guardrail',food:'lifestyle',daily:'reference_guardrail',fun:'lifestyle',beautyFashion:'lifestyle',rent:'lifestyle',insurance:'needs_review',childEducation:'needs_review',selfDevelopment:'needs_review'};
const clamp=(x:number,a=0,b=100)=>Math.max(a,Math.min(b,x));
const lerp=(x:number, pts:[number,number][])=>{ if(x<=pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++){const [x1,y1]=pts[i-1],[x2,y2]=pts[i]; if(x<=x2)return y1+(y2-y1)*(x-x1)/(x2-x1);} return pts[pts.length-1][1]; };
const money=(x:number)=>Math.max(0,Math.round(Number.isFinite(x)?x:0));

export function categoryDiagnosis(c:CategoryInput):CategoryResult{
  if(!Number.isFinite(c.actual)||c.actual<0) throw new Error(`INVALID_ACTUAL:${c.category}`);
  if(c.comparable!==null && (!Number.isFinite(c.comparable)||c.comparable<0)) throw new Error(`INVALID_COMPARABLE:${c.category}`);
  const policy=POLICY[c.category];
  const diff=c.comparable===null?null:c.actual-c.comparable;
  let reducible=0, needsReview=false, actionability=50;
  if(policy==='needs_review') { needsReview=c.actual>0; actionability=20; }
  else if(c.category==='mobile') { const upper=4000; reducible=money(Math.max(0,c.actual-upper)*.80); actionability=90; }
  else if(c.category==='energy') { if(c.comparable!==null){ const upper=c.comparable*1.20; reducible=money(Math.max(0,c.actual-upper)*.60); } actionability=70; }
  else if(c.category==='sub') { reducible=money(Math.min(c.actual,Math.max(0,c.unusedAmount??0))); actionability=95; }
  else if(c.category==='car') { if(c.comparable!==null) reducible=money(Math.max(0,c.actual-c.comparable)*.40); actionability=55; }
  else if(c.category==='daily') { if(c.comparable!==null) reducible=money(Math.max(0,c.actual-c.comparable*1.30)*.40); actionability=60; }
  else if(policy==='lifestyle') {
    // rent is review-only in V2; no automatic reducible estimate.
    if(c.category==='rent'){ needsReview = c.comparable!==null ? c.actual>c.comparable*1.25 : false; actionability=20; }
    else if(c.comparable!==null){
      const base=Math.max(0,c.actual-c.comparable);
      const rate=c.category==='food'?.35:.25;
      reducible=money(base*rate*SAT[c.satisfaction??'satisfied']);
      actionability=c.category==='food'?45:40;
    }
  }
  const risk = c.actual===0?0:clamp(((diff??0)/Math.max(c.comparable??c.actual,1))*50 + (reducible/Math.max(c.actual,1))*100);
  return {category:c.category,policy,actual:c.actual,comparable:c.comparable,comparisonDifference:diff,reducible,needsReview,actionability,risk};
}

export function battleScore(i:DiagnosisInput, cr:CategoryResult[]){
  if(i.monthlyTakeHomeIncome<=0) throw new Error('INVALID_INCOME');
  const sr=i.monthlySavingInvestment/i.monthlyTakeHomeIncome;
  const savings=clamp(lerp(sr,[[-.05,0],[0,5],[.05,15],[.10,24],[.15,30],[.20,35]]),0,35);
  const fcfRate=i.freeCashFlow/i.monthlyTakeHomeIncome;
  const balance=clamp(lerp(fcfRate,[[-.10,0],[-.05,6],[0,15]]),0,15);
  const fixedCats=new Set<Category>(['mobile','energy','sub','car']);
  const fixed=cr.filter(x=>fixedCats.has(x.category));
  const actual=fixed.reduce((s,x)=>s+x.actual,0), red=fixed.reduce((s,x)=>s+x.reducible,0);
  const rr=actual?red/actual:0;
  const fixedEfficiency=clamp(lerp(rr,[[0,25],[.03,25],[.05,22],[.10,17],[.20,9],[.30,0]]),0,25);
  const resilience=clamp(lerp(Math.max(0,i.emergencyMonths),[[0,0],[1,7],[3,15],[6,21],[12,25]]),0,25);
  let penalty=0;
  if(fcfRate<0) penalty+=Math.min(15,Math.abs(fcfRate)*150);
  if(i.emergencyMonths<1) penalty+=5;
  const base=savings+balance+fixedEfficiency+resilience;
  return {score:Math.round(clamp(base-penalty)),components:{savings:+savings.toFixed(2),balance:+balance.toFixed(2),fixedEfficiency:+fixedEfficiency.toFixed(2),resilience:+resilience.toFixed(2)},penalty:+penalty.toFixed(2)};
}

export function runDiagnosisV2(i:DiagnosisInput){
  const categories=i.categories.map(categoryDiagnosis);
  // Rent is never assigned an automatic reducible amount. A high take-home burden only triggers review.
  const rent=categories.find(x=>x.category==='rent');
  if(rent && rent.actual>0 && rent.actual/i.monthlyTakeHomeIncome>.35){ rent.needsReview=true; rent.risk=Math.max(rent.risk,70); }
  const monthly=categories.reduce((s,x)=>s+x.reducible,0);
  const enemies=[...categories].filter(x=>x.reducible>0).map(x=>({ ...x, priority:(x.reducible/Math.max(monthly,1))*50+x.actionability*.30+x.risk*.20 })).sort((a,b)=>b.priority-a.priority);
  return {methodologyVersion:'MUDAGIRI_DIAGNOSIS_V2.0',battle:battleScore(i,categories),improvement:{monthly,annual:monthly*12,fiveYear:monthly*60,excludedCategories:categories.filter(x=>x.needsReview).map(x=>x.category)},needsReview:categories.filter(x=>x.needsReview),enemies,categories};
}
