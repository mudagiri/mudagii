import {FIXED_BEHAVIORS,FIXED_SWITCHES,OMISSION_ALLOCATION,PILOT_ITEMS} from './pilotData';

export type PilotFormId=keyof typeof OMISSION_ALLOCATION;
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

export function assignPilotForm(participantId:string,override?:string|null):PilotFormId{
  if(override&&['A','B','C','D','E'].includes(override))return override as PilotFormId;
  const forms:PilotFormId[]=['A','B','C','D','E'];
  return forms[hashString(participantId)%forms.length];
}

export function assignedPilotItems(form:PilotFormId){
  const omitted=new Set<string>(Object.values(OMISSION_ALLOCATION[form]));
  const core=PILOT_ITEMS.filter(x=>x.family==='CORE'&&!omitted.has(x.item_id));
  const fixed=[...FIXED_SWITCHES,...FIXED_BEHAVIORS].map(itemById);
  const all=[...core,...fixed];
  if(core.length!==40||all.length!==50)throw new Error('Invalid pilot assignment');
  return all;
}

function role(item:PilotItem){
  return item.family==='CORE'?item.construct:item.family;
}

function validOrder(order:PilotItem[]){
  for(let i=1;i<order.length;i++){
    const a=order[i-1],b=order[i];
    if(a.family==='CORE'&&b.family==='CORE'&&a.construct===b.construct)return false;
    if(a.family==='SWITCH'&&b.family==='SWITCH')return false;
    if(a.family==='BEHAVIOR'&&b.family==='BEHAVIOR')return false;
  }
  for(let i=0;i<=order.length-8;i++){
    if(order.slice(i,i+8).filter(x=>x.family==='SWITCH').length>2)return false;
  }
  if(new Set(order.slice(0,8).map(role)).size<6)return false;
  if(new Set(order.slice(-8).map(role)).size<6)return false;
  return true;
}

export function buildPilotOrder(form:PilotFormId,participantId:string){
  const pool=assignedPilotItems(form);
  const rng=mulberry32(hashString(form+'|'+participantId+'|MUDAGIRI_V4_3'));
  for(let i=0;i<10000;i++){
    const order=shuffled(pool,rng);
    if(validOrder(order))return order;
  }
  throw new Error('Unable to build valid pilot order');
}

export function parseSwitchItem(text:string){
  const lines=text.split('\n').map(x=>x.trim()).filter(Boolean);
  const aLine=lines.find(x=>x.startsWith('A：')||x.startsWith('A:'));
  const bLine=lines.find(x=>x.startsWith('B：')||x.startsWith('B:'));
  const prompt=lines.filter(x=>x!==aLine&&x!==bLine).join(' ');
  return {
    prompt:prompt||'次の2つなら、どちらに近いですか？',
    a:(aLine||'A：').replace(/^A[：:]/,'').trim(),
    b:(bLine||'B：').replace(/^B[：:]/,'').trim()
  };
}

export function behaviorOptions(item:PilotItem){
  return item.behavior_options?item.behavior_options.split(' / ').map(x=>x.trim()).filter(Boolean):[];
}
