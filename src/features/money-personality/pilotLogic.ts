import {PILOT_ITEMS} from './pilotData';

export type PilotItem=(typeof PILOT_ITEMS)[number];

const ITEMS_BY_ID=new Map<string,PilotItem>(PILOT_ITEMS.map(x=>[x.item_id,x] as const));

export function itemById(id:string):PilotItem{
  const item=ITEMS_BY_ID.get(id);
  if(!item)throw new Error('Unknown pilot item: '+id);
  return item;
}

function hashString(input:string){
  let h=2166136261>>>0;
  for(let i=0;i<input.length;i++){
    h^=input.charCodeAt(i);
    h=Math.imul(h,16777619)>>>0;
  }
  return h>>>0;
}

function mulberry32(seed:number){
  let a=seed>>>0;
  return ()=>{
    a|=0;a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}

function shuffled<T>(xs:T[],rng:()=>number){
  const out=xs.slice();
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

export function newPilotParticipantId(){
  if(typeof crypto!=='undefined'&&'randomUUID' in crypto)return 'mp_'+crypto.randomUUID();
  return 'mp_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
}

export function getOrCreatePilotParticipantId(storage:Pick<Storage,'getItem'|'setItem'>=localStorage){
  const key='mudagiri_money_pilot_participant_v1';
  const existing=storage.getItem(key);
  if(existing)return existing;
  const id=newPilotParticipantId();
  storage.setItem(key,id);
  return id;
}

export function newPilotSessionId(){
  return 'mps_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
}

function validOrder(order:PilotItem[]){
  for(let i=1;i<order.length;i++){
    const a=order[i-1],b=order[i];
    if(a.factor===b.factor&&a.factor!=='BEHAVIOR')return false;
    if(a.family==='BEHAVIOR'&&b.family==='BEHAVIOR')return false;
  }
  if(new Set(order.slice(0,8).map(x=>x.factor)).size<5)return false;
  if(new Set(order.slice(-8).map(x=>x.factor)).size<5)return false;
  return true;
}

export function buildPilotOrder(participantId:string){
  const pool=PILOT_ITEMS.slice() as PilotItem[];
  const rng=mulberry32(hashString(participantId+'|MUDAGIRI_V4_5'));
  for(let i=0;i<20000;i++){
    const order=shuffled(pool,rng);
    if(validOrder(order))return order;
  }
  throw new Error('Unable to build valid V4.5 pilot order');
}

export type PoleId='A'|'B';

export type BipolarPresentation={
  leftPoleId:PoleId;
  rightPoleId:PoleId;
  leftText:string;
  rightText:string;
  traitPole:PoleId;
  isReversed:boolean;
};

export function bipolarPresentation(item:PilotItem,participantId:string):BipolarPresentation{
  if(item.family!=='BIPOLAR')throw new Error('Not a bipolar item: '+item.item_id);
  const bOnLeft=(hashString(participantId+'|'+item.item_id+'|POLE_V1')&1)===1;
  const leftPoleId:PoleId=bOnLeft?'B':'A';
  const rightPoleId:PoleId=bOnLeft?'A':'B';
  const leftText=bOnLeft?item.option_b:item.option_a;
  const rightText=bOnLeft?item.option_a:item.option_b;
  const traitPole=item.trait_pole as PoleId;
  return {
    leftPoleId,
    rightPoleId,
    leftText,
    rightText,
    traitPole,
    isReversed:leftPoleId===traitPole,
  };
}

export function normalizeTraitScore(rawResponse:number,isReversed:boolean){
  if(!Number.isInteger(rawResponse)||rawResponse<1||rawResponse>5)throw new Error('rawResponse must be 1..5');
  return isReversed?6-rawResponse:rawResponse;
}

export function behaviorOptions(item:PilotItem){
  return item.family==='BEHAVIOR'?[...item.behavior_options]:[];
}
