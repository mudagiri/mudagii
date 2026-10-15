import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {LocalPersistenceV3} from './persistence-v3';
import {lineLeadIdV1} from './line-lead-id-v1';

/**
 * Synthetic, offline tests. No actual GAS deployment, LINE request, Google
 * Sheet, or real user data. Distinguish a LINE redirect ATTEMPT from an
 * acknowledgement, message sent, friend-add, booking or signed contract.
 */
const gas=readFileSync('./MUDAGIRI_GAS_CODE_V4.gs','utf8');
const mockLeadSheet:{rows:unknown[][];appendRow:(row:unknown[])=>void}={
 rows:[],
 appendRow(row){this.rows.push(row)}
};
const patches:{diagnosisId:string;patch:Record<string,unknown>}[]=[];
const fakeSs={getSheetByName(_name:string){return mockLeadSheet}};
const ctx:any={SpreadsheetApp:{getActive:()=>fakeSs},Date,JSON,Math,Object,Number,String};
const api:any=runInNewContext(gas+'\n({lineHandoffRecoveryPatchV1_,CONV_HEADERS,EVENT_HEADERS,saveLead_,findCompositeRows_})',ctx,{timeout:4000});
const native=(value:any)=>JSON.parse(JSON.stringify(value));
const row=(headers:string[],patch:Record<string,unknown>)=>headers.map(x=>patch[x]??'');
const convo=(diagnosisId:string,handoffCode:string,topic:string,createdAt:string,goal?:string)=>row(native(api.CONV_HEADERS),{
 conversion_id:'lead_'+handoffCode,anonymous_user_id:'anon_synthetic_1',
 diagnosis_id:diagnosisId,created_at:createdAt,stage:'line_handoff',
 data_json:JSON.stringify({diagnosisId,handoffCode,consultSelectedTopic:topic,...(goal?{goal}:{})})
});
const event=(diagnosisId:string,name:string)=>row(native(api.EVENT_HEADERS),{
 event_id:'synthetic_'+name,diagnosis_id:diagnosisId,name
});
const plan=(id:string,leads:unknown[][],events:unknown[][])=>native(api.lineHandoffRecoveryPatchV1_(id,leads,events));

const diagnosisId='synthetic_123';
const first=convo(diagnosisId,'MG-LIFE','lifeplan','2026-10-15T09:20:00+09:00','住まい');
const later=convo(diagnosisId,'MG-INS','insurance','2026-10-15T09:25:00+09:00');
const beforeDiagnosis=plan(diagnosisId,[first,later],[event(diagnosisId,'line_clicked')]);
assert.deepEqual(beforeDiagnosis,{
 'LINE遷移（コード発行）':'TRUE',
 '引継ぎコード':'MG-INS',
 '相談テーマ':'insurance',
 'LINEクリック':'TRUE'
},'out-of-order records are recovered without inventing a booking or erasing goal');
assert.ok(!Object.hasOwn(beforeDiagnosis,'未来目的'),
 'newest coverage intent without goal must not overwrite the prior goal');
assert.ok(!Object.hasOwn(beforeDiagnosis,'相談希望'));
assert.ok(!Object.hasOwn(beforeDiagnosis,'面談予約'));
const reversed=plan(diagnosisId,[later,first],[event('other_id','line_clicked')]);
assert.equal(reversed['引継ぎコード'],'MG-INS','latest by creation time, not array order');
assert.equal(reversed['LINEクリック'],undefined,'unrelated events never cross-link users');
const onlyFirst=plan(diagnosisId,[first],[]);
assert.equal(onlyFirst['未来目的'],'住まい','an explicitly selected future goal survives');
assert.equal(plan('other_id',[first,later],[event(diagnosisId,'line_clicked')])['LINE遷移（コード発行）'],undefined,'no cross-diagnosis leakage');
assert.deepEqual(plan('',[first],[]),{});
const invalidData=convo(diagnosisId,'MG-BAD','insurance','2026-10-15T10:00:00+09:00');
invalidData[native(api.CONV_HEADERS).indexOf('data_json')]='{';
assert.equal(plan(diagnosisId,[first,invalidData],[])['引継ぎコード'],'MG-LIFE','malformed raw JSON skipped');
assert.equal(plan(diagnosisId,[first,first],[])['引継ぎコード'],'MG-LIFE','replay idempotent');

assert.ok(gas.includes('  reconcileLineHandoffAfterDiagnosis_(id);'),
 'recovery must be called after the diagnosis summary is upserted');
assert.ok(gas.indexOf('  upsertStore_(summary);')<gas.indexOf('  reconcileLineHandoffAfterDiagnosis_(id);'),
 'never patch a store row before it exists');

// Exercise the actual GAS saveLead_ function with in-memory mocks.
ctx.find_=(sheet:any,col:number,id:string)=>{const pos=sheet.rows.findIndex((r:unknown[])=>String(r[col-1])===String(id));return pos<0?-1:pos+2};
ctx.patchStore_=(id:string,p:Record<string,unknown>)=>patches.push({diagnosisId:id,patch:native(p)});
const lifeLead={
 diagnosisId,anonymousUserId:'anon_synthetic_1',leadId:lineLeadIdV1(diagnosisId,'MG-LIFE','consult_route'),
 handoffCode:'MG-LIFE',consultSelectedTopic:'lifeplan',goal:'住まい',createdAt:'2026-10-15T09:20:00+09:00'
};
const coverLead={...lifeLead,leadId:lineLeadIdV1(diagnosisId,'MG-INS','coverage_review'),handoffCode:'MG-INS',consultSelectedTopic:'insurance',goal:null,createdAt:'2026-10-15T09:25:00+09:00'};
ctx.saveLead_=api.saveLead_;
ctx.saveLead_(lifeLead);
ctx.saveLead_(coverLead);
ctx.saveLead_(coverLead);
assert.equal(mockLeadSheet.rows.length,2,'GAS dedupes by lead ID but keeps two consultation topics');
assert.equal(patches.length,3,'local store patch attempts after each handoff');
assert.equal(patches[0].patch['未来目的'],'住まい');
assert.ok(!Object.hasOwn(patches[1].patch,'未来目的'),'insurance CTA cannot clear the goal');
assert.ok(!Object.hasOwn(patches[1].patch,'相談希望'),'outbound lead is NOT consultation requested');

// Exercise local fallback under the same two-code/one-diagnosis scenario.
const state=new Map<string,string>();
const memory={getItem:(k:string)=>state.get(k)??null,setItem:(k:string,v:string)=>{state.set(k,v)}};
const local=new LocalPersistenceV3(memory as Pick<Storage,'getItem'|'setItem'>);
await local.saveLead(lifeLead);
await local.saveLead(coverLead);
await local.saveLead({...coverLead,stage:'anonymous'});
const saved=JSON.parse(state.get('mudagiri_leads_v3')??'[]');
assert.equal(saved.length,2,'local fallback preserves distinct insurance and life-plan intents');
assert.equal(new Set(saved.map((x:any)=>x.leadId)).size,2);
console.log('LINE_GAS_OUT_OF_ORDER_QA_PASS',JSON.stringify({
 hypothetical:'lead/event before diagnosis save',
 offlineOnly:true,
 separateLeadIds:2,
 newestHandoff:'insurance',
 confirmedOutboundDelivery:false,
 friendAddVerified:false,
 consultRequestedVerified:false,
 actualGasOrLineAccess:false
}));
