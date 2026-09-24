import fs from 'node:fs';
const sql=fs.readFileSync(new URL('./CENTRAL_DB_SCHEMA_V1.sql',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('./server-api-v1.ts',import.meta.url),'utf8');
const tests=[
 ['analytics schema',/schema if not exists analytics/.test(sql)],
 ['crm separated',/schema if not exists crm/.test(sql)],
 ['12 category table',/analytics\.diagnosis_categories/.test(sql)],
 ['events table',/analytics\.funnel_events/.test(sql)],
 ['latest per anon',/partition by anonymous_user_id/.test(sql)],
 ['benchmark consent',/consent_benchmark=true/.test(sql)],
 ['median+p90',/percentile_cont\(\.50\)/.test(sql)&&/percentile_cont\(\.90\)/.test(sql)],
 ['central adapter diagnosis',/\/v1\/diagnoses/.test(api)],
 ['central adapter lead',/\/v1\/leads/.test(api)],
 ['central adapter event',/\/v1\/events/.test(api)],
];
for(const [n,ok] of tests) console.log(`${ok?'PASS':'FAIL'} ${n}`);
if(tests.some(x=>!x[1])) process.exit(1);
console.log(`PASS ${tests.length}/${tests.length}`);
