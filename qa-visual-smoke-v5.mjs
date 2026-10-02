import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const OUT='visual-smoke-v5';
await fs.mkdir(OUT,{recursive:true});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:390,height:844},
  deviceScaleFactor:1,
  isMobile:true,
  hasTouch:true,
  locale:'ja-JP',
  colorScheme:'dark',
});
const page=await context.newPage();
await page.addInitScript(()=>{
  window.__mudagiriShareCalls=[];
  window.open=(url)=>{window.__mudagiriShareCalls.push({kind:'open',url:String(url)});return null};
  try{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true})}catch{}
  try{Object.defineProperty(navigator,'share',{configurable:true,value:async(data)=>{window.__mudagiriShareCalls.push({kind:'share',title:data?.title??'',text:data?.text??'',files:(data?.files??[]).map(f=>f.name)})}})}catch{}
});
page.on('pageerror',err=>console.error('PAGE_ERROR',err.stack||err.message));
page.on('console',msg=>{if(msg.type()==='error')console.error('BROWSER_CONSOLE_ERROR',msg.text())});
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173/';

const report=[];
async function metrics(name,{allowVertical=false}={}){
  await page.waitForTimeout(60);
  const m=await page.evaluate(({allowVertical})=>{
    const visible=(el)=>{
      const s=getComputedStyle(el);
      const r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0;
    };
    const root=document.scrollingElement||document.documentElement;
    const controls=[...document.querySelectorAll('button,input,select')].filter(visible).map((el)=>{
      const r=el.getBoundingClientRect();
      return {
        tag:el.tagName.toLowerCase(),
        text:(el.getAttribute('aria-label')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80),
        x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right,
      };
    });
    const clipped=allowVertical?[]:controls.filter(x=>x.x<-2||x.right>innerWidth+2||x.y<-2||x.bottom>innerHeight+2);
    const tooSmall=controls.filter(x=>x.tag==='button'&&x.height<47.5);
    return {
      viewport:{width:innerWidth,height:innerHeight},
      scroll:{width:root.scrollWidth,height:root.scrollHeight},
      horizontalOverflow:root.scrollWidth>innerWidth+2,
      verticalOverflow:!allowVertical&&root.scrollHeight>innerHeight+4,
      clipped,
      tooSmall,
      activeScene:document.querySelector('main')?.className||document.querySelector('.pre-stage > section')?.className||'',
    };
  },{allowVertical});
  report.push({name,...m});
  if(m.horizontalOverflow)throw new Error('VISUAL_HORIZONTAL_OVERFLOW:'+name+':'+JSON.stringify(m.scroll));
  if(m.verticalOverflow)throw new Error('VISUAL_VERTICAL_OVERFLOW:'+name+':'+JSON.stringify(m.scroll));
  if(m.clipped.length)throw new Error('VISUAL_CLIPPED_CONTROL:'+name+':'+JSON.stringify(m.clipped));
  if(m.tooSmall.length)throw new Error('VISUAL_TOUCH_TARGET_LT48:'+name+':'+JSON.stringify(m.tooSmall));
}
async function shot(name,{fullPage=false,allowVertical=false}={}){
  await metrics(name,{allowVertical});
  await page.screenshot({path:`${OUT}/${name}.png`,fullPage});
}
async function clickButton(re){
  const b=page.getByRole('button',{name:re}).first();
  await b.waitFor({state:'visible'});
  await b.click();
}
async function waitHeading(name){
  const h=page.getByRole('heading',{name}).first();
  await h.waitFor({state:'visible'});
}
async function startPersonal(){
  await page.goto(base,{waitUntil:'networkidle'});
  await shot('01-opening');
  await clickButton(/無料で冒険をはじめる/);
  await waitHeading('今回チェックするのは？');
  await shot('02-scope-personal');
  await clickButton(/自分が払っている分/);
  await waitHeading('どのムダギリに斬られる？');
  await shot('03-mode');
  await clickButton(/正論ムダギリ/);
  await waitHeading('一緒に暮らしている人数は？');
}

async function clearJourney(){
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'networkidle'});
}

// Scenario A: common single-person flow all the way to Result.
await clearJourney();
await startPersonal();
await shot('04-single-household-size');
await clickButton(/次へ/);

await waitHeading('今住んでる都道府県は？');
await page.getByRole('combobox').selectOption({label:'東京都'});
await shot('05-single-prefecture');
await clickButton(/次へ/);

await waitHeading('年齢は？');
await page.getByRole('textbox',{name:'年齢'}).fill('35');
await clickButton(/次へ/);

await waitHeading('今の住まいは？');
await shot('06-single-housing');
await clickButton(/賃貸/);
await clickButton(/民間賃貸/);

await waitHeading('あなた自身の毎月の手取りは？');
await page.getByRole('textbox',{name:'毎月の手取り'}).fill('350000');
await shot('07-single-income');
await clickButton(/次へ/);

await waitHeading('毎月の通信費はいくら？');
await shot('08-scan-first');
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
await shot('09-scan-complete');
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
await shot('10-appraisal-complete');
await clickButton(/お金タイプを解析する/);

await page.getByText('MONEY STYLE ANALYSIS').waitFor();
await shot('11-type-quiz');
for(let i=0;i<8;i++){
  if(i===1){
    const back=page.getByRole('button',{name:/戻る/}).first();
    await back.waitFor({state:'visible'});
    await back.click();
    const previous=page.getByRole('radio',{name:/かなり A 寄り/}).first();
    await previous.waitFor({state:'visible'});
    await previous.click();
    await page.waitForTimeout(80);
  }
  const opt=page.getByRole('radio',{name:/かなり A 寄り/}).first();
  await opt.waitFor({state:'visible'});
  await opt.click();
  await page.waitForTimeout(80);
}
await page.getByText(/行動パターン/).waitFor();
await shot('12-type-complete');
await clickButton(/最後のクエストへ/);

await page.getByText(/優先チェック対象なし|見直しクエストを特定|見直しやすいところ|処刑候補/).waitFor();
await shot('13-battle-intro');
await clickButton(/結果へ進む|クエストを開始する/);
// Confirmed targets enter the combo battle; zero-target scenarios jump straight to completion.
const comboStart=page.getByRole('button',{name:/優先チェック開始/}).first();
if(await comboStart.count()){
  await comboStart.waitFor({state:'visible'});
  await comboStart.click();
  const comboDone=page.getByRole('button',{name:/診断結果へ/}).first();
  await comboDone.waitFor({state:'visible',timeout:10000});
  await comboDone.click();
}
await page.getByText(/家計防衛成功|見直しクエスト完了/).waitFor();
await shot('14-battle-complete');
await clickButton(/診断結果を見る/);

await page.getByText(/家計クエスト/).first().waitFor();
await page.waitForTimeout(260);
await shot('15-result-top',{allowVertical:true});
for(const label of ['𝕏','Instagram','Threads','LINE']){const btn=page.locator('.v51-type-share button',{hasText:label}).first();await btn.waitFor({state:'visible'})}
// Share regression without leaving the test page: X should open an intent; Instagram/Threads should invoke native share.
await page.locator('.v51-type-share button',{hasText:'𝕏'}).first().click();
await page.locator('.v51-type-share button',{hasText:'Instagram'}).first().click();
await page.locator('.v51-type-share button',{hasText:'Threads'}).first().click();
await page.waitForTimeout(80);
const shareCalls=await page.evaluate(()=>window.__mudagiriShareCalls||[]);
const xIntent=shareCalls.find(x=>x.kind==='open'&&x.url.includes('twitter.com/intent/tweet'));
const nativeShares=shareCalls.filter(x=>x.kind==='share');
if(!xIntent)throw new Error('X_SHARE_INTENT_NOT_CALLED:'+JSON.stringify(shareCalls));
if(nativeShares.length<2)throw new Error('NATIVE_SHARE_NOT_CALLED_FOR_INSTAGRAM_THREADS:'+JSON.stringify(shareCalls));
for(const call of nativeShares){
  const payload=(call.text||'');
  if(!payload.includes('#ムダギリ診断')||payload.includes('350000')||payload.includes('70000')||payload.includes('1800'))throw new Error('SHARE_PRIVACY_OR_BRAND_REGRESSION:'+JSON.stringify(call));
}
const futureRange=page.locator('.v51-money-hero.is-range').first();
await futureRange.waitFor({state:'visible'});
const futureRangeText=(await futureRange.innerText()).replace(/\s+/g,'');
if(!futureRangeText.includes('1,800')||!futureRangeText.includes('〜'))throw new Error('FUTURE_RANGE_NOT_RENDERED:'+futureRangeText);
if(await futureRange.locator('strong').count()!==2)throw new Error('FUTURE_RANGE_MUST_RENDER_TWO_VALUES');
for(const [name,selector] of [
  ['15a-result-type','.v5-type'],
  ['15b-result-position','.v5-position'],
  ['15c-result-verdict','.v5-verdict'],
  ['15d-result-future','.v5-future'],
  ['15d2-result-impact','.v5-impact'],
  ['15e-result-goal','.v5-goal'],
  ['15f-result-next','.v5-next'],
  ['15g-result-save','.v5-save'],
  ['15h-result-life','.v5-life'],
  ['15j-result-friend','.v5-friend'],
]){
  const el=page.locator(selector);await el.scrollIntoViewIfNeeded();await el.waitFor({state:'visible'});await shot(name,{allowVertical:true});
}
const goal=page.getByRole('button',{name:/住まい/}).first();
if(await goal.count()){await goal.click();await shot('15k-result-goal-selected',{allowVertical:true})}

// Regression: a subscription shown in the verdict must jump to its atlas entry and auto-open detail.
const subVerdict=page.getByRole('button',{name:/サブスクサキュバスの詳細を見る/}).first();
await subVerdict.waitFor({state:'visible'});
await subVerdict.click();
const subEntry=page.locator('#enemy-sub');
await subEntry.waitFor({state:'visible'});
const subDetail=subEntry.locator('.v51-atlas-detail');
await subDetail.waitFor({state:'visible'});
await page.waitForTimeout(500);
const subDetailText=(await subDetail.innerText()).replace(/\s+/g,'');
if(!subDetailText.includes('確認できた改善額：¥1,800/月'))throw new Error('SUBSCRIPTION_CONFIRMED_SAVING_DETAIL_MISSING:'+subDetailText);
await shot('15l-result-sub-verdict-jump',{allowVertical:true});
// Return atlas to a neutral collapsed state, then exercise a normal remaining-enemy disclosure too.
await subEntry.locator('button').first().click();
const atlasClose=page.locator('.v51-atlas-more').first();
if(await atlasClose.count()&&((await atlasClose.innerText()).includes('閉じる')))await atlasClose.click();
const atlasMore=page.getByRole('button',{name:/残りの敵も見る/}).first();if(await atlasMore.count()){await atlasMore.click();const mini=page.locator('.v51-enemy-mini').first();if(await mini.count()){await mini.click();await page.locator('.v51-atlas-detail').first().waitFor({state:'visible'});await shot('15m-result-atlas-detail-open',{allowVertical:true})}}
const save=page.getByRole('button',{name:/結果をLINEに保存/}).first();await save.scrollIntoViewIfNeeded();await save.click();
await page.getByRole('dialog').waitFor({state:'visible'});await page.getByRole('heading',{name:'診断結果をLINEに保存'}).waitFor();await shot('15n-line-save-modal',{allowVertical:true});await clickButton(/あとで/);
await shot('16-result-full',{fullPage:true,allowVertical:true});

// Cross-width Result regression: narrow and wide phones.
for(const vp of [{width:375,height:812,name:'375x812'},{width:430,height:932,name:'430x932'}]){
  await page.setViewportSize({width:vp.width,height:vp.height});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(120);
  if(vp.width===375){
    const range=page.locator('.v51-money-hero.is-range').first();
    await range.scrollIntoViewIfNeeded();
    const boxes=await range.locator('strong').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}}));
    if(boxes.length!==2||Math.abs(boxes[0].top-boxes[1].top)>3)throw new Error('FUTURE_RANGE_WRAP_375:'+JSON.stringify(boxes));
    const typeLabels=await page.locator('.v51-type-grid b').evaluateAll(els=>els.map(el=>({text:(el.textContent||'').trim(),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight})));
    const badTypeLabel=typeLabels.find(x=>x.scrollWidth>x.clientWidth+1||x.scrollHeight>x.clientHeight+1);
    if(badTypeLabel)throw new Error('TYPE_PREVIEW_LABEL_CLIPPED_375:'+JSON.stringify(badTypeLabel));
    const impactMoney=await page.locator('.v51-impact-money').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {text:(el.getAttribute('aria-label')||el.textContent||'').trim(),left:r.left,right:r.right,width:r.width,parentWidth:el.parentElement?.getBoundingClientRect().width||0,children:[...el.children].map(c=>{const x=c.getBoundingClientRect();return {cls:c.className,left:x.left,right:x.right,top:x.top,bottom:x.bottom}})}}));
    const badImpact=impactMoney.find(x=>x.right>vp.width+1||x.left<-1||x.width>x.parentWidth+1);
    if(badImpact)throw new Error('IMPACT_MONEY_LAYOUT_375:'+JSON.stringify(badImpact));
  }
  await shot(`17-result-${vp.name}`,{fullPage:true,allowVertical:true});
}
await page.setViewportSize({width:390,height:844});


// Scenario B: common multi-adult PERSONAL flow + household-total follow-up.
await clearJourney();
await startPersonal();
await page.getByRole('button',{name:'＋'}).click();
await shot('20-multi-household-size');
await clickButton(/次へ/);
await waitHeading('子ども・親と一緒に暮らしてる？');
await shot('21-multi-composition');
await clickButton(/どちらもない/);

await page.getByRole('combobox').selectOption({label:'東京都'});
await clickButton(/次へ/);
await page.getByRole('textbox',{name:'年齢'}).fill('35');
await clickButton(/次へ/);
await clickButton(/賃貸/);
await clickButton(/民間賃貸/);
await page.getByRole('textbox',{name:'毎月の手取り'}).fill('350000');
await clickButton(/次へ/);

// mobile=0
await page.locator('.scan-money input').fill('0');
await clickButton(/気配を探る/);
await clickButton(/次を探す/);
// energy > 0 -> after detected, scope follow-up
await page.locator('.scan-money input').fill('7000');
await clickButton(/気配を探る/);
await page.getByRole('button',{name:/次を探す/}).waitFor({state:'visible',timeout:2500});
await page.getByRole('button',{name:/次を探す/}).click();
await waitHeading('家全体では、光熱費はいくら？');
await shot('22-household-total-followup');

// Scenario C: parent-family bundled contribution edge path.
await clearJourney();
await startPersonal();
await page.getByRole('button',{name:'＋'}).click();
await page.getByRole('button',{name:'＋'}).click();
await clickButton(/次へ/);
await page.getByText('子ども・親と一緒に暮らしてる？').waitFor();
await clickButton(/親・家族と同居/);
await waitHeading('家にお金を入れるときは？');
await shot('30-parent-contribution-mode');
await clickButton(/毎月まとめて払ってる/);
await waitHeading('毎月、家にいくら入れてる？');
await shot('31-parent-bundled-amount');

await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log('VISUAL_SMOKE_V5_PASS',report.length);
