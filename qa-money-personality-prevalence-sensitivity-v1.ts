import assert from 'node:assert/strict';
import {
  JOBS,
  evaluateMoneyPersonality,
  MONEY_PERSONALITY_ITEM_PLAN,
  publicCore30ItemIds,
  type EngineEvaluation,
  type FactorId,
  type JobCode,
  type SeparatorAnswers,
  type StyleId,
  type TraitAnswers,
} from './src/features/money-personality/classifierV1';

/**
 * Counterfactual prevalence sensitivity, not an empirical MBTI-style population study.
 * Uses the production classifier unchanged. This isolates what happens when input
 * base rates, factor correlations and referral-source mixtures are varied.
 *
 * This test is not calibrated to observed Japanese respondents. Do not describe
 * any scenario's rarest TYPE as "rare in Japan".
 */
const N_PER_MODEL=10000;
const STYLE_IDS:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const JOB_IDS=Object.keys(JOBS) as JobCode[];
const AXIS_PAIRS=[
  ['FUTURE','IMMEDIATE'],
  ['DELIBERATION','INTUITION'],
  ['MONITORING','PERIODIC'],
] as const;
const FACTORS=Object.keys(MONEY_PERSONALITY_ITEM_PLAN) as FactorId[];
const ITEM_FACTOR=new Map<string,FactorId>();
for(const factor of FACTORS){
  const plan=MONEY_PERSONALITY_ITEM_PLAN[factor];
  for(const id of [...plan.core,plan.reserve1,plan.reserve2])ITEM_FACTOR.set(id,factor);
}
type Persona=Record<FactorId,number>;
type Model='SYMMETRIC_INDEPENDENT'|'SKEWED_INDEPENDENT'|'CORRELATED_HYPOTHETICAL'|'SOCIAL_ENTRY_HYPOTHETICAL';
const MODELS:Model[]=[
  'SYMMETRIC_INDEPENDENT','SKEWED_INDEPENDENT',
  'CORRELATED_HYPOTHETICAL','SOCIAL_ENTRY_HYPOTHETICAL',
];
const SEEDS:Record<Model,number>={
  SYMMETRIC_INDEPENDENT:0x10011001,
  SKEWED_INDEPENDENT:0x10011002,
  CORRELATED_HYPOTHETICAL:0x10011003,
  SOCIAL_ENTRY_HYPOTHETICAL:0x10011004,
};
let seed=0;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function uniform(a:number,b:number){return a+(b-a)*rnd();}
function normal(){
  const u=Math.max(1e-12,rnd()),v=rnd();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}
function round5(x:number){return Math.max(1,Math.min(5,Math.round(x)));}
function choose<T>(items:readonly T[],weights:readonly number[]):T{
  assert.equal(items.length,weights.length);
  const total=weights.reduce((a,b)=>a+b,0);
  assert(total>0,'invalid weights');
  let u=rnd()*total;
  for(let i=0;i<items.length;i++){u-=weights[i];if(u<=0)return items[i];}
  return items[items.length-1];
}
function persona(model:Model):Persona{
  const x={} as Persona;
  let f:boolean,d:boolean,m:boolean;
  if(model==='SYMMETRIC_INDEPENDENT'){
    f=rnd()<.5;d=rnd()<.5;m=rnd()<.5;
  }else if(model==='SKEWED_INDEPENDENT'){
    // Deliberately skewed marginal rates, but still independent.
    f=rnd()<.68;d=rnd()<.62;m=rnd()<.72;
  }else if(model==='CORRELATED_HYPOTHETICAL'){
    // Illustrative association: FUTURE is more likely to co-occur with MONITORING.
    f=rnd()<.62;
    d=rnd()<(f?.63:.35);
    m=rnd()<(f?.80:.28);
  }else{
    // NOT observed SNS demographics; a deliberately skewed sensitivity scenario.
    f=rnd()<.28;d=rnd()<.33;m=rnd()<.34;
  }
  const choices=[f,d,m];
  for(let i=0;i<3;i++){
    const [a,b]=AXIS_PAIRS[i];
    const midpoint=uniform(2.75,3.25),p=rnd();
    const delta=p<.35?uniform(0,.35):p<.75?uniform(.35,.95):uniform(.95,1.90);
    const sign=choices[i]?1:-1;
    x[a]=Math.max(1.2,Math.min(4.8,midpoint+sign*delta/2));
    x[b]=Math.max(1.2,Math.min(4.8,midpoint-sign*delta/2));
  }
  const weights=model==='SYMMETRIC_INDEPENDENT'
    ?[.25,.25,.25,.25]
    :model==='SKEWED_INDEPENDENT'
      ?[.38,.30,.21,.11]
      :model==='CORRELATED_HYPOTHETICAL'
        ?(f?[.30,.13,.40,.17]:[.16,.53,.15,.16])
        :[.20,.58,.08,.14];
  const preferred=choose(STYLE_IDS,weights);
  const baseline=uniform(2.2,3.15);
  for(const style of STYLE_IDS){
    x[style]=Math.max(1,Math.min(5,baseline+(style===preferred?uniform(.35,1.25):uniform(-.35,.4))));
  }
  return x;
}
function answer(id:string,p:Persona):number{
  return round5(p[ITEM_FACTOR.get(id)!]+normal()*.77);
}
function separator(id:string,e:EngineEvaluation,p:Persona){
  if(id==='SEP_STYLE'){
    const a=e.style.primary!,b=e.style.secondary!;
    return p[a]+normal()*.32>=p[b]+normal()*.32?a:b;
  }
  const axis=id==='SEP_TIME'?e.axes.TIME:id==='SEP_DECISION'?e.axes.DECISION:e.axes.AWARENESS;
  return p[axis.factorA]+normal()*.32>=p[axis.factorB]+normal()*.32?axis.poleA:axis.poleB;
}
function classify(p:Persona){
  const answers:TraitAnswers={},separators:SeparatorAnswers={};
  for(const id of publicCore30ItemIds())answers[id]=answer(id,p);
  let result=evaluateMoneyPersonality(answers,separators),round=0;
  while(!result.complete&&round++<15){
    let progressed=false;
    for(const id of result.adaptive.nextItemIds){
      if(answers[id]===undefined){answers[id]=answer(id,p);progressed=true;}
    }
    for(const id of result.adaptive.separatorIds){
      if((separators as Record<string,unknown>)[id]===undefined){
        (separators as unknown as Record<string,string>)[id]=separator(id,result,p);
        progressed=true;
      }
    }
    assert(progressed,'adaptive stalled');
    result=evaluateMoneyPersonality(answers,separators);
  }
  assert(result.complete&&result.jobCode&&result.style.primary,'classification must complete');
  return {job:result.jobCode,style:result.style.primary,questions:Object.keys(answers).length+Object.keys(separators).length};
}
function summarise(counts:Record<string,number>){
  const rows=Object.entries(counts).map(([code,n])=>({code,n,pct:Math.round(10000*n/N_PER_MODEL)/100}))
    .sort((a,b)=>b.n-a.n||a.code.localeCompare(b.code));
  const entropy=-rows.reduce((sum,{n})=>n===0?sum:sum+n/N_PER_MODEL*Math.log2(n/N_PER_MODEL),0);
  return {
    count:rows.length,
    mostCommon:rows.slice(0,6),
    leastCommon:rows.slice(-6).reverse(),
    rareUnder1Percent:rows.filter(r=>r.pct<1).map(r=>r.code),
    entropyBits:Math.round(entropy*1000)/1000,
    all:rows,
  };
}
const reports=[];
for(const model of MODELS){
  seed=SEEDS[model];
  const jobs=Object.fromEntries(JOB_IDS.map(id=>[id,0])) as Record<JobCode,number>;
  const styles=Object.fromEntries(STYLE_IDS.map(id=>[id,0])) as Record<StyleId,number>;
  const types=Object.fromEntries(JOB_IDS.flatMap(j=>STYLE_IDS.map(s=>[j+'-'+s,0]))) as Record<string,number>;
  let totalQuestions=0;
  for(let i=0;i<N_PER_MODEL;i++){
    const x=classify(persona(model));
    jobs[x.job]++;styles[x.style]++;types[x.job+'-'+x.style]++;totalQuestions+=x.questions;
  }
  assert.equal(Object.values(jobs).reduce((a,b)=>a+b,0),N_PER_MODEL);
  assert.equal(Object.values(styles).reduce((a,b)=>a+b,0),N_PER_MODEL);
  assert.equal(Object.values(types).reduce((a,b)=>a+b,0),N_PER_MODEL);
  reports.push({
    model,N:N_PER_MODEL,meanQuestions:Math.round(totalQuestions/N_PER_MODEL*100)/100,
    job:summarise(jobs),style:summarise(styles),type:summarise(types),
  });
}
const baseline=reports[0],correlated=reports[2];
assert(baseline.job.entropyBits>2.95,'symmetric baseline unexpectedly non-uniform');
assert(correlated.job.entropyBits<baseline.job.entropyBits,'correlations not reflected in JOB prevalence');
assert(reports[1].type.rareUnder1Percent.length>0,'skewed model should produce rare combinations');
assert(reports[3].type.rareUnder1Percent.length>0,'SNS-skewed model should produce rare combinations');
const result={
  version:'MUDAGIRI_PREVALENCE_SENSITIVITY_V1',
  caveat:'HYPOTHETICAL INPUT MODELS. NOT REAL PARTICIPANTS, JAPANESE PREVALENCE, OR RESEARCH-VALIDATED MBTI FREQUENCIES.',
  assumptions:{
    nPerModel:N_PER_MODEL,responseNoiseSd:.77,
    modelDescriptions:{
      SYMMETRIC_INDEPENDENT:'all three binary directions p=.5 independent; style preference 25% each',
      SKEWED_INDEPENDENT:'F=.68 D=.62 M=.72 independent; style preference [38%,30%,21%,11%]',
      CORRELATED_HYPOTHETICAL:'F=.62; D=.63 if F else .35; M=.80 if F else .28; style preference depends on F',
      SOCIAL_ENTRY_HYPOTHETICAL:'F=.28 D=.33 M=.34 independent; style preference [20%,58%,8%,14%]',
    },
  },
  reports,
};
console.log('MUDAGIRI_PREVALENCE_SENSITIVITY_V1 '+JSON.stringify(result));
