import fs from 'node:fs';
const reveal=fs.readFileSync(new URL('./ResultRevealV2.tsx',import.meta.url),'utf8');
const screen=fs.readFileSync(new URL('./ResultScreenV2.tsx',import.meta.url),'utf8');
const tests=[
 ['4段階開封',/complete.*battle.*title.*money/s.test(reveal)],
 ['QUEST COMPLETE',reveal.includes('QUEST COMPLETE')],
 ['討伐候補',reveal.includes('討伐候補')],
 ['称号公開',reveal.includes('TITLE ACQUIRED')],
 ['改善余地公開',reveal.includes('推定改善余地')],
 ['月年5年',reveal.includes('improvement?.monthly')&&reveal.includes('improvement?.annual')&&reveal.includes('improvement?.fiveYear')],
 ['自動進行',reveal.includes('setTimeout')],
 ['タップ進行',reveal.includes('タップして進む')],
 ['reduced motion',reveal.includes('prefers-reduced-motion')],
 ['analytics',reveal.includes('result_reveal_step')&&reveal.includes('result_reveal_complete')],
 ['価値観保護コピー',reveal.includes('高いだけでは斬っていません')&&reveal.includes('好きなものは、斬らない')],
 ['ResultScreen統合',screen.includes('<ResultRevealV2 result={result}')],
];
let pass=0; for(const [name,ok] of tests){ console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++; }
console.log(`\n${pass}/${tests.length} PASS`); if(pass!==tests.length)process.exit(1);
