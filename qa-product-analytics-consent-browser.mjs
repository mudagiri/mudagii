import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

/** Consent QA is completely local. Intercept all would-be PostHog requests. */
const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const base=process.env.INTEGRATION_URL||'http://127.0.0.1:4173/pilot/analytics-consent-qa/';
const chapter1=new URL('pilot/money-type/',base).toString();
const out='integration-v31-mobile-qa/'+engine;
await fs.mkdir(out,{recursive:true});
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ja-JP'});
const page=await context.newPage();
const captures=[];
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await context.route(/https:\/\/(?:us|eu)\.i\.posthog\.com\//,async(route)=>{
 const request=route.request();
 const body=JSON.parse(request.postData()||'null');
 captures.push({body,headers:request.headers(),url:request.url()});
 await route.fulfill({status:200,contentType:'application/json',body:'{}'});
});
const button=(label)=>page.getByRole('button',{name:label,exact:true});
async function resetChapter1(){
 await page.evaluate(()=>{
  localStorage.removeItem('mudagiri_money_type_public_state_v1');
  localStorage.removeItem('mudagiri_money_type_funnel_v1');
 });
 await page.reload({waitUntil:'networkidle'});
 await button('診断をはじめる').waitFor({state:'visible'});
}
try{
 await page.goto(chapter1,{waitUntil:'networkidle'});
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 await page.reload({waitUntil:'networkidle'});
 const panel=page.locator('.mg-privacy-panel');
 await panel.waitFor({state:'visible'});
 assert.ok((await panel.innerText()).includes('同意しなくても診断は使えます'));
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  const sizes=await page.evaluate(()=>{
   const el=document.querySelector('.mg-privacy-panel');
   const rect=el.getBoundingClientRect();
   const buttons=[...el.querySelectorAll('button')].map(btn=>btn.getBoundingClientRect().height);
   return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,panelLeft:rect.left,panelRight:rect.right,buttonHeights:buttons};
  });
  assert.ok(sizes.panelLeft>=-1&&sizes.panelRight<=width+1,'Privacy banner clips: '+JSON.stringify(sizes));
  assert.ok(sizes.buttonHeights.every(n=>n>=43),'Consent buttons must be tappable: '+JSON.stringify(sizes));
  await page.screenshot({path:out+'/07-analytics-consent-'+width+'.png'});
 }
 await button('同意しない').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('mudagiri_analytics_consent_v1')),'denied');
 await button('診断をはじめる').click();
 await page.waitForTimeout(300);
 assert.equal(captures.length,0,'No analytics traffic while consent is denied');
 await resetChapter1();
 await button('匿名計測の設定を開く').click();
 await button('同意する').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('mudagiri_analytics_consent_v1')),'granted');
 await button('診断をはじめる').click();
 await page.waitForTimeout(600);
 assert.equal(captures.length,1,'Opt-in should capture exactly one Chapter 1 start');
 const captured=captures[0];
 assert.equal(captured.url,'https://us.i.posthog.com/capture/');
 assert.equal(captured.body.event,'mudagiri_chapter1_started');
 assert.equal(captured.body.properties.chapter,'chapter1');
 assert.equal(captured.body.properties.$process_person_profile,false);
 assert.equal(captured.body.properties.$geoip_disable,true);
 assert.equal(captured.headers.cookie,undefined,'No cookies may be sent to PostHog');
 assert.equal(captured.headers.referer,undefined,'No referrer URL may be sent to PostHog');
 assert.ok(!/350000|100000|diagnosisId|monthly|email|answer/i.test(JSON.stringify(captured.body)),'No private assessment input in analytics');
 await button('匿名計測の設定を開く').click();
 await button('同意を撤回する').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('mudagiri_analytics_consent_v1')),'denied');
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('mudagiri_analytics_session_v1')),null,'Revocation must clear anonymous analytics session');
 await resetChapter1();
 await button('診断をはじめる').click();
 await page.waitForTimeout(300);
 assert.equal(captures.length,1,'No future capture allowed after withdrawal');
 assert.deepEqual(errors,[],'No browser exceptions');
 await fs.writeFile(out+'/privacy-consent-report.json',JSON.stringify({ok:true,engine,attempts:captures.length,preConsentZero:true,deniedZero:true,optInExactlyOne:true,withdrawalStopsCollection:true},null,2));
 console.log('MUDAGIRI_ANALYTICS_CONSENT_QA_PASS',engine);
}finally{
 await browser.close();
}
