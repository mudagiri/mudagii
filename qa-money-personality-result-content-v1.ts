import assert from 'node:assert/strict';
import {JOBS,type AxisId,type AxisPole,type EngineEvaluation,type JobCode,type StyleId} from './src/features/money-personality/classifierV1';
import {buildMoneyResultContent,JOB_RESULT_BASE,MONEY_RESULT_CONTENT_VERSION} from './src/features/money-personality/resultContentV1';

const jobs=Object.keys(JOBS) as JobCode[];
const styles:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const forbidden=['浪費家','ズボラ','衝動買い','即決','ケチ','仕事人間','臆病','コスパ厨','計画性がない','普段は見ない'];

function axis(axis:AxisId,dominant:AxisPole,balanceState:'BALANCED'|'LEAN'|'CLEAR'='CLEAR',absoluteState:'HIGH_HIGH'|'LOW_LOW'|'MIXED'='MIXED'){
  return {
    axis,
    factorA:axis==='TIME'?'FUTURE':axis==='DECISION'?'DELIBERATION':'MONITORING',
    factorB:axis==='TIME'?'IMMEDIATE':axis==='DECISION'?'INTUITION':'PERIODIC',
    poleA:axis==='TIME'?'F':axis==='DECISION'?'D':'M',
    poleB:axis==='TIME'?'I':axis==='DECISION'?'N':'P',
    scoreA:75,scoreB:50,gap:25,dominant,balanceState,absoluteState,strongConflict:false,directionChangedAfterReserve1:false,separatorUsed:false,classificationConfidence:'HIGH',
  } as any;
}

function fakeEvaluation(jobCode:JobCode,primary:StyleId,secondary:StyleId,variant:'clear'|'hh'|'ll'='clear'):EngineEvaluation{
  const time=jobCode[0] as AxisPole;
  const decision=jobCode[1] as AxisPole;
  const awareness=jobCode[2] as AxisPole;
  const balanced=variant==='clear'?'CLEAR':'BALANCED';
  const absolute=variant==='hh'?'HIGH_HIGH':variant==='ll'?'LOW_LOW':'MIXED';
  return {
    factors:{} as any,
    axes:{
      TIME:axis('TIME',time,balanced,absolute),
      DECISION:axis('DECISION',decision,balanced,absolute),
      AWARENESS:axis('AWARENESS',awareness,balanced,absolute),
    },
    style:{primary,secondary,gap:20,scores:{DRIVE:60,ENJOY:60,SECURE:60,OPTIMIZE:60},separatorUsed:false,dualLike:false,classificationConfidence:'HIGH'},
    jobCode,jobName:JOBS[jobCode],adaptive:{nextItemIds:[],separatorIds:[]},complete:true,
  };
}

assert.equal(Object.keys(JOB_RESULT_BASE).length,8);
let combinations=0;
for(const job of jobs){
  for(const primary of styles){
    for(const secondary of styles.filter(x=>x!==primary)){
      const result=buildMoneyResultContent(fakeEvaluation(job,primary,secondary));
      combinations++;
      assert.equal(result.version,MONEY_RESULT_CONTENT_VERSION);
      assert.ok(result.headline.length>10);
      assert.ok(result.weapon.length>1);
      assert.ok(result.strength.length>10);
      assert.ok(result.blindSpot.length>10);
      assert.ok(result.strategy.length>10);
      assert.ok(result.oneAction.length>10);
      assert.equal(result.axisInsights.length,3);
      assert.ok(result.primaryStyleLine.includes(primary));
      assert.ok(result.secondaryStyleLine.includes(secondary));
      const text=JSON.stringify(result);
      for(const word of forbidden)assert.ok(!text.includes(word),`${job}/${primary}/${secondary} contained forbidden wording: ${word}`);
    }
  }
}
assert.equal(combinations,96);

const hh=buildMoneyResultContent(fakeEvaluation('FDM','DRIVE','ENJOY','hh'));
const ll=buildMoneyResultContent(fakeEvaluation('FDM','DRIVE','ENJOY','ll'));
assert.ok(hh.axisInsights.every(x=>x.badge==='両方強い'));
assert.ok(ll.axisInsights.every(x=>x.badge==='どちらも控えめ'));
assert.ok(hh.axisInsights[0].text.includes('どちらも強く'));
assert.ok(ll.axisInsights[0].text.includes('どちらか一方を強い基準にするより'));
assert.notEqual(hh.axisInsights[0].text,ll.axisInsights[0].text);

assert.throws(()=>buildMoneyResultContent({...fakeEvaluation('FDM','DRIVE','ENJOY'),complete:false}),/complete evaluation/);

console.log(JSON.stringify({ok:true,version:MONEY_RESULT_CONTENT_VERSION,jobs:jobs.length,combinations,guardrails:forbidden.length,balancedHighHigh:true,balancedLowLow:true}));
