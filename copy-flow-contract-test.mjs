import fs from 'node:fs';
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const result=fs.readFileSync(new URL('./ResultScreenV2.tsx',import.meta.url),'utf8');
const copy=fs.readFileSync(new URL('./ux-copy-v2.ts',import.meta.url),'utf8');
const checks=[
 ['promise',copy.includes('好きなものは、斬らない。ムダだけ、斬る。')],
 ['no registration upfront',copy.includes('無料・登録不要')],
 ['12 scan',copy.includes('12項目をチェック')],
 ['protect satisfaction',copy.includes('満足している支出は守ります')],
 ['future gain framing',copy.includes('節約することがゴールじゃない')],
 ['line after completion',copy.includes('診断はここまでで完了しています')],
 ['line does not alter result',copy.includes('診断結果や改善金額が変わることはありません')],
 ['dynamic satisfaction required',app.includes("disabled={satisfactionQuestions.some(({category:c})=>!catSat[c])}")],
 ['battle remains max3',app.includes('selectBattleEncounters(result,expenses,comparable,3)')],
 ['result uses central copy',result.includes("UX_COPY_V2")],
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok)pass++;}
console.log(`\n${pass}/${checks.length} PASS`); if(pass!==checks.length) process.exit(1);
