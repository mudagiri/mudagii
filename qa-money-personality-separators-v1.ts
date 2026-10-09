import {
  MONEY_PERSONALITY_ITEM_PLAN,
  evaluateMoneyPersonality,
  type FactorId,
  type StyleId,
  type TraitAnswers,
} from './src/features/money-personality/classifierV1';
import {
  AXIS_SEPARATOR_ITEMS,
  SEPARATOR_DESIGN_RULES,
  STYLE_SEPARATOR_VALUE_COPY,
  buildStyleSeparator,
  separatorPresentation,
  type AxisSeparatorId,
} from './src/features/money-personality/separatorDataV1';

function assert(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg);}

const axisIds=Object.keys(AXIS_SEPARATOR_ITEMS) as AxisSeparatorId[];
assert(axisIds.length===3,'axis separator count != 3');

const expected:Record<AxisSeparatorId,readonly string[]>={
  SEP_TIME:['F','I'],
  SEP_DECISION:['D','N'],
  SEP_AWARENESS:['M','P'],
};
const forbidden=['浪費','ズボラ','放置','即決','衝動','暴走','計画性がない','普段は見ない'];

for(const id of axisIds){
  const item=AXIS_SEPARATOR_ITEMS[id];
  assert(item.id===id,id+' id mismatch');
  assert(item.choices.length===2,id+' choices != 2');
  assert(new Set(item.choices.map(x=>x.value)).size===2,id+' duplicate choices');
  assert(expected[id].every(v=>item.choices.some(x=>x.value===v)),id+' pole mapping broken');
  const allText=[item.scenario,item.prompt,...item.choices.map(x=>x.text)].join(' ');
  for(const word of forbidden)assert(!allText.includes(word),id+' contains forbidden inference: '+word);
  assert(item.scenario.length<=50,id+' scenario too long');
  assert(item.prompt.length<=40,id+' prompt too long');
  assert(item.choices.every(x=>x.text.length<=40),id+' choice too long');

  const p1=separatorPresentation(id,'participant_same',item.choices);
  const p2=separatorPresentation(id,'participant_same',item.choices);
  assert(JSON.stringify(p1)===JSON.stringify(p2),id+' presentation not deterministic');

  let swapped=0;
  for(let n=0;n<1000;n++)if(separatorPresentation(id,'sepqa_'+n,item.choices).isSwapped)swapped++;
  const ratio=swapped/1000;
  assert(ratio>=0.45&&ratio<=0.55,id+' position randomization skew '+ratio);
}

const styles=Object.keys(STYLE_SEPARATOR_VALUE_COPY) as StyleId[];
assert(styles.length===4,'style copy count != 4');
let stylePairs=0;
for(let i=0;i<styles.length;i++){
  for(let j=i+1;j<styles.length;j++){
    const a=styles[i],b=styles[j];
    const item=buildStyleSeparator(a,b);
    stylePairs++;
    assert(item.choices[0].value===a&&item.choices[1].value===b,'style pair value mismatch');
    assert(item.choices[0].text===STYLE_SEPARATOR_VALUE_COPY[a],'style A copy mismatch');
    assert(item.choices[1].text===STYLE_SEPARATOR_VALUE_COPY[b],'style B copy mismatch');
    assert(item.choices[0].text!==item.choices[1].text,'style pair copy duplicate');
    const key='SEP_STYLE_'+a+'_'+b;
    const p1=separatorPresentation(key,'style_same',item.choices);
    const p2=separatorPresentation(key,'style_same',item.choices);
    assert(JSON.stringify(p1)===JSON.stringify(p2),'style presentation not deterministic');
  }
}
assert(stylePairs===6,'style pair count != 6');

let threw=false;
try{buildStyleSeparator('DRIVE','DRIVE');}catch{threw=true;}
assert(threw,'same-style separator must throw');
assert(SEPARATOR_DESIGN_RULES.changesFactorScores===false,'separator must not change factor scores');
assert(SEPARATOR_DESIGN_RULES.shownOnlyAfterMaxAdaptive===true,'separator timing rule broken');
assert(SEPARATOR_DESIGN_RULES.preserveBalanceInResult===true,'balance preservation rule broken');
assert(SEPARATOR_DESIGN_RULES.neutralOption===false,'separator must force display-side placement');

const factors=Object.keys(MONEY_PERSONALITY_ITEM_PLAN) as FactorId[];
function allAnswer(value:number):TraitAnswers{
  const a:TraitAnswers={};
  for(const factor of factors){
    const p=MONEY_PERSONALITY_ITEM_PLAN[factor];
    for(const id of [...p.core,p.reserve1,p.reserve2])a[id]=value;
  }
  return a;
}

// Main separators assign a JOB side without altering the balanced factor evidence.
{
  const a=allAnswer(5);
  const before=evaluateMoneyPersonality(a);
  assert(before.adaptive.separatorIds.includes('SEP_TIME'),'balanced time separator missing');
  assert(before.adaptive.separatorIds.includes('SEP_DECISION'),'balanced decision separator missing');
  assert(before.adaptive.separatorIds.includes('SEP_AWARENESS'),'balanced awareness separator missing');
  const scoresBefore={
    F:before.factors.FUTURE.score,I:before.factors.IMMEDIATE.score,
    D:before.factors.DELIBERATION.score,N:before.factors.INTUITION.score,
    M:before.factors.MONITORING.score,P:before.factors.PERIODIC.score,
  };
  const after=evaluateMoneyPersonality(a,{SEP_TIME:'I',SEP_DECISION:'N',SEP_AWARENESS:'P',SEP_STYLE:'ENJOY'});
  assert(after.jobCode==='INP','separator mapping to INP failed');
  assert(after.axes.TIME.balanceState==='BALANCED'&&after.axes.DECISION.balanceState==='BALANCED'&&after.axes.AWARENESS.balanceState==='BALANCED','separator erased balance');
  assert(JSON.stringify(scoresBefore)===JSON.stringify({
    F:after.factors.FUTURE.score,I:after.factors.IMMEDIATE.score,
    D:after.factors.DELIBERATION.score,N:after.factors.INTUITION.score,
    M:after.factors.MONITORING.score,P:after.factors.PERIODIC.score,
  }),'separator changed factor scores');
}

console.log(JSON.stringify({
  ok:true,
  separators:'MUDAGIRI_MONEY_PERSONALITY_SEPARATORS_V1_PILOT_CANDIDATE',
  axisSeparators:axisIds.length,
  stylePairVariants:stylePairs,
  designRules:SEPARATOR_DESIGN_RULES,
}));
