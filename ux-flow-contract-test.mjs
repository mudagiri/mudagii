import fs from 'node:fs'; import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const sat=fs.readFileSync(new URL('./satisfaction-resolver-v2.ts',import.meta.url),'utf8');
const battle=fs.readFileSync(new URL('./battle-encounter-v2.ts',import.meta.url),'utf8');
const checks=[
 ['12 categories retained', /const categories:Category\[\]=\['rent','mobile','energy','insurance','sub','car','food','daily','fun','beautyFashion','childEducation','selfDevelopment'/.test(app)],
 ['no hard slice(0,3) on satisfaction questions', !/suspicious=.*slice\(0,3\)/.test(app)],
 ['dynamic satisfaction resolver used', /resolveSatisfactionQuestions\(expenses,comparable\)/.test(app)],
 ['only satisfaction-sensitive lifestyle categories asked', /food','fun','beautyFashion/.test(sat) && !/LIFESTYLE.*sub/.test(sat)],
 ['battle selector used', /selectBattleEncounters\(result,expenses,comparable,3\)/.test(app)],
 ['battle display capped at max', /slice\(0,Math\.max\(0,max\)\)/.test(battle)],
 ['defeat priority over spared', /300\+/.test(battle) && /200\+/.test(battle)],
 ['review is representable', /needs_review/.test(battle)],
];
for(const [name,ok] of checks){assert.ok(ok,name); console.log('PASS',name)}
console.log(`PASS ${checks.length}/${checks.length}`);
