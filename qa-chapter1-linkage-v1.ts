import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chapter1LinkageV1,validatedChapter1LinkageV1} from './chapter1-linkage-v1';
import type {Chapter1HandoffV1} from './chapter2-v2-contract';

const handoff:Chapter1HandoffV1={
 version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',
 anonymousUserId:'anon_same_user',
 sessionId:'c1_session_001',
 completedAt:'2026-10-14T10:00:00.000Z',
 jobCode:'FDM',jobName:'先回り司令官',primaryStyle:'DRIVE'
};
const link=chapter1LinkageV1(handoff,'anon_same_user');
assert.deepEqual(link,{
 schemaVersion:'MUDAGIRI_CHAPTER1_LINKAGE_V1',
 chapter1SessionId:'c1_session_001',
 chapter1JobCode:'FDM',
 chapter1JobName:'先回り司令官',
 chapter1StyleCode:'DRIVE',
 chapter1CompletedAt:'2026-10-14T10:00:00.000Z'
});
assert.equal(chapter1LinkageV1(handoff,'anon_another_user'),null,'cross-user Chapter 1 data prohibited');
assert.equal(chapter1LinkageV1(null,'anon_same_user'),null,'Chapter 2 standalone must stay standalone');
assert.equal(chapter1LinkageV1({...handoff,jobCode:'FAKE'},'anon_same_user'),null,'unknown JOB is not persisted');
assert.equal(chapter1LinkageV1({...handoff,primaryStyle:'FAKE'},'anon_same_user'),null,'unknown STYLE is not persisted');
assert.equal(validatedChapter1LinkageV1(link)?.chapter1SessionId,'c1_session_001','snapshot survives round-trip');
assert.equal(validatedChapter1LinkageV1({...link,chapter1JobCode:'INVALID'}),null,'corrupt restored data rejected');
assert.equal(validatedChapter1LinkageV1({...link,monthlyTakeHome:999999})?.chapter1SessionId,'c1_session_001','valid data can be restored');
assert.equal(Object.keys(validatedChapter1LinkageV1({...link,monthlyTakeHome:999999})??{}).includes('monthlyTakeHome'),false,'linkage strips financial data');
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const gas=fs.readFileSync('./MUDAGIRI_GAS_CODE_V4.gs','utf8');
assert.match(app,/scopeV4:v\.scopeV4\?\?null,persistenceV4,chapter1Link,/,'save diagnosis snapshot');
assert.match(app,/result:\{[\s\S]*?chapter1Link,counts:vm\.counts/,'save linked data in diagnosis result');
assert.match(app,/completed:\{\.\.\.v,toneMode,chapter1Link\}/,'persist linkage for resume');
assert.match(app,/setResult\(\{\.\.\.vm,chapter1Link\}\)/,'retain linked data in active result');
assert.match(app,/source:'result_line_cta',toneMode,chapter1Link:validatedChapter1LinkageV1\(result\.chapter1Link\)/,'save linkage in LINE lead');
assert.match(app,/externalLineContext\(ctx,payload\)/,'external coverage context remains sanitized');
assert.ok(gas.includes('raw_json:json_(b)'),'GAS raw diagnosis preserves additive lineage without altering frozen columns');
assert.ok(gas.includes('data_json:json_(b)'),'GAS lead raw JSON preserves linked fields');
console.log('CHAPTER1_LINKAGE_QA_PASS');
