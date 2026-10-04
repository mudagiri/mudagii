import {publicCore30ItemIds,type JobCode,type MainFactorId,type StyleId} from './classifierV1';
import {itemById,type PilotItem,type PoleId} from './pilotLogic';

export const PUBLIC_MONEY_TYPE_VERSION='MUDAGIRI_MONEY_PERSONALITY_PUBLIC_V1' as const;

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
  const out=[...xs];
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

function factorGroup(factor:string){
  if(factor==='FUTURE'||factor==='IMMEDIATE')return 'TIME';
  if(factor==='INTUITION'||factor==='DELIBERATION')return 'DECISION';
  if(factor==='MONITORING'||factor==='PERIODIC')return 'AWARENESS';
  return factor;
}

function validNext(prev:PilotItem|undefined,next:PilotItem){
  if(!prev)return true;
  if(prev.factor===next.factor)return false;
  if(factorGroup(prev.factor)===factorGroup(next.factor))return false;
  if(prev.family==='LIKERT'&&next.family==='LIKERT')return false;
  return true;
}

/**
 * Canonical public base order. The same participant always receives the same
 * 30-item order so resume never changes the measurement form.
 */
export function buildPublicCoreOrder(participantId:string):PilotItem[]{
  const source=publicCore30ItemIds().map(itemById);
  const rng=mulberry32(hashString(participantId+'|PUBLIC_CORE30_ORDER_V1'));

  // Seeded greedy restarts make the adjacency rules deterministic without
  // relying on an expensive random-permutation acceptance loop.
  for(let attempt=0;attempt<1000;attempt++){
    const remaining=shuffled(source,rng);
    const order:PilotItem[]=[];
    while(remaining.length){
      const prev=order[order.length-1];
      const candidates=remaining
        .map((item,index)=>({item,index,tie:rng()}))
        .filter(x=>validNext(prev,x.item))
        .sort((a,b)=>a.tie-b.tie);
      if(!candidates.length)break;
      const pick=candidates[0];
      order.push(pick.item);
      remaining.splice(pick.index,1);
    }
    if(order.length===source.length)return order;
  }
  throw new Error('Unable to build PUBLIC_CORE30_V1 order');
}

export type CoreTraitSideMap=Map<string,boolean>;

/** Exactly 12/24 bipolar CORE items place the measured trait on the left. */
export function buildCoreTraitSideMap(participantId:string,order:readonly PilotItem[]):CoreTraitSideMap{
  const bipolar=order.filter(x=>x.family==='BIPOLAR');
  if(bipolar.length!==24)throw new Error('PUBLIC CORE expected 24 bipolar items');
  const rng=mulberry32(hashString(participantId+'|PUBLIC_CORE_SIDE_V1'));
  const randomized=shuffled(bipolar.map(x=>x.item_id),rng);
  const left=new Set(randomized.slice(0,12));
  return new Map(bipolar.map(x=>[x.item_id,left.has(x.item_id)] as const));
}

function oppositePole(p:PoleId):PoleId{return p==='A'?'B':'A';}

export type PublicBipolarPresentation={
  leftPoleId:PoleId;
  rightPoleId:PoleId;
  leftText:string;
  rightText:string;
  traitPole:PoleId;
  traitOnLeft:boolean;
  isReversed:boolean;
};

/** CORE uses the balanced side map; adaptive items use deterministic side assignment. */
export function publicBipolarPresentation(
  item:PilotItem,
  participantId:string,
  coreSideMap?:CoreTraitSideMap,
):PublicBipolarPresentation{
  if(item.family!=='BIPOLAR')throw new Error('Not a bipolar item: '+item.item_id);
  const traitPole=item.trait_pole as PoleId;
  const mapped=coreSideMap?.get(item.item_id);
  const traitOnLeft=mapped===undefined
    ?(hashString(participantId+'|'+item.item_id+'|PUBLIC_ADAPTIVE_SIDE_V1')&1)===1
    :mapped;
  const leftPoleId=traitOnLeft?traitPole:oppositePole(traitPole);
  const rightPoleId=oppositePole(leftPoleId);
  return {
    leftPoleId,
    rightPoleId,
    leftText:leftPoleId==='A'?item.option_a:item.option_b,
    rightText:rightPoleId==='A'?item.option_a:item.option_b,
    traitPole,
    traitOnLeft,
    isReversed:traitOnLeft,
  };
}

/** Convert physical 1..5 response to semantic trait direction (1 low -> 5 high). */
export function normalizePublicBipolarResponse(raw:number,presentation:PublicBipolarPresentation){
  if(!Number.isInteger(raw)||raw<1||raw>5)throw new Error('raw response must be integer 1..5');
  return presentation.traitOnLeft?6-raw:raw;
}

/**
 * Adaptive reserves are response-dependent, so only the active batch is
 * ordered. Ordering remains deterministic for resume and avoids pair blocks.
 */
export function orderAdaptiveItemIds(ids:readonly string[],participantId:string){
  const unique=[...new Set(ids)];
  const rng=mulberry32(hashString(participantId+'|PUBLIC_ADAPTIVE_ORDER_V1|'+unique.slice().sort().join(',')));
  const source=unique.map(itemById);
  for(let attempt=0;attempt<200;attempt++){
    const remaining=shuffled(source,rng);
    const order:PilotItem[]=[];
    while(remaining.length){
      const prev=order[order.length-1];
      const candidates=remaining
        .map((item,index)=>({item,index,tie:rng()}))
        .filter(x=>!prev||factorGroup(prev.factor)!==factorGroup(x.item.factor))
        .sort((a,b)=>a.tie-b.tie);
      if(!candidates.length)break;
      const pick=candidates[0];
      order.push(pick.item);
      remaining.splice(pick.index,1);
    }
    if(order.length===source.length)return order.map(x=>x.item_id);
  }
  // A pathological one-group batch cannot be separated; preserve all IDs.
  return shuffled(unique,rng);
}

export function publicPhaseLabel(coreAnswered:number){
  if(coreAnswered<10)return 'QUEST 1 / MONEY MAP';
  if(coreAnswered<20)return 'QUEST 2 / CHOICE MAP';
  if(coreAnswered<30)return 'QUEST 3 / TYPE MAP';
  return 'FINAL / TYPE ANALYSIS';
}

/**
 * The denominator never grows on screen. CORE occupies 0-84%; adaptive and
 * separator refinement use the remaining pre-result space; result is 100%.
 */
export function publicProgress(coreAnswered:number,adaptiveAnswered:number,separatorAnswered:number,complete:boolean){
  if(complete)return 100;
  const core=Math.max(0,Math.min(30,coreAnswered));
  if(core<30)return Math.min(84,Math.round((core/30)*84));
  const adaptive=Math.min(10,Math.max(0,adaptiveAnswered)*2);
  let progress=84+adaptive;
  if(separatorAnswered>0)progress=Math.max(progress,94+Math.min(4,separatorAnswered));
  return Math.min(98,progress);
}

export const JOB_NUMBER:Record<JobCode,number>={
  FDM:1,FDP:2,FNM:3,FNP:4,IDM:5,IDP:6,INM:7,INP:8,
};

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

export const STYLE_META:Record<StyleId,{label:string;icon:string;copy:string}>={
  DRIVE:{label:'DRIVE',icon:'⚔',copy:'前進したり、できることが増える使い方に価値を感じやすい。'},
  ENJOY:{label:'ENJOY',icon:'✦',copy:'楽しさや体験、気分が上がる使い方に価値を感じやすい。'},
  SECURE:{label:'SECURE',icon:'🛡',copy:'安心できる余裕や、見通しを持てる使い方に価値を感じやすい。'},
  OPTIMIZE:{label:'OPTIMIZE',icon:'⚙',copy:'必要なものに絞り、ムダを減らせる使い方に価値を感じやすい。'},
};

export const FACTOR_PUBLIC_LABEL:Record<MainFactorId,string>={
  FUTURE:'未来を考える',
  IMMEDIATE:'今を活かす',
  INTUITION:'感覚を信じる',
  DELIBERATION:'比較して考える',
  MONITORING:'普段から把握',
  PERIODIC:'節目で確認',
};

export function displayScore(score:number|null){
  if(score==null)return 0;
  return Math.max(0,Math.min(100,Math.round(score/5)*5));
}

export function newPublicSessionId(){
  if(typeof crypto!=='undefined'&&'randomUUID' in crypto)return 'mpp_'+crypto.randomUUID();
  return 'mpp_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
}

export function getOrCreatePublicParticipantId(storage:Pick<Storage,'getItem'|'setItem'>=localStorage){
  const key='mudagiri_money_type_public_participant_v1';
  const existing=storage.getItem(key);
  if(existing)return existing;
  const id=typeof crypto!=='undefined'&&'randomUUID' in crypto
    ?'mpp_user_'+crypto.randomUUID()
    :'mpp_user_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
  storage.setItem(key,id);
  return id;
}
