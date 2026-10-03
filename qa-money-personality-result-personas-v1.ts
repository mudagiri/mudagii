import assert from 'node:assert/strict';
import {
  JOBS,
  type AbsoluteState,
  type AxisId,
  type AxisPole,
  type BalanceState,
  type EngineEvaluation,
  type JobCode,
  type StyleId,
} from './src/features/money-personality/classifierV1';
import {buildMoneyResultContent,MONEY_RESULT_CONTENT_VERSION} from './src/features/money-personality/resultContentV1';

type AxisSpec={
  balance:BalanceState;
  absolute:AbsoluteState;
  dominant:AxisPole;
  scoreA:number;
  scoreB:number;
};

type Persona={
  id:string;
  job:JobCode;
  primary:StyleId;
  secondary:StyleId;
  time:AxisSpec;
  decision:AxisSpec;
  awareness:AxisSpec;
};

const jobs=Object.keys(JOBS) as JobCode[];
const styles:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];

function poles(axis:AxisId){
  if(axis==='TIME')return {factorA:'FUTURE',factorB:'IMMEDIATE',poleA:'F' as AxisPole,poleB:'I' as AxisPole};
  if(axis==='DECISION')return {factorA:'DELIBERATION',factorB:'INTUITION',poleA:'D' as AxisPole,poleB:'N' as AxisPole};
  return {factorA:'MONITORING',factorB:'PERIODIC',poleA:'M' as AxisPole,poleB:'P' as AxisPole};
}

function clearSpec(axis:AxisId,dominant:AxisPole):AxisSpec{
  const {poleA}=poles(axis);
  return dominant===poleA
    ?{balance:'CLEAR',absolute:'MIXED',dominant,scoreA:82,scoreB:42}
    :{balance:'CLEAR',absolute:'MIXED',dominant,scoreA:42,scoreB:82};
}

function balancedSpec(axis:AxisId,dominant:AxisPole,absolute:AbsoluteState):AxisSpec{
  const {poleA}=poles(axis);
  const pair=absolute==='HIGH_HIGH'?[82,78]:absolute==='LOW_LOW'?[28,24]:[62,58];
  return dominant===poleA
    ?{balance:'BALANCED',absolute,dominant,scoreA:pair[0],scoreB:pair[1]}
    :{balance:'BALANCED',absolute,dominant,scoreA:pair[1],scoreB:pair[0]};
}

function leanSpec(axis:AxisId,dominant:AxisPole):AxisSpec{
  const {poleA}=poles(axis);
  return dominant===poleA
    ?{balance:'LEAN',absolute:'MIXED',dominant,scoreA:65,scoreB:55}
    :{balance:'LEAN',absolute:'MIXED',dominant,scoreA:55,scoreB:65};
}

function axisResult(axis:AxisId,spec:AxisSpec){
  const p=poles(axis);
  return {
    axis,
    factorA:p.factorA,
    factorB:p.factorB,
    poleA:p.poleA,
    poleB:p.poleB,
    scoreA:spec.scoreA,
    scoreB:spec.scoreB,
    gap:Math.abs(spec.scoreA-spec.scoreB),
    dominant:spec.dominant,
    balanceState:spec.balance,
    absoluteState:spec.absolute,
    strongConflict:false,
    directionChangedAfterReserve1:false,
    separatorUsed:spec.balance==='BALANCED',
    classificationConfidence:spec.balance==='CLEAR'?'HIGH':'LOW',
  } as any;
}

function evaluation(p:Persona):EngineEvaluation{
  return {
    factors:{} as any,
    axes:{
      TIME:axisResult('TIME',p.time),
      DECISION:axisResult('DECISION',p.decision),
      AWARENESS:axisResult('AWARENESS',p.awareness),
    },
    style:{
      primary:p.primary,
      secondary:p.secondary,
      gap:12,
      scores:{DRIVE:45,ENJOY:45,SECURE:45,OPTIMIZE:45},
      separatorUsed:false,
      dualLike:false,
      classificationConfidence:'MEDIUM',
    },
    jobCode:p.job,
    jobName:JOBS[p.job],
    adaptive:{nextItemIds:[],separatorIds:[]},
    complete:true,
  };
}

function clearPersona(id:string,job:JobCode,primary:StyleId,secondary:StyleId):Persona{
  return {
    id,job,primary,secondary,
    time:clearSpec('TIME',job[0] as AxisPole),
    decision:clearSpec('DECISION',job[1] as AxisPole),
    awareness:clearSpec('AWARENESS',job[2] as AxisPole),
  };
}

const personas:Persona[]=[];

// 32 core combinations: every JOB x every Primary Style.
for(let ji=0;ji<jobs.length;ji++){
  const job=jobs[ji];
  for(let si=0;si<styles.length;si++){
    const primary=styles[si];
    const secondary=styles[(si+1+ji)%styles.length]===primary
      ?styles[(si+2+ji)%styles.length]
      :styles[(si+1+ji)%styles.length];
    personas.push(clearPersona(`CORE_${job}_${primary}`,job,primary,secondary));
  }
}

// 8 edge personas: high-high, low-low, mixed balance and lean states.
personas.push({
  ...clearPersona('EDGE_FDM_ALL_HH','FDM','DRIVE','ENJOY'),
  time:balancedSpec('TIME','F','HIGH_HIGH'),
  decision:balancedSpec('DECISION','D','HIGH_HIGH'),
  awareness:balancedSpec('AWARENESS','M','HIGH_HIGH'),
});
personas.push({
  ...clearPersona('EDGE_INP_ALL_LL','INP','SECURE','OPTIMIZE'),
  time:balancedSpec('TIME','I','LOW_LOW'),
  decision:balancedSpec('DECISION','N','LOW_LOW'),
  awareness:balancedSpec('AWARENESS','P','LOW_LOW'),
});
personas.push({
  ...clearPersona('EDGE_FNP_TIME_HH','FNP','ENJOY','SECURE'),
  time:balancedSpec('TIME','F','HIGH_HIGH'),
});
personas.push({
  ...clearPersona('EDGE_IDM_DECISION_HH','IDM','OPTIMIZE','ENJOY'),
  decision:balancedSpec('DECISION','D','HIGH_HIGH'),
});
personas.push({
  ...clearPersona('EDGE_IDP_AWARE_HH','IDP','DRIVE','OPTIMIZE'),
  awareness:balancedSpec('AWARENESS','P','HIGH_HIGH'),
});
personas.push({
  ...clearPersona('EDGE_FNM_TIME_LL','FNM','SECURE','DRIVE'),
  time:balancedSpec('TIME','F','LOW_LOW'),
});
personas.push({
  ...clearPersona('EDGE_INM_DECISION_LL','INM','ENJOY','OPTIMIZE'),
  decision:balancedSpec('DECISION','N','LOW_LOW'),
});
personas.push({
  ...clearPersona('EDGE_FDP_MIXED_LEAN','FDP','OPTIMIZE','SECURE'),
  time:leanSpec('TIME','F'),
  awareness:balancedSpec('AWARENESS','P','MIXED'),
});

assert.equal(personas.length,40);
assert.equal(new Set(personas.map(p=>p.id)).size,40);

const forbidden=[
  '浪費家','ズボラ','衝動買い','即決','ケチ','仕事人間','臆病','コスパ厨','計画性がない','普段は見ない',
  '使える余力を大きめ','決めにくいタイプ',
];
const rawPoleBadge=/^(F|I|D|N|M|P)寄り/;
const expectedClearWord:Record<AxisPole,string>={
  F:'先の予定',I:'今得られる',D:'比較',N:'しっくり',M:'普段から',P:'節目',
};

const signatures=new Set<string>();
const byJob=new Map<JobCode,Set<string>>();
let hhCount=0;
let llCount=0;
let balancedCount=0;
let leanCount=0;

for(const persona of personas){
  const content=buildMoneyResultContent(evaluation(persona));
  assert.equal(content.version,MONEY_RESULT_CONTENT_VERSION,persona.id);
  assert.ok(content.headline.length>=20&&content.headline.length<=80,`${persona.id}: headline length ${content.headline.length}`);
  assert.ok(content.blindSpot.length>=20&&content.blindSpot.length<=100,`${persona.id}: blindSpot length ${content.blindSpot.length}`);
  assert.ok(content.strategy.length>=20&&content.strategy.length<=110,`${persona.id}: strategy length ${content.strategy.length}`);
  assert.ok(content.oneAction.length>=15&&content.oneAction.length<=80,`${persona.id}: oneAction length ${content.oneAction.length}`);
  assert.ok(content.primaryStyleLine.includes(persona.primary),`${persona.id}: missing primary style`);
  assert.ok(content.secondaryStyleLine.includes(persona.secondary),`${persona.id}: missing secondary style`);
  assert.ok(content.primaryStyleLine.includes('4属性の中では'),`${persona.id}: primary must be framed as relative ranking`);
  assert.ok(content.secondaryStyleLine.includes('4属性では')&&content.secondaryStyleLine.includes('2番目'),`${persona.id}: secondary must be framed as relative ranking`);
  assert.ok(!content.secondaryStyleLine.includes('も強く'),`${persona.id}: secondary must not be called absolutely strong`);

  const full=JSON.stringify(content);
  for(const word of forbidden)assert.ok(!full.includes(word),`${persona.id}: forbidden over-inference wording: ${word}`);

  const specs:[AxisId,AxisSpec][]=[['TIME',persona.time],['DECISION',persona.decision],['AWARENESS',persona.awareness]];
  for(let i=0;i<specs.length;i++){
    const [axis,spec]=specs[i];
    const insight=content.axisInsights[i];
    assert.equal(insight.axis,axis,`${persona.id}: axis order`);
    assert.ok(!rawPoleBadge.test(insight.badge),`${persona.id}: raw internal pole leaked into badge ${insight.badge}`);
    if(spec.balance==='CLEAR'){
      assert.ok(insight.badge.includes('明確'),`${persona.id}/${axis}: clear badge missing`);
      assert.ok(insight.text.includes(expectedClearWord[spec.dominant]),`${persona.id}/${axis}: clear narrative does not match dominant ${spec.dominant}`);
    }
    if(spec.balance==='LEAN'){
      leanCount++;
      assert.ok(!insight.badge.includes('明確'),`${persona.id}/${axis}: lean mislabeled clear`);
      assert.ok(insight.text.includes(expectedClearWord[spec.dominant]),`${persona.id}/${axis}: lean narrative does not match dominant ${spec.dominant}`);
    }
    if(spec.balance==='BALANCED'){
      balancedCount++;
      if(spec.absolute==='HIGH_HIGH'){
        hhCount++;
        assert.equal(insight.badge,'両方強い',`${persona.id}/${axis}: HH badge`);
        assert.ok(insight.text.includes('両方'),`${persona.id}/${axis}: HH narrative`);
      }else if(spec.absolute==='LOW_LOW'){
        llCount++;
        assert.equal(insight.badge,'どちらも控えめ',`${persona.id}/${axis}: LL badge`);
        assert.ok(insight.text.includes('どちらも'),`${persona.id}/${axis}: LL narrative`);
        assert.ok(!insight.text.includes('状況に応じて')&&!insight.text.includes('必要な場面に合わせて'),`${persona.id}/${axis}: LL must not invent adaptive behavior`);
      }else{
        assert.equal(insight.badge,'かなり拮抗',`${persona.id}/${axis}: balanced mixed badge`);
      }
    }
  }

  const signature=[content.headline,content.weapon,content.primaryStyleLine,content.secondaryStyleLine,...content.axisInsights.map(x=>x.badge+'|'+x.text)].join('||');
  assert.ok(!signatures.has(signature),`${persona.id}: duplicate full result signature`);
  signatures.add(signature);
  const jobSet=byJob.get(persona.job)??new Set<string>();
  jobSet.add(content.headline);
  byJob.set(persona.job,jobSet);
}

// The 32 core personas give each JOB four distinct Primary-style headlines.
for(const job of jobs){
  const coreHeadlines=personas
    .filter(p=>p.id.startsWith(`CORE_${job}_`))
    .map(p=>buildMoneyResultContent(evaluation(p)).headline);
  assert.equal(coreHeadlines.length,4,`${job}: expected four core style personas`);
  assert.equal(new Set(coreHeadlines).size,4,`${job}: style variants collapsed into same headline`);
}

assert.ok(hhCount>=5,`expected multiple HH axes, got ${hhCount}`);
assert.ok(llCount>=5,`expected multiple LL axes, got ${llCount}`);
assert.ok(balancedCount>=12,`expected balanced stress coverage, got ${balancedCount}`);
assert.ok(leanCount>=1,'expected lean stress coverage');

console.log(JSON.stringify({
  ok:true,
  suite:'MUDAGIRI_MONEY_RESULT_PERSONA_STRESS_V1',
  version:MONEY_RESULT_CONTENT_VERSION,
  personas:personas.length,
  uniqueSignatures:signatures.size,
  jobs:jobs.length,
  primaryStyles:styles.length,
  balancedAxes:balancedCount,
  highHighAxes:hhCount,
  lowLowAxes:llCount,
  leanAxes:leanCount,
  forbiddenChecks:forbidden.length,
}));
