import {PILOT_ITEMS,PILOT_VERSION} from './src/features/money-personality/pilotData';
import {bipolarPresentation,buildPilotOrder,normalizeTraitScore} from './src/features/money-personality/pilotLogic';

const bip=PILOT_ITEMS.filter(x=>x.family==='BIPOLAR');
const lik=PILOT_ITEMS.filter(x=>x.family==='LIKERT');
const beh=PILOT_ITEMS.filter(x=>x.family==='BEHAVIOR');
if(PILOT_ITEMS.length!==54)throw new Error('total != 54');
if(bip.length!==40)throw new Error('bipolar != 40');
if(lik.length!==10)throw new Error('likert != 10');
if(beh.length!==4)throw new Error('behavior != 4');

const counts=new Map<string,number>();
for(const x of PILOT_ITEMS)counts.set(x.factor,(counts.get(x.factor)||0)+1);
for(const factor of ['FUTURE','IMMEDIATE','INTUITION','DELIBERATION','MONITORING','PERIODIC','DRIVE','ENJOY','SECURE','OPTIMIZE']){
  if(counts.get(factor)!==5)throw new Error(factor+' != 5');
}

const b04=PILOT_ITEMS.find(x=>x.item_id==='B04');
if(!b04||b04.family!=='BEHAVIOR'||!('behavior_followup' in b04))throw new Error('B04 followup missing');
if(b04.behavior_followup.options.length!==5)throw new Error('B04 followup options != 5');
const answerCount=PILOT_ITEMS.length+1;
if(answerCount!==55)throw new Error('answer count != 55');

let left=0,right=0;
for(let n=0;n<500;n++){
  const pid='qa_v452_'+n;
  const order=buildPilotOrder(pid);
  if(order.length!==54||new Set(order.map(x=>x.item_id)).size!==54)throw new Error('invalid order');
  for(let i=1;i<order.length;i++){
    const a=order[i-1],b=order[i];
    if(a.factor===b.factor&&a.factor!=='BEHAVIOR')throw new Error('same factor adjacent');
    if(a.family==='BEHAVIOR'&&b.family==='BEHAVIOR')throw new Error('behavior adjacent');
  }
  for(const item of bip){
    const p=bipolarPresentation(item,pid);
    if(p.isReversed){
      left++;
      if(normalizeTraitScore(1,true)!==5||normalizeTraitScore(5,true)!==1)throw new Error('reverse score');
    }else{
      right++;
      if(normalizeTraitScore(1,false)!==1||normalizeTraitScore(5,false)!==5)throw new Error('forward score');
    }
    if(normalizeTraitScore(3,p.isReversed)!==3)throw new Error('mid score');
  }
}
const ratio=left/(left+right);
if(ratio<0.45||ratio>0.55)throw new Error('randomization skew '+ratio);
console.log(JSON.stringify({ok:true,pilotVersion:PILOT_VERSION,screens:PILOT_ITEMS.length,answers:answerCount,bipolar:bip.length,likert:lik.length,behavior:beh.length,leftRatio:Number(ratio.toFixed(4))}));
