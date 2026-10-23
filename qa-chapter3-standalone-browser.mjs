import {chromium,webkit} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const engine=process.env.BROWSER_ENGINE??'chromium';
const origin=process.env.PREVIEW_ORIGIN??'http://127.0.0.1:4173';
const browser=await ({chromium,webkit})[engine].launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
let errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{
 const u=new URL(r.url());
 if(['http:','https:'].includes(u.protocol)&&!['127.0.0.1','localhost'].includes(u.hostname))external.push(u.href);
});
const dir='chapter3-standalone-browser-qa/'+engine;
await fs.mkdir(dir,{recursive:true});
const snap=async filename=>page.screenshot({path:dir+'/'+filename+'.png',fullPage:true});
try{
 await page.goto(origin+'/?chapter3solo=1',{waitUntil:'domcontentloaded'});
 await page.locator('[data-chapter3-standalone="true"]').waitFor();
 assert.equal(await page.locator('[data-chapter3-standalone="true"]').count(),1);
 assert.equal(await page.locator('[data-testid="chapter3-question"]').count(),0,'starts with meaningful opening');
 await snap('01-opening');
 // The result screen must be discoverable without traversing Ch1 or Ch2.
 await page.getByRole('button',{name:/リザルト画面のサンプルを先に見る/}).click();
 await page.locator('[data-testid="chapter3-result"]').waitFor({state:'visible'});
 assert.match(await page.locator('[data-testid="chapter3-result"]').innerText(),/架空の回答例による結果サンプル/);
 await snap('01b-visible-result-sample');
 await page.getByRole('button',{name:/もう一度、未来を選び直す/}).click();
 await page.getByRole('button',{name:/冒険に出る/}).click();
 const titles=[
  /未来の自分に、どんな景色を見せたい/,
  /何がいちばん引っかかる/,
  /これは失いたくない/,
  /今週、実際に使えそうなのは/
 ];
 for(let i=0;i<4;i++){
  await page.getByRole('heading',{name:titles[i]}).waitFor();
  assert.equal(await page.locator('[data-testid="chapter3-question"] .c3s-option').count(),[6,4,4,4][i]);
  if(i===0)await page.getByRole('button',{name:/資産形成を、無理なく前に進めたい/}).click();
  if(i===1)await page.getByRole('button',{name:/必要なお金・支払いが見えない/}).click();
  if(i===2)await page.getByRole('button',{name:/毎日の暮らしの安心/}).click();
  if(i===3)await page.getByRole('button',{name:/記録・契約・明細を調べられる/}).click();
 }
 const result=page.locator('[data-testid="chapter3-result"]');
 await result.waitFor({state:'visible'});
 const headline=await page.locator('[data-testid="chapter3-result-headline"]').innerText();
 const firstAction=await page.locator('[data-testid="chapter3-first-action"]').innerText();
 assert.match(headline,/資産形成/);
 assert.match(firstAction,/3か月/);
 assert.equal(await result.locator('[data-testid="chapter3-decide-now"]').count(),1,'result offers a decision now');
 assert.match(await result.innerText(),/この場で、次の進み方を決めよう/);
 assert.doesNotMatch(await result.innerText(),/7日後|30日後|90日後/,'no delayed milestones as decision defaults');
 await result.getByRole('button',{name:/この一手で自分で進む/}).click();
 const decision=await result.getByRole('status').innerText();
 assert.match(decision,/自分で進む道を選んだ/);
 assert.ok(decision.includes(firstAction),'chosen route carries specific first action, not a generic reminder');
 assert.match(await result.innerText(),/第2章家計戦果は、この単独プレビューでは未接続/);
 await snap('02-complete-result');
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});
  let dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
  assert.ok(dims.scroll<=dims.inner+3,'horizontal overflow on '+width+' actual '+JSON.stringify(dims));
 }
 await page.getByRole('button',{name:/4つの準備資源を確認する/}).click();
 assert.equal(await result.locator('.c3s-capital>div').count(),4);
 await page.getByRole('button',{name:/この作戦を相談する/}).click();
 const modal=page.getByRole('dialog',{name:/この作戦を相談する/});
 await modal.waitFor({state:'visible'});
 assert.match(await modal.innerText(),/必要資金・支出予定/);
 assert.match(await modal.innerText(),/実際のLINE登録や予約は行いません/);
 await modal.getByRole('button',{name:/作戦書に戻る/}).click();
 await modal.waitFor({state:'hidden'});
 await page.getByRole('button',{name:/もう一度、未来を選び直す/}).click();
 await page.getByRole('button',{name:/冒険に出る/}).click();
 await page.getByRole('button',{name:/自分や大切な人との時間を増やしたい/}).click();
 await page.getByRole('button',{name:/目の前のことで時間が足りない/}).click();
 await page.getByRole('button',{name:/今しかない楽しみ/}).click();
 await page.getByRole('button',{name:/今、少しなら時間を使える/}).click();
 await result.waitFor({state:'visible'});
 const secondAction=await page.locator('[data-testid="chapter3-first-action"]').innerText();
 assert.notEqual(firstAction,secondAction,'meaningful different action across routes');
 assert.match(secondAction,/今日の予定/);
 await snap('03-other-result');
 assert.equal(external.length,0,'no external GAS, analytics, LINE or appointment requests');
 assert.equal(errors.length,0,'no browser runtime errors: '+JSON.stringify(errors));
 await fs.writeFile(dir+'/results.json',JSON.stringify({passed:true,engine,headline,firstAction,secondAction,externalRequests:external,errors},null,2));
 console.log('CHAPTER3_STANDALONE_BROWSER_PASS',JSON.stringify({engine,headline,firstAction,secondAction,externalRequests:0}));
}finally{await browser.close()}
