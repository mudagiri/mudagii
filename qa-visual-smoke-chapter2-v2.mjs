import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const OUT='visual-smoke-chapter2-v2';
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
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173/?chapter2v2=1';

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

await clickButton(/最後のクエストへ/);
if(await page.getByText('MONEY STYLE ANALYSIS').count())throw new Error('LEGACY_TYPE_QUIZ_SHOWN_IN_V2');
await page.getByText(/優先チェック対象なし|見直しクエストを特定|見直しやすいところ|処刑候補/).waitFor();
await shot('11-v2-battle-intro');
await clickButton(/結果へ進む|クエストを開始する/);
const comboStart=page.getByRole('button',{name:/優先チェック開始/}).first();
if(await comboStart.count()){
 await comboStart.click();
 const done=page.getByRole('button',{name:/診断結果へ/}).first();
 await done.waitFor({state:'visible',timeout:12000});await done.click();
}
await page.getByText(/家計防衛成功|見直しクエスト完了/).waitFor();
await page.getByText(/NEXT：RESULT \/ 戦果・改善候補・守る支出/).waitFor();
await shot('12-v2-battle-complete');
await clickButton(/診断結果を見る/);
await page.locator('.c2v2-root').waitFor({state:'visible',timeout:15000});
await shot('13-v2-result-first-view',{allowVertical:true});
const rendered=await page.locator('.c2v2-root').innerText();
if(/TYPE UNLOCKED|称号を獲得|8タイプ図鑑|鉄壁マネー要塞|未来直感ゾンビ/.test(rendered)){
 throw new Error('V2_LEGACY_TYPE_REWARD_LEAK:'+rendered.slice(0,700));
}
if(!rendered.includes('ライフプラン相談の案内を見る'))throw new Error('V2_CTA_NOT_VISIBLE');
if(!rendered.includes('¥1,800'))throw new Error('V2_CONFIRMED_SAVING_MISSING');
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mudagiri_active_result_v1')||'null'));
if(saved?.methodology?.type!=='CHAPTER2_V2_NO_PERSONALITY')throw new Error('V2_RESULT_METHODOLOGY_MISSING');
if(Object.keys(saved?.completed?.typeAnswers||{}).length)throw new Error('V2_SAVED_LEGACY_TYPE_ANSWERS');

const sectionShots=[
 ['14-v2-report','[data-section="HOUSEHOLD_BATTLE_RESULTS"]'],
 ['15-v2-next','[data-section="NEXT_QUEST"]'],
 ['16-v2-atlas','[data-section="CATEGORY_ENCYCLOPEDIA"]'],
 ['17-v2-goal','[data-section="GOAL_QUEST"]'],
 ['18-v2-share','[data-section="HOUSEHOLD_SHARE"]']
];
for(const [name,sel] of sectionShots){
 const el=page.locator(sel);await el.scrollIntoViewIfNeeded();await shot(name,{allowVertical:true});
}
const atlasOpen=page.getByRole('button',{name:/鑑定理由を見る/}).first();
await atlasOpen.click();
const detail=page.locator('.c2v2-detail').first();await detail.waitFor({state:'visible'});
if(!(await detail.innerText()).includes('ムダ額'))throw new Error('V2_COMPARISON_WARNING_MISSING');
await shot('19-v2-detail-expanded',{allowVertical:true});
await page.getByRole('button',{name:/画像カードをシェア／保存する/}).click();
await page.waitForTimeout(300);
const shareCalls=await page.evaluate(()=>window.__mudagiriShareCalls||[]);
const native=shareCalls.find(x=>x.kind==='share');
if(!native||!native.files.includes('mudagiri-household-quest.png')){
 throw new Error('V2_IMAGE_SHARE_FILE_MISSING:'+JSON.stringify(shareCalls));
}
if(/350000|70000|1800|未来直感ゾンビ|TYPE/.test(JSON.stringify(native))){
 throw new Error('V2_SHARE_PRIVACY:'+JSON.stringify(native));
}
await page.getByRole('button',{name:/ライフプラン相談の案内を見る/}).first().click();
await page.getByRole('dialog',{name:'ライフプラン相談の案内へ'}).waitFor();
await shot('20-v2-consultation-dialog',{allowVertical:true});
await page.getByRole('button',{name:'今は結果を見る'}).click();

for(const vp of [{width:375,height:812},{width:430,height:932}]){
 await page.setViewportSize(vp);await page.evaluate(()=>scrollTo(0,0));
 await shot('21-v2-result-'+vp.width,{fullPage:true,allowVertical:true});
}
// Refresh without the query: a stored V2 result must remain V2.
const noFlag=new URL(base);noFlag.searchParams.delete('chapter2v2');
await page.goto(noFlag.toString(),{waitUntil:'networkidle'});
await page.locator('.c2v2-root').waitFor();
if(await page.locator('.v51-type').count())throw new Error('V2_RETURNED_AS_LEGACY_TYPE_AFTER_RELOAD');
await shot('22-v2-resume-without-query',{allowVertical:true});
await fs.writeFile(OUT+'/report.json',JSON.stringify(report,null,2));
await browser.close();
console.log('CHAPTER2_V2_BROWSER_SMOKE_PASS',report.length);
