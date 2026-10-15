import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.PUBLIC_ROUTE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const cases=[
 {query:'',label:'public Chapter 1',chapter:1,expected:'診断をはじめる'},
 {query:'?mode=household',label:'old V5 fallback',chapter:2,expected:'無料で冒険をはじめる'},
 {query:'?chapter2v32=1',label:'latest Chapter 2 continuation',chapter:2,expected:'無料で冒険をはじめる'},
 {query:'?mode=adaptive&utm_source=x&utm_campaign=household_quest_clear',label:'share enters Chapter 1',chapter:1,expected:'診断をはじめる'},
];
try{
 for(const sample of cases){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ja-JP'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const url=new URL(sample.query,base);
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:sample.expected}).first().waitFor({state:'visible',timeout:16000});
  const isPersonality=await page.locator('.mpp-page').count()>0;
  assert.equal(isPersonality,sample.chapter===1,sample.label+' must route correctly');
  const w=await page.evaluate(()=>({actual:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(w.scroll<=w.actual+2,sample.label+' horizontal overflow '+JSON.stringify(w));
  assert.deepEqual(errors,[],sample.label+' must not throw browser exceptions');
  console.log('PUBLIC_ROUTE_BROWSER_PASS',sample.label);
  await context.close();
 }
 // Existing valid results must not get swallowed by Chapter 1 after release.
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const p=await context.newPage();
 await p.addInitScript(()=>{
  localStorage.setItem('mudagiri_active_result_v1',JSON.stringify({
   schemaVersion:'MUDAGIRI_ACTIVE_RESULT_V1',diagnosisId:'restore-v5-synthetic',
   anonymousUserId:'restore-v5-synthetic',completedAt:'2026-10-15T00:00:00Z',
   methodology:{diagnosis:'V5',resolver:'V2',type:'TYPE_MODEL_V3_1_8'},
   completed:{profile:{age:35,householdSize:1}}
  }));
 });
 await p.goto(base,{waitUntil:'networkidle'});
 assert.equal(await p.locator('.mpp-page').count(),0,'pre-existing household results must not jump to Chapter 1');
 console.log('PUBLIC_ROUTE_BROWSER_PASS existing result resumption route');
 await context.close();
 console.log('PUBLIC_CHAPTER12_BROWSER_QA_PASS');
}finally{await browser.close()}
