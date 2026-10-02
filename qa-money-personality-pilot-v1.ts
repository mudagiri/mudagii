import {assignedPilotItems,buildPilotOrder,type PilotFormId} from './src/features/money-personality/pilotLogic';

const forms:PilotFormId[]=['A','B','C','D','E'];
let checked=0;

for(const form of forms){
  const assigned=assignedPilotItems(form);
  const core=assigned.filter(x=>x.family==='CORE');
  const sw=assigned.filter(x=>x.family==='SWITCH');
  const bh=assigned.filter(x=>x.family==='BEHAVIOR');
  if(assigned.length!==50)throw new Error(form+': total != 50');
  if(core.length!==40)throw new Error(form+': core != 40');
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

console.log(JSON.stringify({ok:true,forms:forms.length,ordersChecked:checked}));
