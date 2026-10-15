import {chromium,webkit} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

// Real React Chapter 2 entry and profile/scan flows; synthetic values only.
// No GAS endpoint, LINE, external analytics, or genuine people.
const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const root=process.env.MUDAGIRI_ENTRY_URL??'http://127.0.0.1:4173/index.html?chapter2v32=1';
const out=path.resolve('chapter2-entry-qa');
fs.mkdirSync(out,{recursive:true});
const errors=[];
function expect(condition,message){if(!condition)errors.push(message);}
const expected=[
 ['通信費','端末分割'],
 ['光熱費','灯油'],
 ['サブスク費','ジム月会費'],
 ['食費','デリバリー'],
 ['日用品費','シャンプー'],
 ['娯楽・交際費','月額契約はサブスク'],
 ['美容・服飾費','美容院の月額会員'],
 ['車関連費','自動車保険'],
 ['家賃・住宅ローン','駐車場'],
 ['保険料','自動車保険は車関連費へ'],
 ['自己投資費','子の塾は教育費へ']
];
async function noOverflow(page,label){
 const m=await page.evaluate(()=>({
  viewport:window.innerWidth,
  scroll:document.documentElement.scrollWidth,
  body:document.body.scrollWidth
 }));
 expect(m.scroll<=m.viewport+2&&m.body<=m.viewport+2,label+' horizontal overflow '+JSON.stringify(m));
}
async function next(page,cls){await page.locator(cls+' .profile-primary-cta').click();}
for(const width of [375,390]){
 const context=await browser.newContext({viewport:{width,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();
 const outgoing=[];
 page.on('pageerror',e=>errors.push(engine+' '+width+' JS error: '+String(e)));
 page.on('request',req=>{const url=req.url();if(['script.google.com','/exec','lin.ee','line.me','posthog'].some(s=>url.includes(s)))outgoing.push(url)});
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await page.locator('.pre-op-cta').waitFor({state:'visible'});
 await page.locator('.pre-op-cta').click();
 await page.locator('.pre-step-scope').waitFor({state:'visible'});
 await noOverflow(page,width+' profile scope');
 await page.getByRole('button',{name:/家全体で払っている分/}).click();
 await page.locator('.mode-select-scene').waitFor({state:'visible'});
 await page.locator('.mode-option.is-recommended').click();
 await page.locator('.pre-step-householdSize').waitFor({state:'visible'});
 await page.locator('.pre-step-householdSize button').filter({hasText:'＋'}).click();
 await next(page,'.pre-step-householdSize');
 await page.locator('.pre-step-composition').waitFor({state:'visible'});
 await page.getByRole('button',{name:/子どもはいない/}).click();
 await page.locator('.pre-step-prefecture').waitFor({state:'visible'});
 await page.locator('.pre-step-prefecture select').selectOption('東京都');
 await next(page,'.pre-step-prefecture');
 await page.locator('.pre-step-age').waitFor({state:'visible'});
 await page.locator('.pre-step-age input').fill('34');
 await next(page,'.pre-step-age');
 await page.locator('.pre-step-housing').waitFor({state:'visible'});
 await page.getByRole('button',{name:/賃貸/}).first().click();
 await page.getByRole('button',{name:/民間賃貸/}).click();
 await page.locator('.pre-step-income').waitFor({state:'visible'});
 await page.locator('.pre-step-income input[aria-label="毎月の手取り"]').fill('550000');
 await next(page,'.pre-step-income');
 await page.locator('.pre-scene-scan .scan-phase-input').waitFor({state:'visible',timeout:7000});
 expect(await page.locator('.pre-complete-title').count()===0,width+' unsupported annual-income prompt must be skipped');
 await noOverflow(page,width+' first scan');
 await page.screenshot({path:path.join(out,engine+'-'+width+'-first-scan.png'),fullPage:true});
 await page.locator('.scan-phase-input .journey-back').click();
 await page.locator('.pre-step-income').waitFor({state:'visible'});
 expect(await page.locator('.pre-step-income input').inputValue()==='550,000',width+' back navigation preserves original take-home');
 await next(page,'.pre-step-income');
 await page.locator('.scan-phase-input').waitFor({state:'visible'});
 for(let i=0;i<expected.length;i++){
  const scan=page.locator('.scan-scene.scan-phase-input');
  await scan.waitFor({state:'visible'});
  const text=await scan.locator('.scan-panel').innerText();
  const [question,rule]=expected[i];
  expect(text.includes(question),width+' step '+(i+1)+' question: '+question);
  expect(text.includes(rule),width+' step '+(i+1)+' source ownership rule: '+rule);
  await noOverflow(page,width+' category '+question);
  if(i===5)await page.screenshot({path:path.join(out,engine+'-'+width+'-entertainment.png'),fullPage:true});
  await scan.locator('.scan-money input').fill('0');
  await scan.locator('.scan-start').click();
  await page.locator('.scan-phase-noSpend .scan-next-search').click();
  if(i===3){
   await page.waitForTimeout(70);
   await page.reload({waitUntil:'domcontentloaded'});
   const resume=page.getByRole('button',{name:/続きから再開/});
   await resume.waitFor({state:'visible'});
   await resume.click();
   await page.locator('.scan-scene.scan-phase-input').waitFor({state:'visible'});
   expect((await page.locator('.scan-number').innerText()).includes('05'),width+' reload resumes at fifth scan, not at beginning');
  }
 }
 await page.locator('.scan-complete-scene').waitFor({state:'visible'});
 expect(await page.locator('.pre-complete-title').count()===0,width+' income calibration never appears');
 expect(outgoing.length===0,width+' no actual GAS/LINE/PostHog requests '+outgoing.join(','));
 await noOverflow(page,width+' scan complete');
 await page.screenshot({path:path.join(out,engine+'-'+width+'-scan-complete.png'),fullPage:true});
 await context.close();
}
await browser.close();
if(errors.length)throw new Error('CHAPTER2_ENTRY_MOBILE_QA_FAIL\n'+errors.join('\n'));
console.log('CHAPTER2_ENTRY_MOBILE_QA_PASS',JSON.stringify({
 browser:engine,widths:[375,390],
 syntheticHouseholdSize:2,fields:['household','prefecture','age','housing','takehome'],
 scannedCategories:expected.length,annualIncomeQuestionSkipped:true,
 syntheticResume:true,externalCalls:0,screenshots:6
}));
