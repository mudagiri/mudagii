import assert from 'node:assert/strict';
import React from 'react';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V31 from './ResultScreenChapter2V31';
import {JOB_CHARACTER_ASSETS} from './src/features/money-personality/job-character-assets-v1';

const makeVm=(confirmedA:number,cUpper:number)=>({
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'qa-v31-synthetic',
 v5Counts:{cut:1,optimize:1,protect:7,inspect:3},
 potential:{confirmedA,cUpper},rows:[],firstQuest:null,consultRoute:null
});
const html=renderToStaticMarkup(React.createElement(ResultScreenChapter2V31,{vm:makeVm(1800,17854)}));
for(const required of ['QUEST CLEAR!','BATTLE REPORT','CONFIRMED_REWARD','UNAPPRAISED_TREASURE','未鑑定の宝箱','確認済みの戦利品','FUTURE REWARD','NEXT QUEST','第1章']) {
 assert.ok(html.includes(required),required+' must be rendered');
}
assert.match(html,/毎月/);
assert.match(html,/¥1,800/);
assert.match(html,/最大 ¥17,854/);
assert.match(html,/未確定/);
assert.match(html,/実際に削減できるかは/);
assert.match(html,/¥21,600/);
assert.match(html,/¥108,000/);
assert.match(html,/¥216,000/);
assert.match(html,/将来の改善を保証するものではなく/);
assert.doesNotMatch(html,/¥2,358,480/,'do not multiply unconfirmed additional possibility by 120');
assert.match(html,/MP_BG_01_GUILD_HALL/);
assert.match(html,/MP_BG_02_JOB_UNLOCK/);
assert.match(html,/MP_BG_03_NEXT_QUEST/);
assert.match(html,/aria-label="未鑑定の鍵付き宝箱"/);
assert.match(html,/aria-label="ギルドの戦利品を表す金貨袋とコイン"/);

const zero=renderToStaticMarkup(React.createElement(ResultScreenChapter2V31,{vm:makeVm(0,0)}));
assert.match(zero,/確定した改善額はまだありません/);
assert.match(zero,/追加で見直せる可能性は、まだ特定されていません/);
assert.doesNotMatch(zero,/¥216,000/);
assert.doesNotMatch(zero,/10年間の積み重ね/);

for(const [code,asset] of Object.entries(JOB_CHARACTER_ASSETS)){
 const handoff:any={version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',anonymousUserId:'qa',
  sessionId:'qa-session',completedAt:'2026-10-11T00:00:00Z',jobCode:code,
  jobName:asset.name,primaryStyle:'DRIVE'};
 const result=renderToStaticMarkup(React.createElement(ResultScreenChapter2V31,{vm:makeVm(1800,17854),chapter1:handoff}));
 assert.ok(result.includes(asset.file),'Official JOB image missing: '+code);
 assert.ok(result.includes(asset.name),'Official JOB name missing: '+code);
 assert.match(result,/第1章で獲得したJOB/);
 assert.match(result,/ADVENTURER RECORD/);
 assert.match(result,/挑戦重視/);
}
assert.doesNotMatch(html,/<aside class="c2v31-job-card/,'no inherited-job claim when absent');
const app=readFileSync('MudagiriAppV2.tsx','utf8');
assert.match(app,/VITE_CHAPTER2_V31/);
assert.match(app,/ResultScreenChapter2V31/);
const component=readFileSync('ResultScreenChapter2V31.tsx','utf8');
assert.match(component,/nonnegative\(vm\.potential\?\.confirmedA\)/);
assert.match(component,/nonnegative\(vm\.potential\?\.cUpper\)/);
assert.match(component,/confirmed\*120/);
assert.doesNotMatch(component,/reviewUpper\*120|cUpper\*120|confirmed\+reviewUpper/);
assert.match(component,/無料ライフプラン相談の案内を見る/);
console.log('CHAPTER2_V31_RPG_REWARD_QA_PASS all eight JOBs / confirmed and unconfirmed semantics / 1-5-10 / zero / world assets');
