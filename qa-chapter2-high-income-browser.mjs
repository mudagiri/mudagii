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
async function changeAge(n){await age.selectOption(String(n));}
async function selectGross(band){await annual.selectOption(band);}
async function assertRate(pct){
 await food().waitFor({state:'visible',timeout:12000});
 const t=await food().innerText();
 assert.ok(t.includes(pct),`Food reference should be ${pct}, got ${t.slice(0,500)}`);
 assert.equal(await peers().count(),3,'All 3 original public expenses are visible');
 assert.ok(t.includes('あなたの支出割合'),'Personal take-home ratio should display alongside public peer');
 assert.ok(t.includes('2024年'),'Original source year is visible');
}
try{
 await page.goto(url,{waitUntil:'networkidle'});
 await page.locator('[data-result-version="v32"]').waitFor({state:'visible',timeout:18000});
 assert.equal(await page.locator('[data-section="MULTI_HIGH_INCOME_CLASS_OPTIN"]').count(),1);
 assert.equal(await peers().count(),0,'Frozen 1000plus bucket cannot auto-choose a public income column');
 assert.equal(await head.count(),0,'Head-age confirmation is not shown until supported original cell is selected');
 await page.locator('[data-section="MULTI_HIGH_INCOME_CLASS_OPTIN"] summary').click();
 await selectGross('1500plus');
 await worker.waitFor({state:'visible'});
 await head.waitFor({state:'visible'});
 assert.equal(await peers().count(),0,'Selecting published bracket alone does not prove population');
 await worker.check();
 assert.equal(await peers().count(),0,'Household-head age confirmation is independently required');
 await head.check();
 await assertRate('13.7%'); // 40–49, 1500+ source mean 132463 / 965121
 assert.ok((await food().innerText()).includes('世帯年収 1,500万円以上'),'Selection must be visibly labelled');
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
 await worker.check();
 await head.uncheck();
 assert.equal(await peers().count(),0,'Withdrawing household-head age declaration hides peer rates');
 await head.check();
 await selectGross('');
 assert.equal(await peers().count(),0,'Unselecting exact income must revoke peer');
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
