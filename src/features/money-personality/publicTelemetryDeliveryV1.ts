/**
 * Transport acknowledgement is unavailable for Apps Script no-cors requests.
 * A fulfilled fetch means "attempted without a network error", never "saved".
 * Server upsert by session_id makes bounded retries safe after intermittent drops.
 * No PII, money or answers are stored in this retry record.
 */
export const PUBLIC_MONEY_DELIVERY_KEY='mudagiri_money_type_submission_health_v1';
export const MAX_PUBLIC_ATTEMPTS=4;
export type DeliveryState='UNCONFIGURED'|'IN_FLIGHT'|'OPAQUE_UNVERIFIED'|'NETWORK_ERROR';
export type DeliveryRecord={
  sessionId:string;
  attempts:number;
  state:DeliveryState;
  lastAttemptMs:number;
};
type Store=Pick<Storage,'getItem'|'setItem'>;
const retryDelay=(x:DeliveryRecord)=>{
  if(x.state==='OPAQUE_UNVERIFIED')return 24*60*60*1000;
  if(x.state==='NETWORK_ERROR')return 5*60*1000;
  if(x.state==='IN_FLIGHT')return 60*1000;
  return 0;
};
export function readPublicDeliveryRecord(store:Store,sessionId:string):DeliveryRecord|null{
  try{
    const x=JSON.parse(store.getItem(PUBLIC_MONEY_DELIVERY_KEY)||'null') as DeliveryRecord|null;
    if(!x||x.sessionId!==sessionId||!Number.isInteger(x.attempts)||
      x.attempts<0||x.attempts>MAX_PUBLIC_ATTEMPTS||
      !Number.isFinite(x.lastAttemptMs))return null;
    return x;
  }catch{return null;}
}
function writeRecord(store:Store,record:DeliveryRecord){
  try{store.setItem(PUBLIC_MONEY_DELIVERY_KEY,JSON.stringify(record))}catch{
    // Private mode may forbid storage; never disrupt assessment UX.
  }
}
export function publicDeliveryEligible(record:DeliveryRecord|null,now:number):boolean{
  if(!record)return true;
  if(record.attempts>=MAX_PUBLIC_ATTEMPTS)return false;
  return now-record.lastAttemptMs>=retryDelay(record);
}
export async function attemptPublicMoneyDelivery(args:{
  sessionId:string;payload:unknown;url:string|undefined;store:Store;
  now?:number;fetcher?:(input:string,init:RequestInit)=>Promise<unknown>;
}):Promise<DeliveryState>{
  const {sessionId,payload,url,store}=args;
  const now=args.now??Date.now();
  const previous=readPublicDeliveryRecord(store,sessionId);
  if(!url||!/^https:\/\//.test(url)){
    if(!previous||previous.attempts===0)
      writeRecord(store,{sessionId,attempts:0,state:'UNCONFIGURED',lastAttemptMs:now});
    return 'UNCONFIGURED';
  }
  if(!publicDeliveryEligible(previous,now))return previous?.state||'IN_FLIGHT';
  const attempts=(previous?.attempts??0)+1;
  writeRecord(store,{sessionId,attempts,state:'IN_FLIGHT',lastAttemptMs:now});
  try{
    await (args.fetcher??fetch)(url,{
      method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload),keepalive:true,mode:'no-cors',
    });
    // A no-cors Response is opaque. It is NOT an authoritative GAS receipt.
    const next={sessionId,attempts,state:'OPAQUE_UNVERIFIED' as const,lastAttemptMs:now};
    writeRecord(store,next);
    return next.state;
  }catch{
    const next={sessionId,attempts,state:'NETWORK_ERROR' as const,lastAttemptMs:now};
    writeRecord(store,next);
    return next.state;
  }
}

/** Re-renders and transport retries must not invent new completion timestamps. */
export function stablePublicMoneyCompletedAt(previous:unknown,sessionId:string,fallback:string):string{
  if(!previous||typeof previous!=='object')return fallback;
  const p=previous as {sessionId?:unknown;completedAt?:unknown};
  if(p.sessionId!==sessionId||typeof p.completedAt!=='string'||!Number.isFinite(Date.parse(p.completedAt)))return fallback;
  return p.completedAt;
}
/** Strip unneeded URL query parameters/tokens before sending analytics. */
export function sanitizedPublicMoneySourceUrl(href:string):string{
  try{
    const url=new URL(href);
    const label=url.searchParams.get('utm_source')||url.searchParams.get('source')||'';
    url.search='';url.hash='';
    if(label){
      const clean=label.trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,30);
      if(clean)url.searchParams.set('utm_source',clean);
    }
    return url.toString();
  }catch{return '';}
}
