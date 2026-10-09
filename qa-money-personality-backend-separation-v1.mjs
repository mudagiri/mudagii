import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const telemetry=read('./src/features/money-personality/MoneyPersonalityTelemetry.tsx');
const cognitive=read('./src/features/money-personality/MoneyPersonalityCognitivePilot.tsx');
const legacy=read('./src/features/money-personality/MoneyPersonalityPilot.tsx');
const cognitiveLogic=read('./src/features/money-personality/cognitivePilotV1.ts');
const householdGas=read('./MUDAGIRI_GAS_CODE_V4.gs');
const personalityGas=read('./MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs');

for(const [name,src] of [['telemetry',telemetry],['cognitive',cognitive],['legacy',legacy]]){
  assert.ok(src.includes('VITE_MONEY_PERSONALITY_GAS_URL'),`${name}: dedicated GAS env missing`);
  assert.ok(!src.includes('VITE_MUDAGIRI_GAS_URL'),`${name}: household GAS env must not be used`);
  assert.ok(src.includes('getOrCreateAnonymousUserId'),`${name}: shared anonymous join key missing`);
}
assert.ok(cognitiveLogic.includes('anonymousUserId:string'),'cognitive payload input must carry anonymousUserId');
assert.ok(cognitiveLogic.includes('anonymousUserId:input.anonymousUserId'),'cognitive payload must serialize anonymousUserId');

assert.ok(!householdGas.includes('money_personality_pilot_v1'),'household GAS must not accept Money Personality payloads');
assert.ok(legacy.includes('getOrCreateAnonymousUserId'),'legacy research flow must join with dedicated anonymous ID');
assert.ok(personalityGas.includes("'ALL_54'"),'dedicated GAS must accept explicitly hidden legacy research form');
assert.ok(!householdGas.includes('_性格Pilot_raw'),'household GAS must not create Money Personality storage');

for(const marker of [
  'MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0',
  "SESSIONS:'①セッション'",
  "RESPONSES:'②回答'",
  "FLAGS:'③Cognitiveフラグ'",
  "RESULTS:'④結果'",
  "DEBRIEF:'⑤Debrief'",
  "body.kind!=='money_personality_pilot_v1'",
  "household data not allowed",
  "join_key",
  "anonymous_user_id",
]) assert.ok(personalityGas.includes(marker),`dedicated GAS marker missing: ${marker}`);

console.log(JSON.stringify({
  ok:true,
  suite:'MUDAGIRI_MONEY_PERSONALITY_BACKEND_SEPARATION_V1',
  householdGasFrozen:true,
  dedicatedBackend:true,
  sharedAnonymousJoin:true,
  householdDataGuard:true,
}));
