import assert from 'node:assert/strict';
import {
  PUBLIC_MONEY_DELIVERY_KEY,MAX_PUBLIC_ATTEMPTS,
  attemptPublicMoneyDelivery,readPublicDeliveryRecord,publicDeliveryEligible,
  stablePublicMoneyCompletedAt,sanitizedPublicMoneySourceUrl,stableMoneyCollectionCohort,
} from './src/features/money-personality/publicTelemetryDeliveryV1';

const map=new Map<string,string>();
const store={
  getItem(k:string){return map.get(k)??null;},
  setItem(k:string,v:string){map.set(k,v);},
};
const URL='https://script.google.com/macros/s/example/exec';
let tries=0;
const ok=async (_url:string,opts:RequestInit)=>{
  tries++;
  assert.equal(opts.method,'POST');
  assert.equal(opts.mode,'no-cors');
  assert.equal(opts.keepalive,true);
  assert.ok(String(opts.body).includes('"sessionId":"foo"'));
  return {type:'opaque'}; // transport success is NOT backend receipt
};
const args={sessionId:'foo',payload:{sessionId:'foo'},store,fetcher:ok};
const empty=await attemptPublicMoneyDelivery({...args,url:undefined,now:1000});
assert.equal(empty,'UNCONFIGURED');
assert.equal(tries,0,'missing endpoint must not send');
assert.equal(readPublicDeliveryRecord(store,'foo')?.attempts,0);
assert.equal(await attemptPublicMoneyDelivery({...args,url:URL,now:2000}),'OPAQUE_UNVERIFIED');
assert.equal(tries,1);
assert.equal(readPublicDeliveryRecord(store,'foo')?.attempts,1);
assert.equal(await attemptPublicMoneyDelivery({...args,url:URL,now:3000}),'OPAQUE_UNVERIFIED');
assert.equal(tries,1,'observer must not repost every second');
assert.equal(await attemptPublicMoneyDelivery({...args,url:URL,now:2000+24*60*60*1000}),'OPAQUE_UNVERIFIED');
assert.equal(tries,2);
assert.equal(readPublicDeliveryRecord(store,'foo')?.attempts,2);
assert.equal(readPublicDeliveryRecord(store,'bar'),null,'new session cannot inherit old lock');
for(let i=2;i<MAX_PUBLIC_ATTEMPTS;i++){
  const now=2000+i*24*60*60*1000;
  await attemptPublicMoneyDelivery({...args,url:URL,now});
}
assert.equal(tries,MAX_PUBLIC_ATTEMPTS);
const closed=readPublicDeliveryRecord(store,'foo')!;
assert.equal(closed.attempts,MAX_PUBLIC_ATTEMPTS);
assert.equal(publicDeliveryEligible(closed,Date.now()+365*24*60*60*1000),false);
await attemptPublicMoneyDelivery({...args,url:URL,now:Date.now()+365*24*60*60*1000});
assert.equal(tries,MAX_PUBLIC_ATTEMPTS,'bounded retry cap must hold');
let failures=0;
const err=async ()=>{failures++;throw Error('network dropped')};
const failure=await attemptPublicMoneyDelivery({
  sessionId:'bar',payload:{},url:URL,store,fetcher:err,now:10000,
});
assert.equal(failure,'NETWORK_ERROR');
await attemptPublicMoneyDelivery({sessionId:'bar',payload:{},url:URL,store,fetcher:err,now:10000+1000});
assert.equal(failures,1);
await attemptPublicMoneyDelivery({sessionId:'bar',payload:{},url:URL,store,fetcher:err,now:10000+5*60*1000});
assert.equal(failures,2);
assert.equal(readPublicDeliveryRecord(store,'bar')?.attempts,2);
assert.ok(JSON.stringify([...map]).includes(PUBLIC_MONEY_DELIVERY_KEY));
assert.ok(!JSON.stringify([...map]).includes('anonymousUserId'), 'health store must not contain person identifiers');
const firstCompletion='2026-10-09T02:14:23.000Z';
assert.equal(stablePublicMoneyCompletedAt({sessionId:'foo',completedAt:firstCompletion},'foo','2026-10-10T00:00:00Z'),firstCompletion);
assert.equal(stablePublicMoneyCompletedAt({sessionId:'bar',completedAt:firstCompletion},'foo','2026-10-10T00:00:00Z'),'2026-10-10T00:00:00Z');
assert.equal(sanitizedPublicMoneySourceUrl('https://mudagiri.github.io/mudagii/?utm_source=Instagram&access_token=privateSecret#share'), 'https://mudagiri.github.io/mudagii/?utm_source=instagram');
assert.equal(sanitizedPublicMoneySourceUrl('https://mudagiri.github.io/mudagii/pilot/money-type/?cognitive=1&debug=1'), 'https://mudagiri.github.io/mudagii/pilot/money-type/');
assert.equal(stableMoneyCollectionCohort(null,'session-1',undefined),'PILOT');
assert.equal(stableMoneyCollectionCohort(null,'session-1','PUBLIC'),'PUBLIC');
assert.equal(stableMoneyCollectionCohort({sessionId:'session-1',quality:{collectionCohort:'PILOT'}},'session-1','PUBLIC'),'PILOT');
assert.equal(stableMoneyCollectionCohort({sessionId:'session-1',quality:{collectionCohort:'PUBLIC'}},'session-1','PILOT'),'PUBLIC');
assert.equal(stableMoneyCollectionCohort({sessionId:'other',quality:{collectionCohort:'PUBLIC'}},'session-1',undefined),'PILOT');

const cognitiveKey='mudagiri_money_type_cognitive_delivery_v1';
let cognitiveTries=0;
const cognitiveFetcher=async (_url:string,_init:RequestInit)=>{
  cognitiveTries++;
  return {type:'opaque'};
};
const cog1=await attemptPublicMoneyDelivery({
  sessionId:'foo__cognitive',payload:{sessionId:'foo__cognitive'},
  url:URL,store,storageKey:cognitiveKey,fetcher:cognitiveFetcher,now:15000,
});
assert.equal(cog1,'OPAQUE_UNVERIFIED');
assert.equal(cognitiveTries,1);
assert.equal(readPublicDeliveryRecord(store,'foo__cognitive',cognitiveKey)?.attempts,1);
assert.equal(readPublicDeliveryRecord(store,'foo')?.attempts,MAX_PUBLIC_ATTEMPTS,
  'independent cognitive submission must not evict completed assessment health');
await attemptPublicMoneyDelivery({
  sessionId:'foo__cognitive',payload:{sessionId:'foo__cognitive'},
  url:URL,store,storageKey:cognitiveKey,fetcher:cognitiveFetcher,now:15001,
});
assert.equal(cognitiveTries,1,'observer and retry should not flood cognitive GAS');
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_PUBLIC_GAS_DELIVERY_V1',
  noEndpointDoesNotMarkSent:true,opaqueNeverClaimsConfirmed:true,
  retriesCapped:MAX_PUBLIC_ATTEMPTS,failedTransportRetryMinutes:5,
  storageContainsOnlySessionAttemptMetadata:true}));
