import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/MudagiriAppV2.tsx',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('./api-server-v1.mjs',import.meta.url),'utf8');
const env=fs.readFileSync(new URL('./.env.example',import.meta.url),'utf8');
const checks=[
 ['app imports production adapter',app.includes("productionPersistence")],
 ['app uses production adapter',app.includes('return productionPersistence(new LocalPersistenceAdapter())')],
 ['diagnosis endpoint',api.includes("'/v1/diagnoses'")],
 ['event endpoint',api.includes("'/v1/events'")],
 ['lead endpoint',api.includes("'/v1/leads'")],
 ['transaction',api.includes("query('begin')")&&api.includes("query('commit')")],
 ['no secret in VITE env',!env.includes('SERVICE_ROLE')&&!env.includes('DATABASE_URL=')],
 ['official line url',env.includes('https://lin.ee/ZeLu7i6')],
];
let n=0; for(const [name,ok] of checks){console.log(ok?'PASS':'FAIL',name);if(ok)n++} console.log(`${n}/${checks.length} PASS`); if(n!==checks.length)process.exit(1);
