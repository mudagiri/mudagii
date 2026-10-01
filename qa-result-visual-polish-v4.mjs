import fs from 'node:fs';
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');

const checks=[
 ['Mudagiri Result art includes extended guide roles',
  ['shareHint','quest','save','friend'].every(k=>result.includes(k+":'./assets/"))],
 ['Mudagiri appears in at least eight Result image placements',
  (result.match(/className="rv3-mudagiri/g)||[]).length>=8],
 ['social share has Mudagiri cameo',result.includes('className="rv3-mini-guide-row"')&&result.includes('MUDAGIRI_RESULT_ART.shareHint')],
 ['NEXT QUEST has Mudagiri cameo',result.includes('className="rv3-mini-guide-row is-next"')&&result.includes('MUDAGIRI_RESULT_ART.quest')],
 ['LINE save has Mudagiri cameo',result.includes('className="rv3-mini-guide-row is-save"')&&result.includes('MUDAGIRI_RESULT_ART.save')],
 ['friend quest has Mudagiri cameo',result.includes('className="rv3-mini-guide-row is-friend"')&&result.includes('MUDAGIRI_RESULT_ART.friend')],
 ['semantic palette defines distinct accent colors',
  ['--rv-gold','--rv-cyan','--rv-teal','--rv-violet','--rv-coral','--rv-green'].every(x=>result.includes(x))],
 ['type section uses violet identity treatment',result.includes('.rv3-type-card{')&&result.includes('rgba(154,140,255')],
 ['benchmark uses cyan treatment',result.includes('.rv3-benchmark .rv3-kicker{color:var(--rv-cyan)')],
 ['verdict preserves semantic cut review protect colors',
  result.includes('.rv3-verdict-grid .is-cut')&&result.includes('.rv3-verdict-grid .is-review')&&result.includes('.rv3-verdict-grid .is-protect')],
 ['NEXT QUEST uses gold treatment',result.includes('.rv3-next{')&&result.includes('rgba(246,200,75')],
 ['consult uses teal treatment',result.includes('.rv3-consult-route .rv3-kicker{color:var(--rv-teal)')],
 ['LINE uses green treatment',result.includes('.rv3-line-early .rv3-primary')&&result.includes('var(--rv-green)')],
 ['friend quest uses violet treatment',result.includes('.rv3-viral-loop .rv3-kicker{color:#b9afff')],
 ['diagnosis logic remains outside this visual file change',!result.includes('function buildFinalJudgementsV4')&&!result.includes('function resolveComparable')],
];
for(const [name,ok] of checks){
 if(!ok)throw new Error('RESULT_VISUAL_POLISH_V4_QA_FAIL:'+name);
 console.log('PASS',name);
}
console.log('RESULT_VISUAL_POLISH_V4_QA_PASS',checks.length);
