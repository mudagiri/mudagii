import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V3 from './ResultScreenChapter2V3';
import {JOB_CHARACTER_ASSETS} from './src/features/money-personality/job-character-assets-v1';

const makeVm=(confirmedA:number,cUpper=25000)=>({
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'qa-v3-no-personal-details',
 v5Counts:{cut:1,optimize:2,protect:3,inspect:1},
 potential:{confirmedA,cUpper},rows:[],firstQuest:null,consultRoute:null
});
const positive=renderToStaticMarkup(React.createElement(ResultScreenChapter2V3,{vm:makeVm(1800)}));
assert.match(positive,/c2v3-world/);
assert.match(positive,/FUTURE_REWARDS/);
assert.match(positive,/未来の戦利品/);
assert.match(positive,/¥21,600/,'confirmed improvement ×12');
assert.match(positive,/¥108,000/,'confirmed improvement ×60');
assert.match(positive,/¥216,000/,'confirmed improvement ×120');
assert.match(positive,/10年後の積み重ね/);
assert.match(positive,/最大 ¥25,000/,'unconfirmed opportunity separate');
assert.doesNotMatch(positive,/¥3,216,000/,'unconfirmed opportunity must not be accumulated');
assert.match(positive,/確認できた改善額だけで計算した単純累計/);
assert.match(positive,/MP_BG_02_JOB_UNLOCK/);
assert.match(positive,/MP_BG_03_NEXT_QUEST/);
assert.match(positive,/MUDAGIRI_POSE_23_RESULT/);
assert.doesNotMatch(positive,/TYPE UNLOCKED|称号を獲得|8タイプ図鑑/);

const zero=renderToStaticMarkup(React.createElement(ResultScreenChapter2V3,{vm:makeVm(0,100000)}));
assert.match(zero,/確定した改善額は、まだ見つかっていない/);
assert.doesNotMatch(zero,/10年後の積み重ね/);
assert.doesNotMatch(zero,/¥12,000,000/,'unconfirmed estimate must not be multiplied by 120');
assert.doesNotMatch(zero,/1年続けると/);

for(const [code,asset] of Object.entries(JOB_CHARACTER_ASSETS)){
 const handoff:any={version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',
  anonymousUserId:'test-user',sessionId:'test-session',completedAt:'2026-10-09T13:00:00Z',
  jobCode:code,jobName:asset.name,primaryStyle:'DRIVE'};
 const html=renderToStaticMarkup(React.createElement(ResultScreenChapter2V3,{vm:makeVm(1800),chapter1:handoff}));
 assert.match(html,/第1章から引き継いだ冒険者/);
 assert.ok(html.includes(asset.file),code+' uses canonical JOB image');
 assert.ok(html.includes(asset.name),code+' uses canonical JOB name');
}
assert.doesNotMatch(positive,/<aside class="c2v3-job-card"/,'no fake character without Chapter 1');
const original=readFileSync('MudagiriAppV2.tsx','utf8');
assert.match(original,/VITE_CHAPTER2_V3/);
assert.match(original,/ResultScreenChapter2V3/);
const resultSource=readFileSync('ResultScreenChapter2V3.tsx','utf8');
assert.match(resultSource,/nonnegative\(vm\.potential\?\.confirmedA\)/);
assert.match(resultSource,/confirmed\*120/);
assert.doesNotMatch(resultSource,/reviewUpper\*120|cUpper\*120/);
console.log('CHAPTER2_V3_WORLD_REWARD_QA PASS: guild world, canonical 8 JOB portraits, 1/5/10 confirmed-only, zero-saving state, V1/V2 isolation');
