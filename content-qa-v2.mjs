import fs from 'node:fs';
const copy=fs.readFileSync(new URL('./ux-copy-v2.ts',import.meta.url),'utf8');
const result=fs.readFileSync(new URL('./ResultScreenV2.tsx',import.meta.url),'utf8');
const type=fs.readFileSync(new URL('./type-content-v2.ts',import.meta.url),'utf8');
const enemy=fs.readFileSync(new URL('./enemy-content-v2.ts',import.meta.url),'utf8');
const line=fs.readFileSync(new URL('./line-report-full-v2.ts',import.meta.url),'utf8');
const tests=[
 ['brand promise',copy.includes('好きなものは、斬らない。ムダだけ、斬る。')],
 ['no high=bad intro',copy.includes('金額だけでムダ認定はしません')],
 ['12 result states',copy.includes('斬るもの・守るもの・まだ斬らないもの')],
 ['future goal non-guarantee',copy.includes('この改善余地') && !copy.includes('浮いたお金')],
 ['line result not hostage',result.includes('診断結果はここで完結')],
 ['line next action value',copy.includes('最初の一手')],
 ['share privacy',result.includes('改善金額を隠してシェアする')],
 ['16 types', (type.match(/code:'[FV][PI][AU][SE]'/g)||[]).length===16],
 ['12 enemies', (enemy.match(/category:'/g)||[]).length===12],
 ['12 line reports', (line.match(/category:'/g)||[]).length===12],
 ['insurance guardrail',line.includes('内容確認前の解約はしない')],
 ['education guardrail',line.includes('教育機会を削ることを改善とは扱わない')],
 ['food satisfaction',line.includes('幸せな食費は守る')],
 ['no investment promise',result.includes('投資収益は含めず')],
 ['comparison disclaimer',result.includes('その全部をムダとは判定していません')],
];
let pass=0; for(const [n,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok)pass++;}
console.log(`\n${pass}/${tests.length} PASS`); if(pass!==tests.length)process.exit(1);
