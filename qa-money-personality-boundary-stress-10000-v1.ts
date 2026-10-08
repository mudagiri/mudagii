import assert from 'node:assert/strict';
import {
  evaluateMoneyPersonality,
  MONEY_PERSONALITY_ITEM_PLAN,
  publicCore30ItemIds,
  type FactorId,
  type TraitAnswers,
  type SeparatorAnswers,
  type EngineEvaluation,
} from './src/features/money-personality/classifierV1';

/**
 * Synthetic-response stress audit. NOT population distribution, diagnostic
 * accuracy, clinical validation, or human test-retest reliability.
 *
 * Draw one latent financial decision pattern. Administer the SAME adaptive
 * classifier twice, sampling fresh noisy answers and tie-breaker choices.
 * Stratify same-person repeat agreement by the FIRST evaluation's proximity
 * to classification boundaries rather than reporting a single 32TYPE rate.
 *
 * Fixed seed makes CI reproducible. No actual respondent data is collected.
 */
const SAMPLE_COUNT=10000;
let seed=0x20261009;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function normal(){
  const u=Math.max(1e-10,rnd()),v=rnd();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}
function between(a:number,b:number){return a+(b-a)*rnd();}
function clip(x:number){return Math.max(1,Math.min(5,Math.round(x)));}
const FACTORS=Object.keys(MONEY_PERSONALITY_ITEM_PLAN) as FactorId[];
const AXES=['TIME','DECISION','AWARENESS'] as const;
type Latent=Record<FactorId,number>;
type Stat={n:number;job:number;style:number;full:number;time:number;decision:number;awareness:number;answerCount:number;separatorCount:number};
function zero():Stat{return {n:0,job:0,style:0,full:0,time:0,decision:0,awareness:0,answerCount:0,separatorCount:0};}
function latent():Latent{
  const x={} as Latent;
  for(const [a,b] of [['FUTURE','IMMEDIATE'],['DELIBERATION','INTUITION'],['MONITORING','PERIODIC']] as [FactorId,FactorId][]){
    const mid=between(2.75,3.25),group=rnd();
    const delta=group<.35?between(0,.35):group<.75?between(.35,.95):between(.95,1.9);
    const sign=rnd()<.5?-1:1;
    x[a]=Math.max(1.2,Math.min(4.8,mid+sign*delta/2));
    x[b]=Math.max(1.2,Math.min(4.8,mid-sign*delta/2));
  }
  const baseline=between(2.2,3.15),preferred=Math.floor(rnd()*4);
  for(let i=0;i<4;i++){
    const f=(['DRIVE','ENJOY','SECURE','OPTIMIZE'] as FactorId[])[i];
    x[f]=Math.max(1,Math.min(5,baseline+(i===preferred?between(.35,1.25):between(-.35,.4))));
  }
  return x;
}
const ITEM_FACTOR=new Map<string,FactorId>();
for(const factor of FACTORS){
  const p=MONEY_PERSONALITY_ITEM_PLAN[factor];
  for(const id of [...p.core,p.reserve1,p.reserve2])ITEM_FACTOR.set(id,factor);
}
function respond(id:string,x:Latent,noise:number){return clip(x[ITEM_FACTOR.get(id)!]+normal()*noise);}
function separatorChoice(id:string,e:EngineEvaluation,x:Latent,noise:number){
  if(id==='SEP_STYLE'){
    const p=e.style.primary!,s=e.style.secondary!;
    return x[p]+normal()*noise>=x[s]+normal()*noise?p:s;
  }
  const ax=id==='SEP_TIME'?e.axes.TIME:id==='SEP_DECISION'?e.axes.DECISION:e.axes.AWARENESS;
  return x[ax.factorA]+normal()*noise>=x[ax.factorB]+normal()*noise?ax.poleA:ax.poleB;
}
function run(x:Latent,noise=.77,separatorNoise=.32){
  const answers:TraitAnswers={},separators:SeparatorAnswers={};
  // Public UI always starts with 30 CORE questions. No 54-item forced pass.
  for(const id of publicCore30ItemIds())answers[id]=respond(id,x,noise);
  let evaluation=evaluateMoneyPersonality(answers,separators),rounds=0;
  while(!evaluation.complete&&rounds++<15){
    let advanced=false;
    for(const id of evaluation.adaptive.nextItemIds){
      if(answers[id]===undefined){answers[id]=respond(id,x,noise);advanced=true;}
    }
    for(const id of evaluation.adaptive.separatorIds){
      const key=id as keyof SeparatorAnswers;
      if(separators[key]===undefined){
        // TypeScript needs the union value tied to each separator key.
        (separators as Record<string,string>)[id]=separatorChoice(id,evaluation,x,separatorNoise);
        advanced=true;
      }
    }
    assert(advanced,'adaptive made no progress');
    evaluation=evaluateMoneyPersonality(answers,separators);
  }
  assert(evaluation.complete,'adaptive evaluation must complete');
  assert(evaluation.jobCode!==null&&evaluation.style.primary!==null,'missing TYPE');
  return {evaluation,answered:Object.keys(answers).length,separatorCount:Object.keys(separators).length};
}
function fill(s:Stat,a:ReturnType<typeof run>,b:ReturnType<typeof run>){
  const x=a.evaluation,y=b.evaluation;
  s.n++;s.answerCount+=a.answered;s.separatorCount+=a.separatorCount;
  if(x.jobCode===y.jobCode)s.job++;
  if(x.style.primary===y.style.primary)s.style++;
  if(x.jobCode===y.jobCode&&x.style.primary===y.style.primary)s.full++;
  if(x.axes.TIME.dominant===y.axes.TIME.dominant)s.time++;
  if(x.axes.DECISION.dominant===y.axes.DECISION.dominant)s.decision++;
  if(x.axes.AWARENESS.dominant===y.axes.AWARENESS.dominant)s.awareness++;
}
const stats=new Map<string,Stat>(),transition=new Map<string,number>();
function add(k:string,a:ReturnType<typeof run>,b:ReturnType<typeof run>){
  if(!stats.has(k))stats.set(k,zero());
  fill(stats.get(k)!,a,b);
}
const gapBins=['0–7.5 BALANCED','7.5–15 LEAN','15–25 CLEAR_LOW','25+ CLEAR_HIGH'];
function bucket(gap:number|null){
  if(gap===null)return 0;
  return gap<=7.5?0:gap<15?1:gap<25?2:3;
}
const counts: number[]=[];
for(let i=0;i<SAMPLE_COUNT;i++){
  const x=latent(),a=run(x),b=run(x);
  counts.push(a.answered);
  const e=a.evaluation;
  add('ALL',a,b);
  for(const axis of AXES)add('AXIS_'+axis+'_'+gapBins[bucket(e.axes[axis].gap)],a,b);
  const buckets=AXES.map(axis=>bucket(e.axes[axis].gap));
  const closest=Math.min(...buckets);
  add('MIN_AXIS_'+gapBins[closest],a,b);
  const allClear=buckets.every(b=>b>=2);
  add(allClear?'ALL_AXES_CLEAR':'ONE_OR_MORE_NOT_CLEAR',a,b);
  const styleGap=e.style.gap??0;
  add(styleGap<=5?'STYLE_NEAR_0–5':styleGap<15?'STYLE_MID_5–15':'STYLE_FAR_15+',a,b);
  add(allClear&&styleGap>=15?'AXES_CLEAR_STYLE_FAR':'OTHER',a,b);
  const f=e.jobCode+'→'+b.evaluation.jobCode;
  transition.set(f,(transition.get(f)??0)+1);
}
counts.sort((a,b)=>a-b);
const percentage=(a:number,b:number)=>b===0?null:Math.round(a*1000/b)/10;
const out=Object.fromEntries([...stats.entries()].map(([key,s])=>[key,{
  n:s.n,job:percentage(s.job,s.n),style:percentage(s.style,s.n),
  full32:percentage(s.full,s.n),time:percentage(s.time,s.n),
  decision:percentage(s.decision,s.n),awareness:percentage(s.awareness,s.n),
  meanQuestions:Math.round(s.answerCount/s.n*100)/100,
  meanSeparatorQuestions:Math.round(s.separatorCount/s.n*100)/100,
}]));
assert.equal(stats.get('ALL')?.n,SAMPLE_COUNT);
assert.equal(Object.entries(out).filter(([k])=>k.startsWith('MIN_AXIS_')).reduce((n,[,v])=>n+v.n,0),SAMPLE_COUNT);
const flips=[...transition.entries()].filter(([k])=>k.split('→')[0]!==k.split('→')[1]).sort((a,b)=>b[1]-a[1]).slice(0,12);
const report={seed:'0x20261009',samplePairs:SAMPLE_COUNT,model:'independent latent factor pairs, Likert answer noise sd=0.77, separator noise sd=0.32',notEmpirical:true,
 p50Answers:counts[Math.floor(counts.length*.5)],p90Answers:counts[Math.floor(counts.length*.9)],
 maxAnswers:counts[counts.length-1],strata:out,largestJobFlips:flips};
console.log('MUDAGIRI_BOUNDARY_SIM_10K_V1 '+JSON.stringify(report));
