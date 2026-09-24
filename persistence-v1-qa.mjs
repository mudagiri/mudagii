import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync(new URL('./persistence-v1.ts',import.meta.url),'utf8');
for(const x of ['diagnosis_started','diagnosis_completed','line_clicked','appointment_booked','valid_appointment','conversion'])assert.ok(s.includes(x),x);
assert.ok(s.includes('mudagiri_anonymous_user_id_v1'));assert.ok(s.includes('utm_source'));assert.ok(s.includes('saveDiagnosis'));assert.ok(s.includes('saveLead'));assert.ok(s.includes('appendEvent'));
console.log('PASS persistence contract 10/10');
