import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {moneyPersonalityGasHealth,validateMoneyPersonalityGasUrl} from './scripts/check-money-personality-gas-health.mjs';
import {inspectMoneyPersonalityBuild} from './scripts/verify-money-personality-build.mjs';

const URL='https://script.google.com/macros/s/QA_FAKE_TEST_ONLY/exec';
const HOUSEHOLD='https://script.google.com/macros/s/QA_OTHER_TEST_ONLY/exec';
assert.equal(validateMoneyPersonalityGasUrl(undefined),'MISSING_ENDPOINT');
for(const x of ['http://script.google.com/macros/s/a/exec','https://example.net/macros/s/a/exec',
  'https://script.google.com/macros/s/a/dev','https://script.google.com/macros/s/a/exec?token=secret']){
  assert.equal(validateMoneyPersonalityGasUrl(x),'INVALID_ENDPOINT_SHAPE',x);
}
assert.equal(validateMoneyPersonalityGasUrl(URL),null);
const valid={backend:'money_personality',gas_version:'MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0',household_backend_separated:true};
const good=()=>Promise.resolve({ok:true,json:()=>Promise.resolve(valid)});
assert.deepEqual(await moneyPersonalityGasHealth(URL,good),{ok:true,code:'DEDICATED_GAS_HEALTH_OK'});
const badBackend=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({ok:true,version:'MUDAGIRI_SHEET_V3'})});
assert.equal((await moneyPersonalityGasHealth(URL,badBackend)).code,'WRONG_BACKEND_OR_VERSION');
const badVersion=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({...valid,gas_version:'MUDAGIRI_OTHER_GAS'})});
assert.equal((await moneyPersonalityGasHealth(URL,badVersion)).code,'WRONG_BACKEND_OR_VERSION');
const unauthorized=()=>Promise.resolve({ok:false,status:403});
assert.equal((await moneyPersonalityGasHealth(URL,unauthorized)).code,'HTTP_NOT_OK');
const unreachable=()=>Promise.reject(Error('unavailable'));
assert.equal((await moneyPersonalityGasHealth(URL,unreachable)).code,'HEALTH_UNREACHABLE_OR_INVALID_JSON');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'mudagiri-gas-build-'));
try{
  const assets=path.join(folder,'assets');fs.mkdirSync(assets);
  const write=x=>fs.writeFileSync(path.join(assets,'index-test.js'),x);
  write('async function transport(){}');
  assert.equal(inspectMoneyPersonalityBuild({distDir:folder,moneyUrl:URL}).code,'MONEY_GAS_OPTIMIZED_OUT_OF_BUNDLE');
  assert.equal(inspectMoneyPersonalityBuild({distDir:folder,moneyUrl:URL,householdUrl:URL}).code,'MONEY_URL_EQUALS_HOUSEHOLD_URL');
  write(JSON.stringify([URL,'money_personality_pilot_v1','mudagiri_money_type_submission_health_v1']));
  assert.equal(inspectMoneyPersonalityBuild({distDir:folder,moneyUrl:URL,householdUrl:HOUSEHOLD}).code,'PERSONALITY_GAS_BUILD_BOUND');
  write(JSON.stringify([URL,'money_personality_pilot_v1']));
  assert.equal(inspectMoneyPersonalityBuild({distDir:folder,moneyUrl:URL}).code,'RETRY_TELEMETRY_NOT_IN_BUNDLE');
}finally{fs.rmSync(folder,{recursive:true,force:true})}
for(const f of ['deploy-money-personality-hidden-preview.yml','attach-money-personality-preview.yml']){
 const yaml=fs.readFileSync(new URL('./.github/workflows/'+f,import.meta.url),'utf8');
 assert.ok(yaml.includes('check-money-personality-gas-health.mjs'),f+' backend check missing');
 assert.ok(yaml.includes('verify-money-personality-build.mjs'),f+' bundle check missing');
 assert.ok(yaml.indexOf('check-money-personality-gas-health.mjs')<yaml.indexOf('Build pilot candidate'),f+' release guard must run before build');
 assert.ok(yaml.includes('steps.capture_pilot_sha.outputs.sha'),f+' captured SHA output missing');
 assert.ok(yaml.includes('REVISION_SHA.txt'),f+' published marker probe missing');
 assert.ok(yaml.includes('EXPECTED_PILOT_SHA'),f+' exact revision comparison missing');
}
console.log(JSON.stringify({suite:'MUDAGIRI_DEDICATED_GAS_RELEASE_CONTRACT_V1',ok:true,
  frontendCannotUseHouseholdGAS:true, wrongBackendRejected:true,
  missingBackendRejected:true,compiledOutTransportRejected:true,
  verifiedPublishWorkflows:2}));
