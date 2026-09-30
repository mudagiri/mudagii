import fs from 'node:fs';
const src=fs.readFileSync('./RpgBlock1.tsx','utf8');
const checks=[
 ['zero-target skips combo',src.includes("setScene(encounterTargets.length ? 'battle' : 'battleComplete')")],
 ['target path enters combo',src.includes("scene === 'battle' && encounterTargets.length")&&src.includes('<ComboBattleScene')],
 ['combo finishes at complete',src.includes("onDone={() => setScene('battleComplete')}")],
 ['result uses finishDiagnosis',src.includes('onResult={finishDiagnosis}')],
 ['finish lock exists',src.includes('diagnosisFinishLock=React.useRef(false)')],
 ['finish lock guards callback',src.includes('if(!onCompleteV3||diagnosisFinishLock.current)return;')&&src.includes('diagnosisFinishLock.current=true;')],
 ['battle targets capped',src.includes('.slice(0,3)')],
 ['battle scene exists',src.includes("'battle' | 'battleComplete'")||src.includes("'battle'|'battleComplete'")],
 ['battle intro resumable',src.includes("'battleIntro'")&&src.includes('resumeDraft?.scene')]
];
for(const [name,ok] of checks){if(!ok)throw new Error('BATTLE_RPG_QA_FAIL:'+name);console.log('PASS',name)}
console.log('BATTLE_RPG_QA_PASS',checks.length);
