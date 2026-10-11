import assert from 'node:assert/strict';
import React from 'react';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V31 from './ResultScreenChapter2V31';
import {buildSafeFunnelEvent,buildPostHogCaptureBody,hasProductAnalyticsConsent,trackMudagiriProductEvent} from './src/product-funnel-analytics-v1';
import {LINE_URL} from './src/features/money-personality/line-conversion-v1';
import {JOB_CHARACTER_ASSETS} from './src/features/money-personality/job-character-assets-v1';

const makeVm=(confirmedA:number,cUpper:number)=>({
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'qa-v31-synthetic',
 v5Counts:{cut:1,optimize:1,protect:0,inspect:0,ok:7,na:3},
 potential:{confirmedA,cUpper},rows:[],firstQuest:null,consultRoute:null
});
const html=renderToStaticMarkup(React.createElement(ResultScreenChapter2V31,{vm:makeVm(1800,17854)}));
for(const required of ['QUEST CLEAR!','BATTLE REPORT','CONFIRMED_REWARD','UNAPPRAISED_TREASURE','未鑑定の宝箱','確認済みの戦利品','FUTURE REWARD','NEXT QUEST']) {
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
assert.match(html,/月 ¥1,800 の改善が続いた場合/);
assert.match(html,/ほかに、問題なし 7件・対象外 3件/);
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
 assert.match(result,/第1章のJOB/);
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
assert.match(component,/画像付きでシェアする/);
assert.match(html,/画像の保存・文章だけで共有/);
assert.match(html,/招待リンクをコピー/);
assert.match(html,/画像は自動添付されないよ/);
assert.match(component,/chapter2_v31_share_intent/);
assert.match(component,/chapter2_v31_share_export/);
assert.match(component,/chapter2_v31_consultation_line_outbound/);
assert.equal(LINE_URL,'https://lin.ee/ol9c2rJ','Chapter 1 and Chapter 2 official LINE destinations must match');
assert.deepEqual(buildSafeFunnelEvent('chapter1','result_seen'),{
 event:'mudagiri_chapter1_completed',properties:{chapter:'chapter1'},
});
assert.deepEqual(buildSafeFunnelEvent('chapter2','diagnosis_completed',{monthlyIncome:300000,answers:['private'],email:'private@example.com'}),{
 event:'mudagiri_chapter2_completed',properties:{chapter:'chapter2'},
},'private answers and amounts must never reach product analytics');
assert.deepEqual(buildSafeFunnelEvent('chapter2','chapter2_v31_share_intent',{method:'native_image',amount:100000,name:'sensitive'}),{
 event:'mudagiri_chapter2_share_attempted',properties:{chapter:'chapter2',method:'native_image'},
});
assert.deepEqual(buildSafeFunnelEvent('chapter2','chapter2_v31_consultation_line_outbound',{placement:'consult_route',diagnosisId:'secret'}),{
 event:'mudagiri_chapter2_line_outbound_clicked',properties:{chapter:'chapter2',placement:'consult_route'},
});
assert.equal(buildSafeFunnelEvent('chapter2','line_friend_added'),null,'never invent LINE follow or booking completion');
assert.equal(buildSafeFunnelEvent('chapter2','consultation_booked'),null,'reservation requires verified server event');
const anonymousId='mg_12345678-1234-1234-1234-123456789012';
const capture=buildPostHogCaptureBody('phc_TestKey123',anonymousId,'chapter2','chapter2_v31_share_intent',{
 method:'native_image',monthlyExpense:900000,name:'private',address:'private',diagnosisId:'private',
});
assert.deepEqual(capture,{
 api_key:'phc_TestKey123',distinct_id:anonymousId,event:'mudagiri_chapter2_share_attempted',
 properties:{chapter:'chapter2',method:'native_image',$process_person_profile:false,$geoip_disable:true},
});
assert.ok(!JSON.stringify(capture).includes('private')&&!JSON.stringify(capture).includes('900000'),'capture body must contain no private inputs');
assert.equal(buildPostHogCaptureBody('invalid',anonymousId,'chapter2','diagnosis_completed'),null,'invalid public project key must fail closed');
assert.equal(buildPostHogCaptureBody('phc_TestKey123','wrong','chapter2','diagnosis_completed'),null,'untrusted session ID must fail closed');
assert.equal(buildSafeFunnelEvent('chapter2','constructor'),null,'inherited properties cannot become analytics events');
assert.equal(buildSafeFunnelEvent('chapter1','toString'),null,'prototype names cannot become events');
assert.equal(hasProductAnalyticsConsent({getItem:()=>null} as any),false,'consent defaults to denied');
assert.equal(hasProductAnalyticsConsent({getItem:()=> 'denied'} as any),false,'denial must disable analytics');
assert.equal(hasProductAnalyticsConsent({getItem:()=> 'granted'} as any),true,'explicit consent must enable only after configuration');
assert.equal(hasProductAnalyticsConsent({getItem:()=>{throw new Error('blocked storage')}} as any),false,'storage failures must fail closed');
assert.equal(trackMudagiriProductEvent('chapter2','diagnosis_completed'),false,'SSR must not send analytics');
const funnel=readFileSync('src/features/money-personality/money-type-funnel-v1.ts','utf8');
assert.match(funnel,/line_bonus_outbound_clicked/);
assert.match(funnel,/trackMudagiriProductEvent/);
console.log('CHAPTER2_V31_RPG_REWARD_QA_PASS all eight JOBs / confirmed and unconfirmed semantics / 1-5-10 / zero / world assets');
