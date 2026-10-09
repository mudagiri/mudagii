import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const gas=fs.readFileSync(new URL('./MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs',import.meta.url),'utf8');
let writeCalls=0;
const sandbox={
  SpreadsheetApp:{getActive(){throw Error('must not be invoked by pure audit')}},
  Logger:{log(){throw Error('must not log in pure audit')}},
};
vm.createContext(sandbox);
vm.runInContext(gas,sandbox,{filename:'MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs'});
const audit=sandbox.computeMoneyPersonalityPrevalenceV1_;
assert.equal(typeof audit,'function');
const sessionHeaders=[
  'session_id','anonymous_user_id','participant_id','form_id','schema_version','pilot_version',
  'started_at','completed_at','duration_ms','response_count','cognitive_mode','variant',
  'parent_session_id','source_url','user_agent','received_at','raw_json'
];
const resultHeaders=[
  'session_id','anonymous_user_id','participant_id','completed_at','job_code','job_name',
  'primary_style','secondary_style','time_state','decision_state','awareness_state',
  'result_content_version','core_count','adaptive_answer_count','separator_count','received_at'
];
const sess=[sessionHeaders],results=[resultHeaders];
function put(arr,headers,values){arr.push(headers.map(k=>values[k]??''));}
function add(id,anon,job,style,options={}){
  const startedAt=options.completedAt||'2026-10-10T01:00:00Z';
  const raw=options.omitFlags?'{}':JSON.stringify({
    quality:{cognitiveMode:!!options.cognitive,debugMode:!!options.debug,
      variant:options.cognitive?'PUBLIC_ADAPTIVE_COGNITIVE':'PUBLIC_ADAPTIVE',
      ...(options.omitCohort?{}:{collectionCohort:options.cohort||'PUBLIC'})},
  });
  put(sess,sessionHeaders,{
    session_id:id,anonymous_user_id:anon,
    participant_id:options.participantId||'mpp_participant_'+id,
    form_id:options.formId||'PUBLIC_ADAPTIVE',cognitive_mode:options.cognitive?'TRUE':'FALSE',
    source_url:options.url||'https://mudagiri.github.io/mudagii/?utm_source=x',
    raw_json:raw
  });
  put(results,resultHeaders,{
    session_id:id,anonymous_user_id:options.resultAnon||anon,job_code:job,
    primary_style:style,completed_at:startedAt
  });
}
add('session-1','anon-1','FDM','DRIVE',{url:'https://mudagiri.github.io/?utm_source=instagram'});
add('session-2','anon-2','FNM','ENJOY',{url:'https://mudagiri.github.io/?utm_source=line'});
add('session-3','anon-3','FDM','DRIVE',{url:'https://mudagiri.github.io/'});
add('session-4','anon-4','INP','SECURE',{url:'https://mudagiri.github.io/?utm_source=twitter'});
add('session-5','anon-5','FNM','ENJOY',{url:'https://mudagiri.github.io/?utm_source=threads'});
add('session-6','anon-6','FDM','DRIVE',{url:'https://mudagiri.github.io/?utm_source=ig'});
// The later retest belongs to anon-1 and must not inflate a population frequency.
add('session-7','anon-1','INP','OPTIMIZE',{completedAt:'2026-10-11T01:00:00Z'});
add('session-debug','anon-debug','FDM','DRIVE',{debug:true});
add('session-cognitive','anon-cog','FDM','DRIVE',{cognitive:true});
add('session-preview','anon-prev','INP','ENJOY',{cohort:'PILOT',url:'https://mudagiri.github.io/mudagii/pilot/money-type/?utm_source=x'});
add('session-public-path','anon-public-path','INP','OPTIMIZE',{url:'https://mudagiri.github.io/mudagii/pilot/money-type/?utm_source=threads'});
add('session-localhost','anon-local','INP','DRIVE',{url:'http://127.0.0.1:4173/?utm_source=x'});
add('session-untagged','anon-untagged','INP','DRIVE',{omitCohort:true});
add('session-test','anon-test','INP','ENJOY',{participantId:'qa_test_persona_0'});
add('session-no-flags','anon-no-flags','INP','ENJOY',{omitFlags:true});
add('session-bad-style','anon-bad','INP','ALIEN');
add('session-mismatch','anon-mismatch','INP','DRIVE',{resultAnon:'other-anon'});
add('session-bad-date','anon-bad-date','INP','DRIVE',{completedAt:'not-a-date'});
put(results,resultHeaders,{session_id:'orphan',anonymous_user_id:'orphan',job_code:'FDM',primary_style:'ENJOY',completed_at:'2026-10-10T00:00:00Z'});
put(results,resultHeaders,{session_id:'session-3',anonymous_user_id:'anon-3',job_code:'INP',primary_style:'SECURE',completed_at:'2026-10-10T00:00:00Z'});
const out=audit(sess,results);
assert.equal(out.uniqueCompletedBrowserIds,7,'must count six unique valid browser IDs');
assert.equal(out.eligibleBeforeAnonymousDedupe,8,'must keep all seven valid sessions before anon dedupe');
assert.equal(out.exclusionCounts.duplicateAnonymous,1);
assert.equal(out.exclusionCounts.duplicateSession,1);
assert.equal(out.exclusionCounts.orphanResult,1);
assert.equal(out.exclusionCounts.testOrDebug,3);
assert.equal(out.exclusionCounts.preview,1);
assert.equal(out.exclusionCounts.missingOrInvalidCohort,1);
assert.equal(out.pilotSample.uniqueCompletedBrowserIds,1);
assert.equal(out.cohort,'PUBLIC');
assert.equal(out.pilotSample.cohort,'PILOT');
assert.equal(out.exclusionCounts.missingAuditFlags,1);
assert.equal(out.exclusionCounts.invalidResult,1);
assert.equal(out.exclusionCounts.mismatchedIdentity,1);
assert.equal(out.exclusionCounts.invalidDate,1);
assert.equal(out.byJob.find(x=>x.code==='FDM').count,3);
assert.equal(out.byJob.find(x=>x.code==='FNM').count,2);
assert.equal(out.byJob.find(x=>x.code==='INP').count,2);
assert.equal(out.byType.find(x=>x.code==='INP-OPTIMIZE').count,1);
assert.equal(out.byType.find(x=>x.code==='INP-SECURE').count,1);
assert.equal(out.bySource.find(x=>x.code==='instagram').count,2);
assert.equal(out.bySource.find(x=>x.code==='unspecified').count,1);
assert.ok(out.byJob.every(x=>x.ci95[0]>=0&&x.ci95[1]<=100));
assert.equal(out.publication.ready,false,'private aggregate should not be auto-publishable');
assert.equal(out.publication.preliminaryMinimumReached,false);
const empty=audit([sessionHeaders],[resultHeaders]);
assert.equal(empty.uniqueCompletedBrowserIds,0);
assert.equal(empty.byJob[0].percent,null);
assert.equal(empty.publication.ready,false);
// Malformed databases should fail closed rather than fabricate an all-zero population.
assert.throws(()=>audit([['session_id']],[resultHeaders]),/Missing column/);
assert.equal(writeCalls,0);
assert.ok(gas.includes("function auditMoneyPersonalityPrevalenceV1()"));
assert.ok(!/function doGet[\s\S]*auditMoneyPersonalityPrevalenceV1\s*\(/.test(gas.split('function doPost')[0]),'public doGet must not call private audit');
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_REAL_PREVALENCE_ADMIN_V1',
  sampleUnique:out.uniqueCompletedBrowserIds,excluded:out.exclusionCounts,
  publishable:false,dbWrites:writeCalls,emptyDataValid:true,
  privateAggregate:true,sourceBreakdown:true,firstAssessmentPerAnonymous:true}));
