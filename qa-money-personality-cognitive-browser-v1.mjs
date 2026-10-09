import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const OUT='visual-smoke-v5/money-personality-cognitive';
await fs.mkdir(OUT,{recursive:true});
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'ja-JP',colorScheme:'dark'});
const page=await context.newPage();
page.on('pageerror',err=>{throw err});

await page.goto(base+'?adaptive=money-type&cognitive=1&debug=1',{waitUntil:'networkidle'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle'});
await page.getByRole('button',{name:'診断をはじめる'}).click();
await page.locator('.mpp-question-card').waitFor({state:'visible'});
await page.locator('.mpp-cog-note').waitFor({state:'visible',timeout:5000});
await page.getByRole('button',{name:'意味が取りづらい'}).click();

let answered=0;
for(let guard=0;guard<80;guard++){
  await page.waitForFunction(()=>Boolean(
    document.querySelector('.mpp17-page')||
    document.querySelector('.mpp-class-unlock')||
    document.querySelector('.mpp-separator-options button')||
    document.querySelector('.mpp-scale button')||
    document.querySelector('.mpp-answer-list button')
  ),{timeout:2500}).catch(()=>{});
  const result=page.locator('.mpp17-page');
  if(await result.count()&&await result.isVisible())break;
  if(await page.locator('.mpp-class-unlock').count()){
    await page.getByRole('button',{name:'結果を見る'}).waitFor({state:'visible',timeout:10000});
    await page.getByRole('button',{name:'結果を見る'}).click();
    continue;
  }
  const separator=page.locator('.mpp-separator-options button');
  if(await separator.count()){
    await separator.first().click();answered++;await page.waitForTimeout(170);continue;
  }
  const scale=page.locator('.mpp-scale button');
  if(await scale.count()){
    await scale.nth(2).click();answered++;await page.waitForTimeout(170);continue;
  }
  const likert=page.locator('.mpp-answer-list button');
  if(await likert.count()){
    await likert.nth(2).click();answered++;await page.waitForTimeout(170);continue;
  }
  throw new Error('COGNITIVE_PUBLIC_NO_ANSWER_CONTROL');
}
await page.locator('.mpp17-page').waitFor({state:'visible',timeout:15000});
await page.waitForFunction(()=>Boolean(localStorage.getItem('mudagiri_money_type_public_last_payload_v1')),{timeout:5000});
await page.getByRole('button',{name:'テスト用フィードバック'}).waitFor({state:'visible',timeout:5000});
await page.getByRole('button',{name:'テスト用フィードバック'}).click();
await page.locator('.mpp-cog-panel').waitFor({state:'visible'});

const ratings=page.locator('.mpp-cog-rating');
const ratingCount=await ratings.count();
if(ratingCount<6)throw new Error('COGNITIVE_RATING_COUNT_BAD:'+ratingCount);
for(let i=0;i<ratingCount;i++)await ratings.nth(i).locator('button').nth(i===3?2:4).click();
await page.locator('.mpp-cog-screenshot label').first().click();
const textareas=page.locator('.mpp-cog-text textarea');
await textareas.nth(0).fill('強みが自分っぽい');
await textareas.nth(1).fill('大きな違和感はない');
await textareas.nth(2).fill('Cognitive browser smoke');
const submit=page.getByRole('button',{name:'フィードバックを保存'});
if(await submit.isDisabled())throw new Error('COGNITIVE_SUBMIT_DISABLED_AFTER_REQUIRED');
await submit.click();
await page.waitForFunction(()=>Boolean(localStorage.getItem('mudagiri_money_type_cognitive_last_payload_v1')),{timeout:5000});
await page.screenshot({path:`${OUT}/01-debrief-saved.png`,fullPage:true});

const data=await page.evaluate(()=>{
  const payload=JSON.parse(localStorage.getItem('mudagiri_money_type_cognitive_last_payload_v1')||'null');
  const parent=JSON.parse(localStorage.getItem('mudagiri_money_type_public_last_payload_v1')||'null');
  const local=JSON.parse(localStorage.getItem('mudagiri_money_type_cognitive_v1')||'null');
  return {payload,parent,local};
});
if(data.parent?.quality?.cognitiveMode!==true)throw new Error('COGNITIVE_PARENT_MODE_MISSING');
if(data.parent?.quality?.variant!=='PUBLIC_ADAPTIVE_COGNITIVE')throw new Error('COGNITIVE_PARENT_VARIANT_BAD');
if(data.parent?.quality?.collectionCohort!=='PILOT')throw new Error('COGNITIVE_PARENT_COHORT_BAD');
if(data.payload?.kind!=='money_personality_pilot_v1')throw new Error('COGNITIVE_PAYLOAD_KIND_BAD');
if(data.payload?.formId!=='PUBLIC_COGNITIVE_DEBRIEF')throw new Error('COGNITIVE_FORM_BAD');
if(data.payload?.quality?.cognitiveMode!==true)throw new Error('COGNITIVE_MODE_MISSING');
if(!data.payload?.quality?.parentSessionId)throw new Error('COGNITIVE_PARENT_SESSION_MISSING');
if(data.payload?.quality?.parentSessionId!==data.parent?.sessionId)throw new Error('COGNITIVE_PARENT_LINK_MISMATCH');
if((data.payload?.quality?.flaggedItemCount||0)<1)throw new Error('COGNITIVE_FLAG_MISSING');
if(!data.local?.submittedAt)throw new Error('COGNITIVE_LOCAL_SUBMITTED_MISSING');
if(answered<30)throw new Error('COGNITIVE_COMPLETED_BEFORE_CORE30:'+answered);
const report={ok:true,flow:'MUDAGIRI_MONEY_COGNITIVE_BROWSER_V1',answered,ratingCount,flaggedItemCount:data.payload.quality.flaggedItemCount,jobCode:data.payload.quality.jobCode,primaryStyle:data.payload.quality.primaryStyle,parentVariant:data.parent.quality.variant};
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report));
