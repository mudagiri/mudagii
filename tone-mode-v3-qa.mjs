import fs from 'node:fs';
const tone=fs.readFileSync(new URL('./tone-mode-v3.ts',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const battle=fs.readFileSync(new URL('./BattleSequenceV2.tsx',import.meta.url),'utf8');
const result=fs.readFileSync(new URL('./ResultScreenV2.tsx',import.meta.url),'utf8');
const checks=[
 ['3 modes', ['gentle','serious','hell'].every(x=>tone.includes(x))],
 ['serious default', app.includes("useState<ToneMode>('serious')")],
 ['mode choice tracked', app.includes('mudagiri_mode_selected')],
 ['same result promise', app.includes('診断結果・金額はどのモードでも同じ')],
 ['battle gets mode', app.includes('<BattleSequenceV2 toneMode={toneMode}')],
 ['result gets mode', app.includes('<ResultScreenV2 result={result} toneMode={toneMode}')],
 ['battle tone only copy', battle.includes('MODE_COPY[toneMode]')],
 ['result CTA tone', result.includes('MODE_COPY[toneMode].lineCta')],
 ['hell protects happiness', tone.includes('幸せなら斬れねぇ')],
 ['review guardrail', tone.includes('中身も見ずに切るのは')],
];
for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(!ok) process.exitCode=1}
console.log(`${checks.filter(x=>x[1]).length}/${checks.length} PASS`);
