import {publicCore30ItemIds} from './classifierV1';
import {itemById,type BipolarPresentation,type PilotItem,type PoleId} from './pilotLogic';

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

function validCoreOrder(order:string[]){
  const items=order.map(itemById);
  for(let i=1;i<items.length;i++){
    if(items[i-1].factor===items[i].factor)return false;
  }
  if(new Set(items.slice(0,8).map(x=>x.factor)).size<6)return false;
  if(new Set(items.slice(-8).map(x=>x.factor)).size<6)return false;
  for(let i=0;i<items.length-2;i++){
    const trio=items.slice(i,i+3).map(x=>x.factor);
    if(new Set(trio).size<3)return false;
  }
  return true;
}

/**
 * Public CORE30 order is deterministic per participant so resume never changes
 * the question sequence. It deliberately mixes all ten factors and avoids
 * exposing factor blocks to respondents.
 */
export function buildPublicCoreOrder(participantId:string){
  const pool=[...publicCore30ItemIds()];
  const rng=mulberry32(hashString(participantId+'|PUBLIC_CORE30_V1'));
  for(let i=0;i<30000;i++){
    const order=shuffled(pool,rng);
    if(validCoreOrder(order))return order;
  }
  throw new Error('Unable to build valid PUBLIC_CORE30_V1 order');
}

export type PublicSideMap=Record<string,boolean>;

/**
 * Exactly half of the 24 bipolar CORE items show the measured trait on the
 * physical left side. This is stronger than independent randomization because
 * it removes session-level left/right imbalance by construction.
 */
export function buildCoreTraitLeftMap(participantId:string,coreOrder:string[]):PublicSideMap{
  const bipolarIds=coreOrder.filter(id=>itemById(id).family==='BIPOLAR');
  if(bipolarIds.length!==24)throw new Error('PUBLIC CORE expected 24 bipolar items');
  const rng=mulberry32(hashString(participantId+'|PUBLIC_CORE_SIDE_V1'));
  const randomized=shuffled(bipolarIds,rng);
  const traitLeft=new Set(randomized.slice(0,12));
  return Object.fromEntries(bipolarIds.map(id=>[id,traitLeft.has(id)]));
}

function oppositePole(p:PoleId):PoleId{return p==='A'?'B':'A';}

/**
 * CORE items use the balanced map. Adaptive reserve items use deterministic
 * per-item side randomization because their count is response-dependent.
 */
export function publicBipolarPresentation(
  item:PilotItem,
  participantId:string,
  coreTraitLeftMap?:PublicSideMap,
):BipolarPresentation{
  if(item.family!=='BIPOLAR')throw new Error('Not a bipolar item: '+item.item_id);
  const traitPole=item.trait_pole as PoleId;
  const mapped=coreTraitLeftMap?.[item.item_id];
  const traitOnLeft=mapped===undefined
    ?(hashString(participantId+'|'+item.item_id+'|PUBLIC_ADAPTIVE_SIDE_V1')&1)===1
    :mapped;
  const leftPoleId=traitOnLeft?traitPole:oppositePole(traitPole);
  const rightPoleId=oppositePole(leftPoleId);
  const leftText=leftPoleId==='A'?item.option_a:item.option_b;
  const rightText=rightPoleId==='A'?item.option_a:item.option_b;
  return {
    leftPoleId,rightPoleId,leftText,rightText,traitPole,
    isReversed:leftPoleId===traitPole,
  };
}

export function publicPhaseLabel(coreAnswered:number,hasAdaptive:boolean,hasSeparator:boolean){
  if(hasSeparator)return 'FINAL CHECK';
  if(hasAdaptive)return 'FINAL TUNE';
  if(coreAnswered<10)return 'QUEST 1 / 3';
  if(coreAnswered<20)return 'QUEST 2 / 3';
  return 'QUEST 3 / 3';
}

/**
 * Progress never exposes a denominator that can grow after adaptive branching.
 * CORE30 occupies 0-84%, adaptive refinement 84-96%, separators 97%, result 100%.
 */
export function publicProgressPercent(coreAnswered:number,adaptiveAnswered:number,hasSeparator:boolean,complete:boolean){
  if(complete)return 100;
  if(hasSeparator)return 97;
  if(coreAnswered<30)return Math.min(84,Math.round((coreAnswered/30)*84));
  return Math.min(96,84+Math.min(12,adaptiveAnswered*3));
}
