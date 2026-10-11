/**
 * Read-only release health probe. No production writes, no PII, no endpoint
 * logging. A passing GET still does not prove receipt of diagnostic POSTs.
 */
const endpoints=[
 {id:'household',raw:process.env.MUDAGIRI_HOUSEHOLD_GAS_URL,
  keys:{ok:true,schema_version:'MUDAGIRI_DATA_ASSET_V1',gas_version:'MUDAGIRI_GAS_V4_0'}},
 {id:'personality',raw:process.env.MUDAGIRI_PERSONALITY_GAS_URL,
  keys:{ok:true,backend:'money_personality',gas_version:'MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0',household_backend_separated:true}},
];
let blocked=false;
for(const target of endpoints){
 const log={backend:target.id,configured:Boolean(target.raw),healthy:false,reason:null};
 try{
  if(!target.raw)throw Error('ENDPOINT_NOT_CONFIGURED');
  const url=new URL(target.raw);
  if(url.protocol!=='https:'||url.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname))
   throw Error('UNEXPECTED_ENDPOINT_SHAPE');
  const reply=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(16000)});
  if(!reply.ok)throw Error('HTTP_NOT_OK');
  const body=await reply.json();
  if(Object.entries(target.keys).some(([key,value])=>body[key]!==value)){
   // Expose only fixed, bounded protocol labels (no URL, row data or IDs).
   const version=v=>typeof v==='string'&&/^[a-zA-Z0-9_]{1,80}$/.test(v)?v:'MISSING_OR_UNEXPECTED';
   log.observedProtocol={
    gasVersion:version(body.gas_version),
    schemaVersion:version(body.schema_version),
    backend:version(body.backend),
    separated:body.household_backend_separated===true
   };
   throw Error('BACKEND_VERSION_OR_SEPARATION_MISMATCH');
  }
  log.healthy=true;
 }catch(e){
  const safe=['ENDPOINT_NOT_CONFIGURED','UNEXPECTED_ENDPOINT_SHAPE','HTTP_NOT_OK','BACKEND_VERSION_OR_SEPARATION_MISMATCH'];
  log.reason=safe.includes(e?.message)?e.message:'NETWORK_OR_AUTHENTICATION_ERROR';
  blocked=true;
 }
 console.log(JSON.stringify(log));
}
console.log(JSON.stringify({suite:'MUDAGIRI_LAUNCH_RC_GAS_HEALTH_ONLY',status:blocked?'BLOCKED':'HEALTH_PASS',
  note:'GET success is not POST receipt or confirmation of Sheet writes'}));
if(blocked)process.exitCode=2;
