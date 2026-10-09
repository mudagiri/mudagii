import {chromium,webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// Both pages are copies of the same integrated build, served on ONE origin.
// Only the hidden integration prefix is used. No data is POSTed to GAS.
const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const preview=process.env.INTEGRATION_URL||'http://127.0.0.1:4173/pilot/chapter2-v2/';
const firstUrl=new URL('pilot/money-type/',preview).toString();
const out='integration-v3-mobile-qa/'+engine;
await fs.mkdir(out,{recursive:true});
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'ja-JP',colorScheme:'dark'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.__integrationShare=[];
 window.open=(url)=>{window.__integrationShare.push({kind:'open',url:String(url)});return null};
 try{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true})}catch{}
 try{Object.defineProperty(navigator,'share',{configurable:true,value:async(info)=>window.__integrationShare.push({kind:'share',text:info.text,files:(info.files||[]).map(x=>x.name)})})}catch{}
});
async function screenshot(name){await page.screenshot({path:out+'/'+name+'.png',fullPage:true});}
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
 await screenshot('02-chapter1-result');
 await clickButton('家計クエストへ進む');
 await page.waitForURL(url=>url.pathname.endsWith('/pilot/chapter2-v2/'),{timeout:13000});
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
 const inherited=await page.locator('.c2v3-job-card').innerText();
 assert.ok(inherited.includes(before.handoff.jobName),'Chapter 1 job must appear in Chapter 2 without re-scoring');
 const resultText=await page.locator('.c2v2-root').innerText();
 assert.ok(resultText.includes('今回の戦果'),'Household battle report must appear');
 assert.ok(!resultText.includes('8タイプ図鑑'),'Legacy Chapter 2 type gallery must be absent');
 assert.ok(resultText.includes('¥1,800'),'Confirmed savings must retain the verified subscription amount');
 assert.ok(resultText.includes('¥21,600'),'1-year confirmed saving must be prominent');
 assert.ok(resultText.includes('¥108,000'),'5-year confirmed saving must be prominent');
 assert.ok(resultText.includes('¥216,000'),'10-year confirmed saving must be prominent');
 const jobPortrait=page.locator('.c2v3-job-portrait img');
 await jobPortrait.waitFor({state:'visible',timeout:10000});
 const visuals=await page.evaluate(()=>{
  const job=document.querySelector('.c2v3-job-portrait img');
  const guide=document.querySelector('.c2v3-hero-mascot');
  const world=document.querySelector('.c2v3-hero');
  const report=document.querySelector('[data-section="HOUSEHOLD_BATTLE_RESULTS"]');
  const future=document.querySelector('[data-section="FUTURE_REWARDS"]');
  const cta=document.querySelector('[data-section="CONSULTATION_CTA_TOP"]');
  const impact=future.querySelector('.c2v3-reward-ten strong');
  const impactSize=parseFloat(getComputedStyle(impact).fontSize);
  const first=getComputedStyle(world).backgroundImage;
  return {
    jobReady:job.complete&&job.naturalWidth>0,
    mascotReady:guide.complete&&guide.naturalWidth>0,
    background:first,
    impactSize,
    rewardVisible:future.querySelector('.c2v3-reward-ten')!==null,
    reportFirst:!!(report.compareDocumentPosition(future)&Node.DOCUMENT_POSITION_FOLLOWING),
    beforeConsult:!!(future.compareDocumentPosition(cta)&Node.DOCUMENT_POSITION_FOLLOWING),
    overflow:document.documentElement.scrollWidth>window.innerWidth+2,
  };
 });
 assert.ok(visuals.jobReady,'Canonical inherited JOB artwork must load');
 assert.ok(visuals.mascotReady,'Official RESULT mascot artwork must load');
 assert.ok(visuals.background.includes('MP_BG_02_JOB_UNLOCK'),'Use existing guild victory background');
 assert.ok(visuals.reportFirst&&visuals.beforeConsult,'Battle report then future rewards then consultation');
 assert.ok(visuals.impactSize>=28,'10-year future reward should be visually prominent');
 assert.ok(!visuals.overflow,'Result must not overflow mobile viewport');
 await screenshot('04-chapter2-result-with-job');
 const result=await page.evaluate(()=>JSON.parse(localStorage.getItem('mudagiri_active_result_v1')||'null'));
 assert.equal(result?.methodology?.type,'CHAPTER2_V2_NO_PERSONALITY');
 assert.equal(Object.keys(result?.completed?.typeAnswers||{}).length,0);
 // Chapter 2 share URL must lead back to Chapter 1 of the same hidden preview.
 await clickButton(/Xで文章を共有/);
 const links=await page.evaluate(()=>window.__integrationShare);
 const x=links.find(v=>v.kind==='open'&&v.url.includes('twitter.com/intent/tweet'));
 assert.ok(x,'X share intent missing');
 const decoded=decodeURIComponent(new URL(x.url).searchParams.get('text')||'');
 assert.ok(decoded.includes(firstUrl),'Chapter 2 referral must lead to the integrated Chapter 1 entry');
 await page.reload({waitUntil:'networkidle'});
 await page.locator('.c2v2-root').waitFor({state:'visible',timeout:14000});
 assert.ok((await page.locator('.c2v3-job-card').innerText()).includes(before.handoff.jobName),'Handoff must survive reload');
 await screenshot('05-chapter2-resumed');
 if(errors.length)throw new Error('BROWSER_PAGE_ERRORS:'+JSON.stringify(errors));
 await fs.writeFile(out+'/report.json',JSON.stringify({
  ok:true,engine,simulatedMobile:true,publicPageNotModified:true,chapter1Count:count,
  inheritedJobCode:before.handoff.jobCode,anonymousIdsEqual:true,legacyEightQuestionsSkipped:true,
  savedResultWithoutTypeAnswers:true,referralToChapter1:true,reloadPassed:true
 },null,2));
 console.log('CHAPTER2_V3_INTEGRATION_PASS',engine,'answers',count,'JOB',before.handoff.jobCode);
}finally{
 await browser.close();
}
