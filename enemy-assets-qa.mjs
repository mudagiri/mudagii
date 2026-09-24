import fs from 'node:fs';
const cats=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
let pass=0; const failures=[];
for(const c of cats){const p=`public/assets/enemies/${c}.webp`; if(fs.existsSync(p)&&fs.statSync(p).size>5000)pass++; else failures.push(p)}
const content=fs.readFileSync('enemy-content-v2.ts','utf8');
for(const c of cats){if(!content.includes(`/assets/enemies/${c}.webp`))failures.push(`mapping:${c}`)}
const battle=fs.readFileSync('BattleSequenceV2.tsx','utf8');
const sat=fs.readFileSync('SatisfactionBattleV2.tsx','utf8');
if(!battle.includes('src={content.image}'))failures.push('battle image');
if(!sat.includes('src={enemy.image}'))failures.push('satisfaction image');
console.log(`enemy files ${pass}/12`); console.log(failures.length?'FAIL '+failures.join(', '):'PASS enemy asset integration');
if(failures.length)process.exit(1);
