import {publicCore30ItemIds} from './src/features/money-personality/classifierV1';
import {itemById,normalizeTraitScore} from './src/features/money-personality/pilotLogic';
import {buildCoreTraitLeftMap,buildPublicCoreOrder,publicBipolarPresentation,publicPhaseLabel,publicProgressPercent} from './src/features/money-personality/adaptiveLogicV1';

function assert(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg);}
const canonical=new Set(publicCore30ItemIds());

for(let n=0;n<500;n++){
  const participant='public_flow_'+n;
  const order=buildPublicCoreOrder(participant);
  const order2=buildPublicCoreOrder(participant);
  assert(order.length===30,'core order length != 30');
  assert(new Set(order).size===30,'core order duplicate');
  assert(order.every(id=>canonical.has(id)),'non-core item leaked into public base');
  assert(JSON.stringify(order)===JSON.stringify(order2),'core order not deterministic');
  for(let i=1;i<order.length;i++)assert(itemById(order[i-1]).factor!==itemById(order[i]).factor,'same factor adjacent');

  const map=buildCoreTraitLeftMap(participant,order);
  const bip=order.filter(id=>itemById(id).family==='BIPOLAR');
  assert(bip.length===24,'public core bipolar count != 24');
  assert(bip.filter(id=>map[id]).length===12,'public core trait-left balance != 12/12');
  for(const id of bip){
    const item=itemById(id);
    const p=publicBipolarPresentation(item,participant,map);
    assert(p.isReversed===map[id],'balanced side map not applied');
    assert(normalizeTraitScore(1,p.isReversed)===(p.isReversed?5:1),'left endpoint normalization broken');
    assert(normalizeTraitScore(5,p.isReversed)===(p.isReversed?1:5),'right endpoint normalization broken');
  }
}

assert(publicPhaseLabel(0,false,false)==='QUEST 1 / 3','phase 1 broken');
assert(publicPhaseLabel(10,false,false)==='QUEST 2 / 3','phase 2 broken');
assert(publicPhaseLabel(20,false,false)==='QUEST 3 / 3','phase 3 broken');
assert(publicPhaseLabel(30,true,false)==='FINAL TUNE','adaptive phase broken');
assert(publicPhaseLabel(30,false,true)==='FINAL CHECK','separator phase broken');

let last=-1;
for(let n=0;n<=30;n++){
  const p=publicProgressPercent(n,0,false,false);
  assert(p>=last,'core progress regressed');
  last=p;
}
assert(publicProgressPercent(30,1,false,false)>84,'adaptive progress did not advance');
assert(publicProgressPercent(30,10,false,false)<=96,'adaptive progress exceeded 96');
assert(publicProgressPercent(30,10,true,false)===97,'separator progress != 97');
assert(publicProgressPercent(30,10,false,true)===100,'complete progress != 100');

console.log(JSON.stringify({ok:true,flow:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_FLOW_V1',participants:500,coreItems:30,bipolarCore:24,traitSideBalance:'12/12'}));
