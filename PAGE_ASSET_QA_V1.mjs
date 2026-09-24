import fs from 'node:fs';
const required=['hero-key-visual.png','battle-background.png','encounter-vs.png','result-victory-background.png','future-goal-key-visual.png','unresolved-background.png','share-card-template.png'];
let pass=0;
for(const name of required){const p=`public/assets/page/${name}`; const ok=fs.existsSync(p)&&fs.statSync(p).size>10000; console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok) pass++;}
console.log(`PAGE ASSET QA: ${pass}/${required.length} PASS`);
const runtimeFiles=['MudagiriAppV2.tsx','BattleSequenceV2.tsx','ResultRevealV2.tsx','ResultScreenV2.tsx','ShareResultCardV2.tsx'];
const runtime=runtimeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
let wired=0;
for(const name of required){ const ok=runtime.includes(`./assets/page/${name}`); console.log(`${ok?'PASS':'FAIL'} WIRED ${name}`); if(ok) wired++; }
console.log(`PAGE ASSET WIRING: ${wired}/${required.length} PASS`);
process.exit(pass===required.length && wired===required.length ? 0 : 1);
