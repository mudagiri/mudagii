import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
for(const filename of [
  '.github/workflows/attach-money-personality-preview.yml',
  '.github/workflows/deploy-money-personality-hidden-preview.yml'
]){
  const s=read(filename);
  assert.match(s,/Require dedicated Money Personality GAS endpoint before preview publish/);
  assert.match(s,/secrets\.VITE_MONEY_PERSONALITY_GAS_URL/);
  assert.match(s,/Dedicated Money Personality GAS URL is unavailable; hidden preview deployment blocked/);
  assert.match(s,/https:\/\/script\.google\.com\/macros\/s\/\*\/exec/);
  assert.ok(s.indexOf('Require dedicated Money Personality GAS endpoint')<s.indexOf('Build pilot candidate'));
}
const transport=read('src/features/money-personality/publicTelemetryDeliveryV1.ts');
const telemetry=read('src/features/money-personality/MoneyPersonalityTelemetry.tsx');
assert.match(telemetry,/attemptPublicMoneyDelivery/);
assert.ok(!telemetry.includes("const SUBMITTED_KEY="),'must not mark sent before confirmation');
assert.match(transport,/OPAQUE_UNVERIFIED/);
assert.match(transport,/MAX_PUBLIC_ATTEMPTS=4/);
assert.match(transport,/sanitizedPublicMoneySourceUrl/);
const gas=read('MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs');
assert.match(gas,/function auditMoneyPersonalityPrevalenceV1\(/);
assert.match(gas,/function computeMoneyPersonalityPrevalenceV1_\(/);
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_BACKEND_RELEASE_GATE_V1',
  guardedDeployWorkflows:2,offlineTransportAudited:true,
  secretValuesNotExposed:true,householdBackendUntouched:true}));
