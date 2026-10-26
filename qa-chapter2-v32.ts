import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V32,{chapter2QuestShareLabels} from './ResultScreenChapter2V32';
import Chapter2PeerComparisonCard from './Chapter2PeerComparisonCard';
import {chapter2PeerGapV1} from './chapter2-official-peer-gap-v1';
import {buildSafeFunnelEvent,buildPostHogCaptureBody} from './src/product-funnel-analytics-v1';
import {externalLineContext} from './scripts/coverage-consult-handoff-v1.mjs';

const makeVm=(confirmedA:number,cUpper:number)=>({
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'v32-qa-synthetic',
 v5Counts:{cut:0,optimize:2,protect:3,inspect:2,ok:3,na:2},
 potential:{confirmedA,cUpper},rows:[],firstQuest:null,consultRoute:null
});
const show=(a:number,c:number)=>renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:makeVm(a,c)}));
const uncertain=show(0,17854);
assert.equal(chapter2QuestShareLabels().main,'12カテゴリをチェック');
assert.equal(chapter2QuestShareLabels('戦術ハンター').main,'冒険者：戦術ハンター');
assert.match(chapter2QuestShareLabels('戦術ハンター').sub,/12カテゴリをチェック/);
assert.doesNotMatch(chapter2QuestShareLabels().main+chapter2QuestShareLabels('戦術ハンター').sub,/鑑定完了/,
 'A finished quest must not imply every spending category was appraised');

const verifiedPositive=chapter2PeerGapV1({
 ownMonthlyExpenseYen:100000,ownMonthlyTakeHomeYen:500000,
 peerPctLow:12.4,peerPctHigh:15.6,
 sameExpenseScopeConfirmed:true,sourceVerified:true
});
assert.equal(verifiedPositive.available,true);
if(verifiedPositive.available){
 const card=renderToStaticMarkup(React.createElement(Chapter2PeerComparisonCard,{
  category:'food',label:'食費',gap:verifiedPositive,householdLabel:'二人以上'
 }));
 assert.match(card,/data-peer-three-way-category="food"/);
 assert.match(card,/あなたの負担率/);
 assert.match(card,/20.0%/);
 assert.match(card,/12.4% ～ 15.6%/);
 assert.match(card,/\+4.4pt ～ \+7.6pt/);
 assert.match(card,/\+¥22,000 ～ \+¥38,000/);
 assert.match(card,/統計上の比較差/);
 assert.match(card,/勤労者二人以上世帯/);
 assert.doesNotMatch(card,/今回のあなたの支出/,'optional expense remains absent when not given');
 const withExpense=renderToStaticMarkup(React.createElement(Chapter2PeerComparisonCard,{
  category:'food',label:'食費',gap:verifiedPositive,householdLabel:'二人以上',ownMonthlyExpenseYen:100000
 }));
 assert.match(withExpense,/あなたの支出/);
 assert.match(withExpense,/¥100,000／月/);
 assert.match(withExpense,/data-peer-three-way-category="food"/);
 assert.doesNotMatch(withExpense,/見直し候補：月最大/);
 assert.doesNotMatch(card,/削減できる金額です|確定改善額|見直し候補：月最大/);
}
const verifiedNegative=chapter2PeerGapV1({
 ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:500000,
 peerPctLow:14.8,peerPctHigh:25.3,
 sameExpenseScopeConfirmed:true,sourceVerified:true
});
assert.equal(verifiedNegative.available,true);
if(verifiedNegative.available){
 const card=renderToStaticMarkup(React.createElement(Chapter2PeerComparisonCard,{
  category:'energy',label:'光熱費',gap:verifiedNegative,householdLabel:'単身'
 }));
 assert.match(card,/-13.3pt ～ -2.8pt/);
 assert.match(card,/−¥66,500 ～ −¥14,000/);
 assert.match(card,/全国の参考率/);
}
// The three-way presentation must never render for age/income-only marginals,
// missing worker confirmation, missing head-of-household age, or scope mismatch.

// 2025 e-Stat's income class is an independent reference. It must never
// overwrite the age/size primary comparison, cUpper, or confirmed saving.
const incomeProfile={diagnosisScope:'household',householdSize:4,monthlyTakeHome:400000,annualIncomeBand:'500_599'};
const officialIncomeHTML=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),
 profile:incomeProfile,
 rows:[{category:'food',label:'食費',known:true,amount:64000,diagnosisAmount:64000,
  comparable:103384,comparisonAmount:64000,comparisonQuality:'exact',v5Status:'protect',
  aAmount:0,cUpper:0,applicability:'applicable'},
 {category:'energy',label:'光熱・水道費',known:true,amount:33000,diagnosisAmount:33000,comparisonAmount:33000,
  comparable:26000,comparisonQuality:'exact',v5Status:'inspect',aAmount:0,cUpper:0,applicability:'applicable'},
 {category:'daily',label:'日用品費',known:true,amount:10000,diagnosisAmount:10000,comparisonAmount:10000,
  comparable:8000,comparisonQuality:'exact',v5Status:'inspect',aAmount:0,cUpper:0,applicability:'applicable'}]
}}));
assert.doesNotMatch(officialIncomeHTML,/data-peer-three-way-category=/,'no opt-in and population confirmation; no matched card');
assert.match(officialIncomeHTML,/data-section="INCOME_CLASS_FOOD_CONTEXT"/);
assert.match(officialIncomeHTML,/data-section="INCOME_CLASS_FOOD_ROW"/);
assert.match(officialIncomeHTML,/年齢・世帯の目安と、年収帯の参考を一緒に見る/);
assert.match(officialIncomeHTML,/あなたの支出/);
assert.match(officialIncomeHTML,/あなたの手取りの <b>16.0%<\/b>/,'user expense / own takehome');
assert.doesNotMatch(officialIncomeHTML,/同じ手取り換算 <b>25.8%<\/b>/,'do not confuse pseudo denominator rate with official worker burden rate');
assert.match(officialIncomeHTML,/data-section="JOINT_PEER_COMPARISON_GUIDE"/,
 'Age × household classification × annual income cohort comparison must be introduced explicitly');
assert.doesNotMatch(officialIncomeHTML,/あなたの手取り換算/,
 'Never create pseudo statistical burden by dividing unrelated reference expenses by user take-home');
assert.match(officialIncomeHTML,/同年代 × 世帯区分 × 額面年収帯/,
 'The matched reference priority is stated clearly');

assert.doesNotMatch(officialIncomeHTML,/この参考率を<strong>あなたの手取りに当てはめると/,'income-only reference is not a same-age peer ratio');
assert.match(officialIncomeHTML,/あなたの「光熱・水道費」は/);
assert.match(officialIncomeHTML,/data-worker-rate-category="daily"/,'daily worker reference must be independently sourced');
assert.match(officialIncomeHTML,/data-worker-rate-category="food"/);
assert.match(officialIncomeHTML,/data-worker-rate-category="energy"/);
assert.match(officialIncomeHTML,/年収帯のみの負担率参考/);
assert.match(officialIncomeHTML,/20\.6 ～ 21\.2%/,'observed worker food rates across the 500-599m subcells');
assert.doesNotMatch(officialIncomeHTML,/data-section="REFERENCE_RECHECK_BUFFER"/,'unverified age×income cells must never create a monthly buffer');
assert.doesNotMatch(officialIncomeHTML,/data-dual-clue-category="energy"/,'same food/energy/daily category must not stack worker and all-pop reference buffer');
assert.doesNotMatch(officialIncomeHTML,/属性別＋勤労者の負担率/);
assert.doesNotMatch(officialIncomeHTML,/月 <b>¥9,000<\/b>/,'age-unmatched gap must never appear');
assert.doesNotMatch(officialIncomeHTML,/月 最大 ¥9,000/,'statistical gap must never replace frozen cUpper');
assert.match(officialIncomeHTML,/2024年全国家計構造調査/,'true cross-tab peer rates require 2024 table 1-29');
assert.match(officialIncomeHTML,/月 ¥/);
assert.doesNotMatch(officialIncomeHTML,/原表Excelを開く|e-Statの原表Excelを開く|\.xlsx<\/a>/,'UI must cite source without Excel links');
assert.match(officialIncomeHTML,/500～599万円/);
assert.match(officialIncomeHTML,/¥89,676/);
assert.match(officialIncomeHTML,/¥90,249/);
assert.match(officialIncomeHTML,/data-section="INCOME_CLASS_ENERGY_ROW"/);
assert.match(officialIncomeHTML,/data-section="INCOME_CLASS_DAILY_ROW"/);
assert.match(officialIncomeHTML,/¥5,849/);
assert.match(officialIncomeHTML,/¥6,288/);
assert.match(officialIncomeHTML,/家事雑貨（4.4）/);
assert.match(officialIncomeHTML,/2025年/);
assert.match(officialIncomeHTML,/世帯人数・年齢・地域を掛け合わせた平均ではありません/);
assert.match(officialIncomeHTML,/参考差をムダ額・削減額・見直し候補額に加えない/);
assert.match(officialIncomeHTML,/平均支出 ÷ 平均可処分所得/,'same-cell ratio must be labelled as a ratio of means, not a mean of household ratios');
assert.match(officialIncomeHTML,/同じ所得階級の平均支出 ÷ 平均可処分所得/);
assert.match(officialIncomeHTML,/年収帯のみの負担率参考/);
assert.match(officialIncomeHTML,/年齢は未反映/);
assert.doesNotMatch(officialIncomeHTML,/href="[^"]*e-stat/,'result never sends user to raw government spreadsheet');
assert.doesNotMatch(officialIncomeHTML,/data-section="CANDIDATE_BREAKDOWN"/);
const noGrossBandHtml=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,annualIncomeBand:'unknown'}
}}));
assert.doesNotMatch(noGrossBandHtml,/data-section="INCOME_CLASS_FOOD_CONTEXT"/);
const differentIncomeHTML=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,annualIncomeBand:'1000plus'},
 rows:[{category:'food',label:'食費',known:true,amount:64000,diagnosisAmount:64000,comparisonAmount:64000,
  comparable:103384,comparisonQuality:'exact',v5Status:'protect',aAmount:0,cUpper:0}]
}}));
assert.match(differentIncomeHTML,/¥116,235/);
assert.match(differentIncomeHTML,/¥144,294/);
assert.match(differentIncomeHTML,/data-worker-rate-category="food"/,'high-income validated workers reference still shown');
const smallWorkers=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,annualIncomeBand:'under500'},
 rows:[{category:'food',label:'食費',known:true,amount:95000,diagnosisAmount:95000,comparisonAmount:95000,
  comparable:75000,comparisonQuality:'exact',v5Status:'inspect',cUpper:0}]
}}));
assert.doesNotMatch(smallWorkers,/data-age-income-worker-peer-category=/,'multi-person profile does not verify household-head age');
assert.doesNotMatch(smallWorkers,/data-worker-rate-category="food"/);
const noWorkerScope=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,monthlyTakeHome:null},
 rows:[{category:'food',label:'食費',known:true,amount:95000,diagnosisAmount:95000,comparisonAmount:95000,
  comparable:75000,comparisonQuality:'exact',v5Status:'inspect',cUpper:0}]
}}));
assert.match(noWorkerScope,/data-worker-rate-category="food"/,'official worker population rate can still be shown independently');
assert.doesNotMatch(noWorkerScope,/data-section="REFERENCE_RECHECK_BUFFER"/,'never show a reference buffer without verified age×income cells');

// Multi-person peer reference requires explicitly matching respondent age to
// household head age; never auto-label an unverified household as same-age.
const multiVerifiedAgeInput=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,age:35},
 rows:[{category:'food',label:'食費',known:true,amount:85000,diagnosisAmount:85000,
  comparisonAmount:85000,comparable:80000,comparisonQuality:'exact',
  v5Status:'inspect',aAmount:0,cUpper:0}],
}}));
assert.match(multiVerifiedAgeInput,/data-section="MULTI_PEER_HEAD_AGE_CONFIRM"/,
 'Multi-person respondent must confirm that their age equals household head age');
assert.match(multiVerifiedAgeInput,/id="c2v32-head-age-confirm" type="checkbox"/);
assert.match(multiVerifiedAgeInput,/data-section="PEER_WORKER_STATUS_CONFIRM"/);
assert.match(multiVerifiedAgeInput,/id="c2v32-worker-status-confirm" type="checkbox"/);
assert.match(multiVerifiedAgeInput,/勤労者世帯の参考率を表示する/);
assert.doesNotMatch(multiVerifiedAgeInput,/data-age-income-worker-peer-category=/,
 'Multi-person peer reference is disabled until household-head age and salary-worker status are confirmed');
assert.match(multiVerifiedAgeInput,/回答は比較画面内だけに使うよ/);
const multiUnsupportedAge=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,age:27},
}}));
assert.doesNotMatch(multiUnsupportedAge,/data-section="MULTI_PEER_HEAD_AGE_CONFIRM"/,
 'Do not ask for unnecessary confirmation when public income subcell n<50');
const multiUpperOpenEnded=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,age:35,annualIncomeBand:'1000plus'},
}}));
assert.doesNotMatch(multiUpperOpenEnded,/data-section="MULTI_PEER_HEAD_AGE_CONFIRM"/,
 'Open-ended income group is not a directly comparable gross-income group');
assert.match(multiUpperOpenEnded,/data-section="MULTI_HIGH_INCOME_CLASS_OPTIN"/,
 'Users with broad 1000plus can voluntarily choose the actual official grouped gross band');
assert.match(multiUpperOpenEnded,/id="c2v32-multi-high-income"/,
 'High-income choice belongs only to the optional display, not the frozen profile');
assert.match(multiUpperOpenEnded,/value="1000_1249"/);
assert.match(multiUpperOpenEnded,/value="1250_1499"/);
assert.match(multiUpperOpenEnded,/value="1500plus"/);
assert.doesNotMatch(multiUpperOpenEnded,/data-age-income-worker-peer-category=/,
 'Do not assume which 1000plus published bracket applies without explicit selection');
assert.match(multiUpperOpenEnded,/比較表示のみ変更。確定改善額・未確定上限はそのまま/);
const coResidentIndividual=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,age:35,diagnosisScope:'personal'},
}}));
assert.doesNotMatch(coResidentIndividual,/data-section="MULTI_PEER_HEAD_AGE_CONFIRM"/,
 'Individual income should never be compared to household-income-based official peer group');

for(const marker of ['data-result-version="v32"','POTENTIAL_HERO','POTENTIAL_TREASURE','FUTURE_REWARDS','HOUSEHOLD_BATTLE_RESULTS','CONSULTATION_CTA_TOP','MP_BG_01_GUILD_HALL','MP_BG_02_JOB_UNLOCK','MP_BG_03_NEXT_QUEST']){
 assert.ok(uncertain.includes(marker),'missing section or asset '+marker);
}
assert.match(uncertain,/月 最大 ¥17,854/);
assert.match(uncertain,/¥214,248/);
assert.match(uncertain,/¥1,071,240/);
assert.match(uncertain,/¥2,142,480/);
assert.match(uncertain,/未確定/);
assert.match(uncertain,/実際の節約額・将来の結果を保証するものではなく/);
assert.match(uncertain,/data-section="CANDIDATE_EVIDENCE_JUMP"/,'the entry CTA must point to reasoning, not speculative horizon');
assert.doesNotMatch(uncertain,/data-section="FUTURE_REWARD_JUMP"/,'old future-first hero cue must be removed');
assert.match(uncertain,/見直し候補を確認する/,'no invented evidence promise when reviewUpper has no source rows');
assert.match(uncertain,/未確定の候補を/,'unrealized future premise must be in the primary sentence');
assert.match(uncertain,/10年間で積み重ねたら/);
assert.match(uncertain,/未来の戦利品<\/h2>/,'readable RPG heading stays clean');
assert.doesNotMatch(uncertain,/未来の戦利品（仮定）|未確定の仮定/,'stiff parenthetical should not return');
assert.doesNotMatch(uncertain,/<span class="c2v31-quest-crest"/,'do not stack redundant quest crest next to clear heading');

// CSS selectors for sticky scroll offsets mention data-section names inside
// <style>. Check DOM markup order, not earlier source text in the stylesheet.
const markupOnly=uncertain.replace(/<style>[\s\S]*?<\/style>/,'');
assert.ok(markupOnly.indexOf('data-section="POTENTIAL_HERO"')<markupOnly.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(markupOnly.indexOf('data-section="POTENTIAL_TREASURE"')<markupOnly.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(markupOnly.indexOf('data-section="CATEGORY_ENCYCLOPEDIA"')<markupOnly.indexOf('data-section="FUTURE_REWARDS"'),
 'All twelve category outcomes are now before future projections');
assert.ok(markupOnly.indexOf('data-section="FUTURE_REWARDS"')<markupOnly.indexOf('data-section="HOUSEHOLD_BATTLE_RESULTS"'));
assert.ok(markupOnly.indexOf('data-section="HOUSEHOLD_BATTLE_RESULTS"')<markupOnly.indexOf('data-section="CONSULTATION_CTA_TOP"'));
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
assert.match(mixed,/回答から確認できた改善額/,'confirmedA keeps its evidence-backed meaning');
assert.match(mixed,/実行・節約済みかは別途確認が必要です/,'confirmed opportunity is not proven realized saving');
assert.match(mixed,/契約変更・解約などが完了した実績ではありません/,'plain-language distinction adjacent to monthly figure');
assert.doesNotMatch(mixed,/確認済みの戦利品|確定した改善額/,'do not imply achieved saving just because respondent confirmed an opportunity');
const confirmedOnly=show(1800,0);
assert.match(confirmedOnly,/¥1,800/);
assert.doesNotMatch(confirmedOnly,/10年間の積み重ね/,'no invented future scenario without uncertain candidates');
const empty=show(0,0);
assert.match(empty,/候補額はまだ未特定/);
assert.doesNotMatch(empty,/¥2,142,480/);
assert.doesNotMatch(empty,/data-section="CANDIDATE_EVIDENCE_JUMP"/,'never navigate to invented sources when upper bound is zero');
assert.doesNotMatch(empty,/data-section="CANDIDATE_BREAKDOWN"/,'no arbitrary list when there are no candidates');
const candidateHtml=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,17854),
 rows:[
  {category:'mobile',label:'通信費',known:true,amount:11500,cUpper:5500,cMethod:'mobile',appraisal:{mobileScope:'mobileOnly',mobileCarrier:'major'},nextAction:'スマホ料金プランを確認',v5Status:'optimize'},
  {category:'food',label:'食費',known:true,amount:54000,comparable:37860,cUpper:12354,cMethod:'standard',nextAction:'食費の内訳を確認',v5Status:'inspect'},
 ],
 firstQuest:{category:'mobile',label:'通信費',nextAction:'料金プランを確認'}
}}));

// Simplified result: keep 2 candidate amounts and one visible action;
 // the threshold math is still accessible in the optional reason disclosure.
assert.match(candidateHtml,/>2カテゴリ<\/strong>/,'treasure shows compact count without a split phrase');
assert.match(candidateHtml,/まず、見直し候補と最初の一歩を見る/,'When source rows exist, lead directly to a candidate action; details are optional');
const treasureMarkup=candidateHtml.slice(candidateHtml.indexOf('data-section="POTENTIAL_TREASURE"'),candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"'));
assert.doesNotMatch(treasureMarkup,/最大 ¥17,854/,'avoid repeating the same prominent amount in stacked hero and treasure');
assert.match(candidateHtml,/CANDIDATE_BREAKDOWN/);
assert.match(candidateHtml,/宝箱の中身はこれ/);
assert.equal((candidateHtml.match(/data-candidate-category=/g)||[]).length,2,'all contributor amounts must remain in result HTML');
const breakdownHTML=candidateHtml.slice(candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"'),candidateHtml.indexOf('data-section="FUTURE_REWARDS"'));
for(const label of ['通信費','食費','最大 ¥5,500','最大 ¥12,354','候補になった理由','まず確かめる：','スマホ料金プランを確認','食費の内訳を確認','月額・未確定','参考上限']){
 assert.ok(breakdownHTML.includes(label),'missing candidate evidence '+label);
}
assert.equal((breakdownHTML.match(/候補になった理由/g)||[]).length,1,'only the top candidate repeats detail before the definitive 12-category list');
assert.match(breakdownHTML,/今回の入力：/,'largest candidate shows actual expense');
assert.match(breakdownHTML,/¥54,000/,'largest candidate food expense remains visible');
assert.match(breakdownHTML,/¥37,860/,'largest food comparison clearly remains non-saving context');
assert.match(breakdownHTML,/data-section="OTHER_CANDIDATE_SUMMARIES"/,'other candidates have an optional compact disclosure');
assert.match(breakdownHTML,/ほか1件の見直し候補を見る/,'other candidate count visible');
assert.match(breakdownHTML,/差額がそのまま削減額ではないよ/,'No unsupported savings inference survives in the optional evidence');
assert.equal((breakdownHTML.match(/まず確かめる：/g)||[]).length,1,'One visible concrete next action precedes optional source details');
assert.ok(candidateHtml.includes('data-comparison-category="mobile"'),'secondary mobile details remain in 12-category ledger');
assert.ok(candidateHtml.indexOf('data-section="POTENTIAL_TREASURE"')<candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"'));
assert.ok(candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"')<candidateHtml.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(candidateHtml.indexOf('data-section="FUTURE_REWARDS"')<candidateHtml.indexOf('data-section="CONSULTATION_CTA_TOP"'));
assert.doesNotMatch(candidateHtml,/FIRST_REVIEW_ACTION|data-section="NEXT_QUEST"/,
 'Repeated first-action cards are removed from the initial result');
assert.match(candidateHtml,/まず確かめる/,'The concrete primary action is visible in the candidate itself');
assert.match(candidateHtml,/PRIMARY_CANDIDATE_REASON/,'Why this candidate was selected remains available on demand');
assert.match(candidateHtml,/未確定の候補を/,'Future reward math remains explicitly hypothetical');
assert.match(candidateHtml,/本当に見直せるか、一緒に確かめよう/);
assert.match(candidateHtml,/「いつかやりたいこと」を、今日できる一歩に変える作戦/,'small next step framed positively, not fear of old age');
assert.match(empty,/「いつかやりたいこと」を、今日できる小さな一歩につなげよう/,'no savings candidates still receives a voluntary action');
assert.doesNotMatch(candidateHtml,/老後に後悔|今すぐ申し込まないと/,'no regret/fear-based pressure');
// Coverage consultation must be an optional, dedicated pathway after the
// financial RPG reward, not a disguised savings amount or hidden accordion.
const coverageVm={
 ...makeVm(0,17854),
 rows:[{category:'insurance',known:true,applicability:'applicable',amount:11500,
  appraisal:{insurancePurpose:'unclear',insuranceLastReview:'never'},v5Status:'optimize',cUpper:0}]
};
const coverageHtml=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:coverageVm}));
for(const mark of ['COVERAGE_AWARENESS','COVERAGE_LINE_CONSULT',
 '公式LINEで保障の相談をする','医療の変化','通院・薬物療法','暮らしの変化','保険料・重複']){
 assert.ok(coverageHtml.includes(mark),'visible coverage consultation marker '+mark);
}
assert.ok(coverageHtml.indexOf('data-section="FUTURE_REWARDS"')<coverageHtml.indexOf('data-section="COVERAGE_AWARENESS"'));
assert.ok(coverageHtml.indexOf('data-section="COVERAGE_AWARENESS"')<coverageHtml.indexOf('data-section="CONSULTATION_CTA_TOP"'));
const exemption=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...coverageVm,rows:[{...coverageVm.rows[0],appraisal:{insurancePurpose:'clear'}}]
}}));
assert.doesNotMatch(exemption,/COVERAGE_LINE_CONSULT/,'fully informed user not nudged to insurance advice');
const recent=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...coverageVm,rows:[{...coverageVm.rows[0],appraisal:{insurancePurpose:'mostly',insuranceLastReview:'within1y'}}]
}}));
assert.doesNotMatch(recent,/COVERAGE_LINE_CONSULT/,'recently reviewed user not nudged');
assert.doesNotMatch(coverageHtml,/LINEで保障相談をすると保険料が下がる/,'no false saving or insurance promise');

const jobHandoff={
 version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',anonymousUserId:'test',sessionId:'test',
 completedAt:'2026-10-11T00:00:00Z',jobCode:'FDM',jobName:'先回り司令官',primaryStyle:'DRIVE'
} as const;
const withJob=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:makeVm(0,17854),chapter1:jobHandoff}));
assert.match(withJob,/冒険者JOBとクリア記念のカード/);
assert.match(withJob,/先回り司令官/);
assert.ok(withJob.indexOf('data-section="CHAPTER1_JOB_BRIDGE"')<withJob.indexOf('data-section="POTENTIAL_HERO"'), 'same Chapter 1 JOB must appear in the Chapter 2 opening before the numbers');
assert.equal((withJob.match(/data-section="CHAPTER1_JOB_BRIDGE"/g)||[]).length,1,'no duplicate JOB card interrupts the second chapter');
assert.match(withJob,/MUDAGIRI QUEST LOG/,'chapter progression matches Chapter 1 design grammar');
assert.match(withJob,/第1章で獲得した冒険者/);
assert.match(withJob,/前進重視/,'STYLE name matches the finalized Japanese four-style names');
assert.match(withJob,/一緒に戦った戦果を見よう/,'Mudagiri talks to the same adventurer');

const {JOB_CHARACTER_ASSETS}=await import('./src/features/money-personality/job-character-assets-v1');
for(const asset of Object.values(JOB_CHARACTER_ASSETS)){
 for(const [style,jp] of [['DRIVE','前進'],['ENJOY','楽しさ'],['SECURE','安心'],['OPTIMIZE','納得']] as const){
  const html=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:makeVm(0,17854),chapter1:{...jobHandoff,jobCode:asset.jobCode,jobName:asset.name,primaryStyle:style}}));
  const block=html.slice(html.indexOf('data-section="CHAPTER1_JOB_BRIDGE"'),html.indexOf('class="c2v31-hero-stage"'));
  assert.ok(block.includes(asset.name),'canonical JOB must match C1 '+asset.jobCode);
  assert.ok(block.includes(asset.file),'canonical artwork must match C1 '+asset.jobCode);
  assert.ok(block.includes(jp+'重視'),'STYLE label must match Japanese system '+style);
  assert.equal((html.match(/data-section="CHAPTER1_JOB_BRIDGE"/g)||[]).length,1,'single hero JOB '+asset.jobCode+'/'+style);
 }
}

assert.doesNotMatch(uncertain,/data-section="CHAPTER1_JOB_BRIDGE"/,'no invented JOB without valid handoff');
assert.match(uncertain,/未連携/,'direct chapter 2 entry cannot falsely imply Chapter 1 completion');
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
assert.equal((monsterHtml.match(/data-section="MUDAGIRI_TALK"/g)||[]).length,2,'two intentional companion transitions instead of repeated interruptions');
assert.equal((monsterHtml.match(/class="c2v2-entry c2v32-enemy-record"/g)||[]).length,12,'show all 12 canonical enemy cards');
assert.match(monsterHtml,/ENEMY_BATTLE_PREVIEW/);
assert.match(monsterHtml,/ENEMY_FULL_GALLERY/);
assert.match(monsterHtml,/data-section="CATEGORY_COMPARISON_OVERVIEW"/,'all 12 comparison rows must be available without expanding atlas');
assert.equal((monsterHtml.match(/data-comparison-category=/g)||[]).length,12,
 'All twelve frozen category cards appear in the one consolidated atlas');
assert.doesNotMatch(monsterHtml,/data-section="COMPARISON_REST_TOGGLE"/,
 'Do not hide eight categories behind another global expansion button');
assert.match(monsterHtml,/class="c2v22-comparison-row c2v32-category-accordion"/,
 'Every category is a compact individually expandable result');
assert.match(monsterHtml,/data-section="CATEGORY_ALL_VISIBLE_NOTE"/,
 'Summary explicitly states that all categories are present');
assert.match(candidateHtml,/OTHER_REFERENCE_/,'unmatched secondary comparisons stay discoverable in optional disclosure');
assert.match(candidateHtml,/c2v32-auxiliary-comparisons/,'extra narratives must not clutter the first glance');
assert.match(monsterHtml,/c2v32-single-next-action/,'each flagged row gets one concise next action');
assert.match(monsterHtml,/CATEGORY_NEXT_ACTION_/,'flagged category outcome remains individually addressable');
assert.match(monsterHtml,/data-section="COMPARISON_OVERVIEW_JUMP"/,'visible link to comparison on the battle result');
assert.match(monsterHtml,/判定の手がかり/,'numeric reference is not required to explain a decision');
assert.doesNotMatch(monsterHtml,/>数値比較なし</,'avoid high-salience empty benchmark labels');

assert.match(monsterHtml,/敵キャラと詳しい説明を見る（任意）/,'atlas is optional RPG art, not a mandatory evidence tunnel');
const compareTest=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,12354),rows:[
  {category:'food',label:'食費',known:true,amount:54000,comparisonAmount:54000,comparable:37860,comparisonQuality:'exact',comparisonSourceVersion:'FOOD_V1.1_MULTI_2025',comparisonContext:{criteria:['2人世帯']},v5Status:'inspect',cUpper:12354,cMethod:'standard',nextAction:'食費の内訳を見る'},
  {category:'sub',label:'サブスク',known:true,amount:4200,comparisonAmount:null,comparable:null,comparisonQuality:'none',v5Status:'cut',aAmount:1200,cUpper:0},
  {category:'energy',label:'光熱・水道費',known:true,amount:15500,comparisonAmount:null,comparable:19000,comparisonQuality:'exact',v5Status:'inspect',cUpper:0},
  {category:'insurance',label:'保険',known:true,amount:11000,comparisonAmount:null,comparable:null,comparisonQuality:'none',v5Status:'inspect',cUpper:0,
   v5ReferencePrimary:{monthly:22500,criteria:['40代','2人以上世帯'],sourceVersion:'JILI_2024_HOUSEHOLD_PREMIUM_BY_HOH_AGE',label:'同年代の2人以上世帯',note:'保険の表示参考'}}
 ]}}));
const overviewStart=compareTest.indexOf('data-section="CATEGORY_COMPARISON_OVERVIEW"');
assert.ok(overviewStart>=0,'comparison summary remains present before optional gallery');
const overview=compareTest.slice(overviewStart,compareTest.indexOf('data-optional="enemy-atlas"',overviewStart));
assert.equal((overview.match(/data-comparison-category=/g)||[]).length,4);
assert.equal((overview.match(/class="c2v23-comparison-enemy"/g)||[]).length,4,'each row shows its official enemy');
assert.match(overview,/クイダオーレの敵キャラ/);
assert.match(overview,/サブスクサキュバスの敵キャラ/);
assert.doesNotMatch(overview,/>数値比較なし</,'decision basis replaces giant no-reference box');
assert.match(overview,/あなたの支出/);
assert.match(overview,/¥54,000/);
assert.match(overview,/属性別の支出目安（同条件の平均ではない）/,'unmatched attribute amount is never presented as a same-cohort average');
assert.match(overview,/¥37,860/);
assert.match(overview,/比較条件：/);
assert.match(overview,/2人世帯/);
assert.match(overview,/家計調査（2025年）をもとにした参考目安/);
assert.match(overview,/約1.10倍/,'source of review candidate threshold visible without nested detail');
assert.match(overview,/見直し候補：月最大 ¥12,354（未確定）/);
assert.match(overview,/data-comparison-category="sub" data-comparison-available="false"/);
assert.match(overview,/利用状況で判断/,'subscription category shows decision basis, not a fake average');
assert.match(overview,/使っていない契約・重複・解約可能かどうか/);
assert.match(overview,/data-comparison-category="energy" data-comparison-available="false"/,'null comparison scope must not fall back to diagnosis amount');
assert.doesNotMatch(overview,/¥19,000/,'no benchmark shown without compatible comparison amount');
assert.match(overview,/data-comparison-category="insurance" data-comparison-available="true"/,'V5 primary lens is displayed even when frozen V4 quality is none');
assert.match(overview,/¥22,500/,'V5 reference is visible in comparison list');
assert.match(overview,/40代・2人以上世帯/,'V5 basis shown adjacent');
assert.match(overview,/生命保険文化センターの調査（2024年）/,'V5 research provenance accurate');
assert.doesNotMatch(overview,/¥1,200.*節約済み/,'confirmed opportunity is not a realized saving');

assert.equal((monsterHtml.match(/class="c2v32-optional-detail"/g)||[]).length,2,'Remove redundant first-step, retaining atlas and goal optional details');
assert.match(monsterHtml,/data-optional="enemy-atlas"/);
assert.match(monsterHtml,/data-optional="future-goal"/);
assert.doesNotMatch(monsterHtml,/data-optional="first-step"/,'No repeated first-step CTA');
for(const enemy of Object.values(ENEMY_ASSETS)){
 assert.ok(monsterHtml.includes(enemy.name),'named enemy is missing: '+enemy.name);
 assert.ok(monsterHtml.includes(enemy.normal),'official enemy image is missing: '+enemy.id);
}
assert.match(monsterHtml,/対象外/);
assert.match(monsterHtml,/守る/);
assert.match(monsterHtml,/MUDAGIRI_POSE_04_EXPLAIN/);
assert.match(monsterHtml,/MUDAGIRI_POSE_12_PROUD/);
assert.match(monsterHtml,/「守る」「そのままでOK」も、今回の戦果だ/,'recognize evidence-based strengths, not only deficits');
assert.doesNotMatch(empty,/「守る」「そのままでOK」も、今回の戦果だ/,'no claim of positive categories without actual assessed rows');
assert.match(empty,/まずは今できることを1つ、確かめよう/,'a first step should still exist for zero verified positive categories');
assert.doesNotMatch(monsterHtml,/人生がうまくいかない人|学習性無力感|ワースト1/,'no shaming or diagnosis-by-headline');
assert.match(monsterHtml,/未確定の候補を/,'future scenario is explicitly a hypothetical, not realized savings');
const source=(await import('node:fs')).readFileSync('ResultScreenChapter2V32.tsx','utf8');
assert.match(source,/reviewUpper\*120/);
assert.match(source,/createQuestShareCard\(chapter1\?\.jobCode\)/);
assert.match(source,/loadImage\(job\?\.file\|\|ART\.result\)/);
assert.doesNotMatch(source,/confirmed\*120|confirmed\+reviewUpper|cUpper\+confirmedA/);
console.log('CHAPTER2_V32_POTENTIAL_FIRST_QA_PASS: zero confirmed, scenario, both, neither, honest labels, visual hierarchy');

// A visual benchmark must also disclose whether beauty/fashion is an
// age-only household MODEL or a sex-by-age single-person table.
const beautyExample=(sourceVersion:string)=>renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),
 rows:[{category:'beautyFashion',label:'美容・服飾費',known:true,applicability:'applicable',
  amount:50000,comparisonAmount:50000,comparable:20039,comparisonQuality:'reference',
  comparisonSourceVersion:sourceVersion,comparisonContext:{criteria:[]},
  v5Status:'inspect',cUpper:0,nextAction:'内訳を確認'}]
}}));
assert.match(beautyExample('BEAUTY_FASHION_V1.1_MULTI_AGE_MODEL_2025'),/年代別の参考モデル（世帯人数別ではない）/);
assert.match(beautyExample('BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025'),/性別と年代を組み合わせた比較/);
assert.match(beautyExample('BEAUTY_FASHION_V1.0_SINGLE_2025'),/単身・年代別の比較/);

// A frozen 2026-09-30 income-ratio result combines separate official tables.
// It may remain visible while P0 is reconciled, but must never be presented as
// a directly observed household-size × income mean.
const modeledIncome=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),
 rows:[{category:'food',label:'食費',known:true,applicability:'applicable',
  amount:120000,comparisonAmount:120000,comparable:110000,comparisonQuality:'exact',
  comparisonModelEstimate:true,comparisonSourceVersion:'FOOD_V1.1_MULTI_2025',
  comparisonContext:{criteria:['4人世帯','人数別基準×年収帯の推計（直接集計ではない）']},
  v5Status:'inspect',cUpper:0,nextAction:'食費の内訳を確認'}]
}}));
assert.match(modeledIncome,/統計を組み合わせた推計値/,'modeled income x size is never represented as directly measured mean');
assert.match(modeledIncome,/人数別基準×年収帯の推計（直接集計ではない）/,'display explicit lack of direct cross table');
assert.doesNotMatch(modeledIncome,/今回の支出は.*節約済み/,'no claimed savings based on model');

// Marketing / privacy / buzz: insurance and life-plan LINE funnels must be
// distinguishable without transporting health data, actual premiums or names.
const safeCoverage=buildSafeFunnelEvent('chapter2','chapter2_v32_coverage_line_message_outbound',{
 placement:'coverage_review',insurancePremium:85000,diagnosisId:'private',
 insuranceDiagnosis:'private',medicalHistory:'private'
});
assert.deepEqual(safeCoverage,{
 event:'mudagiri_chapter2_coverage_line_outbound_clicked',
 properties:{chapter:'chapter2',placement:'coverage_review'},
});
for(const [name,expected] of [
 ['chapter2_v32_coverage_consultation_clicked','mudagiri_chapter2_coverage_consultation_opened'],
 ['chapter2_v32_coverage_line_copy_success','mudagiri_chapter2_coverage_message_copied'],
 ['chapter2_v32_coverage_line_copy_failed','mudagiri_chapter2_coverage_message_copy_failed'],
] as const){
 assert.equal(buildSafeFunnelEvent('chapter2',name,{placement:'coverage_review'})?.event,expected);
}
const safeLifeplan=buildSafeFunnelEvent('chapter2','chapter2_v31_consultation_line_outbound',{placement:'consult_route',householdSalary:500000});
assert.equal(safeLifeplan?.properties.placement,'consult_route','lifeplan and coverage remain distinct');
assert.notEqual(safeLifeplan?.event,safeCoverage?.event,'insurance conversion intent must not be merged into general lifeplan');
const post=buildPostHogCaptureBody('phc_TestKey123','mg_12345678-1234-1234-1234-123456789012','chapter2','chapter2_v32_coverage_line_message_outbound',{placement:'coverage_review',confirmedMonthly:9999999,condition:'private'});
assert.ok(post);
assert.equal(post?.properties?.placement,'coverage_review');
assert.ok(!JSON.stringify(post).includes('9999999')&&!JSON.stringify(post).includes('private'),'PostHog only receives allowlisted non-sensitive funnel properties');
assert.equal(buildSafeFunnelEvent('chapter2','line_friend_added'),null,'friend-add can only be measured at LINE provider, not guessed from click');
assert.equal(buildSafeFunnelEvent('chapter2','appointment_booked'),null,'booking is an independently verified downstream stage');

const privateLead={
 diagnosisId:'diagnosis_synthetic',handoffCode:'MG-TEST',anonymousUserId:'sensitive_anonymous_id',
 rawExpenses:{food:95000},monthlyIncome:700000,confirmedMonthly:9999,potentialUpper:150000,
 insurancePurpose:'private',healthInformation:'private',chapter1Link:{primaryStyle:'ENJOY'}
};
const lifeExternal=externalLineContext({
 diagnosisId:'diagnosis_synthetic',handoffCode:'MG-TEST',placement:'consult_route',
 firstQuest:'food',goal:'home',confirmedMonthly:9999,anonymousUserId:'sensitive_anonymous_id'
},privateLead);
assert.deepEqual(lifeExternal,{
 diagnosisId:'diagnosis_synthetic',handoffCode:'MG-TEST',placement:'consult_route',
 firstQuest:'food',goal:'home',consultPrimary:'lifeplan',consultSelectedTopic:'lifeplan'
},'external life-plan callback is allowlisted and cannot include household values');
assert.ok(!JSON.stringify(lifeExternal).includes('95000')&&!JSON.stringify(lifeExternal).includes('sensitive'),'no private amounts or Chapter1 data forwarded externally');
assert.deepEqual(externalLineContext({
 diagnosisId:'diagnosis_synthetic',handoffCode:'MG-INS',placement:'coverage_review',
 healthInformation:'private'
},privateLead),{
 diagnosisId:'diagnosis_synthetic',firstQuest:null,placement:'coverage_review',
 handoffCode:'MG-INS',goal:null,consultPrimary:'lifeplan',consultSelectedTopic:'insurance',insuranceReview:true
},'dedicated coverage intent stays minimal and identifiable');
assert.equal(externalLineContext({placement:'consult_route'},{diagnosisId:'synthetic'}),null,'no handoff code -> fail closed');
assert.equal(externalLineContext({diagnosisId:'diagnosis_synthetic',handoffCode:'MG-TEST',placement:'consult_route',goal:'medical_history'},privateLead)?.goal,null,'unapproved goal strings never reach callbacks');

// Chapter 2 UI cannot pass while underlying benchmark/scope/confirmed-saving regressions fail.
await import('./qa-resolver-v2');
// Production-baseline contract invariants + verified 2025 income table; old
// candidate-only legacy income projection tests are intentionally excluded.
await import('./qa-comparable-income-matrix-v1');
await import('./qa-income-class-food-reference-v1');
await import('./qa-income-class-energy-reference-v1');
await import('./qa-income-class-daily-reference-v1');




await import('./qa-scope-v4');
await import('./qa-result-v5');
await import('./qa-chapter1-linkage-v1');
await import('./qa-chapter2-recognition-v1');
