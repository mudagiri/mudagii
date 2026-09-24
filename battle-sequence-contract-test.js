import fs from 'node:fs';
const battle=fs.readFileSync('./BattleSequenceV2.tsx','utf8');
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const checks=[
 ['3-state defeat',battle.includes("'defeat'|'spared'|'needs_review'")],
 ['defeat label',battle.includes('WEAK POINT')],
 ['spared label',battle.includes('NO ATTACK')],
 ['review label',battle.includes('UNKNOWN')],
 ['comparison shown',battle.includes('近い世帯')],
 ['monthly improvement shown',battle.includes('改善余地')],
 ['battle step wired',app.includes("|'battle'|'result'")],
 ['max 3 encounters',app.includes('].slice(0,3)')],
 ['satisfaction routes battle',app.includes("setStep('battle')")],
 ['battle completes result',app.includes("onComplete={()=>setStep('result')}")]
];
for(const [n,ok] of checks){if(!ok) throw new Error('FAIL '+n); console.log('PASS',n)}
console.log(`Battle contract: ${checks.length}/${checks.length} PASS`);
