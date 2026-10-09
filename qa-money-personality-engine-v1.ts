import {
  FACTOR_GUARDRAILS,
  JOBS,
  MONEY_PERSONALITY_ITEM_PLAN,
  evaluateMoneyPersonality,
  publicCore30ItemIds,
  reserve20ItemIds,
  traitScore1to5,
  type FactorId,
  type SeparatorAnswers,
  type TraitAnswers,
} from './src/features/money-personality/classifierV1';

function assert(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg);}
const factors=Object.keys(MONEY_PERSONALITY_ITEM_PLAN) as FactorId[];

function setFactor(answers:TraitAnswers,factor:FactorId,value:number,scope:'core'|'all'='core'){
  const p=MONEY_PERSONALITY_ITEM_PLAN[factor];
  const ids=scope==='core'?[...p.core]:[...p.core,p.reserve1,p.reserve2];
  for(const id of ids)answers[id]=value;
}
function clearBase():TraitAnswers{
  const a:TraitAnswers={};
  for(const f of factors)setFactor(a,f,3);
  return a;
}
function clearMain(a:TraitAnswers){
  setFactor(a,'FUTURE',5);setFactor(a,'IMMEDIATE',1);
  setFactor(a,'DELIBERATION',5);setFactor(a,'INTUITION',1);
  setFactor(a,'MONITORING',5);setFactor(a,'PERIODIC',1);
}
function clearStyle(a:TraitAnswers){
  setFactor(a,'DRIVE',5);setFactor(a,'ENJOY',3);setFactor(a,'SECURE',2);setFactor(a,'OPTIMIZE',1);
}

const core=publicCore30ItemIds(),reserve=reserve20ItemIds();
assert(core.length===30,'CORE count != 30');
assert(reserve.length===20,'reserve count != 20');
assert(new Set(core).size===30,'CORE duplicate');
assert(new Set(reserve).size===20,'reserve duplicate');
const reserveSet=new Set<string>(reserve as readonly string[]);
assert(core.every(id=>!reserveSet.has(id)),'CORE/reserve overlap');
assert(traitScore1to5(1)===0&&traitScore1to5(3)===50&&traitScore1to5(5)===100,'1..5 mapping broken');
assert(Object.keys(FACTOR_GUARDRAILS).length===10,'guardrail factor count != 10');

{
  const a=clearBase();clearMain(a);clearStyle(a);
  const r=evaluateMoneyPersonality(a);
  assert(r.jobCode==='FDM','clear FDM failed');
  assert(r.jobName===JOBS.FDM,'FDM name mismatch');
  assert(r.style.primary==='DRIVE'&&r.style.secondary==='ENJOY','clear style failed');
  assert(r.adaptive.nextItemIds.length===0&&r.adaptive.separatorIds.length===0,'clear profile should not adapt');
  assert(r.complete,'clear profile should complete');
}

{
  const a=clearBase();clearStyle(a);
  for(const f of ['FUTURE','IMMEDIATE','DELIBERATION','INTUITION','MONITORING','PERIODIC'] as FactorId[])setFactor(a,f,5,'all');
  let r=evaluateMoneyPersonality(a);
  assert(r.axes.TIME.absoluteState==='HIGH_HIGH','time high-high lost');
  assert(r.axes.DECISION.absoluteState==='HIGH_HIGH','decision high-high lost');
  assert(r.axes.AWARENESS.absoluteState==='HIGH_HIGH','awareness high-high lost');
  assert(r.adaptive.separatorIds.length===3,'balanced main should request three separators after reserves');
  r=evaluateMoneyPersonality(a,{SEP_TIME:'F',SEP_DECISION:'D',SEP_AWARENESS:'M'});
  assert(r.jobCode==='FDM','separator FDM failed');
  assert(r.axes.TIME.balanceState==='BALANCED'&&r.axes.TIME.scoreA===100&&r.axes.TIME.scoreB===100,'balanced scores overwritten');
}

{
  const a=clearBase();clearStyle(a);
  for(const f of ['FUTURE','IMMEDIATE','DELIBERATION','INTUITION','MONITORING','PERIODIC'] as FactorId[])setFactor(a,f,1,'all');
  const r=evaluateMoneyPersonality(a,{SEP_TIME:'I',SEP_DECISION:'N',SEP_AWARENESS:'P'});
  assert(r.jobCode==='INP','low-low separator job failed');
  assert(r.axes.TIME.absoluteState==='LOW_LOW'&&r.axes.DECISION.absoluteState==='LOW_LOW'&&r.axes.AWARENESS.absoluteState==='LOW_LOW','low-low lost');
}

{
  const a=clearBase();clearStyle(a);
  setFactor(a,'FUTURE',5,'all');setFactor(a,'IMMEDIATE',1,'all');
  setFactor(a,'DELIBERATION',5,'all');setFactor(a,'INTUITION',1,'all');
  setFactor(a,'MONITORING',5,'all');setFactor(a,'PERIODIC',5,'all');
  const r=evaluateMoneyPersonality(a,{SEP_AWARENESS:'P'});
  assert(r.jobCode==='FDP','high M + high P with P separator should be FDP');
  assert(r.factors.MONITORING.score===100&&r.factors.PERIODIC.score===100,'P incorrectly suppressed M');
  assert(r.axes.AWARENESS.absoluteState==='HIGH_HIGH','M/P high-high lost');
}

{
  const a=clearBase();clearStyle(a);
  setFactor(a,'FUTURE',5);setFactor(a,'IMMEDIATE',5);
  setFactor(a,'DELIBERATION',5);setFactor(a,'INTUITION',1);setFactor(a,'MONITORING',5);setFactor(a,'PERIODIC',1);
  let r=evaluateMoneyPersonality(a);
  assert(r.adaptive.nextItemIds.includes('F02')&&r.adaptive.nextItemIds.includes('I01'),'main R1 pair not requested');
  a.F02=5;
  r=evaluateMoneyPersonality(a);
  assert(r.adaptive.nextItemIds.includes('I01'),'main R1 counterpart was dropped after partial batch');
  a.I01=5;
  r=evaluateMoneyPersonality(a);
  assert(r.adaptive.nextItemIds.includes('F04')&&r.adaptive.nextItemIds.includes('I04'),'main R2 pair not requested');
  a.F04=5;
  r=evaluateMoneyPersonality(a);
  assert(r.adaptive.nextItemIds.includes('I04'),'main R2 counterpart was dropped after partial batch');
}

{
  const a=clearBase();clearStyle(a);
  const fp=MONEY_PERSONALITY_ITEM_PLAN.FUTURE;
  a[fp.core[0]]=1;a[fp.core[1]]=5;a[fp.core[2]]=3;
  setFactor(a,'IMMEDIATE',1);
  setFactor(a,'DELIBERATION',5);setFactor(a,'INTUITION',1);setFactor(a,'MONITORING',5);setFactor(a,'PERIODIC',1);
  const r=evaluateMoneyPersonality(a);
  assert(r.factors.FUTURE.strongConflict,'conflict not detected');
  assert(r.adaptive.nextItemIds.includes('F02')&&r.adaptive.nextItemIds.includes('I01'),'conflict did not trigger pair reserve1');
}

{
  const a=clearBase();clearMain(a);clearStyle(a);
  const before=evaluateMoneyPersonality(a);
  a.F05=4;
  const after=evaluateMoneyPersonality(a);
  assert(before.jobCode==='FDM'&&after.jobCode==='FDM','clear job flipped after one-step perturbation');
}

{
  const a=clearBase();clearMain(a);
  setFactor(a,'DRIVE',5);setFactor(a,'ENJOY',5);setFactor(a,'SECURE',1);setFactor(a,'OPTIMIZE',1);
  let r=evaluateMoneyPersonality(a);
  assert(r.adaptive.nextItemIds.includes('R05')&&r.adaptive.nextItemIds.includes('E02'),'style R1 missing');
  a.R05=5;a.E02=5;
  r=evaluateMoneyPersonality(a);
  assert(r.adaptive.nextItemIds.includes('R03')&&r.adaptive.nextItemIds.includes('E05'),'style R2 missing');
  a.R03=5;a.E05=5;
  r=evaluateMoneyPersonality(a);
  assert(r.adaptive.separatorIds.includes('SEP_STYLE'),'style separator missing');
  r=evaluateMoneyPersonality(a,{SEP_STYLE:'ENJOY'});
  assert(r.style.primary==='ENJOY'&&r.style.secondary==='DRIVE'&&r.style.dualLike,'style separator failed');
}

let seed=0x12345678;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let n=0;n<2000;n++){
  const a:TraitAnswers={};
  for(const f of factors){
    const p=MONEY_PERSONALITY_ITEM_PLAN[f];
    for(const id of [...p.core,p.reserve1,p.reserve2])a[id]=1+Math.floor(rnd()*5);
  }
  const pre=evaluateMoneyPersonality(a);
  const sep:SeparatorAnswers={};
  if(pre.axes.TIME.balanceState==='BALANCED')sep.SEP_TIME=pre.axes.TIME.poleA;
  if(pre.axes.DECISION.balanceState==='BALANCED')sep.SEP_DECISION=pre.axes.DECISION.poleA;
  if(pre.axes.AWARENESS.balanceState==='BALANCED')sep.SEP_AWARENESS=pre.axes.AWARENESS.poleA;
  if(pre.style.gap!==null&&pre.style.gap<=5&&pre.style.primary)sep.SEP_STYLE=pre.style.primary;
  const r=evaluateMoneyPersonality(a,sep);
  assert(r.adaptive.nextItemIds.length===0,'full answers requested more trait items');
  assert(r.jobCode!==null&&r.jobName!==null,'full main answers + separators did not classify');
  assert(r.style.primary!==null&&r.style.secondary!==null,'full style answers did not classify');
  assert(Object.prototype.hasOwnProperty.call(JOBS,r.jobCode),'unknown job code');
}

console.log(JSON.stringify({ok:true,engine:'MUDAGIRI_MONEY_PERSONALITY_ENGINE_V1_PILOT_CANDIDATE',coreItems:core.length,reserveItems:reserve.length,jobs:Object.keys(JOBS).length,randomInvariantCases:2000}));
