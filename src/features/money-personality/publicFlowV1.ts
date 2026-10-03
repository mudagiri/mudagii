import {publicCore30ItemIds,type JobCode,type StyleId} from './classifierV1';
import {itemById,type PilotItem} from './pilotLogic';

export const PUBLIC_MONEY_TYPE_VERSION='PUBLIC_MONEY_TYPE_V1_PILOT_CANDIDATE' as const;

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
function shuffled<T>(xs:readonly T[],rng:()=>number){
  const out=xs.slice() as T[];
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

const pairGroup=(item:PilotItem)=>{
  if(item.factor==='FUTURE'||item.factor==='IMMEDIATE')return 'TIME';
  if(item.factor==='INTUITION'||item.factor==='DELIBERATION')return 'DECISION';
  if(item.factor==='MONITORING'||item.factor==='PERIODIC')return 'AWARENESS';
  return item.factor;
};
function validCoreOrder(order:PilotItem[]){
  for(let i=1;i<order.length;i++){
    const a=order[i-1],b=order[i];
    if(a.factor===b.factor)return false;
    if(pairGroup(a)===pairGroup(b))return false;
  }
  if(new Set(order.slice(0,8).map(x=>x.factor)).size<6)return false;
  if(new Set(order.slice(-8).map(x=>x.factor)).size<6)return false;
  return true;
}

export function buildPublicCoreOrder(participantId:string){
  const items=publicCore30ItemIds().map(itemById);
  const rng=mulberry32(hashString(participantId+'|PUBLIC_CORE30_V1'));
  for(let i=0;i<30000;i++){
    const order=shuffled(items,rng);
    if(validCoreOrder(order))return order;
  }
  throw new Error('Unable to build valid public CORE30 order');
}

export type PublicBipolarPresentation={
  leftPoleId:'A'|'B';rightPoleId:'A'|'B';leftText:string;rightText:string;traitOnLeft:boolean;
};

export function buildCoreTraitSideMap(participantId:string,order:PilotItem[]){
  const bip=order.filter(x=>x.family==='BIPOLAR');
  if(bip.length!==24)throw new Error('Public CORE30 must contain 24 bipolar items');
  const rng=mulberry32(hashString(participantId+'|PUBLIC_CORE_SIDE_V1'));
  const traitLeftIds=new Set(shuffled(bip.map(x=>x.item_id),rng).slice(0,12));
  return new Map(bip.map(x=>[x.item_id,traitLeftIds.has(x.item_id)] as const));
}

export function publicBipolarPresentation(item:PilotItem,participantId:string,coreSideMap?:Map<string,boolean>):PublicBipolarPresentation{
  if(item.family!=='BIPOLAR')throw new Error('Not bipolar: '+item.item_id);
  const traitPole=item.trait_pole as 'A'|'B';
  const otherPole: 'A'|'B'=traitPole==='A'?'B':'A';
  const mapped=coreSideMap?.get(item.item_id);
  const traitOnLeft=mapped??((hashString(participantId+'|'+item.item_id+'|PUBLIC_ADAPTIVE_SIDE_V1')&1)===1);
  const leftPoleId=traitOnLeft?traitPole:otherPole;
  const rightPoleId=traitOnLeft?otherPole:traitPole;
  const text=(pole:'A'|'B')=>pole==='A'?item.option_a:item.option_b;
  return {leftPoleId,rightPoleId,leftText:text(leftPoleId),rightText:text(rightPoleId),traitOnLeft};
}

export function normalizePublicBipolarResponse(rawResponse:number,p:PublicBipolarPresentation){
  if(!Number.isInteger(rawResponse)||rawResponse<1||rawResponse>5)throw new Error('rawResponse must be 1..5');
  return p.traitOnLeft?6-rawResponse:rawResponse;
}

export function getOrCreatePublicParticipantId(storage:Pick<Storage,'getItem'|'setItem'>=localStorage){
  const key='mudagiri_money_type_public_participant_v1';
  const existing=storage.getItem(key);
  if(existing)return existing;
  const id=typeof crypto!=='undefined'&&'randomUUID' in crypto?'mpp_'+crypto.randomUUID():'mpp_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);
  storage.setItem(key,id);return id;
}
export function newPublicSessionId(){return 'mps_public_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);}

export const JOB_ONE_LINERS:Record<JobCode,string>={
  FDM:'先を見て、考えて決める。財布の現在地も見失わない。',
  FDP:'先を見据え、節目ごとに作戦を組み直す。',
  FNM:'現在地をつかみながら、先の気配を感覚で読む。',
  FNP:'目的地は先にある。進む道は、その時の感覚で選ぶ。',
  IDM:'いまの状況を見つめ、納得できる一手を選ぶ。',
  IDP:'目の前を見定め、節目でじっくり照準を合わせる。',
  INM:'手元の現在地をつかみながら、いましっくりくる一手を選ぶ。',
  INP:'いまの風を感覚で読み、節目ごとに構えを整える。',
};
export const JOB_NUMBER:Record<JobCode,string>={FDM:'01',FDP:'02',FNM:'03',FNP:'04',IDM:'05',IDP:'06',INM:'07',INP:'08'};
export const STYLE_META:Record<StyleId,{label:string;icon:string;copy:string}>={
  DRIVE:{label:'DRIVE',icon:'⚔️',copy:'できることや前進につながる価値を重視'},
  ENJOY:{label:'ENJOY',icon:'🎉',copy:'楽しさや心が動く体験を重視'},
  SECURE:{label:'SECURE',icon:'🛡️',copy:'安心できる余裕や見通しを重視'},
  OPTIMIZE:{label:'OPTIMIZE',icon:'⚙️',copy:'ムダを減らし必要なものへ絞る価値を重視'},
};
