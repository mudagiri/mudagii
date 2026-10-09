import assert from 'node:assert/strict';
import {JOBS,type AxisId,type AxisPole,type EngineEvaluation,type JobCode,type StyleId} from './src/features/money-personality/classifierV1';
import {MONEY_RESULT_EXPERIENCE_VERSION,type MoneyResultExperienceV2} from './src/features/money-personality/resultExperienceV2';
import {buildMoneyResultExperienceV4} from './src/features/money-personality/resultNarrativeV4';

const jobs=Object.keys(JOBS) as JobCode[];
const styles:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];

function poles(axis:AxisId){
  if(axis==='TIME')return {factorA:'FUTURE',factorB:'IMMEDIATE',poleA:'F' as AxisPole,poleB:'I' as AxisPole};
  if(axis==='DECISION')return {factorA:'DELIBERATION',factorB:'INTUITION',poleA:'D' as AxisPole,poleB:'N' as AxisPole};
  return {factorA:'MONITORING',factorB:'PERIODIC',poleA:'M' as AxisPole,poleB:'P' as AxisPole};
}

function axisResult(axis:AxisId,dominant:AxisPole){
  const p=poles(axis);const isA=dominant===p.poleA;
  return {
    axis,factorA:p.factorA,factorB:p.factorB,poleA:p.poleA,poleB:p.poleB,
    scoreA:isA?78:46,scoreB:isA?46:78,gap:32,dominant,
    balanceState:'CLEAR',absoluteState:'MIXED',strongConflict:false,
    directionChangedAfterReserve1:false,separatorUsed:false,classificationConfidence:'HIGH',
  } as any;
}

function evaluation(job:JobCode,primary:StyleId,secondary:StyleId):EngineEvaluation{
  return {
    factors:{} as any,
    axes:{
      TIME:axisResult('TIME',job[0] as AxisPole),
      DECISION:axisResult('DECISION',job[1] as AxisPole),
      AWARENESS:axisResult('AWARENESS',job[2] as AxisPole),
    },
    style:{primary,secondary,gap:12,scores:{DRIVE:50,ENJOY:50,SECURE:50,OPTIMIZE:50},separatorUsed:false,dualLike:false,classificationConfidence:'MEDIUM'},
    jobCode:job,jobName:JOBS[job],adaptive:{nextItemIds:[],separatorIds:[]},complete:true,
  };
}

const base:MoneyResultExperienceV2={
  version:MONEY_RESULT_EXPERIENCE_VERSION,
  heroLine:'base hero',headline:'base headline',mudagiriLine:'base line',typeMeaning:'base meaning',weapon:'base weapon',strength:'base strength',blindSpot:'base blind',strategy:'base strategy',oneAction:'base action',styleSynthesis:'base synthesis',
  patterns:[
    {title:'TIME',badge:'base',text:'base'},
    {title:'DECISION',badge:'base',text:'base'},
    {title:'AWARENESS',badge:'base',text:'base'},
  ],
};

const forbidden=['浪費家','ズボラ','衝動買い','ケチ','計画性がない','普段は見ない'];
const signatures=new Set<string>();
const identities=new Set<string>();
let count=0;

for(let ji=0;ji<jobs.length;ji++){
  const job=jobs[ji];
  for(let si=0;si<styles.length;si++){
    const primary=styles[si];
    const secondary=styles[(si+1)%styles.length]===primary?styles[(si+2)%styles.length]:styles[(si+1)%styles.length];
    const content=buildMoneyResultExperienceV4(evaluation(job,primary,secondary),base);
    count++;
    assert.equal(content.resultVersion,'MUDAGIRI_MONEY_RESULT_NARRATIVE_V4');
    assert.equal(content.resonanceChecks.length,3,`${job}/${primary}: resonance count`);
    assert.ok(content.identityTitle.length>=8&&content.identityTitle.length<=34,`${job}/${primary}: identity title length ${content.identityTitle.length}`);
    assert.ok(content.sceneTitle.length>=10&&content.sceneTitle.length<=42,`${job}/${primary}: scene title length ${content.sceneTitle.length}`);
    assert.ok(content.sceneBody.length>=45&&content.sceneBody.length<=150,`${job}/${primary}: scene body length ${content.sceneBody.length}`);
    assert.ok(content.hiddenConflict.length>=35&&content.hiddenConflict.length<=130,`${job}/${primary}: hidden conflict length ${content.hiddenConflict.length}`);
    content.resonanceChecks.forEach((line,i)=>{
      assert.ok(line.length>=18&&line.length<=72,`${job}/${primary}/${i}: resonance length ${line.length}`);
    });
    const full=[content.identityTitle,...content.resonanceChecks,content.sceneTitle,content.sceneBody,content.hiddenConflict].join('|');
    for(const word of forbidden)assert.ok(!full.includes(word),`${job}/${primary}: forbidden wording ${word}`);
    const signature=`${job}|${primary}|${full}`;
    assert.ok(!signatures.has(signature),`${job}/${primary}: duplicate V4 signature`);
    signatures.add(signature);
    identities.add(content.identityTitle);
  }
}

assert.equal(count,32);
assert.equal(signatures.size,32);
assert.equal(identities.size,32,'all 32 combinations need distinct identity titles');
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_MONEY_RESULT_V4',combinations:count,uniqueSignatures:signatures.size,uniqueIdentityTitles:identities.size,forbiddenChecks:forbidden.length}));
