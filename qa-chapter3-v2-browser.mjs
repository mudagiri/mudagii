import {chromium,webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {auditChapter2TextContrast} from './qa-chapter2-v32-contrast.mjs';

// Both pages are copies of the same integrated build, served on ONE origin.
// Only the hidden integration prefix is used. No data is POSTed to GAS.
const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const preview=process.env.INTEGRATION_URL||'http://127.0.0.1:4173/pilot/chapter2-v2/';
const firstUrl=new URL('pilot/money-type/',preview).toString();
const out='integration-v32-mobile-qa/'+engine;
await fs.mkdir(out,{recursive:true});
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'ja-JP',colorScheme:'dark'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('crash',()=>console.error('WEBKIT_RESULT_PAGE_CRASH',engine));
page.on('console',msg=>{if(msg.type()==='error')console.error('BROWSER_CONSOLE_ERROR',engine,msg.text())});
await page.addInitScript(()=>{
 window.__integrationShare=[];
 try{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{window.__integrationShare.push({kind:'clipboard',text:String(text)})}}})}catch{}
 window.open=(url)=>{window.__integrationShare.push({kind:'open',url:String(url)});return null};
 try{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true})}catch{}
 try{Object.defineProperty(navigator,'share',{configurable:true,value:async(info)=>{
  window.__integrationShare.push({kind:'share',text:info.text,files:(info.files||[]).map(x=>x.name)});
  if(info?.files?.length){
   const reader=new FileReader();
   window.__v31SharePng=await new Promise((resolve,reject)=>{
    reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(info.files[0]);
   });
  }
 }})}catch{}
});
async function screenshot(name){
 // Full-page captures of the asset-heavy 4,700px result can exhaust the
 // Playwright WebKit renderer. Keep full-page Chrome baselines, capture
 // iPhone WebKit viewport at each tested width; DOM overflow is asserted.
 const onResult=/(result-entry|chapter2-v32-result|v32-mobile|consultation-modal|chapter2-resumed)/.test(name);
 if(engine==='webkit'&&onResult){
  // Playwright WebKit's screenshot renderer times out on the asset-rich
  // result even at viewport size. Preserve DOM/layout/click assertions here;
  // actual iPhone visual approval remains a distinct launch gate.
  console.log('WEBKIT_RESULT_SCREENSHOT_MANUAL_GATE',name);
  return;
 }
 await page.screenshot({path:out+'/'+name+'.png',fullPage:true,timeout:15000});
}
async function clickButton(pattern){const button=page.getByRole('button',{name:pattern}).first();await button.waitFor({state:'visible',timeout:12000});await button.click();}
async function waitHeading(name){await page.getByRole('heading',{name}).first().waitFor({state:'visible',timeout:12000});}
try{
 await page.goto(firstUrl,{waitUntil:'networkidle'});
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 await page.reload({waitUntil:'networkidle'});
 await page.getByRole('button',{name:'診断をはじめる'}).waitFor({state:'visible',timeout:10000});
 await screenshot('01-chapter1-intro');
 await clickButton('診断をはじめる');
 let count=0,sawUnlock=false;
 for(let iteration=0;iteration<90;iteration++){
  if(await page.locator('.mpp17-page').count())break;
  const unlock=page.locator('.mpp-class-unlock');
  if(await unlock.count()){
   sawUnlock=true;
   await page.getByRole('button',{name:'結果を見る'}).waitFor({state:'visible',timeout:16000});
   await page.waitForTimeout(700);
   await clickButton('結果を見る');
   break;
  }
  const separators=page.locator('.mpp-separator-options button');
  const scale=page.locator('.mpp-scale button');
  const likert=page.locator('.mpp-answer-list button');
  if(await separators.count())await separators.first().click();
  else if(await scale.count())await scale.nth(2).click();
  else if(await likert.count())await likert.nth(2).click();
  else throw new Error('INTEGRATED_CHAPTER1_NO_ANSWER_CONTROL_AFTER_'+count);
  count++;
  await page.waitForTimeout(175);
 }
 await page.locator('.mpp17-page').waitFor({state:'visible',timeout:15000});
 assert.ok(sawUnlock,'SSR card must precede the result');
 assert.ok(count>=30,'Chapter 1 must answer 30 core questions');
 await page.waitForFunction(()=>Boolean(localStorage.getItem('mudagiri_money_type_handoff_v1')),{timeout:6000});
 const before=await page.evaluate(()=>{
  const handoff=JSON.parse(localStorage.getItem('mudagiri_money_type_handoff_v1'));
  return {handoff,anonymousUserId:localStorage.getItem('mudagiri_anonymous_user_id_v1')};
 });
 assert.equal(before.handoff.version,'MUDAGIRI_MONEY_TYPE_HANDOFF_V1');
 assert.equal(before.handoff.anonymousUserId,before.anonymousUserId);
 assert.ok(before.handoff.jobName&&before.handoff.jobCode,'Chapter 1 handoff must have JOB');
 // Chrome and iPhone WebKit both use a 720ms collectible-card entrance.
 // Do not mistake a frame from the opacity=0 transition for a broken result.
 await page.waitForFunction(()=>{
  const el=document.querySelector('.mpp17-profile');
  if(!el)return false;
  const img=el.querySelector('.mpp17-portrait img');
  return getComputedStyle(el).opacity==='1'&&
   (!img||(img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0));
 },null,{timeout:6500});
 await page.locator('.mpp17-unified-next-preview').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('.mpp17-unified-next-enemies img')].length===3&&
  [...document.querySelectorAll('.mpp17-unified-next-enemies img')].every(x=>x.complete&&x.naturalWidth>0),
  null,{timeout:12000});
 // WebKit can finish transfer before the large transparent PNGs are decoded.
 // Give the official enemy sprites time to rasterize while they are onscreen.
 await page.locator('.mpp17-unified-next-enemies img').evaluateAll(async images=>{
   await Promise.all(images.map(img=>img.decode().catch(()=>{})));
 });
 await page.waitForTimeout(220);
 if(engine==='webkit')await page.screenshot({path:out+'/02b-chapter1-enemy-viewport.png',fullPage:false,timeout:12000});
 const ch1Journey=await page.evaluate(()=>{
  const root=document.querySelector('.mpp17-unified-world');
  const hud=document.querySelector('.mpp17-unified-progress');
  const invite=document.querySelector('[data-section="CHAPTER1_NEXT_BATTLE"]');
  const images=[...document.querySelectorAll('.mpp17-unified-next-enemies img')];
  return {
    root:!!root,hud:!!hud,invite:!!invite,
    enemyCount:images.length,loaded:images.every(x=>x instanceof HTMLImageElement&&x.complete&&x.naturalWidth>0),
    buttons:[...document.querySelectorAll('.mpp17-unified-next-cta')].length,
    background:getComputedStyle(root).backgroundImage,
    job:document.querySelector('.mpp17-profile h1')?.textContent,
    share:!!document.querySelector('.mpp17-share-preview')
  };
 });
 assert.ok(ch1Journey.root&&ch1Journey.hud&&ch1Journey.invite,'Chapter 1 result shares Chapter 2 world and progression');
 assert.equal(ch1Journey.enemyCount,3,'Invite must preview exactly three official RPG enemies');
 assert.ok(ch1Journey.loaded,'Official monster assets must load in Chapter 1 invite');
 assert.equal(ch1Journey.buttons,1,'One early continue-to-Chapter2 CTA');
 assert.ok(ch1Journey.background.includes('MP_BG_01_GUILD_HALL'),'Chapter 1 backdrop must use the official Chapter 2 guild hall');
 assert.ok(ch1Journey.job&&ch1Journey.share,'SSR JOB and viral share preview must remain intact');
 await screenshot('02-chapter1-result');
 await page.locator('.mpp17-unified-next-cta').click();
 await page.waitForURL(url=>url.pathname.endsWith('/pilot/chapter2-v32/'),{timeout:13000});
 assert.equal(new URL(page.url()).pathname,new URL(preview).pathname);
 const after=await page.evaluate(()=>({anonymousUserId:localStorage.getItem('mudagiri_anonymous_user_id_v1'),handoff:JSON.parse(localStorage.getItem('mudagiri_money_type_handoff_v1')||'null')}));
 assert.equal(after.anonymousUserId,before.anonymousUserId,'shared origin must retain anonymous join key');
 assert.equal(after.handoff.sessionId,before.handoff.sessionId);
 await screenshot('03-chapter2-opening');
 // Chapter 2 profile, 12 categories, appraisal, combo battle.
 await clickButton(/無料で冒険をはじめる/);
 await waitHeading('今回チェックするのは？');
 await clickButton(/自分が払っている分/);
 await waitHeading('どのムダギリに斬られる？');
 await clickButton(/正論ムダギリ/);
 await waitHeading('一緒に暮らしている人数は？');

await screenshot('04-single-household-size');
await clickButton(/次へ/);

await waitHeading('今住んでる都道府県は？');
await page.getByRole('combobox').selectOption({label:'東京都'});
await screenshot('05-single-prefecture');
await clickButton(/次へ/);

await waitHeading('年齢は？');
await page.getByRole('textbox',{name:'年齢'}).fill('35');
await clickButton(/次へ/);

await waitHeading('今の住まいは？');
await screenshot('06-single-housing');
await clickButton(/賃貸/);
await clickButton(/民間賃貸/);

await waitHeading('あなた自身の毎月の手取りは？');
await page.getByRole('textbox',{name:'毎月の手取り'}).fill('350000');
const entryGross=page.locator('[data-section="PROFILE_OPTIONAL_GROSS_ANNUAL"]');
assert.equal(await entryGross.count(),1,'Entry offers optional annual gross bracket without new required step');
assert.equal(await entryGross.evaluate(el=>el.open),false,'Optional entry income must start collapsed');
await entryGross.locator('summary').click();
await page.locator('#profile-annual-peer-band').selectOption('400_499');
assert.equal(await page.locator('#profile-annual-peer-band').inputValue(),'400_499');
await page.locator('#profile-annual-peer-band').selectOption('');
await entryGross.locator('summary').click();
await screenshot('07-single-income');
await clickButton(/次へ/);

await waitHeading('毎月の通信費はいくら？');
await screenshot('08-scan-first');
for(let i=0;i<11;i++){
  if(i===1){
    const back=page.getByRole('button',{name:/戻る/}).first();
    await back.waitFor({state:'visible'});
    await back.click();
    const previousInput=page.locator('.scan-money input').first();
    await previousInput.waitFor({state:'visible'});
    if((await previousInput.inputValue()).replace(/,/g,'')!=='0')throw new Error('SCAN_BACK_DID_NOT_PRESERVE_VALUE');
    await clickButton(/気配を探る/);
    const previousNext=page.getByRole('button',{name:/次を探す|探索結果へ/}).first();
    await previousNext.waitFor({state:'visible'});
    await previousNext.click();
  }
  const input=page.locator('.scan-money input').first();
  await input.waitFor({state:'visible'});
  // single-person scan order: mobile, energy, sub, food...
  // Exercise both confirmed-A subscription savings and comparator-C food opportunity.
  await input.fill(i===2?'5000':i===3?'70000':'0');
  await clickButton(/気配を探る/);
  const next=page.getByRole('button',{name:/次を探す|探索結果へ/}).first();
  await next.waitFor({state:'visible'});
  await next.click();
}
await page.getByText(/ここから、必要な支出をちゃんと守ろう。|……まだ斬るな。|待て。まだ処刑するな。/).waitFor();
await screenshot('09-scan-complete');
await clickButton(/ムダ鑑定を始める/);

// Subscription A evidence: paid -> unused -> concrete monthly amount -> stoppable.
await page.getByText('使ってない・ほぼ使ってないサブスク、ありそう？').waitFor();
await clickButton(/1つくらいありそう/);
await page.getByText('その未使用分、月額まで分かる？').waitFor();
// Appraisal Back regression: dynamic follow-up must return to the previous appraisal question.
const appraisalBack=page.getByRole('button',{name:/戻る/}).first();
await appraisalBack.waitFor({state:'visible'});
await appraisalBack.click();
await page.getByText('使ってない・ほぼ使ってないサブスク、ありそう？').waitFor({state:'visible'});
await clickButton(/1つくらいありそう/);
await page.getByText('その未使用分、月額まで分かる？').waitFor({state:'visible'});
await clickButton(/月額まで分かる/);
const subAmountInput=page.locator('.appraisal-amount-input input').first();
await subAmountInput.waitFor({state:'visible'});
await subAmountInput.fill('1800');
await clickButton(/この金額で次へ/);
await page.getByText('その未使用分、解約・停止できる？').waitFor();
await clickButton(/^解約・停止できる/);

// Food is above the comparison guide. Choose a value-preserving answer:
// V4 can still protect it, while V5 must surface price-efficiency C potential.
const foodAppraisal=page.getByText('今の食費について、一番近いのは？');
await foodAppraisal.waitFor({state:'visible'});
await clickButton(/今くらいでいい/);
await page.getByText(/鑑定完了。|仕分けできたよ。|仕分け終了。/).waitFor();
await screenshot('10-appraisal-complete');

await clickButton(/最後のクエストへ/);
if(await page.getByText('MONEY STYLE ANALYSIS').count())throw new Error('LEGACY_TYPE_QUIZ_SHOWN_IN_V2');
await page.getByText(/優先チェック対象なし|見直しクエストを特定|見直しやすいところ|処刑候補/).waitFor();
await screenshot('11-v2-battle-intro');
await clickButton(/結果へ進む|クエストを開始する/);
const comboStart=page.getByRole('button',{name:/優先チェック開始/}).first();
if(await comboStart.count()){
 await comboStart.click();
 const done=page.getByRole('button',{name:/診断結果へ/}).first();
 await done.waitFor({state:'visible',timeout:12000});await done.click();
}
await page.getByText(/家計防衛成功|見直しクエスト完了/).waitFor();
await page.getByText(/NEXT：RESULT \/ 戦果・改善候補・守る支出/).waitFor();
await screenshot('12-v2-battle-complete');
await clickButton(/診断結果を見る/);

 await page.locator('.c2v2-root').waitFor({state:'visible',timeout:16000});
 // The current V20–V22 RPG HUD supersedes the old .c2v32-chapter-label.
 await page.locator('.c2v32-rpg[data-result-version="v32"]').waitFor({state:'visible',timeout:16000});
 const hud=await page.locator('.c2v20-quest-log').innerText();
 assert.ok(/第1章/.test(hud)&&/JOB獲得/.test(hud)&&/第2章/.test(hud)&&/家計バトル/.test(hud),
  'Chapter 2 HUD must retain Chapter 1 JOB to household quest continuity');
 const inherited=await page.locator('.c2v31-job-card').innerText();
 assert.ok(inherited.includes(before.handoff.jobName),'Chapter 1 JOB identity survives the handoff');
 const resultText=await page.locator('.c2v32-rpg').innerText();
 // Optional income-class lens must not add a required question to Chapter 1/2.
 // Single-person results can inspect the actual official 2025 table without
 // guessing annual gross salary from net take-home.
 const singleIncomeOpt=page.locator('[data-section="SINGLE_INCOME_CLASS_OPTIN"]');
 assert.equal(await singleIncomeOpt.count(),1,'Single households can opt into a standalone 2025 income reference');
 assert.equal(await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').count(),0,'No peer income reference before explicit user choice');
 assert.equal(await singleIncomeOpt.evaluate(el=>el.open),true,
  'Gross income selection must be visible, not hidden under collapsed details');
 assert.ok((await page.locator('[data-section="JOINT_PEER_COMPARISON_GUIDE"]').innerText()).includes('同年代 × 世帯区分 × 額面年収帯'));
 const cohortScopeDetails=page.locator('[data-section="PEER_2024_CATEGORY_COVERAGE_AUDIT"]');
 assert.equal(await cohortScopeDetails.count(),1,'All unavailable category reasons are discoverable in one optional detail');
 await cohortScopeDetails.locator('summary').click();
 assert.equal(await cohortScopeDetails.locator('[data-peer-coverage-category]').count(),9,
  'Nine category limitations are displayed, not falsely claimed as cross-tab peers');
 assert.ok((await cohortScopeDetails.innerText()).includes('サブスクだけの公式平均はないよ'));
 await cohortScopeDetails.locator('summary').click();
 assert.equal(await page.locator('.c2v32-rpg').getByText('あなたの手取り換算',{exact:false}).count(),0,
  'Never print synthetic own-denominator proxies as statistical burden rates');
 await page.locator('#c2v32-single-income').selectOption('400_499');
 await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').waitFor({state:'visible'});
 // A matching income and age class does not establish worker-household scope.
 assert.equal(await page.locator('[data-age-income-worker-peer-category="food"]').count(),0,
  'Never auto-display wage-worker peers before the household head declares worker status');
 await page.locator('#c2v32-worker-status-confirm').check();
 assert.equal(await page.locator('#c2v32-worker-status-confirm').isChecked(),true);
 const methodDetail=page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]');
 assert.equal(await methodDetail.evaluate(el=>el.open),false,'Global long-form reference explanation is collapsed by default');
 await methodDetail.locator(':scope > summary').click();
 const official40=await methodDetail.innerText();
 const merged40=await page.locator('[data-section="CATEGORY_COMPARISON_OVERVIEW"]').innerText();
 assert.ok(official40.includes('年齢・世帯の目安と、年収帯の参考を一緒に見る'),'Two independent references share a compact explanation');
 assert.ok(merged40.includes('あなたの支出'),'User expense is visible in the category comparison');
 assert.equal(await page.locator('[data-section="INCOME_CLASS_FOOD_ROW"]').count(),0,'Hide age-unmatched food-only value when matched 2024 peer rate exists');
 assert.equal(await page.locator('[data-section="INCOME_CLASS_ENERGY_ROW"]').count(),0,'Hide superseded age-unmatched utilities amount');
 assert.equal(await page.locator('[data-section="INCOME_CLASS_DAILY_ROW"]').count(),0,'Hide superseded age-unmatched daily necessities amount');
 assert.ok(official40.includes('公式交差集計を優先'),'2024 age×income peer group takes priority in the UI');
 assert.ok(official40.includes('参考差をムダ額・削減額・見直し候補額に加えない'),'Observed differences never imply guaranteed savings');
 assert.equal(await page.locator('[data-worker-rate-category="food"]').count(),0,'Do not duplicate 2025 income-only rate when matched 2024 age×income rate exists');
 assert.equal(await page.locator('[data-section="REFERENCE_RECHECK_BUFFER"]').count(),0,'No invented age×income monthly buffer');
 assert.ok((await page.locator('[data-section="AGE_INCOME_PEER_RATE_SOURCE_NOTICE"]').innerText()).includes('2024年全国家計構造調査'),'Official joint 2024 source is identified');
 const sameAge40=page.locator('[data-age-income-worker-peer-category="food"]');
 assert.equal(await sameAge40.count(),1,'30–39 age and 400–499 gross class must match OFFICIAL same-cell source');
 assert.equal(await sameAge40.evaluate(el=>el.open),false,'Reference evidence stays folded on first view');
 assert.ok((await sameAge40.innerText()).includes('条件・出典を見る'),'Source details are discoverable');
 const foodCardCollapsed=await page.locator('[data-comparison-category="food"]').innerText();
 assert.equal((foodCardCollapsed.match(/14\.8% ～ 25\.3%/g)||[]).length,1,
  'Only one copy of the same reference rate should appear in a visible card');
 await sameAge40.locator('summary').click();
 const sameAgeFood40=await sameAge40.innerText();
 assert.ok(sameAgeFood40.includes('2024年全国家計構造調査'),'Official e-Stat source must open on request');
 const primaryPeerFood=await page.locator('[data-comparison-category="food"] .c2v32-peer-gap-card--three-way').innerText();
 assert.ok(primaryPeerFood.includes('同条件の全国参考率')&&primaryPeerFood.includes('14.8% ～ 25.3%'),
  'The true 2024 same-cohort burden rate must be in the primary comparison cell');
 const peerGapText=await page.locator('[data-section="OFFICIAL_PEER_GAP_food"]').innerText();
 assert.ok(peerGapText.includes('-5.3pt ～ +5.2pt'),'Official 2024 gap uses signed 0.1 percentage points');
 assert.ok(peerGapText.includes('−¥18,550 ～ +¥18,200'),'Monthly yen gap uses own take-home with signed endpoints');
 assert.ok(peerGapText.includes('地域は未反映')&&peerGapText.includes('削減可能額'),
  'National-only gap must not become a fake regional saving');
 assert.equal(await page.locator('[data-comparison-story="food"]').count(),0,
  'Hide conflicting age-only yen comparison story when true peer is available');
 assert.ok(sameAgeFood40.includes('本人申告によるもの'),'Worker-status match is self-declared, not independently certified');
 assert.equal(await page.locator('[data-age-income-worker-peer-category="energy"]').count(),1);
 assert.equal(await page.locator('[data-age-income-worker-peer-category="daily"]').count(),1);
 await page.locator('[data-age-income-worker-peer-category="daily"] summary').click();
 assert.ok((await page.locator('[data-section="PEER_SCOPE_CAVEAT_daily"]').innerText()).includes('シャンプー'),
  'Official housewares+consumables comparison is narrower than all daily goods');

 // WCAG AA gate against computed rendered colors in the income comparison.
 await auditChapter2TextContrast(page,{requireWorker:true,viewportWidth:390});
 if(engine==='chromium'){
  await page.locator('[data-comparison-category="food"] .c2v32-worker-rate-card--age-income').scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/15-food-worker-burden-readable.png',fullPage:false,timeout:14000});
 }


 assert.equal(await page.locator('a:has-text("Excel")').count(),0,'No spreadsheet links on result');
 if(engine==='chromium'){
  await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForTimeout(150);
  const incomeHeading=await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"] h3').evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(incomeHeading>=63,'Sticky navigation must not hide the income reference heading: '+incomeHeading);
  await page.screenshot({path:out+'/14-income-food-official-selected.png',fullPage:false,timeout:12000});
 }
 await page.locator('#c2v32-single-income').selectOption('500_599');
 assert.equal(await page.locator('[data-worker-rate-category="food"]').count(),0,'2025 income-only single rate suppressed for n=27, independently of 2024 rate');
 const age50=await page.locator('[data-comparison-category="food"] .c2v32-peer-gap-card--three-way').innerText();
 assert.ok(age50.includes('12.2% ～ 17.8%'),'2024 official 30-39 x 500-599 income classes must be directly joined');
 assert.ok((await page.locator('[data-section="AGE_INCOME_PEER_RATE_SOURCE_NOTICE"]').innerText()).includes('同時集計した'),'Cross-tab must be visibly distinguished from separate marginal data');
 assert.equal(await page.locator('[data-section="REFERENCE_RECHECK_BUFFER"]').count(),0,'No extra savings buffer before worker employment status and expense match');
 await page.locator('#c2v32-single-income').selectOption('600plus');
 await page.locator('[data-section="INCOME_CLASS_FOOD_ROW"]').getByText('¥69,413',{exact:false}).waitFor({state:'visible',timeout:8000});
 const official600=await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').innerText();
 const merged600=await page.locator('[data-section="CATEGORY_COMPARISON_OVERVIEW"]').innerText();
 assert.ok(merged600.includes('¥69,413')&&official600.includes('1,000万円以上に固有の平均ではありません'),'Upper income ceiling visibly broad, never fabricated');
 assert.equal(await page.locator('[data-worker-rate-category="food"]').count(),1,'600+ broad-worker cell available with sample size 39 and warning');
 assert.equal(await page.locator('[data-age-income-worker-peer-category="food"]').count(),0,'600plus single gross is broader than approved 2024 age-income source rows');
 assert.ok((await page.locator('[data-section="SINGLE_PEER_MATCH_STATUS"]').innerText()).includes('標本数などの条件'),
  'Give explicit reason for unavailable matched cohort');


 await page.locator('#c2v32-single-income').selectOption('');
 assert.equal(await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').count(),0,'Clear choice removes secondary reference');
 assert.equal(await page.locator('[data-age-income-worker-peer-category="food"]').count(),0,
  'Clearing gross salary removes all same-cell references even with worker declaration');
 if(await singleIncomeOpt.evaluate(el=>el.open)) await singleIncomeOpt.locator('summary').click();

 const candidateText=await page.locator('.c2v32-hero-teaser strong').innerText();
 const cUpper=Number(candidateText.replace(/[^0-9]/g,''));
 assert.ok(cUpper>0,'Synthetic food case must surface an unconfirmed review candidate');
 const yen=n=>'¥'+new Intl.NumberFormat('ja-JP').format(n);
 for(const marker of ['QUEST CLEAR!','未確定',yen(cUpper),yen(cUpper*12),yen(cUpper*60),yen(cUpper*120),'無料ライフプラン相談の案内を見る']){
  assert.ok(resultText.includes(marker),'Missing V3.2 RPG reward: '+marker);
 }
 assert.ok(!resultText.includes('8タイプ図鑑'),'No repeated personality quiz in Chapter 2');
 for(const section of ['POTENTIAL_HERO','POTENTIAL_TREASURE','FUTURE_REWARDS','HOUSEHOLD_BATTLE_RESULTS','CONFIRMED_REWARD','CONSULTATION_CTA_TOP','CATEGORY_COMPARISON_OVERVIEW']){
  assert.equal(await page.locator('[data-section="'+section+'"]').count(),1,'latest chapter section '+section);
 }
 const cats=page.locator('[data-comparison-category]');
 assert.equal(await cats.count(),12,'12 category comparisons visible without opening atlas');
 const artCount=await cats.locator('img.c2v23-comparison-enemy').count();
 assert.ok(artCount>=10,'Most official enemy artwork in category ledger');
 const foodRowText=await page.locator('[data-comparison-category="food"]').innerText();
 assert.ok(foodRowText.includes('食費')&&foodRowText.includes('比較条件：'),'Food reference and comparison criteria visible');
 const energyRowText=await page.locator('[data-comparison-category="energy"]').innerText();
 assert.ok(energyRowText.includes('光熱')&&energyRowText.includes('あなたの支出'),'Energy row is inspectable without tapping');
 const sourceButton=page.locator('[data-comparison-category="food"] .c2v32-evidence-toggle').first();
 if(await sourceButton.count()){
  assert.equal(await sourceButton.getAttribute('aria-expanded'),'false','source details collapsed by default');
  await sourceButton.click();
  assert.equal(await sourceButton.getAttribute('aria-expanded'),'true','source detail opens with one tap');
  await sourceButton.click();
 }
 const income=page.locator('[data-section="INCOME_BURDEN_CONTEXT"]');
 if(await income.count()){
  assert.ok((await income.innerText()).includes('350,000'),'Entered net income survives the latest result UI');
 }
 const visuals=await page.evaluate(()=>{
  const hero=document.querySelector('.c2v31-hero');
  const job=document.querySelector('.c2v31-job-card img');
  const mascot=document.querySelector('.c2v31-hero-mascot');
  const talk=[...document.querySelectorAll('[data-section="MUDAGIRI_TALK"]')];
  const heroDialogue=!!document.querySelector('.c2v31-dialogue');
  const flow=['POTENTIAL_TREASURE','FUTURE_REWARDS','HOUSEHOLD_BATTLE_RESULTS','CONFIRMED_REWARD','CONSULTATION_CTA_TOP'].map(k=>document.querySelector('[data-section="'+k+'"]'));
  return {heroBackground:hero?getComputedStyle(hero).backgroundImage:'',jobReady:!!job&&job.complete&&job.naturalWidth>0,
   mascotReady:!!mascot&&mascot.complete&&mascot.naturalWidth>0,talkCount:talk.length,heroDialogue,
   sequence:flow.every((x,i,a)=>!!x&&(i===0||!!(a[i-1].compareDocumentPosition(x)&Node.DOCUMENT_POSITION_FOLLOWING))),
   overflow:document.documentElement.scrollWidth>innerWidth+2};
 });
 assert.ok(visuals.jobReady&&visuals.mascotReady,'Official JOB and Mudagiri art must load');
 assert.ok(visuals.heroBackground.includes('MP_BG_01_GUILD_HALL'),'RPG guild hall backdrop must render');
 assert.ok(visuals.talkCount>=2&&visuals.heroDialogue,'Hero conversation and two guide dialogues must recur throughout Chapter 2');
 assert.ok(visuals.sequence,'Treasures, compounding, comparisons, confirmed reward and CTA in proper order');
 assert.ok(!visuals.overflow,'No horizontal overflow at 390px');

 // Chapter 3 V2 ISOLATED PILOT: same-origin real C1→C2 diagnosis result.
 const outgoing=[];
 page.on('request',request=>{
   try{const url=new URL(request.url());
     if(['http:','https:'].includes(url.protocol)&&!['127.0.0.1','localhost'].includes(url.hostname))
       outgoing.push(url.origin);
   }catch{}
 });
 const chapter3Entry=page.locator('[data-section="CHAPTER3_V2_ENTRY"]');
 assert.equal(await chapter3Entry.count(),1,'V2 entry must appear exactly once in opt-in build');
 const goalDetails=page.locator('[data-optional="future-goal"]');
 await goalDetails.locator('summary').click();
 await page.locator('[data-section="GOAL_QUEST"] button').filter({hasText:'住まい'}).first().click();
 await chapter3Entry.getByRole('button',{name:/未来の地図をひらく/}).click();
 const ch3=page.locator('[data-chapter3-v2-pilot="true"]');
 await ch3.waitFor({state:'visible',timeout:10000});
 assert.ok((await ch3.innerText()).includes(before.handoff.jobName),'Official Chapter1 JOB appears in Chapter3');
 const c3Job=ch3.locator('img.c3v2-job');
 await c3Job.waitFor({state:'visible',timeout:10000});
 await page.waitForFunction(()=>{
   const img=document.querySelector('img.c3v2-job');
   return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;
 },null,{timeout:10000});
 await ch3.getByRole('button',{name:/この旗で進む/}).click();
 await ch3.getByRole('heading',{name:/いつごろ近づきたい/}).waitFor();
 await ch3.getByRole('button',{name:/1〜3年以内/}).click();
 const housingHeadline=await ch3.locator('[data-testid="chapter3-headline"]').innerText();
 assert.ok(housingHeadline.length>10,'Result contains meaningful narrative headline');
 assert.match(housingHeadline,/住まい|家賃|契約/,'Housing result headline explains planning tradeoff');
 assert.ok((await ch3.locator('[data-testid="chapter3-insight"]').innerText()).length>50,'Explanation is more than a repetition of goal');
 const planText=await ch3.locator('.c3v2-result-hero').innerText();
 assert.match(planText,/住居|住まい|契約/,'Inherit home goal: result first-step concerns actual housing');
 assert.equal(await ch3.locator('.c3v2-choices button').count(),0,'Home route has no redundant mandatory third question');
 await screenshot('17-chapter3-home-result');
 for(const width of [320,375,390,430]){
   await page.setViewportSize({width,height:844});
   const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert.ok(scroll<=width+3,'Chapter3 mobile width '+width+' has horizontal overflow '+scroll);
 }
 await page.setViewportSize({width:390,height:844});
 const canRead=await ch3.locator('.c3v2-result-hero').evaluate(el=>{
   const s=getComputedStyle(el);return {font:s.fontSize,visible:s.visibility,display:s.display};
 });
 assert.ok(parseInt(canRead.font,10)>=16&&canRead.display!=='none','Chapter3 first step should be readable');
 await ch3.getByRole('button',{name:/第2章の戦果へ戻る/}).click();
 await chapter3Entry.waitFor({state:'visible'});
 assert.equal((await page.locator('[data-section="GOAL_QUEST"] button.is-selected').first().textContent())?.trim(),'住まい','C2 goal remains after Chapter3 return');
 await chapter3Entry.getByRole('button',{name:/未来の地図をひらく/}).click();
 await ch3.waitFor({state:'visible'});
 await ch3.getByRole('button',{name:'目的地を変える'}).click();
 await ch3.getByRole('button',{name:/収入を増やしたい/}).click();
 await ch3.getByRole('button',{name:/この旗を立てる/}).click();
 await ch3.getByRole('button',{name:/1〜3年以内/}).click();
 await ch3.getByRole('heading',{name:/収入を増やすなら/}).waitFor();
 await ch3.getByRole('button',{name:/仕事以外でも頼まれた経験/}).click();
 const incomeHeadline1=await ch3.locator('[data-testid="chapter3-headline"]').innerText();
 assert.match(incomeHeadline1,/頼まれた/,'External request leads to specific insight');
 const firstStep=await ch3.locator('.c3v2-result-hero').innerText();
 assert.match(firstStep,/社外|頼まれた/,'Income route uses concrete handhold');
 await screenshot('18-chapter3-income-result');
 await ch3.getByRole('button',{name:/戻る/}).first().click();
 await ch3.getByRole('button',{name:/今の仕事に昇給の道/}).click();
 const incomeHeadline2=await ch3.locator('[data-testid="chapter3-headline"]').innerText();
 assert.match(incomeHeadline2,/昇給/,'In-work answer leads to different insight');
 assert.notEqual(incomeHeadline1,incomeHeadline2,'Income paths change the result headline, not merely the step');
 const secondStep=await ch3.locator('.c3v2-result-hero').innerText();
 assert.match(secondStep,/給与/,'Income first-step changes with different handhold');
 assert.notEqual(secondStep,firstStep,'Conditional third question materially changes result');
 await ch3.getByRole('button',{name:/第2章の相談窓口を確認する/}).click();
 await page.locator('.c2v2-root').waitFor({state:'visible'});
 const c2Modal=page.getByRole('dialog',{name:'ライフプラン相談の案内へ'});
 await c2Modal.waitFor({state:'visible'});
 assert.match(await c2Modal.innerText(),/調査用の案内画面です。公式LINEへの移動や相談予約は行われません/);
 await page.getByRole('button',{name:'今は結果を見る'}).click();
 await c2Modal.waitFor({state:'hidden'});
 // The "more free time" path must not make three different answers feel the same.
 await chapter3Entry.getByRole('button',{name:/未来の地図をひらく/}).click();
 await ch3.waitFor({state:'visible'});
 await ch3.getByRole('button',{name:'目的地を変える'}).click();
 await ch3.getByRole('button',{name:/自由な時間を増やしたい/}).click();
 await ch3.getByRole('button',{name:/この旗を立てる/}).click();
 await ch3.getByRole('button',{name:/1〜3年以内/}).click();
 await ch3.getByRole('button',{name:/家事・育児・家のこと/}).click();
 const homeTime=await ch3.locator('.c3v2-result-hero').innerText();
 assert.match(homeTime,/家事|育児|作業/,'Home time leads to delegated work as starting point');
 const homeTimeHeadline=await ch3.locator('[data-testid="chapter3-headline"]').innerText();
 await ch3.getByRole('button',{name:/戻る/}).first().click();
 await ch3.getByRole('button',{name:/移動/}).click();
 const moveTime=await ch3.locator('.c3v2-result-hero').innerText();
 const moveTimeHeadline=await ch3.locator('[data-testid="chapter3-headline"]').innerText();
 assert.match(moveTime,/移動/,'Travel time leads to commute/time counting');
 assert.notEqual(homeTime,moveTime,'Time path answers change action');
 assert.notEqual(homeTimeHeadline,moveTimeHeadline,'Time path answers change headline');
 await screenshot('20-chapter3-time-result');
 await ch3.getByRole('button',{name:/第2章の戦果へ戻る/}).click();
 await chapter3Entry.waitFor({state:'visible'});
 assert.equal(outgoing.length,0,'No GAS/analytics/LINE network requests in isolated Chapter3 preview');
 const ch3Report={engine,job:before.handoff.jobCode,goalHome:planText.trim(),
   incomePath1:firstStep.trim(),incomePath2:secondStep.trim(),
   inheritedGoal:true,consultReturnsToC2:true,externalRequests:outgoing};
 await fs.writeFile(out+'/chapter3-v2-bridge-report.json',JSON.stringify(ch3Report,null,2));
 console.log('CHAPTER3_V2_BROWSER_BRIDGE_PASS',engine,
  JSON.stringify({job:before.handoff.jobCode,readable:true,outbound:outgoing.length}));


 if(errors.length)throw new Error('CHAPTER3_V2_BROWSER_PAGE_ERRORS: '+JSON.stringify(errors));
 await screenshot('19-chapter2-return-from-chapter3');
 console.log('CHAPTER3_V2_REAL_JOURNEY_PASS',engine);
}finally{
 await browser.close();
}
