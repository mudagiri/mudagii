import fs from 'node:fs';
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const result=fs.readFileSync(new URL('./ResultScreenV2.tsx',import.meta.url),'utf8');
const copy=fs.readFileSync(new URL('./ux-copy-v2.ts',import.meta.url),'utf8');
const checks=[
 ['time promise is realistic', copy.includes('約2分') && !copy.includes('約1〜2分')],
 ['income required', app.includes('disabled={income<=0}')],
 ['all 12 expense categories present', ['rent','mobile','energy','insurance','sub','car','food','daily','fun','beautyFashion','childEducation','selfDevelopment'].every(x=>app.includes(`'${x}'`))],
 ['8 type answers required', app.includes('TYPE_QUESTIONS.some(q=>typeAnswers[q.id]===undefined)')],
 ['global satisfaction explicitly required', app.includes('!globalSat || satisfactionQuestions.some')],
 ['dynamic satisfaction only', app.includes('satisfactionQuestions.map')],
 ['battle max 3', app.includes('selectBattleEncounters(result,expenses,comparable,3)')],
 ['future goal avoids realized-savings claim', copy.includes('この改善余地、何に変えたい？') && !copy.includes('浮いたお金')],
 ['priority wording not moral ranking', result.includes('今回の討伐優先度') && !result.includes('ムダ敵ランキング')],
 ['LINE does not hostage hidden money', !result.includes('残りの推定改善余地')],
 ['LINE says diagnosis is complete', result.includes('診断結果はここで完了')],
 ['comparison disclaimer preserved', result.includes('その全部をムダとは判定していません')],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`\n${pass}/${checks.length} PASS`); if(pass!==checks.length) process.exit(1);
