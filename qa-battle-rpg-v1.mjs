import fs from 'node:fs';
const src=fs.readFileSync('./RpgBlock1.tsx','utf8');
const checks=[
 ['zero-target skips combo',src.includes("setScene(visibleBattleTargets.length ? 'battle' : 'battleComplete')")],
 ['target path enters combo',src.includes("scene === 'battle' && visibleBattleTargets.length")&&src.includes('<ComboBattleScene')],
 ['combo finishes at complete',src.includes("onDone={() => setScene('battleComplete')}")],
 ['result uses finishDiagnosis',src.includes('onResult={finishDiagnosis}')],
 ['finish lock exists',src.includes('diagnosisFinishLock=React.useRef(false)')],
 ['finish lock guards callback',src.includes('if(!onCompleteV3||diagnosisFinishLock.current)return;')&&src.includes('diagnosisFinishLock.current=true;')],
 ['legacy targets still sourced from frozen final bundle',src.includes('const encounterTargets=finalBundle.encounterTargets;')],
 ['V4 targets use scope-safe final judgement',src.includes('const v4VisualTargets=useMemo')&&src.includes("x.status==='cut'||(x.status==='review'&&x.attentionFlag)")],
 ['battle targets prefer V4 with V3 fallback',src.includes('const visibleBattleTargets=v4VisualTargets??encounterTargets;')],
 ['battle scene exists',/type Scene =[^;]*'battle'[^;]*'battleComplete'/.test(src)],
 ['battle intro resumable',src.includes("'battleIntro'")&&src.includes('resumeDraft?.scene as Scene')]
];
for(const [name,ok] of checks){if(!ok)throw new Error('BATTLE_RPG_QA_FAIL:'+name);console.log('PASS',name)}
console.log('BATTLE_RPG_QA_PASS',checks.length);
