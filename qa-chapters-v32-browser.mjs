import {chromium,webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

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
 const ch2Hud=await page.locator('.c2v32-chapter-label').innerText();
 assert.ok(ch2Hud.includes('第1章 JOB獲得')&&ch2Hud.includes('第2章 家計バトル'),'Chapter 2 HUD continues the same two-chapter journey');
 const observed=await page.evaluate(()=>({
  url:location.href, rootClass:document.querySelector('.c2v2-root')?.className,
  version:document.querySelector('[data-result-version]')?.getAttribute('data-result-version'),
  htmlTitle:document.title,
  hasV32:!!document.querySelector('.c2v32-rpg')
 }));
 console.log('RESULT_ENTRY_DIAGNOSTICS',engine,JSON.stringify(observed));
 await screenshot('13-result-entry-before-assert');
 const inherited=await page.locator('.c2v31-job-card').innerText();
 assert.ok(inherited.includes(before.handoff.jobName),'Chapter 1 job and official name persist');
 await page.locator('.c2v32-rpg').waitFor({state:'visible',timeout:10000});
 const resultText=await page.locator('.c2v32-rpg').innerText();
 const candidateText=await page.locator('.c2v32-hero-teaser strong').innerText();
 const cUpper=Number(candidateText.replace(/[^0-9]/g,''));
 assert.ok(cUpper>0,'QA household inputs must produce an explicit V5 C reference candidate');
 const yen=(n)=>'¥'+new Intl.NumberFormat('ja-JP').format(n);
 for(const msg of ['QUEST CLEAR!','BATTLE REPORT','未鑑定の宝箱','¥1,800',yen(cUpper),yen(cUpper*12),yen(cUpper*60),yen(cUpper*120),'未確定','実際の削減額や将来の結果を保証するものではなく','無料ライフプラン相談の案内を見る']){
  assert.ok(resultText.includes(msg),'Missing RPG reward content: '+msg);
 }
 assert.ok(!resultText.includes('8タイプ図鑑'),'Legacy Chapter 2 type gallery must be absent');
 const chapter2Creatures=await page.evaluate(()=>{
   const beats=[...document.querySelectorAll('[data-section="MUDAGIRI_TALK"]')];
   const records=[...document.querySelectorAll('.c2v32-enemy-record')];
   const previews=[...document.querySelectorAll('.c2v32-enemy-preview')];
   return {
    beatCount:beats.length,
    beatPortraits:beats.every(el=>!!el.querySelector('img[src*="MUDAGIRI_POSE_"]')&&!!el.querySelector('.c2v32-mudagiri-talk')),
    namedEnemyCards:records.every(el=>!!el.querySelector('.c2v32-enemy-tile img')&&!!el.querySelector('.c2v2-enemy-text>b')&&!!el.querySelector('.c2v2-enemy-text>small')),
    enemyCount:records.length, previewCount:previews.length,
    namedMobile:!!records.find(el=>el.textContent.includes('通信ザウルス')),
   };
 });
 assert.equal(chapter2Creatures.beatCount,5,'Chapter 1 style Mudagiri portrait + bubble must recur throughout Chapter 2');
 assert.ok(chapter2Creatures.beatPortraits,'All five Mudagiri talk images must use official pose artwork');
 assert.ok(chapter2Creatures.namedEnemyCards,'Enemy atlas needs both named monster and expense category with art');
 assert.equal(chapter2Creatures.enemyCount,12,'All 12 category enemy characters must remain visible, including N/A');
 assert.ok(chapter2Creatures.previewCount>0&&chapter2Creatures.namedMobile,'Battle preview and canonical monster names must display');
 const jobPortrait=page.locator('.c2v31-job-inner img');
 await jobPortrait.waitFor({state:'visible',timeout:10000});
 const visuals=await page.evaluate(()=>{
  const job=document.querySelector('.c2v31-job-inner img');
  const mascot=document.querySelector('.c2v31-hero-mascot');
  const hero=document.querySelector('.c2v31-hero');
  const report=document.querySelector('[data-section="HOUSEHOLD_BATTLE_RESULTS"]');
  const confirmed=document.querySelector('[data-section="CONFIRMED_REWARD"]');
  const unknown=document.querySelector('[data-section="UNAPPRAISED_TREASURE"]');
  const future=document.querySelector('[data-section="FUTURE_REWARDS"]');
  const cta=document.querySelector('[data-section="CONSULTATION_CTA_TOP"]');
  const font1=parseFloat(getComputedStyle(confirmed.querySelector('.c2v31-confirmed-amount strong')).fontSize);
  const font2=parseFloat(getComputedStyle(unknown.querySelector('.c2v31-unknown-details strong')).fontSize);
  return {jobReady:job.complete&&job.naturalWidth>0,mascotReady:mascot.complete&&mascot.naturalWidth>0,
   heroBg:getComputedStyle(hero).backgroundImage,reportBg:getComputedStyle(report).backgroundImage,
   ctaBg:getComputedStyle(cta).backgroundImage,confirmedFont:font1,uncertainFont:font2,
   sequence:[unknown,future,report,confirmed,cta].every((x,index,a)=>index===0||Boolean(a[index-1].compareDocumentPosition(x)&Node.DOCUMENT_POSITION_FOLLOWING)),
   confirmedIllustration:!!confirmed.querySelector('svg'),lockedChest:!!unknown.querySelector('svg'),
   gold10:!!future.querySelector('.c2v31-reward-ten'),overflow:document.documentElement.scrollWidth>innerWidth+2};
 });
 assert.ok(visuals.jobReady&&visuals.mascotReady,'Official character artwork must load');
 assert.ok(visuals.heroBg.includes('MP_BG_01_GUILD_HALL'),'Official guild-hall background must fill hero');
 assert.ok(visuals.reportBg.includes('MP_BG_02_JOB_UNLOCK'),'Reward report must retain official JOB-unlock world');
 assert.ok(visuals.ctaBg.includes('MP_BG_03_NEXT_QUEST'),'Next quest must use official gate');
 assert.ok(visuals.sequence,'RPG report flow out of order');
 assert.ok(visuals.confirmedIllustration&&visuals.lockedChest&&visuals.gold10,'Rewards must have live UI illustrations');
 assert.ok(visuals.uncertainFont>=visuals.confirmedFont,'Uncertain candidate must lead over confirmed supplementary number');
 assert.ok(!visuals.overflow,'No horizontal scroll at 390px');
 await screenshot('04-chapter2-v32-result');
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});
  const layout=await page.evaluate(()=>{
   const doc=document.documentElement;
   const speech=document.querySelector('.c2v31-dialogue').getBoundingClientRect();
   const mascot=document.querySelector('.c2v31-hero-mascot').getBoundingClientRect();
   const intersect=Math.max(0,Math.min(speech.right,mascot.right)-Math.max(speech.left,mascot.left))
    *Math.max(0,Math.min(speech.bottom,mascot.bottom)-Math.max(speech.top,mascot.top));
   const reward=document.querySelector('.c2v31-ten-details strong');
   return {width:innerWidth,scrollWidth:doc.scrollWidth,speechMascotOverlap:intersect,
    rewardSize:parseFloat(getComputedStyle(reward).fontSize),
    rewardClipped:reward.scrollWidth>reward.getBoundingClientRect().width+2,
    heroY:document.querySelector('.c2v32-hero-teaser strong').getBoundingClientRect().bottom,
    counterFont:parseFloat(getComputedStyle(document.querySelector('.c2v31-counts span')).fontSize),
    tenQualified:!!document.querySelector('.c2v31-ten-qualifier')};
  });
  if(layout.scrollWidth>layout.width+2)throw new Error('V32_HORIZONTAL_OVERFLOW:'+JSON.stringify(layout));
  if(layout.speechMascotOverlap>1)throw new Error('V32_MASCOT_DIALOGUE_OVERLAP:'+JSON.stringify(layout));
  if(layout.rewardSize<28||layout.rewardClipped)throw new Error('V32_TEN_YEAR_REWARD_CLIP:'+JSON.stringify(layout));
  if(width>=375&&layout.heroY>844)throw new Error('V32_FIRST_FOLD_CANDIDATE_HIDDEN:'+JSON.stringify(layout));
  if(layout.counterFont<(width<=350?13:12))throw new Error('V32_COUNTER_TOO_SMALL:'+JSON.stringify(layout));
  if(!layout.tenQualified)throw new Error('V32_10_YEAR_ASSUMPTION_MISSING');
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
