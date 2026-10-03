import {publicCore30ItemIds} from './src/features/money-personality/classifierV1';
import {itemById} from './src/features/money-personality/pilotLogic';
import {
  buildCoreTraitSideMap,buildPublicCoreOrder,JOB_ONE_LINERS,normalizePublicBipolarResponse,
  orderAdaptiveItemIds,publicBipolarPresentation,publicPhaseLabel,publicProgress,STYLE_META,
} from './src/features/money-personality/publicFlowV1';

function assert(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg);}
const canonical=new Set(publicCore30ItemIds());
const group=(factor:string)=>{
  if(factor==='FUTURE'||factor==='IMMEDIATE')return 'TIME';
  if(factor==='INTUITION'||factor==='DELIBERATION')return 'DECISION';
  if(factor==='MONITORING'||factor==='PERIODIC')return 'AWARENESS';
  return factor;
};

for(let n=0;n<500;n++){
  const participant='public_flow_'+n;
  const order=buildPublicCoreOrder(participant);
  const order2=buildPublicCoreOrder(participant);
  assert(order.length===30,'core order length != 30');
  assert(new Set(order.map(x=>x.item_id)).size===30,'core order duplicate');
  assert(order.every(x=>canonical.has(x.item_id)),'non-core item leaked into public base');
  assert(JSON.stringify(order.map(x=>x.item_id))===JSON.stringify(order2.map(x=>x.item_id)),'core order not deterministic');
  for(let i=1;i<order.length;i++){
    assert(order[i-1].factor!==order[i].factor,'same factor adjacent');
    assert(group(order[i-1].factor)!==group(order[i].factor),'same main pair adjacent');
    assert(!(order[i-1].family==='LIKERT'&&order[i].family==='LIKERT'),'Likert adjacent');
  }

  const map=buildCoreTraitSideMap(participant,order);
  const bip=order.filter(x=>x.family==='BIPOLAR');
  assert(bip.length===24,'public core bipolar count != 24');
  assert(bip.filter(x=>map.get(x.item_id)).length===12,'public core trait-left balance != 12/12');
  for(const item of bip){
    const p=publicBipolarPresentation(item,participant,map);
    assert(p.traitOnLeft===map.get(item.item_id),'balanced side map not applied');
    assert(normalizePublicBipolarResponse(1,p)===(p.traitOnLeft?5:1),'left endpoint normalization broken');
    assert(normalizePublicBipolarResponse(5,p)===(p.traitOnLeft?1:5),'right endpoint normalization broken');
    assert(normalizePublicBipolarResponse(3,p)===3,'midpoint normalization broken');
  }
}

{
  const ids=['F02','I01','D05','N01','M04','P03'];
  const a=orderAdaptiveItemIds(ids,'adaptive_user');
  const b=orderAdaptiveItemIds(ids,'adaptive_user');
  assert(JSON.stringify(a)===JSON.stringify(b),'adaptive order not deterministic');
  assert(new Set(a).size===ids.length,'adaptive order lost/duplicated items');
  for(let i=1;i<a.length;i++)assert(group(itemById(a[i-1]).factor)!==group(itemById(a[i]).factor),'adaptive pair adjacency not avoided');
}

assert(publicPhaseLabel(0)==='QUEST 1 / MONEY MAP','phase 1 broken');
assert(publicPhaseLabel(10)==='QUEST 2 / CHOICE MAP','phase 2 broken');
assert(publicPhaseLabel(20)==='QUEST 3 / JOB MAP','phase 3 broken');
assert(publicPhaseLabel(30)==='FINAL / JOB ANALYSIS','final phase broken');

let last=-1;
for(let n=0;n<=30;n++){
  const p=publicProgress(n,0,0,false);
  assert(p>=last,'core progress regressed');
  last=p;
}
assert(publicProgress(30,1,0,false)>84,'adaptive progress did not advance');
assert(publicProgress(30,10,0,false)<=98,'adaptive progress exceeded 98');
assert(publicProgress(30,10,2,false)<=98,'separator progress exceeded 98');
assert(publicProgress(30,10,3,true)===100,'complete progress != 100');
assert(Object.keys(JOB_ONE_LINERS).length===8,'JOB result copy count != 8');
assert(Object.keys(STYLE_META).length===4,'style metadata count != 4');

console.log(JSON.stringify({ok:true,flow:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_FLOW_V1',participants:500,coreItems:30,bipolarCore:24,traitSideBalance:'12/12',adaptiveOrder:'deterministic'}));
