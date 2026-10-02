import {PILOT_ITEMS} from './src/features/money-personality/pilotData';
import {assignedPilotItems,buildPilotOrder,parseSwitchItem,type PilotFormId} from './src/features/money-personality/pilotLogic';

const forms:PilotFormId[]=['A','B','C','D','E'];
let checked=0;

const core=PILOT_ITEMS.filter(x=>x.family==='CORE');
if(core.length!==50)throw new Error('core bank != 50');
for(const item of core){
  const shouldBeB=item.construct==='MONITORING'||item.construct==='PERIODIC';
  if(shouldBeB&&item.scale_type!=='B')throw new Error(item.item_id+': expected scale B');
  if(!shouldBeB&&item.scale_type!=='A')throw new Error(item.item_id+': expected scale A');
  if(!item.scenario.trim())throw new Error(item.item_id+': missing scenario');
  if(!item.prompt.trim())throw new Error(item.item_id+': missing prompt');
  if(!item.contract.trim())throw new Error(item.item_id+': missing contract');
}

const sw05=PILOT_ITEMS.find(x=>x.item_id==='SW05');
const sw06=PILOT_ITEMS.find(x=>x.item_id==='SW06');
if(!sw05||!sw06||sw05.family!=='SWITCH'||sw06.family!=='SWITCH')throw new Error('SW05/SW06 missing');
const p05=parseSwitchItem(sw05.text);
const p06=parseSwitchItem(sw06.text);
if(p05.a!==p06.a||p05.b!==p06.b)throw new Error('SW05/SW06 poles must match exactly');

for(const form of forms){
  const assigned=assignedPilotItems(form);
  const formCore=assigned.filter(x=>x.family==='CORE');
  const sw=assigned.filter(x=>x.family==='SWITCH');
  const bh=assigned.filter(x=>x.family==='BEHAVIOR');
  if(assigned.length!==50)throw new Error(form+': total != 50');
  if(formCore.length!==40)throw new Error(form+': core != 40');
  if(sw.length!==6)throw new Error(form+': switch != 6');
  if(bh.length!==4)throw new Error(form+': behavior != 4');

  for(let n=0;n<100;n++){
    const order=buildPilotOrder(form,'qa_'+form+'_'+n);
    if(order.length!==50)throw new Error(form+': order != 50');

    for(let i=1;i<order.length;i++){
      const a=order[i-1],b=order[i];
      if(a.family==='CORE'&&b.family==='CORE'&&a.construct===b.construct)throw new Error(form+': same construct adjacent');
      if(a.family==='SWITCH'&&b.family==='SWITCH')throw new Error(form+': switch adjacent');
      if(a.family==='BEHAVIOR'&&b.family==='BEHAVIOR')throw new Error(form+': behavior adjacent');
    }
    for(let i=0;i<=order.length-8;i++){
      if(order.slice(i,i+8).filter(x=>x.family==='SWITCH').length>2)throw new Error(form+': switch cluster');
    }
    checked++;
  }
}

console.log(JSON.stringify({ok:true,pilotVersion:'V4.4',forms:forms.length,ordersChecked:checked,coreItems:core.length,scaleB:core.filter(x=>x.scale_type==='B').length}));
