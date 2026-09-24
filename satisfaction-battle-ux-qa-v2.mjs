import fs from 'node:fs';
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const comp=fs.readFileSync(new URL('./SatisfactionBattleV2.tsx',import.meta.url),'utf8');
const checks=[
 ['dedicated battle component',app.includes('SatisfactionBattleV2')],
 ['one question index',app.includes('satisfactionQuestionIndex')],
 ['global satisfaction first',app.includes('!globalSat?')],
 ['enemy encounter',comp.includes('が あらわれた！')],
 ['explicit permission framing',comp.includes('本当に斬っていい？')],
 ['difference is not waste disclaimer',comp.includes('差額＝ムダではありません')],
 ['four value choices', ['waste','inertia','satisfied','verySatisfied'].every(x=>comp.includes(`key:'${x}'`))],
 ['very satisfied protects',comp.includes('これは守る。斧をしまおう。')],
 ['back navigation',comp.includes('1体戻る')],
 ['progress visible',comp.includes('questions.length')],
 ['analytics event',app.includes('mudagiri_value_check')],
 ['sub actual remains separate',app.includes('ほぼ使っていないサブスクの月額')],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`\n${pass}/${checks.length} PASS`); if(pass!==checks.length)process.exit(1);
