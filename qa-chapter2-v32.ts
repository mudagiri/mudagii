import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V32 from './ResultScreenChapter2V32';
import {LINE_URL} from './src/features/money-personality/line-conversion-v1';
import {readFileSync} from 'node:fs';

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
assert.ok(uncertain.indexOf('data-section="POTENTIAL_HERO"')<uncertain.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(uncertain.indexOf('data-section="POTENTIAL_TREASURE"')<uncertain.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(uncertain.indexOf('data-section="FUTURE_REWARDS"')<uncertain.indexOf('data-section="HOUSEHOLD_BATTLE_RESULTS"'));
assert.ok(uncertain.indexOf('data-section="HOUSEHOLD_BATTLE_RESULTS"')<uncertain.indexOf('data-section="CONSULTATION_CTA_TOP"'));
assert.ok(!uncertain.includes('確認済みの戦利品'),'do not claim confirmed positive saving when it is zero');
const fractional=show(0,17853.6);
assert.match(fractional,/月 最大 ¥17,854/);
assert.match(fractional,/¥214,248/);
assert.match(fractional,/¥1,071,240/);
assert.match(fractional,/¥2,142,480/);
assert.doesNotMatch(fractional,/¥214,243/,'future must compound from displayed yen, not invisible decimals');
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
const candidateHtml=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,17854),
 rows:[
  {category:'mobile',label:'通信費',cUpper:5500,nextAction:'スマホ料金プランを確認',v5Status:'optimize'},
  {category:'food',label:'食費',cUpper:12354,nextAction:'食費の内訳を確認',v5Status:'inspect'},
 ],
 firstQuest:{category:'mobile',label:'通信費',nextAction:'料金プランを確認'}
}}));
assert.match(candidateHtml,/FIRST_REVIEW_ACTION/);
assert.match(candidateHtml,/最初に確かめるなら/);
assert.match(candidateHtml,/食費の内訳を確認/);
assert.ok(candidateHtml.indexOf('data-section="FIRST_REVIEW_ACTION"')<candidateHtml.indexOf('data-section="FUTURE_REWARDS"'));
assert.match(candidateHtml,/もし見直し候補を/);
assert.match(candidateHtml,/未確定の参考シミュレーション/);
assert.match(candidateHtml,/見直し候補を本当に変えられるか確かめよう/);
const jobHandoff={
 version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',anonymousUserId:'test',sessionId:'test',
 completedAt:'2026-10-11T00:00:00Z',jobCode:'FDM',jobName:'先回り司令官',primaryStyle:'DRIVE'
} as const;
const withJob=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:makeVm(0,17854),chapter1:jobHandoff}));
assert.match(withJob,/冒険者JOBとクリア記念のカード/);
assert.match(withJob,/先回り司令官/);
assert.doesNotMatch(uncertain,/冒険者JOBとクリア記念のカード/);
// The result must actually show the canonical enemy characters, their names
// and all 12 category states, including categories that are protected or N/A.
const {ENEMY_ASSETS}=await import('./enemy-assets-v1');
const allCategories=Object.entries(ENEMY_ASSETS).map(([category,enemy],i)=>({
 category,label:['通信費','光熱費','サブスク','食費','日用品','娯楽','服・美容','車','住居費','保険','教育費','自己投資'][i],
 v5Status:(i%4===0?'optimize':i%4===1?'protect':i%4===2?'na':'inspect'),
 cUpper:i===0?2500:0, nextAction:'契約内容を確認', known:false,
}));
const monsterHtml=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,2500),rows:allCategories,firstQuest:{category:'mobile',label:'通信費',nextAction:'プランを見直す'}
}}));
assert.equal((monsterHtml.match(/data-section="MUDAGIRI_TALK"/g)||[]).length,5,'five Chapter 1 style companion beats');
assert.equal((monsterHtml.match(/class="c2v2-entry c2v32-enemy-record"/g)||[]).length,12,'show all 12 canonical enemy cards');
assert.match(monsterHtml,/ENEMY_BATTLE_PREVIEW/);
assert.match(monsterHtml,/ENEMY_FULL_GALLERY/);
for(const enemy of Object.values(ENEMY_ASSETS)){
 assert.ok(monsterHtml.includes(enemy.name),'named enemy is missing: '+enemy.name);
 assert.ok(monsterHtml.includes(enemy.normal),'official enemy image is missing: '+enemy.id);
}
assert.match(monsterHtml,/対象外/);
assert.match(monsterHtml,/守る/);
assert.match(monsterHtml,/MUDAGIRI_POSE_20_CHECK/);
assert.match(monsterHtml,/MUDAGIRI_POSE_24_SHARE/);
assert.match(monsterHtml,/未確定の参考シミュレーション/);
const source=(await import('node:fs')).readFileSync('ResultScreenChapter2V32.tsx','utf8');
assert.match(source,/reviewUpper\*120/);
assert.match(source,/createQuestShareCard\(chapter1\?\.jobCode\)/);
assert.match(source,/loadImage\(job\?\.file\|\|ART\.result\)/);
assert.doesNotMatch(source,/confirmed\*120|confirmed\+reviewUpper|cUpper\+confirmedA/);
assert.equal(LINE_URL,'https://lin.ee/ol9c2rJ','must use current official LINE URL');
for(const path of ['MudagiriAppV2.tsx','ResultScreenChapter2V2.tsx','ResultScreenChapter2V3.tsx','ResultScreenChapter2V31.tsx','ResultScreenChapter2V32.tsx']){
 const source=readFileSync(path,'utf8');
 assert.ok(source.includes(LINE_URL),path+' must use current official LINE URL');
 assert.ok(!source.includes('https://lin.ee/ZeLu7i6'),path+' must not retain obsolete LINE URL');
}
console.log('CHAPTER2_V32_POTENTIAL_FIRST_QA_PASS: zero confirmed, scenario, both, neither, honest labels, visual hierarchy');
