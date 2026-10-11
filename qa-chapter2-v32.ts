import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V32 from './ResultScreenChapter2V32';

const makeVm=(confirmedA:number,cUpper:number)=>({
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'v32-qa-synthetic',
 v5Counts:{cut:0,optimize:2,protect:3,inspect:2,ok:3,na:2},
 potential:{confirmedA,cUpper},rows:[],firstQuest:null,consultRoute:null
});
const show=(a:number,c:number)=>renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:makeVm(a,c)}));
const uncertain=show(0,17854);
for(const marker of ['data-result-version="v32"','POTENTIAL_HERO','POTENTIAL_TREASURE','FUTURE_REWARDS','HOUSEHOLD_BATTLE_RESULTS','CONSULTATION_CTA_TOP','NEXT_QUEST','MP_BG_01_GUILD_HALL','MP_BG_02_JOB_UNLOCK','MP_BG_03_NEXT_QUEST']){
 assert.ok(uncertain.includes(marker),'missing section or asset '+marker);
}
assert.match(uncertain,/月 最大 ¥17,854/);
assert.match(uncertain,/¥214,248/);
assert.match(uncertain,/¥1,071,240/);
assert.match(uncertain,/¥2,142,480/);
assert.match(uncertain,/未確定/);
assert.match(uncertain,/実際の削減額や将来の結果を保証するものではなく/);
assert.ok(uncertain.indexOf('POTENTIAL_HERO')<uncertain.indexOf('FUTURE_REWARDS'));
assert.ok(uncertain.indexOf('POTENTIAL_TREASURE')<uncertain.indexOf('FUTURE_REWARDS'));
assert.ok(uncertain.indexOf('FUTURE_REWARDS')<uncertain.indexOf('HOUSEHOLD_BATTLE_RESULTS'));
assert.ok(uncertain.indexOf('HOUSEHOLD_BATTLE_RESULTS')<uncertain.indexOf('CONSULTATION_CTA_TOP'));
assert.ok(!uncertain.includes('確認済みの戦利品'),'do not claim confirmed positive saving when it is zero');
const mixed=show(1800,17854);
assert.match(mixed,/¥1,800/);
assert.match(mixed,/¥2,142,480/);
assert.doesNotMatch(mixed,/¥2,358,480/,'do not add confirmed savings into uncertain future upper');
const confirmedOnly=show(1800,0);
assert.match(confirmedOnly,/¥1,800/);
assert.doesNotMatch(confirmedOnly,/10年間の積み重ね/,'no invented future scenario without uncertain candidates');
const empty=show(0,0);
assert.match(empty,/候補額はまだ未特定/);
assert.doesNotMatch(empty,/¥2,142,480/);
const source=(await import('node:fs')).readFileSync('ResultScreenChapter2V32.tsx','utf8');
assert.match(source,/reviewUpper\*120/);
assert.doesNotMatch(source,/confirmed\*120|confirmed\+reviewUpper|cUpper\+confirmedA/);
console.log('CHAPTER2_V32_POTENTIAL_FIRST_QA_PASS: zero confirmed, scenario, both, neither, honest labels, visual hierarchy');
