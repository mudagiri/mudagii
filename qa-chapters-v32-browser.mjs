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
 await singleIncomeOpt.locator('summary').click();
 await page.locator('#c2v32-single-income').selectOption('400_499');
 await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').waitFor({state:'visible'});
 const official40=await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').innerText();
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
 const sameAgeFood40=await sameAge40.innerText();
 assert.ok(sameAgeFood40.includes('14.8 ～ 25.3%'),'Real e-Stat 2024 30s x 400–499 worker food rate range');
 assert.ok(sameAgeFood40.includes('あなたの支出割合')&&sameAgeFood40.includes('20.0%'),'User own takehome rate is shown next to same age+income worker reference');
 assert.ok(sameAgeFood40.includes('就労状態の一致は未確認'),'No unsupported worker-status claim');
 assert.equal(await page.locator('[data-age-income-worker-peer-category="energy"]').count(),1);
 assert.equal(await page.locator('[data-age-income-worker-peer-category="daily"]').count(),1);

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
 const age50=await page.locator('[data-age-income-worker-peer-category="food"]').innerText();
 assert.ok(age50.includes('12.2 ～ 17.8%'),'2024 official 30-39 x 500-599 income classes must be directly joined');
 assert.ok((await page.locator('[data-section="AGE_INCOME_PEER_RATE_SOURCE_NOTICE"]').innerText()).includes('同時集計した'),'Cross-tab must be visibly distinguished from separate marginal data');
 assert.equal(await page.locator('[data-section="REFERENCE_RECHECK_BUFFER"]').count(),0,'No extra savings buffer before worker employment status and expense match');
 await page.locator('#c2v32-single-income').selectOption('600plus');
 await page.locator('[data-section="INCOME_CLASS_FOOD_ROW"]').getByText('¥69,413',{exact:false}).waitFor({state:'visible',timeout:8000});
 const official600=await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').innerText();
 const merged600=await page.locator('[data-section="CATEGORY_COMPARISON_OVERVIEW"]').innerText();
 assert.ok(merged600.includes('¥69,413')&&official600.includes('1,000万円以上に固有の平均ではありません'),'Upper income ceiling visibly broad, never fabricated');
 assert.equal(await page.locator('[data-worker-rate-category="food"]').count(),1,'600+ broad-worker cell available with sample size 39 and warning');
 assert.equal(await page.locator('[data-age-income-worker-peer-category="food"]').count(),0,'600plus single gross is broader than approved 2024 age-income source rows');


 await page.locator('#c2v32-single-income').selectOption('');
 assert.equal(await page.locator('[data-section="INCOME_CLASS_FOOD_CONTEXT"]').count(),0,'Clear choice removes secondary reference');
 await singleIncomeOpt.locator('summary').click();

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
 await screenshot('13-result-entry-before-assert');
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
   comparisonRows:document.querySelectorAll('[data-comparison-category]').length,shareButton:!!document.querySelector('.c2v31-share-primary')}));
  assert.ok(layout.scrollWidth<=width+2,'No mobile horizontal overflow: '+JSON.stringify(layout));
  assert.equal(layout.comparisonRows,12,'All comparisons stay visible at '+width);
  assert.ok(layout.shareButton,'One primary share action remains present');
  await auditChapter2TextContrast(page,{viewportWidth:width});
  await screenshot('04-v32-mobile-'+width);
 }
 await page.setViewportSize({width:390,height:844});
 const result=await page.evaluate(()=>JSON.parse(localStorage.getItem('mudagiri_active_result_v1')||'null'));
 assert.equal(result?.methodology?.type,'CHAPTER2_V2_NO_PERSONALITY');
 assert.equal(Object.keys(result?.completed?.typeAnswers||{}).length,0);
 await page.getByRole('button',{name:/無料ライフプラン相談の案内を見る/}).click();
 const modal=page.getByRole('dialog',{name:'ライフプラン相談の案内へ'});
 await modal.waitFor({state:'visible'});
 assert.ok((await modal.innerText()).includes('友だち追加だけでは予約は確定しません'));
 await screenshot('05-v32-consultation-modal');
 await page.getByRole('button',{name:'今は結果を見る'}).click();
 await modal.waitFor({state:'hidden'});
 // One image-share CTA; optional tools start collapsed to reduce decision load.
 const alternatives=page.locator('.c2v31-share-alternatives');
 assert.ok(!(await alternatives.evaluate(el=>el.open)),'Optional share tools must start collapsed');
 await alternatives.locator('summary').click();
 await clickButton(/招待リンクをコピー/);
 const copied=await page.evaluate(()=>window.__integrationShare.find(v=>v.kind==='clipboard'));
 assert.ok(copied?.text.includes(firstUrl),'Copied referral must point to same-preview Chapter 1');
 // Text-only share retains correct referral routing and is explicitly labeled.
 await clickButton(/Xで文章を共有/);
 const links=await page.evaluate(()=>window.__integrationShare);
 const x=links.find(v=>v.kind==='open'&&v.url.includes('twitter.com/intent/tweet'));
 assert.ok(x,'X share intent missing');
 const decoded=decodeURIComponent(new URL(x.url).searchParams.get('text')||'');
 assert.ok(decoded.includes(firstUrl),'Chapter 2 referral must lead to the integrated Chapter 1 entry');
 await page.getByRole('button',{name:/画像付きでシェアする/}).waitFor({state:'visible'});
 await clickButton(/画像付きでシェアする/);
 await page.waitForFunction(()=>String(window.__v31SharePng||'').startsWith('data:image/png;base64,'),null,{timeout:12000});
 const png=await page.evaluate(()=>window.__v31SharePng);
 await fs.writeFile(out+'/06-v32-guild-social-card.png',Buffer.from(png.split(',')[1],'base64'));
 const lastShare=await page.evaluate(()=>window.__integrationShare.find(x=>x.kind==='share'));
 assert.ok(lastShare.files.includes('mudagiri-household-quest.png'),'native share should attach PNG');
 assert.ok(!/1800|350000|70000|¥/.test(JSON.stringify(lastShare)),'share must not include sensitive financial amounts');
 await page.reload({waitUntil:'networkidle'});
 await page.locator('.c2v2-root').waitFor({state:'visible',timeout:14000});
 assert.ok((await page.locator('.c2v31-job-card').innerText()).includes(before.handoff.jobName),'Handoff must survive reload');
 await screenshot('05-chapter2-resumed');
 if(errors.length)throw new Error('BROWSER_PAGE_ERRORS:'+JSON.stringify(errors));
 await fs.writeFile(out+'/report.json',JSON.stringify({
  ok:true,engine,simulatedMobile:true,publicPageNotModified:true,chapter1Count:count,
  inheritedJobCode:before.handoff.jobCode,anonymousIdsEqual:true,legacyEightQuestionsSkipped:true,
  savedResultWithoutTypeAnswers:true,referralToChapter1:true,reloadPassed:true
 },null,2));
 console.log('CHAPTER2_V32_INTEGRATION_PASS',engine,'answers',count,'JOB',before.handoff.jobCode);
}finally{
 await browser.close();
}
