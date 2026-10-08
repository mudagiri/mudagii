import assert from 'node:assert/strict';
import {JOBS,type EngineEvaluation,type JobCode,type StyleId} from './src/features/money-personality/classifierV1';
import {buildResultAxisRows,buildResultBalanceNote} from './src/features/money-personality/resultAxisPresentationV1';
import {resultV9For} from './src/features/money-personality/resultV9Content';

function sample(a:number,b:number,state:'BALANCED'|'LEAN'|'CLEAR',absolute:'MIXED'|'HIGH_HIGH'|'LOW_LOW'='MIXED'):EngineEvaluation{
 const axis=(axis:'TIME'|'DECISION'|'AWARENESS',factorA:string,factorB:string,poleA:string,poleB:string)=>({
  axis,factorA,factorB,poleA,poleB,scoreA:a,scoreB:b,gap:Math.abs(a-b),
  dominant:a>=b?poleA:poleB,balanceState:state,absoluteState:absolute,
  separatorUsed:state==='BALANCED',classificationConfidence:state==='BALANCED'?'LOW':'HIGH',
  strongConflict:false,directionChangedAfterReserve1:false,
 });
 return {
  axes:{
   TIME:axis('TIME','FUTURE','IMMEDIATE','F','I'),
   DECISION:axis('DECISION','DELIBERATION','INTUITION','D','N'),
   AWARENESS:axis('AWARENESS','MONITORING','PERIODIC','M','P'),
  },factors:{} as any,jobCode:'FDM',jobName:JOBS.FDM,complete:true,
  adaptive:{nextItemIds:[],separatorIds:[]},
  style:{primary:'ENJOY',secondary:'SECURE',gap:8,scores:{DRIVE:50,ENJOY:80,SECURE:72,OPTIMIZE:35},
   separatorUsed:false,dualLike:false,classificationConfidence:'HIGH'},
 } as EngineEvaluation;
}
const clear=buildResultAxisRows(sample(100,85,'CLEAR'));
assert.equal(clear[0].lean,'未来を考える寄り','100 vs 85 must not show balance');
assert.equal(clear[0].pos,43);
assert.ok(clear.every(x=>!x.lean.includes('半々')));
assert.equal(buildResultAxisRows(sample(65,55,'LEAN'))[0].lean,'やや未来を考える寄り');
const highHigh=buildResultAxisRows(sample(80,80,'BALANCED','HIGH_HIGH'));
assert.equal(highHigh[0].lean,'両方強い');
assert.equal(highHigh[0].pos,50);
assert.ok(buildResultBalanceNote(sample(80,80,'BALANCED','HIGH_HIGH'))?.includes('両方の特徴'));
assert.equal(buildResultAxisRows(sample(20,20,'BALANCED','LOW_LOW'))[0].lean,'どちらも控えめ');
assert.equal(buildResultBalanceNote(sample(90,40,'CLEAR')),null);
const jobs=Object.keys(JOBS) as JobCode[];
const styles:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const specialized=['二軒目','保険','旅行','ホテル','ライブ','転職','仕事道具','資格','講座'];
let types=0;
for(const job of jobs)for(const style of styles){
 const x=resultV9For(job,style);types++;
 assert.equal(x.scenes.length,6);
 assert.equal(new Set(x.scenes.map(s=>s.label)).size,6);
 assert.deepEqual(x.scenes,resultV9For(job,style).scenes,'scene order must be stable');
 const firstTwo=x.scenes.slice(0,2);
 assert.ok(firstTwo.some(s=>!specialized.some(n=>s.label.includes(n))),`${job}/${style}: both first scenes are specialist scenarios`);
 assert.ok(firstTwo.every(s=>s.hit.length>12&&s.voice.length>8),`${job}/${style}: blank recognition scene`);
}
assert.equal(types,32);
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_RESULT_CALIBRATION_V1',types,scenes:types*6,clearVsRatioResolved:true,balanceExplained:true}));
