import assert from 'node:assert/strict';
import {
  buildCognitiveDebriefPayload,emptyCognitiveDebrief,isCognitiveDebriefComplete,toggleCognitiveFlag,
  MONEY_COGNITIVE_PILOT_VERSION,type CognitiveItemNote,
} from './src/features/money-personality/cognitivePilotV1';

const empty=emptyCognitiveDebrief();
assert.equal(isCognitiveDebriefComplete(empty,0),false);
const complete={...empty,jobFit:5,resultFit:4,questionClarity:5,lengthComfort:3,shareIntent:4,householdIntent:5};
assert.equal(isCognitiveDebriefComplete(complete,0),true);
assert.equal(isCognitiveDebriefComplete(complete,1),false);
const withSeparator={...complete,separatorNaturalness:4,screenshotTargets:['JOB','STRENGTH'] as const,bestFitText:'強みが自分っぽい',mismatchText:'',comment:'少し長い'};
assert.equal(isCognitiveDebriefComplete(withSeparator as any,1),true);
assert.deepEqual(toggleCognitiveFlag([], 'UNCLEAR'),['UNCLEAR']);
assert.deepEqual(toggleCognitiveFlag(['UNCLEAR'], 'UNCLEAR'),[]);
assert.deepEqual(new Set(toggleCognitiveFlag(['UNCLEAR'],'BOTH_FIT')),new Set(['UNCLEAR','BOTH_FIT']));

const notes:Record<string,CognitiveItemNote>={
  F05:{itemId:'F05',kind:'trait',flags:['UNCLEAR','BOTH_FIT'],visitCount:1,totalViewMs:4200,firstSeenAt:'2026-10-04T00:00:01.000Z',lastSeenAt:'2026-10-04T00:00:05.200Z'},
  N03:{itemId:'N03',kind:'trait',flags:[],visitCount:2,totalViewMs:6100,firstSeenAt:'2026-10-04T00:00:06.000Z',lastSeenAt:'2026-10-04T00:00:15.000Z'},
  SEP_TIME:{itemId:'SEP_TIME',kind:'separator',flags:['NEITHER_FIT'],visitCount:1,totalViewMs:3000,firstSeenAt:'2026-10-04T00:04:00.000Z',lastSeenAt:'2026-10-04T00:04:03.000Z'},
};
const payload=buildCognitiveDebriefPayload({
  parentSessionId:'mpp_test',anonymousUserId:'au_test',participantId:'mpp_user_test',startedAt:'2026-10-04T00:00:00.000Z',completedAt:'2026-10-04T00:05:00.000Z',
  itemNotes:notes,debrief:withSeparator as any,jobCode:'FNM',jobName:'兆しの占星術師',primaryStyle:'DRIVE',secondaryStyle:'OPTIMIZE',separatorCount:1,
  resultContentVersion:'MUDAGIRI_MONEY_RESULT_CONTENT_V1_PILOT',userAgent:'qa',sourceUrl:'https://example.test/?adaptive=money-type&cognitive=1',
});
assert.equal(payload.kind,'money_personality_pilot_v1');
assert.equal(payload.schemaVersion,MONEY_COGNITIVE_PILOT_VERSION);
assert.equal(payload.formId,'PUBLIC_COGNITIVE_DEBRIEF');
assert.equal(payload.sessionId,'mpp_test__cognitive');
assert.equal(payload.anonymousUserId,'au_test');
assert.equal(payload.quality.parentSessionId,'mpp_test');
assert.equal(payload.quality.cognitiveMode,true);
assert.equal(payload.quality.flaggedItemCount,2);
assert.equal(payload.quality.flagCounts.UNCLEAR,1);
assert.equal(payload.quality.flagCounts.BOTH_FIT,1);
assert.equal(payload.quality.flagCounts.NEITHER_FIT,1);
assert.equal(payload.quality.flagCounts.REPETITIVE,0);
assert.ok(payload.item_responses.some(x=>x.item_id==='JOB_FIT'&&x.final_response===5));
assert.ok(payload.item_responses.some(x=>x.item_id==='F05'));
assert.ok(payload.responseCount>=14);
const serialized=JSON.stringify(payload);
for(const forbidden of ['monthly_take_home','confirmed_saving','annual_income','bank_account','credit_card'])assert.ok(!serialized.includes(forbidden),`privacy leak: ${forbidden}`);
assert.throws(()=>buildCognitiveDebriefPayload({...({} as any),parentSessionId:'',anonymousUserId:'au',participantId:'x',debrief:withSeparator}),/parentSessionId required/);
assert.throws(()=>buildCognitiveDebriefPayload({...({} as any),parentSessionId:'mpp',anonymousUserId:'',participantId:'x',debrief:withSeparator}),/anonymousUserId required/);

console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_MONEY_COGNITIVE_PILOT_V1',version:MONEY_COGNITIVE_PILOT_VERSION,notes:Object.keys(notes).length,flagged:payload.quality.flaggedItemCount,separatorRequired:true,privacyGuard:true,sharedAnonymousJoin:true}));
