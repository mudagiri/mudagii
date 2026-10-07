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

async function assertQuestionCompanionGeometry(label){
  const m=await page.evaluate(()=>{
    const card=document.querySelector('.mpp-question-card');
    const companion=card?.querySelector(':scope > .mpp-measurement-companion');
    const img=companion?.querySelector('.mpp-mudagiri--question img, .mpp-mudagiri img');
    const question=card?.querySelector('.mpp-family-label, .mpp-scenario, h2');
    if(!card||!companion||!img||!question)return {ok:false,reason:'missing',card:!!card,companion:!!companion,img:!!img,question:!!question};
    const c=card.getBoundingClientRect(),r=companion.getBoundingClientRect(),i=img.getBoundingClientRect(),q=question.getBoundingClientRect();
    const speech=companion.querySelector('.mpp-progress-talk');
    const s=speech?.getBoundingClientRect();
    return {
      ok:true,
      pose:companion.querySelector('.mpp-mudagiri')?.getAttribute('data-pose')||null,
      card:{top:c.top,left:c.left,right:c.right},
      companion:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},
      image:{width:i.width,height:i.height,left:i.left,right:i.right},
      question:{top:q.top,left:q.left},
      speech:s?{top:s.top,bottom:s.bottom,left:s.left,right:s.right}:null,
      viewport:innerWidth,
    };
  });
  if(!m.ok)throw new Error(`MONEY_PUBLIC_COMPANION_NOT_IN_QUESTION_CARD:${label}:${JSON.stringify(m)}`);
  if(m.companion.top<m.card.top-2)throw new Error(`MONEY_PUBLIC_COMPANION_ABOVE_CARD:${label}:${JSON.stringify(m)}`);
  if(m.question.top<m.companion.bottom-3)throw new Error(`MONEY_PUBLIC_COMPANION_OVERLAPS_QUESTION:${label}:${JSON.stringify(m)}`);
  if(Math.abs(m.image.width-m.image.height)>2||m.image.width<65||m.image.width>86)throw new Error(`MONEY_PUBLIC_COMPANION_SIZE_BAD:${label}:${JSON.stringify(m)}`);
  if(m.speech&&(m.speech.left<m.image.right-3||m.speech.right>m.viewport+2))throw new Error(`MONEY_PUBLIC_SPEECH_POSITION_BAD:${label}:${JSON.stringify(m.speech)}`);
  return m;
}

async function assertJobImageLoaded(scope,label){
  const m=await page.locator(scope).evaluate(el=>{
    const img=el.querySelector('.mpp-job-character img');
    return img instanceof HTMLImageElement?{found:true,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,src:img.currentSrc||img.src}:{found:false};
  });
  if(!m.found||!m.complete||!m.naturalWidth||!m.naturalHeight)throw new Error(`MONEY_PUBLIC_JOB_IMAGE_NOT_LOADED:${label}:${JSON.stringify(m)}`);
  return m;
}

await page.goto(base+'?adaptive=money-type&debug=1',{waitUntil:'networkidle'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle'});
await page.getByRole('button',{name:'診断をはじめる'}).waitFor({state:'visible'});
await screenshot('01-intro');
await page.getByRole('button',{name:'診断をはじめる'}).click();
await page.locator('.mpp-question-card').waitFor({state:'visible'});
const firstQuestionGeometry=await assertQuestionCompanionGeometry('core-first');
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
    if(!capturedAdaptive){await assertQuestionCompanionGeometry('adaptive');await screenshot('03-adaptive-question');capturedAdaptive=true;}
  }
  if(isSeparator){
    sawSeparator=true;
    if(!capturedSeparator){await assertQuestionCompanionGeometry('separator');await screenshot('04-separator');capturedSeparator=true;}
    await separator.first().click();
    answered++;
    await page.waitForTimeout(180);
    continue;
  }

  const scale=page.locator('.mpp-scale button');
  if(await scale.count()){
    await scale.nth(2).click();
    answered++;
  }else{
    const likert=page.locator('.mpp-answer-list button');
    if(!await likert.count())throw new Error('MONEY_PUBLIC_NO_ANSWER_CONTROL:'+debugText);
    await likert.nth(2).click();
    answered++;
  }
  await page.waitForTimeout(180);

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
await page.locator('.mpp-result-ssr-card').waitFor({state:'visible',timeout:3000});
await page.waitForFunction(()=>{const img=document.querySelector('.mpp-result-job-hero .mpp-job-character img');return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0},{timeout:5000});
await assertJobImageLoaded('.mpp-result-job-hero','result-hero');
await page.waitForTimeout(1100);
await screenshot('05-result-ssr-card');
const moreScenes=page.locator('.mpp-v9-more');
await moreScenes.locator('summary').click();
await page.waitForTimeout(80);
const visibleMore=await moreScenes.locator('.mpp-v9-more-list .mpp-v9-scene').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden'&&r.height>0}).length);
if(visibleMore!==3)throw new Error('MONEY_PUBLIC_RESULT_V9_MORE_NOT_VISIBLE:'+visibleMore);
await screenshot('05b-result-more-scenes');
await moreScenes.locator('summary').click();
await page.waitForTimeout(50);

const resultV9Geometry=await page.evaluate(()=>{
  const hero=document.querySelector('.mpp-result-v4-hero');
  const body=document.querySelector('.mpp-result-v9');
  const heroRect=hero?.getBoundingClientRect();
  const bodyRect=body?.getBoundingClientRect();
  return {
    hero:heroRect?{top:heroRect.top,bottom:heroRect.bottom,height:heroRect.height}:null,
    body:bodyRect?{top:bodyRect.top,bottom:bodyRect.bottom,height:bodyRect.height}:null,
    innerHeight,
    primarySceneCount:document.querySelectorAll('.mpp-v9-scenes .mpp-v9-scene').length,
    extraSceneCount:document.querySelectorAll('.mpp-v9-more-list .mpp-v9-scene').length,
    hasMore:Boolean(document.querySelector('.mpp-v9-more')),
    hasSsrBadge:Boolean(document.querySelector('.mpp-result-ssr-badge')),
  };
});
if(!resultV9Geometry.hero||!resultV9Geometry.body)throw new Error('MONEY_PUBLIC_RESULT_V9_MISSING:'+JSON.stringify(resultV9Geometry));
if(resultV9Geometry.primarySceneCount!==3||resultV9Geometry.extraSceneCount!==3)throw new Error('MONEY_PUBLIC_RESULT_V9_SCENE_COUNT_BAD:'+JSON.stringify(resultV9Geometry));
if(!resultV9Geometry.hasMore)throw new Error('MONEY_PUBLIC_RESULT_V9_MORE_MISSING');
if(!resultV9Geometry.hasSsrBadge)throw new Error('MONEY_PUBLIC_RESULT_SSR_BADGE_MISSING');

const resultScrollBefore=await page.evaluate(()=>{
  const root=document.scrollingElement||document.documentElement;
  const htmlStyle=getComputedStyle(document.documentElement),bodyStyle=getComputedStyle(document.body);
  return {scrollHeight:root.scrollHeight,innerHeight,scrollY,htmlOverflowY:htmlStyle.overflowY,bodyOverflowY:bodyStyle.overflowY,pageHeight:document.querySelector('.mpp-page--result')?.getBoundingClientRect().height||0,cardHeight:document.querySelector('.mpp-result')?.getBoundingClientRect().height||0};
});
if(resultScrollBefore.scrollHeight<=resultScrollBefore.innerHeight+100)throw new Error('MONEY_PUBLIC_RESULT_NOT_TALL_ENOUGH:'+JSON.stringify(resultScrollBefore));
if(resultScrollBefore.htmlOverflowY==='hidden'||resultScrollBefore.bodyOverflowY==='hidden')throw new Error('MONEY_PUBLIC_RESULT_DOCUMENT_SCROLL_LOCKED:'+JSON.stringify(resultScrollBefore));
await page.evaluate(()=>window.scrollTo({top:Math.min(700,(document.scrollingElement||document.documentElement).scrollHeight-innerHeight),behavior:'auto'}));
await page.waitForTimeout(80);
const resultScrollY=await page.evaluate(()=>window.scrollY);
if(resultScrollY<40)throw new Error('MONEY_PUBLIC_RESULT_CANNOT_SCROLL:'+JSON.stringify({resultScrollBefore,resultScrollY}));
await page.evaluate(()=>window.scrollTo({top:0,behavior:'auto'}));

const text=((await page.locator('.mpp-result').textContent())||'').replace(/\s+/g,' ');
if(!text.includes('あなたのお金タイプ'))throw new Error('MONEY_PUBLIC_RESULT_TYPE_LABEL_MISSING');
if(!text.includes('TYPE UNLOCKED')||!text.includes('SSR'))throw new Error('MONEY_PUBLIC_RESULT_SSR_COPY_MISSING');
if(!text.includes('こんな瞬間、ない？'))throw new Error('MONEY_PUBLIC_RESULT_V9_RECOGNITION_MISSING');
if(!text.includes('ほかの場面も見る'))throw new Error('MONEY_PUBLIC_RESULT_V9_MORE_MISSING');
if(!text.includes('つまり、あなたは'))throw new Error('MONEY_PUBLIC_RESULT_V9_TRUTH_MISSING');
if(!text.includes('見え方のズレ')||!text.includes('武器 → 暴走 → 戻し方'))throw new Error('MONEY_PUBLIC_RESULT_V9_INSIGHT_MISSING');
if(!text.includes('友だちと比べる'))throw new Error('MONEY_PUBLIC_RESULT_V9_COMPARE_MISSING');
if(!text.includes('YOUR NEXT MOVE'))throw new Error('MONEY_PUBLIC_NEXT_MOVE_MISSING');
if(!text.includes('あなたの3軸ステータス'))throw new Error('MONEY_PUBLIC_AXES_MISSING');
const axisV10=await page.evaluate(()=>({
  axisCount:document.querySelectorAll('.mpp-axis-v10').length,
  oldTraitCount:document.querySelectorAll('.mpp-analysis-details .mpp-trait').length,
  compareCards:document.querySelectorAll('.mpp-v9-compare-grid article').length,
  compactMore:document.querySelectorAll('.mpp-v9-more-list .mpp-v9-scene--compact').length,
}));
if(axisV10.axisCount!==3||axisV10.oldTraitCount!==0)throw new Error('MONEY_PUBLIC_AXIS_V10_BAD:'+JSON.stringify(axisV10));
if(axisV10.compareCards!==2)throw new Error('MONEY_PUBLIC_COMPARE_V10_BAD:'+JSON.stringify(axisV10));
if(axisV10.compactMore!==3)throw new Error('MONEY_PUBLIC_MORE_COMPACT_BAD:'+JSON.stringify(axisV10));
if(!text.includes('次のクエストへ進む'))throw new Error('MONEY_PUBLIC_NEXT_QUEST_CTA_MISSING');
if(!text.includes('このTYPEカードをシェア'))throw new Error('MONEY_PUBLIC_INLINE_SHARE_CTA_MISSING');
if(answered<30)throw new Error('MONEY_PUBLIC_COMPLETED_BEFORE_CORE30:'+answered);
if(!resumeChecked)throw new Error('MONEY_PUBLIC_RESUME_NOT_EXERCISED');
if(!sawAdaptive)throw new Error('MONEY_PUBLIC_ADAPTIVE_NOT_EXERCISED');
if(!sawSeparator)throw new Error('MONEY_PUBLIC_SEPARATOR_NOT_EXERCISED');

await page.getByRole('button',{name:'次のクエストへ進む'}).click();
await page.locator('.mpp-next-routes').waitFor({state:'visible',timeout:3000});
await screenshot('06-next-routes');
const routesText=((await page.locator('.mpp-next-routes').textContent())||'').replace(/\s+/g,' ');
if(!routesText.includes('SSR ACQUIRED')||!routesText.includes('家計クエスト'))throw new Error('MONEY_PUBLIC_NEXT_ROUTES_BAD:'+routesText);
if(!routesText.includes('32TYPE図鑑'))throw new Error('MONEY_PUBLIC_TYPE_BOOK_CTA_MISSING:'+routesText);
await page.getByRole('button',{name:'32TYPE図鑑を見る'}).click();
await page.locator('.mpp-job-book').waitFor({state:'visible',timeout:3000});
const typeBook=await page.evaluate(()=>({
  jobs:document.querySelectorAll('.mpp-job-book-grid article').length,
  typeChips:document.querySelectorAll('.mpp-job-book-typechips>div').length,
  mine:document.querySelectorAll('.mpp-job-book-typechips>div.is-mine').length,
  visibleImages:[...document.querySelectorAll('.mpp-job-book .mpp-job-character img')].filter(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0).length,
}));
if(typeBook.jobs!==8||typeBook.typeChips!==32||typeBook.mine!==1||typeBook.visibleImages!==8)throw new Error('MONEY_PUBLIC_TYPE_BOOK_BAD:'+JSON.stringify(typeBook));
await screenshot('07-type-book-32');
await page.getByRole('button',{name:'獲得画面に戻る'}).click();
await page.locator('.mpp-next-routes').waitFor({state:'visible',timeout:3000});

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

const report={ok:true,answered,resumeChecked,sawAdaptive,sawSeparator,capturedSsrResult:true,capturedNextRoutes:true,personalizedResult:true,resultV10:true,firstQuestionGeometry,resultV9Geometry,resultScroll:{...resultScrollBefore,verifiedScrollY:resultScrollY},telemetry:{formId:telemetry.payload.formId,responseCount:telemetry.payload.responseCount,jobCode:telemetry.payload.quality.jobCode,primaryStyle:telemetry.payload.quality.primaryStyle,resultContentVersion:telemetry.payload.quality.resultContentVersion},handoff:{jobCode:telemetry.handoff.jobCode,primaryStyle:telemetry.handoff.primaryStyle,resultContentVersion:telemetry.handoff.resultContentVersion}};
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify({ok:true,flow:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_BROWSER_V1',...report}));
