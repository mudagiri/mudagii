import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V32 from './ResultScreenChapter2V32';
import {buildSafeFunnelEvent,buildPostHogCaptureBody} from './src/product-funnel-analytics-v1';
import {externalLineContext} from './scripts/coverage-consult-handoff-v1.mjs';

const makeVm=(confirmedA:number,cUpper:number)=>({
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'v32-qa-synthetic',
 v5Counts:{cut:0,optimize:2,protect:3,inspect:2,ok:3,na:2},
 potential:{confirmedA,cUpper},rows:[],firstQuest:null,consultRoute:null
});
const show=(a:number,c:number)=>renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:makeVm(a,c)}));
const uncertain=show(0,17854);
// 2025 e-Stat's income class is an independent reference. It must never
// overwrite the age/size primary comparison, cUpper, or confirmed saving.
const incomeProfile={diagnosisScope:'household',householdSize:4,annualIncomeBand:'500_599'};
const officialIncomeHTML=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),
 profile:incomeProfile,
 rows:[{category:'food',label:'食費',known:true,amount:64000,diagnosisAmount:64000,
  comparable:103384,comparisonAmount:64000,comparisonQuality:'exact',v5Status:'protect',
  aAmount:0,cUpper:0,applicability:'applicable'}]
}}));
assert.match(officialIncomeHTML,/data-section="INCOME_CLASS_FOOD_CONTEXT"/);
assert.match(officialIncomeHTML,/500～599万円/);
assert.match(officialIncomeHTML,/¥89,676/);
assert.match(officialIncomeHTML,/¥90,249/);
assert.match(officialIncomeHTML,/2025年/);
assert.match(officialIncomeHTML,/世帯人数・年齢・地域を掛け合わせた平均ではありません/);
assert.match(officialIncomeHTML,/この差はムダ額・削減額・見直し候補額に加えない/);
assert.doesNotMatch(officialIncomeHTML,/data-section="CANDIDATE_BREAKDOWN"/);
const noGrossBandHtml=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,annualIncomeBand:'unknown'}
}}));
assert.doesNotMatch(noGrossBandHtml,/data-section="INCOME_CLASS_FOOD_CONTEXT"/);
const differentIncomeHTML=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm:{
 ...makeVm(0,0),profile:{...incomeProfile,annualIncomeBand:'1000plus'}
}}));
assert.match(differentIncomeHTML,/¥116,235/);
assert.match(differentIncomeHTML,/¥144,294/);

for(const marker of ['data-result-version="v32"','POTENTIAL_HERO','POTENTIAL_TREASURE','FUTURE_REWARDS','HOUSEHOLD_BATTLE_RESULTS','CONSULTATION_CTA_TOP','NEXT_QUEST','MP_BG_01_GUILD_HALL','MP_BG_02_JOB_UNLOCK','MP_BG_03_NEXT_QUEST']){
 assert.ok(uncertain.includes(marker),'missing section or asset '+marker);
}
assert.match(uncertain,/月 最大 ¥17,854/);
assert.match(uncertain,/¥214,248/);
assert.match(uncertain,/¥1,071,240/);
assert.match(uncertain,/¥2,142,480/);
assert.match(uncertain,/未確定/);
assert.match(uncertain,/実際の削減額や将来の結果を保証するものではなく/);
assert.match(uncertain,/data-section="CANDIDATE_EVIDENCE_JUMP"/,'the entry CTA must point to reasoning, not speculative horizon');
assert.doesNotMatch(uncertain,/data-section="FUTURE_REWARD_JUMP"/,'old future-first hero cue must be removed');
assert.match(uncertain,/見直し候補を確認する/,'no invented evidence promise when reviewUpper has no source rows');
assert.match(uncertain,/まだ確定した金額じゃないよ。実際に減らせるかは確認してから。/);
assert.match(uncertain,/10年間で積み重ねたら/);
assert.match(uncertain,/未来の戦利品<\/h2>/,'readable RPG heading stays clean');
assert.doesNotMatch(uncertain,/未来の戦利品（仮定）|未確定の仮定/,'stiff parenthetical should not return');
assert.doesNotMatch(uncertain,/<span class="c2v31-quest-crest"/,'do not stack redundant quest crest next to clear heading');

// CSS selectors for sticky scroll offsets mention data-section names inside
// <style>. Check DOM markup order, not earlier source text in the stylesheet.
const markupOnly=uncertain.replace(/<style>[\s\S]*?<\/style>/,'');
assert.ok(markupOnly.indexOf('data-section="POTENTIAL_HERO"')<markupOnly.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(markupOnly.indexOf('data-section="POTENTIAL_TREASURE"')<markupOnly.indexOf('data-section="FUTURE_REWARDS"'));
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

// Four-lens UX contract: the amount must be immediately explained, no "open
// details" required for the *main* monthly upper bound. All contributing rows
// appear before any annualization, personality card or meeting CTA.
assert.match(candidateHtml,/>2カテゴリ<\/strong>/,'treasure shows compact count without a split phrase');
assert.match(candidateHtml,/まず、見直し候補の理由を見る/,'when source rows exist, invite explanation before scenario numbers');
const treasureMarkup=candidateHtml.slice(candidateHtml.indexOf('data-section="POTENTIAL_TREASURE"'),candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"'));
assert.doesNotMatch(treasureMarkup,/最大 ¥17,854/,'avoid repeating the same prominent amount in stacked hero and treasure');
assert.match(candidateHtml,/CANDIDATE_BREAKDOWN/);
assert.match(candidateHtml,/宝箱の中身はこれ/);
assert.equal((candidateHtml.match(/data-candidate-category=/g)||[]).length,2,'every positive cUpper contributor is initially visible');
const breakdownHTML=candidateHtml.slice(candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"'),candidateHtml.indexOf('data-section="FIRST_REVIEW_ACTION"'));
for(const label of ['通信費','食費','最大 ¥5,500','最大 ¥12,354','候補になった理由：','確かめること：','スマホ料金プランを確認','食費の内訳を確認','月額・未確定','まだ削減できると決まった金額ではない']){
 assert.ok(breakdownHTML.includes(label),'missing visible candidate evidence '+label);
}
assert.equal((breakdownHTML.match(/候補になった理由：/g)||[]).length,2,'each candidate must have inline evidence');
assert.match(breakdownHTML,/今回の入力：/,'actual expense visible when known');
assert.match(breakdownHTML,/¥54,000/,'food entered monthly not hidden in gallery');
assert.match(breakdownHTML,/¥37,860/,'food comparison amount transparent where known');
assert.match(breakdownHTML,/¥11,500/,'mobile entered monthly shown as source');
assert.match(breakdownHTML,/月6,000円を超える部分/,'mobile contract-aware upper basis shown');
assert.match(breakdownHTML,/平均との差がそのまま削減額になるわけではありません/,'no interpretation of benchmark as savings');

assert.equal((breakdownHTML.match(/確かめること：/g)||[]).length,2,'each candidate must give a practical next check');
assert.ok(candidateHtml.indexOf('data-section="POTENTIAL_TREASURE"')<candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"'));
assert.ok(candidateHtml.indexOf('data-section="CANDIDATE_BREAKDOWN"')<candidateHtml.indexOf('data-section="FUTURE_REWARDS"'));
assert.ok(candidateHtml.indexOf('data-section="FUTURE_REWARDS"')<candidateHtml.indexOf('data-section="CONSULTATION_CTA_TOP"'));
assert.match(candidateHtml,/FIRST_REVIEW_ACTION/);
assert.match(candidateHtml,/最初に確かめるなら/);
assert.match(candidateHtml,/食費の内訳を確認/);
assert.ok(candidateHtml.indexOf('data-section="FIRST_REVIEW_ACTION"')<candidateHtml.indexOf('data-section="FUTURE_REWARDS"'));
assert.match(candidateHtml,/もし見直し候補を/);
assert.match(candidateHtml,/まだ確定した金額じゃないよ。実際に減らせるかは確認してから。/,'future values describe a conditional scenario, not earned returns');
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
assert.equal((monsterHtml.match(/data-comparison-category=/g)||[]).length,12,'all 12 category amounts/benchmarks immediately readable');
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
assert.match(overview,/今回の入力/);
assert.match(overview,/¥54,000/);
assert.match(overview,/近い条件の目安/,'numeric compare is labeled as guidance, not automatic savings');
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

assert.equal((monsterHtml.match(/class="c2v32-optional-detail"/g)||[]).length,3,'optional deep exploration does not interrupt main decision path');
assert.match(monsterHtml,/data-optional="enemy-atlas"/);
assert.match(monsterHtml,/data-optional="future-goal"/);
assert.match(monsterHtml,/data-optional="first-step"/);
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
assert.match(monsterHtml,/まだ確定した金額じゃないよ。実際に減らせるかは確認してから。/,'future scenario is clearly conditional across category cases');
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




await import('./qa-scope-v4');
await import('./qa-result-v5');
await import('./qa-chapter1-linkage-v1');
await import('./qa-chapter2-recognition-v1');
