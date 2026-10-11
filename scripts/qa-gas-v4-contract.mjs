/**
 * No user data, no Google Sheets, no production network:
 * Executes the published V4 Apps Script in a sandbox with dummy adapters.
 * This validates its GET response and POST routing contract before anyone
 * pastes the source into the production Apps Script editor.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const gas=readFileSync('MUDAGIRI_GAS_CODE_V4.gs','utf8');
const v2=readFileSync('MUDAGIRI_GAS_CODE_V2.gs','utf8');
const contentService={
 MimeType:{JSON:'application/json'},
 createTextOutput(value){
  return {body:String(value),setMimeType(type){assert.equal(type,'application/json');return this;},getContent(){return this.body}};
 }
};
let locked=0,released=0,routes=[];
const ctx={
 ContentService:contentService,
 LockService:{getScriptLock:()=>({waitLock(ms){assert.equal(ms,10000);locked++},releaseLock(){released++}})},
 console
};
vm.createContext(ctx);
vm.runInContext(gas,ctx,{filename:'MUDAGIRI_GAS_CODE_V4.gs',timeout:2500});
const response=JSON.parse(ctx.doGet().getContent());
assert.equal(response.ok,true);
assert.equal(response.schema_version,'MUDAGIRI_DATA_ASSET_V1');
assert.equal(response.gas_version,'MUDAGIRI_GAS_V4_0');
assert.ok(!Object.prototype.hasOwnProperty.call(response,'version'),'V2-only health format would not validate');

ctx.ensureRuntime_=()=>{}; // Only the external SpreadsheetApp dependency is faked.
for(const kind of ['diagnosis_v3','event_v3','lead_v3','conversion_v1']){
 const impl={diagnosis_v3:'saveDiagnosis_',event_v3:'saveEvent_',lead_v3:'saveLead_',conversion_v1:'saveConversion_'}[kind];
 ctx[impl]=body=>{assert.equal(body.kind,kind);routes.push(kind)};
 const reply=JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({kind,diagnosisId:'synthetic_contract_only'})}}).getContent());
 assert.equal(reply.ok,true,kind);
}
const unknown=JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({kind:'unknown_kind'})}}).getContent());
assert.equal(unknown.ok,false);
assert.equal(routes.length,4);
assert.equal(locked,5);
assert.equal(released,5,'Apps Script lock must always release');
assert.match(v2,/version:CFG\.VERSION/,'Older V2-style health is the observed release blocker');
console.log('MUDAGIRI_GAS_V4_CONTRACT_QA_PASS',JSON.stringify({
 schema:response.schema_version,version:response.gas_version,
 routes,unknownKindRejected:true,locksReleased:released,
 productionNetworkUsed:false,productionDataWritten:false
}));
