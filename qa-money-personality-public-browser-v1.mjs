import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const OUT='visual-smoke-v5/money-personality';
await fs.mkdir(OUT,{recursive:true});
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173/';

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
page.on('pageerror',err=>{throw err});

async function noHorizontalOverflow(label){
  const m=await page.evaluate(()=>{
    const root=document.scrollingElement||document.documentElement;
    const buttons=[...document.querySelectorAll('button')].filter(el=>{
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
    }).map(el=>{const r=el.getBoundingClientRect();return {text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,60),height:r.height,right:r.right,left:r.left}});
    return {scrollWidth:root.scrollWidth,width:innerWidth,small:buttons.filter(x=>x.height<37),outside:buttons.filter(x=>x.left<-2||x.right>innerWidth+2)};
  });
  if(m.scrollWidth>m.width+2)throw new Error(`MONEY_PUBLIC_HORIZONTAL_OVERFLOW:${label}:${JSON.stringify(m)}`);
  if(m.outside.length)throw new Error(`MONEY_PUBLIC_CONTROL_OUTSIDE:${label}:${JSON.stringify(m.outside)}`);
  if(m.small.length)throw new Error(`MONEY_PUBLIC_TOUCH_TARGET_TOO_SMALL:${label}:${JSON.stringify(m.small)}`);
}

async function screenshot(name){
  await noHorizontalOverflow(name);
  await page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});
}

await page.goto(base+'?adaptive=money-type&debug=1',{waitUntil:'networkidle'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle'});
await page.getByRole('button',{name:'JOB診断をはじめる'}).waitFor({state:'visible'});
await screenshot('01-intro');
await page.getByRole('button',{name:'JOB診断をはじめる'}).click();
await page.locator('.mpp-question-card').waitFor({state:'visible'});
await screenshot('02-core-question');

let answered=0;
let sawAdaptive=false;
let sawSeparator=false;
let resumeChecked=false;
let capturedAdaptive=false;
let capturedSeparator=false;
for(let guard=0;guard<80;guard++){
  const result=page.locator('.mpp-result');
  if(await result.count()&&await result.isVisible())break;

  const debug=page.locator('.mpp-debug');
  const debugText=await debug.count()?await debug.innerText():'';
  const separator=page.locator('.mpp-separator-options button');
  const isSeparator=Boolean(await separator.count());
  const isAdaptive=!isSeparator&&debugText.includes('core 30');

  if(isAdaptive){
    sawAdaptive=true;
    if(!capturedAdaptive){await screenshot('03-adaptive-question');capturedAdaptive=true;}
  }
  if(isSeparator){
    sawSeparator=true;
    if(!capturedSeparator){await screenshot('04-separator');capturedSeparator=true;}
    await separator.first().click();
    answered++;
    await page.waitForTimeout(180);
    continue;
  }

  const scale=page.locator('.mpp-scale button');
  if(await scale.count()){
    await scale.nth(2).click(); // semantic midpoint regardless of side mapping
    answered++;
  }else{
    const likert=page.locator('.mpp-answer-list button');
    if(!await likert.count())throw new Error('MONEY_PUBLIC_NO_ANSWER_CONTROL:'+debugText);
    await likert.nth(2).click();
    answered++;
  }
  await page.waitForTimeout(180);

  // Exercise persisted resume once without changing the measurement form.
  if(!resumeChecked&&answered===4){
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('button',{name:'続きから再開する'}).waitFor({state:'visible'});
    await page.getByRole('button',{name:'続きから再開する'}).click();
    await page.waitForTimeout(100);
    resumeChecked=true;
  }
}

await page.locator('.mpp-result').waitFor({state:'visible',timeout:15000});
await page.waitForFunction(()=>Boolean(localStorage.getItem('mudagiri_money_type_public_last_payload_v1')),{timeout:5000});
await screenshot('05-result');
const text=(await page.locator('.mpp-result').innerText()).replace(/\s+/g,' ');
if(!text.includes('MUDAGIRI CLASS UNLOCKED'))throw new Error('MONEY_PUBLIC_RESULT_UNLOCK_MISSING');
if(!text.includes('主属性')||!text.includes('副属性'))throw new Error('MONEY_PUBLIC_STYLE_MISSING');
if(!text.includes('WEAPON')||!text.includes('強み')||!text.includes('死角')||!text.includes('攻略法'))throw new Error('MONEY_PUBLIC_PERSONALIZED_PROFILE_MISSING');
if(!text.includes('YOUR NEXT MOVE'))throw new Error('MONEY_PUBLIC_NEXT_MOVE_MISSING');
if(!text.includes('あなたの3軸ステータス'))throw new Error('MONEY_PUBLIC_AXES_MISSING');
if(!text.includes('家計クエストへ進む'))throw new Error('MONEY_PUBLIC_HOUSEHOLD_CTA_MISSING');
if(answered<30)throw new Error('MONEY_PUBLIC_COMPLETED_BEFORE_CORE30:'+answered);
if(!resumeChecked)throw new Error('MONEY_PUBLIC_RESUME_NOT_EXERCISED');
if(!sawAdaptive)throw new Error('MONEY_PUBLIC_ADAPTIVE_NOT_EXERCISED');
if(!sawSeparator)throw new Error('MONEY_PUBLIC_SEPARATOR_NOT_EXERCISED');

const telemetry=await page.evaluate(()=>{
  const payload=JSON.parse(localStorage.getItem('mudagiri_money_type_public_last_payload_v1')||'null');
  const handoff=JSON.parse(localStorage.getItem('mudagiri_money_type_handoff_v1')||'null');
  return {payload,handoff};
});
if(telemetry.payload?.kind!=='money_personality_pilot_v1')throw new Error('MONEY_PUBLIC_TELEMETRY_KIND_MISSING');
if(telemetry.payload?.formId!=='PUBLIC_ADAPTIVE')throw new Error('MONEY_PUBLIC_TELEMETRY_FORM_MISSING');
if((telemetry.payload?.responseCount||0)<30)throw new Error('MONEY_PUBLIC_TELEMETRY_RESPONSE_COUNT_BAD');
if(!telemetry.payload?.quality?.jobCode||!telemetry.payload?.quality?.primaryStyle)throw new Error('MONEY_PUBLIC_TELEMETRY_RESULT_MISSING');
if(!telemetry.payload?.quality?.resultContentVersion)throw new Error('MONEY_PUBLIC_RESULT_CONTENT_VERSION_MISSING');
if(telemetry.handoff?.version!=='MUDAGIRI_MONEY_TYPE_HANDOFF_V1')throw new Error('MONEY_PUBLIC_HANDOFF_MISSING');
if(telemetry.handoff?.jobCode!==telemetry.payload?.quality?.jobCode)throw new Error('MONEY_PUBLIC_HANDOFF_JOB_MISMATCH');
if(telemetry.handoff?.resultContentVersion!==telemetry.payload?.quality?.resultContentVersion)throw new Error('MONEY_PUBLIC_RESULT_CONTENT_VERSION_MISMATCH');

const report={ok:true,answered,resumeChecked,sawAdaptive,sawSeparator,personalizedResult:true,telemetry:{formId:telemetry.payload.formId,responseCount:telemetry.payload.responseCount,jobCode:telemetry.payload.quality.jobCode,primaryStyle:telemetry.payload.quality.primaryStyle,resultContentVersion:telemetry.payload.quality.resultContentVersion},handoff:{jobCode:telemetry.handoff.jobCode,primaryStyle:telemetry.handoff.primaryStyle,resultContentVersion:telemetry.handoff.resultContentVersion}};
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify({ok:true,flow:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_BROWSER_V1',...report}));
