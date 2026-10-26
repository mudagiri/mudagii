import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const url=process.env.HIGH_INCOME_QA_URL||'http://127.0.0.1:4182/qa-high-income-browser.html';
const out='integration-v32-mobile-qa/'+engine;
await fs.mkdir(out,{recursive:true});
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'ja-JP',colorScheme:'dark'});
const page=await context.newPage();
const errors=[],outbound=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{
 const target=new URL(r.url());
 if(!['127.0.0.1','localhost'].includes(target.hostname)&&['http:','https:'].includes(target.protocol)){
  outbound.push(target.origin);
 }
});
await page.route('**/*',async route=>{
 const request=route.request(),target=new URL(request.url());
 if(['http:','https:'].includes(target.protocol)&&!['127.0.0.1','localhost'].includes(target.hostname)){
  await route.abort();
 }else await route.continue();
});
const peers=()=>page.locator('[data-age-income-worker-peer-category]');
const food=()=>page.locator('[data-age-income-worker-peer-category="food"]');
const annual=page.locator('#c2v32-multi-high-income');
const age=page.locator('#qa-head-age');
const head=page.locator('#c2v32-head-age-confirm');
const worker=page.locator('#c2v32-worker-status-confirm');
const matchStatus=page.locator('[data-section="MULTI_HIGH_INCOME_MATCH_STATUS"]');
async function changeAge(n){await age.selectOption(String(n));}
async function selectGross(band){await annual.selectOption(band);}
async function assertRate(pct){
 await food().waitFor({state:'visible',timeout:12000});
 const primary=page.locator('[data-comparison-category="food"] .c2v32-peer-gap-card--three-way');
 await primary.waitFor({state:'visible'});
 const text=await primary.innerText();
 assert.ok(text.includes(pct),`Food official reference should be ${pct}, got ${text.slice(0,500)}`);
 assert.equal(await peers().count(),3,'All 3 original public expenses are visible');
 assert.ok(text.includes('あなたの負担率'),'Own monthly take-home ratio is visible in the matched peer card');
 assert.ok((await primary.textContent()).includes('2024年'),'Verified source year stays documented in optional card method');
 assert.ok(text.includes('あなたの支出'),'Actual spend is visible alongside matched ratios');
 assert.equal(await page.locator('[data-comparison-category="food"] .c2v32-merged-values').count(),0,
  'Once the 3-way card is verified, hide the old duplicate two-column comparison');
}
try{
 await page.goto(url,{waitUntil:'networkidle'});
 await page.locator('[data-result-version="v32"]').waitFor({state:'visible',timeout:18000});
 assert.match(await page.locator('[data-section="HOUSEHOLD_BATTLE_RESULTS"]').innerText(),/12カテゴリの判定状況/,
  'Completed quest must not claim that every unknown spending category was fully appraised');
 assert.equal(await page.locator('[data-section="MULTI_HIGH_INCOME_CLASS_OPTIN"]').count(),1);
 const legend=page.locator('[data-section="OFFICIAL_12_CATEGORY_REFERENCE_LEGEND"]');
 assert.equal(await legend.count(),1,'One readable source-scope guide must precede all twelve enemy cards');
 assert.equal(await legend.evaluate(el=>el.open),false,
  'Complete official source-scope explanation is hidden by default');
 assert.equal(await page.locator('[data-section="PEER_2024_CATEGORY_COVERAGE_AUDIT"]').count(),0,
  'Do not duplicate category-by-category methodology before the actual results');
 await legend.locator('summary').click();
 const sourceLegend=await legend.innerText();
 for(const marker of ['食費・光熱水道・日用品','ほかの7カテゴリ','サブスク・自己投資','標本数']){
  assert.ok(sourceLegend.includes(marker),'Missing optional official source-scope evidence: '+marker);
 }
 await legend.locator('summary').click();
 assert.ok(!(await page.locator('[data-section="INCOME_BURDEN_CONTEXT"]').innerText()).includes('同年代 × 同世帯'),
  'Two-or-more worker statistics are not falsely labeled exact same household size');
 const compareCondition=page.locator('[data-section="PEER_COMPARISON_CONDITIONS_SUMMARY"]');
 assert.match(await compareCondition.innerText(),/45歳 · 二人以上の世帯全体 · 1,000万円以上（未細分化）/,
  'Entry high-income bracket is inherited without guessing a fine source cell');
 assert.equal(await page.locator('[data-peer-condition-edit="single"]').count(),0);
 assert.equal(await page.locator('[data-peer-condition-edit="multi-high"]').count(),1);
 const allRows=page.locator('[data-comparison-category]');
 assert.equal(await allRows.count(),12);
 assert.equal(await page.locator('[data-comparison-category]:visible').count(),12,
  'All 12 categories have a readable compact summary without one global reveal');
 assert.equal(await page.locator('[data-section="COMPARISON_REST_TOGGLE"]').count(),0);
 assert.equal(await page.locator('[data-section="CATEGORY_BATTLEBOARD"]').count(),0);
 await page.locator('[data-comparison-category="food"] > summary').click();
 assert.equal(await page.locator('[data-comparison-category="food"]').evaluate(el=>el.open),true,
  'User opens source evidence only in the category they want to inspect');
 assert.equal(await peers().count(),0,'Frozen 1000plus bucket cannot auto-choose a public income column');
 assert.equal(await head.count(),0,'Head-age confirmation is not shown until supported original cell is selected');
 assert.equal(await page.locator('[data-peer-three-way-category]').count(),0,
  'Three-way comparison must not appear before official population and income validation');
 // Result shortcuts must lead ABOVE the optional income and head-of-household
 // controls, not directly to the category cards (which would conceal them).
 const compareShortcut=page.locator('[data-section="RESULT_SHORTCUTS"] button').nth(1);
 assert.match(await compareShortcut.innerText(),/12カテゴリ/);
 await compareShortcut.click();
 await page.waitForFunction(()=>{
  const guide=document.querySelector('[data-section="JOINT_PEER_COMPARISON_GUIDE"]');
  return guide&&Math.abs(guide.getBoundingClientRect().top)<150;
 },null,{timeout:7000});
 assert.equal(await page.locator('[data-section="MULTI_HIGH_INCOME_CLASS_OPTIN"]').count(),1,
  'Income selector must be reachable immediately after the comparison guide');
 await page.locator('[data-section="MULTI_PEER_CONDITION_EDIT"] summary').click();
 assert.equal(await page.locator('#c2v32-multi-income').inputValue(),'1000plus',
  'Result inherits the broad income cohort without re-requesting it');
 await selectGross('1500plus');
 assert.match(await compareCondition.innerText(),/45歳 · 二人以上の世帯全体 · 1,500万円以上/,
  'Fine-grained year band chosen in this result updates the condition heading');
 await worker.waitFor({state:'visible'});
 await head.waitFor({state:'visible'});
 await matchStatus.waitFor({state:'visible'});
 assert.ok((await matchStatus.innerText()).includes('世帯主の年齢と働き方を確認すると'),
  'Public-cell match must guide the user to the missing consent gates');
 assert.equal(await matchStatus.getAttribute('aria-live'),'polite');
 assert.equal(await peers().count(),0,'Selecting published bracket alone does not prove population');
 assert.equal(await page.locator('[data-peer-related-rate-category]').count(),0,'Seven related public items also require both cohort checks');
 await worker.check();
 assert.equal(await peers().count(),0,'Household-head age confirmation is independently required');
 await head.check();
 await assertRate('13.7%'); // 40–49, 1500+ source mean 132463 / 965121
 assert.equal(await page.locator('[data-peer-related-rate-category]').count(),7,
  'Exactly seven additional related official public fee groups render only after cohort verification');
 const relatedCards=page.locator('[data-peer-related-rate-category]');
 assert.equal(await relatedCards.count(),7);
 for(const key of ['mobile','car','insurance']){
  const row=page.locator('[data-comparison-category="'+key+'"]');
  if(!(await row.evaluate(el=>el.open)))await row.locator(':scope > summary').click();
  const detail=row.locator('[data-peer-related-rate-category="'+key+'"]');
  assert.equal(await detail.evaluate(el=>el.open),false,
   'Related public fees start collapsed inside the selected category');
  assert.ok((await detail.locator('summary').innerText()).includes('診断項目の平均ではない'),
   'A related public fee must not be confused with the official diagnosis-category average');
  await detail.locator('summary').click();
  assert.equal(await detail.evaluate(el=>el.open),true);
  const evidence=await detail.innerText();
  if(key==='mobile'){
   assert.ok(evidence.includes('通信')&&evidence.includes('1.65%')&&evidence.includes('15,948'),
    'Original 2024 official communication source is distinct from mobile diagnosis benchmark');
  }else if(key==='car'){
   assert.ok(evidence.includes('内数'),'Maintenance belongs within the published car total');
  }else{
   assert.ok(evidence.includes('保障だけでなく'),'Insurance includes savings, not only protection premiums');
  }
 }
 // One category open at a time is the intended mobile-friendly interaction.
 // Re-open food before checking the matched reference in the expanded row.
 const foodRow=page.locator('[data-comparison-category="food"]');
 if(!(await foodRow.evaluate(el=>el.open)))await foodRow.locator(':scope > summary').click();

 const foodThreeWay=page.locator('[data-peer-three-way-category="food"]');
 assert.equal(await page.locator('[data-peer-three-way-category]').count(),3,
  'All 3 supported original categories show same-cell percent comparisons');
 await foodThreeWay.waitFor({state:'visible'});
 const threeWayText=await foodThreeWay.innerText();
 assert.ok(threeWayText.includes('16.0%')&&threeWayText.includes('13.7%')&&threeWayText.includes('+2.3pt'),
  'User rate, official matching cohort rate and signed percentage-point gap are visible together');
 const gapCard=page.locator('[data-section="OFFICIAL_PEER_GAP_food"]');
 assert.ok((await gapCard.innerText()).includes('統計上の差'),
  'Upfront percent-point difference is not a confirmed saving');
 const gapMethod=page.locator('[data-section="OFFICIAL_PEER_GAP_DETAIL_food"]');
 assert.equal(await gapMethod.evaluate(el=>el.open),false,
  'Long yen conversion and statistical disclaimers are hidden until requested');
 assert.ok(!(await gapCard.innerText()).includes('参考率との差を、あなたの月手取りで機械的に換算すると'),
  'Default food card does not display the extra yen-conversion paragraph');
 await gapMethod.locator('summary').click();
 assert.ok((await gapCard.innerText()).includes('削減可能額'),
  'Expanded calculation preserves no-saving warning');
 await gapMethod.locator('summary').click();

 assert.ok((await matchStatus.innerText()).includes('比較の準備ができたよ'),
  'After both confirmations show a visible completion cue at the income selector');
 await food().locator(':scope > summary').click();
 assert.ok((await food().innerText()).includes('世帯年収 1,500万円以上'),'Selection is explicit in the optional original source note');
 assert.equal(await page.locator('[data-section="REFERENCE_RECHECK_BUFFER"]').count(),0,
  'No statistical difference is a confirmed or potential saving');
 if(engine==='chromium'){
  await food().scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/16-high-income-age40-1500-worker-confirmed.png',fullPage:false,timeout:12000});
 }
 await selectGross('1250_1499');
 await assertRate('17.5%'); // 40–49, 1250–1500, source 116635 / 667844
 await changeAge(35);
 await selectGross('1500plus');
 assert.equal(await peers().count(),0,'Age 30s n=40 < 50 must fail closed');
 assert.ok((await matchStatus.innerText()).includes('標本数が少ない'),
  'When age cohort is unsupported, explain why rather than making comparison silently disappear');
 assert.equal(await head.count(),0,'No false prompt to confirm an ineligible peer cell');
 await selectGross('1000_1249');
 await assertRate('14.9%'); // 30–39, 1000–1250, source 88255 / 593662
 await changeAge(75);
 await selectGross('1250_1499');
 assert.equal(await peers().count(),0,'Age 70s n=20 < 50 must fail closed');
 await selectGross('1000_1249');
 await assertRate('16.2%'); // age 70s, n=50 exactly
 await changeAge(25);
 assert.equal(await peers().count(),0,'Under 30 sample n=40 < 50');
 await changeAge(55);
 await selectGross('1500plus');
 await assertRate('14.9%'); // age 50s, 1500+, 130143 / 870777
 await worker.uncheck();
 assert.equal(await peers().count(),0,'Withdrawing worker declaration immediately hides peer rates');
 assert.equal(await page.locator('[data-peer-related-rate-category]').count(),0,
  'Removing worker consent hides all seven public related expense rates');
 assert.equal(await page.locator('[data-peer-three-way-category]').count(),0,'Matched cards also vanish after worker revocation');
 await worker.check();
 await head.uncheck();
 assert.equal(await peers().count(),0,'Withdrawing household-head age declaration hides peer rates');
 await head.check();
 await selectGross('');
 assert.equal(await peers().count(),0,'Unselecting exact income must revoke peer');
 assert.equal(await matchStatus.count(),0,'Clearing selection also clears contextual status');
 // The main edit control can also change a previously chosen broad band,
 // but this is result-only; an old 1000+ fine class must not leak through.
 await page.locator('#c2v32-multi-income').selectOption('800_999');
 assert.match(await compareCondition.innerText(),/800～999万円/,
  'A user-initiated comparison edit updates the compact inherited condition');
 assert.equal(await page.locator('[data-section="MULTI_HIGH_INCOME_CLASS_OPTIN"]').count(),0,
  'Hidden old fine-income selection is cleared after changing broad comparison cohort');
 assert.equal(await page.locator('[data-peer-condition-edit="multi"]').count(),1,
  'Exactly one optional edit panel manages multi income bands');
 assert.equal(await page.locator('[data-section="REFERENCE_RECHECK_BUFFER"]').count(),0,
  'Editing the reference cohort cannot turn differences into confirmed savings');

 // Switching the isolated QA fixture to the original 500–599万円 group
 // must not reuse the previous 1000+ high-income columns or confirmation.
 await page.locator('#qa-head-age').selectOption('35');
 await page.locator('#qa-gross-band').selectOption('500_599');
 const middleWorker=page.locator('#c2v32-worker-status-confirm');
 const middleHead=page.locator('#c2v32-head-age-confirm');
 await middleWorker.waitFor({state:'visible'});
 await middleHead.waitFor({state:'visible'});
 assert.equal(await page.locator('[data-peer-related-range-category]').count(),0,
  'Middle-income related official items are not visible before population gates');
 await middleWorker.check();
 assert.equal(await page.locator('[data-peer-related-range-category]').count(),0,
  'Middle-income requires household head age confirmation too');
 await middleHead.check();
 assert.equal(await page.locator('[data-peer-related-range-category]').count(),7,
  '30s multi 500–599 official original supports all seven related public fee groups');
 if(!(await page.locator('[data-comparison-category="mobile"]').evaluate(el=>el.open)))
  await page.locator('[data-comparison-category="mobile"] > summary').click();
 const midComm=page.locator('[data-peer-related-range-category="mobile"]');
 await midComm.locator('summary').click();
 assert.ok((await midComm.innerText()).includes('2.92 ～ 2.94%'),
  'Official 500–550 and 550–600 communication cell rates are a range, not synthetic mean');
 assert.ok((await midComm.innerText()).includes('合算した公式平均でもありません'),
  'Do not mislabel two 50万円 cell means as one 100万円-band official average');
 assert.equal(await page.locator('[data-section="REFERENCE_RECHECK_BUFFER"]').count(),0,
  'Official related category range never becomes claimed savings');

 // Single-person official worker cells: head age follows respondent age.
 await page.locator('#qa-household-type').selectOption('single');
 const singleWorker=page.locator('#c2v32-worker-status-confirm');
 await singleWorker.waitFor({state:'visible'});
 assert.equal(await page.locator('[data-peer-related-range-category]').count(),0,
  'Single original public fee rates need worker status gate');
 await singleWorker.check();
 assert.equal(await page.locator('[data-peer-related-range-category]').count(),6,
  '30s single 400–499 original has six related groups; education is not a single-person comparable');
 assert.equal(await page.locator('[data-peer-related-range-category="childEducation"]').count(),0,
  'Do not invent single-household children education expenses');
 if(!(await page.locator('[data-comparison-category="mobile"]').evaluate(el=>el.open)))
  await page.locator('[data-comparison-category="mobile"] > summary').click();
 const singleComm=page.locator('[data-peer-related-range-category="mobile"]');
 await singleComm.locator('summary').click();
 assert.ok((await singleComm.innerText()).includes('2.74 ～ 3.07%'),
  'Single worker age30s original communication 400–450/450–500 rates match raw source');
 await singleWorker.uncheck();
 assert.equal(await page.locator('[data-peer-related-range-category]').count(),0,
  'Revoking worker-status confirmation hides all related ranges');

 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert.ok(scrollWidth<=width+4,`Viewport ${width}px has horizontal overflow ${scrollWidth}px`);
 }
 assert.equal(outbound.length,0,'Synthetic QA may not send any request to GAS, LINE, analytics or other hosts');
 assert.deepEqual(errors,[],'No browser uncaught exceptions');
 await fs.writeFile(out+'/high-income-browser-qa.json',JSON.stringify({
  engine,ok:true,source:'e-Stat 0004039867',originalHighIncomeCells:12,
  verified:{age40_1500:'13.7%',age40_1250:'17.5%',age30_1000:'14.9%',age70_1000:'16.2%',age50_1500:'14.9%'},
  ineligible:['age30_1500_n40','age70_1250_n20','under30_1000_n40'],
  headAgeGate:true,workerGate:true,exactGrossSelection:true,confirmedSavingUnchanged:true,
  outboundRequests:0,uncaughtErrors:0,viewports:[320,390,430],
 },null,2));
 console.log('CHAPTER2_HIGH_INCOME_INTERACTIVE_BROWSER_QA_PASS',engine);
}finally{
 await browser.close();
}
