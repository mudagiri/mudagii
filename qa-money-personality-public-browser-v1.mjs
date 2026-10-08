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
const cdp=await context.newCDPSession(page);
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
  const result=page.locator('.mpp17-page');
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

await page.locator('.mpp17-page').waitFor({state:'visible',timeout:15000});
await page.waitForFunction(()=>Boolean(localStorage.getItem('mudagiri_money_type_public_last_payload_v1')),{timeout:5000});
await page.locator('.mpp17-profile').waitFor({state:'visible',timeout:3000});
await page.waitForFunction(()=>{const img=document.querySelector('.mpp17-portrait .mpp-job-character img');return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0},{timeout:5000});
await assertJobImageLoaded('.mpp17-portrait','result-hero');
await page.waitForTimeout(1100);
await screenshot('05-result-profile');
const moreScenes=page.locator('.mpp17-more');
await moreScenes.locator('summary').click();
await page.waitForTimeout(80);
const visibleMore=await moreScenes.locator('div > article').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden'&&r.height>0}).length);
if(visibleMore!==3)throw new Error('MONEY_PUBLIC_RESULT_V17_MORE_NOT_VISIBLE:'+visibleMore);
await screenshot('05b-result-more-scenes');
await moreScenes.locator('summary').click();
await page.waitForTimeout(50);

const resultV17Geometry=await page.evaluate(()=>{
  const hero=document.querySelector('.mpp17-profile');
  const body=document.querySelector('.mpp17-wrap');
  const heroRect=hero?.getBoundingClientRect();
  const bodyRect=body?.getBoundingClientRect();
  return {
    hero:heroRect?{top:heroRect.top,bottom:heroRect.bottom,height:heroRect.height}:null,
    body:bodyRect?{top:bodyRect.top,bottom:bodyRect.bottom,height:bodyRect.height}:null,
    innerHeight,
    primarySceneCount:document.querySelectorAll('.mpp17-scene-list > article').length,
    extraSceneCount:document.querySelectorAll('.mpp17-more > div > article').length,
    hasMore:Boolean(document.querySelector('.mpp17-more')),
    socialButtons:document.querySelectorAll('.mpp17-share-buttons button').length,
    matchCards:document.querySelectorAll('.mpp17-match-list article').length,
    miniJobs:document.querySelectorAll('.mpp17-mini-jobs > div').length,
  };
});
if(!resultV17Geometry.hero||!resultV17Geometry.body)throw new Error('MONEY_PUBLIC_RESULT_V17_MISSING:'+JSON.stringify(resultV17Geometry));
if(resultV17Geometry.primarySceneCount!==3||resultV17Geometry.extraSceneCount!==3)throw new Error('MONEY_PUBLIC_RESULT_V17_SCENE_COUNT_BAD:'+JSON.stringify(resultV17Geometry));
if(!resultV17Geometry.hasMore)throw new Error('MONEY_PUBLIC_RESULT_V17_MORE_MISSING');
if(resultV17Geometry.socialButtons!==4)throw new Error('MONEY_PUBLIC_RESULT_SOCIAL_BUTTONS_BAD:'+JSON.stringify(resultV17Geometry));
if(resultV17Geometry.matchCards!==3)throw new Error('MONEY_PUBLIC_RESULT_MATCH_CARDS_BAD:'+JSON.stringify(resultV17Geometry));
if(resultV17Geometry.miniJobs!==8)throw new Error('MONEY_PUBLIC_RESULT_MINI_JOB_BOOK_BAD:'+JSON.stringify(resultV17Geometry));

const resultScrollBefore=await page.evaluate(()=>{
  const root=document.scrollingElement||document.documentElement;
  const htmlStyle=getComputedStyle(document.documentElement),bodyStyle=getComputedStyle(document.body);
  return {scrollHeight:root.scrollHeight,innerHeight,scrollY,htmlOverflowY:htmlStyle.overflowY,bodyOverflowY:bodyStyle.overflowY,pageHeight:document.querySelector('.mpp17-page')?.getBoundingClientRect().height||0,cardHeight:document.querySelector('.mpp17-wrap')?.getBoundingClientRect().height||0};
});
if(resultScrollBefore.scrollHeight<=resultScrollBefore.innerHeight+100)throw new Error('MONEY_PUBLIC_RESULT_NOT_TALL_ENOUGH:'+JSON.stringify(resultScrollBefore));
if(resultScrollBefore.htmlOverflowY==='hidden'||resultScrollBefore.bodyOverflowY==='hidden')throw new Error('MONEY_PUBLIC_RESULT_DOCUMENT_SCROLL_LOCKED:'+JSON.stringify(resultScrollBefore));
await page.evaluate(()=>window.scrollTo({top:Math.min(700,(document.scrollingElement||document.documentElement).scrollHeight-innerHeight),behavior:'auto'}));
await page.waitForTimeout(80);
const resultScrollY=await page.evaluate(()=>window.scrollY);
if(resultScrollY<40)throw new Error('MONEY_PUBLIC_RESULT_CANNOT_SCROLL:'+JSON.stringify({resultScrollBefore,resultScrollY}));
await page.evaluate(()=>window.scrollTo({top:0,behavior:'auto'}));

const text=((await page.locator('.mpp17-page').textContent())||'').replace(/\s+/g,' ');
if(!text.includes('あなたのお金タイプ'))throw new Error('MONEY_PUBLIC_RESULT_TYPE_LABEL_MISSING');
if(text.includes('TYPE UNLOCKED')||text.includes('SSR'))throw new Error('MONEY_PUBLIC_RESULT_SSR_COPY_LEAK');
if(!text.includes('これ、やりがちじゃない？'))throw new Error('MONEY_PUBLIC_RESULT_V17_RECOGNITION_MISSING');
if(!text.includes('ほかのあるあるも見る'))throw new Error('MONEY_PUBLIC_RESULT_V17_MORE_MISSING');
if(!text.includes('つまり、あなたは'))throw new Error('MONEY_PUBLIC_RESULT_V9_TRUTH_MISSING');
if(!text.includes('外から見ると、こう見える。')||!text.includes('このタイプの強み'))throw new Error('MONEY_PUBLIC_RESULT_V17_INSIGHT_MISSING');
if(!text.includes('同じ場面でも、タイプで違う'))throw new Error('MONEY_PUBLIC_RESULT_V17_COMPARE_MISSING');
if(!text.includes('次にやるなら、これ'))throw new Error('MONEY_PUBLIC_NEXT_MOVE_MISSING');
if(!text.includes('診断の内訳を見る'))throw new Error('MONEY_PUBLIC_AXES_MISSING');
const axisV17=await page.evaluate(()=>({
  axisCount:document.querySelectorAll('.mpp17-axis-list article').length,
  compareCards:document.querySelectorAll('.mpp17-compare-row article').length,
  compactMore:document.querySelectorAll('.mpp17-more > div > article').length,
}));
if(axisV17.axisCount!==3)throw new Error('MONEY_PUBLIC_AXIS_V17_BAD:'+JSON.stringify(axisV17));
if(axisV17.compareCards!==2)throw new Error('MONEY_PUBLIC_COMPARE_V17_BAD:'+JSON.stringify(axisV17));
if(axisV17.compactMore!==3)throw new Error('MONEY_PUBLIC_MORE_V17_BAD:'+JSON.stringify(axisV17));
const typography=await page.evaluate(()=>({
  hero:parseFloat(getComputedStyle(document.querySelector('.mpp17-profile h1')).fontSize),
  heroLine:parseFloat(getComputedStyle(document.querySelector('.mpp17-hero')).fontSize),
  voice:parseFloat(getComputedStyle(document.querySelector('.mpp17-scene-list blockquote')).fontSize),
  scene:parseFloat(getComputedStyle(document.querySelector('.mpp17-scene-list p')).fontSize),
  truth:parseFloat(getComputedStyle(document.querySelector('.mpp17-core h2')).fontSize),
}));
if(typography.hero<30||typography.heroLine<16||typography.voice<18||typography.scene<12||typography.truth<22)throw new Error('MONEY_PUBLIC_V17_TYPOGRAPHY_TOO_SMALL:'+JSON.stringify(typography));
if(text.includes('同じTYPEの中の「あなたらしさ」も見る'))throw new Error('MONEY_PUBLIC_SECONDARY_STILL_ON_MAIN_RESULT');
if(!text.includes('家計クエストへ進む'))throw new Error('MONEY_PUBLIC_NEXT_QUEST_CTA_MISSING');
if(!text.includes('このカードを、そのままシェア。')||!text.includes('お金の感覚で見る'))throw new Error('MONEY_PUBLIC_SOCIAL_RESULT_SECTIONS_MISSING');
if(answered<30)throw new Error('MONEY_PUBLIC_COMPLETED_BEFORE_CORE30:'+answered);
if(!resumeChecked)throw new Error('MONEY_PUBLIC_RESUME_NOT_EXERCISED');
if(!sawAdaptive)throw new Error('MONEY_PUBLIC_ADAPTIVE_NOT_EXERCISED');
if(!sawSeparator)throw new Error('MONEY_PUBLIC_SEPARATOR_NOT_EXERCISED');

await page.getByRole('button',{name:'家計クエストへ進む'}).click();
await page.locator('.mpp-next-routes').waitFor({state:'visible',timeout:3000});
await screenshot('06-next-routes');
const routesText=((await page.locator('.mpp-next-routes').textContent())||'').replace(/\s+/g,' ');
if(!routesText.includes('YOUR MONEY TYPE')||!routesText.includes('家計クエスト'))throw new Error('MONEY_PUBLIC_NEXT_ROUTES_BAD:'+routesText);
if(!routesText.includes('32TYPE図鑑'))throw new Error('MONEY_PUBLIC_TYPE_BOOK_CTA_MISSING:'+routesText);
await page.getByRole('button',{name:'32TYPE図鑑を見る'}).click();
await page.waitForURL(url=>new URL(url).searchParams.get('book')==='1',{timeout:5000});
await page.locator('.mpp-job-book').waitFor({state:'visible',timeout:3000});
// fold-like encyclopedia viewport: wide mobile screens must still remain a one-column vertical collection.
await page.setViewportSize({width:690,height:844});
await page.waitForTimeout(80);
const typeBook=await page.evaluate(()=>({
  jobs:document.querySelectorAll('.mpp-job-book-grid article').length,
  gridColumns:getComputedStyle(document.querySelector('.mpp-job-book-grid')).gridTemplateColumns.split(' ').filter(Boolean).length,
  typeChips:document.querySelectorAll('.mpp-job-book-typechips>button').length,
  mine:document.querySelectorAll('.mpp-job-book-typechips>button.is-mine').length,
  styleButtons:document.querySelectorAll('.mpp-job-book-style-key>button').length,
  visibleImages:[...document.querySelectorAll('.mpp-job-book .mpp-job-character img')].filter(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0).length,
  htmlOverflow:getComputedStyle(document.documentElement).overflow,
  bodyOverflow:getComputedStyle(document.body).overflow,
  rootOverflow:getComputedStyle(document.getElementById('root')).overflow,
  surfaceOverflowY:getComputedStyle(document.querySelector('.mpp-job-book-standalone-surface')).overflowY,
  surfaceTouchAction:getComputedStyle(document.querySelector('.mpp-job-book-standalone-surface')).touchAction,
  surfaceScrollHeight:document.querySelector('.mpp-job-book-standalone-surface')?.scrollHeight||0,
  surfaceClientHeight:document.querySelector('.mpp-job-book-standalone-surface')?.clientHeight||0,
  standalone:!!document.querySelector('.mpp-book-standalone'),
}));
if(typeBook.jobs!==8||typeBook.typeChips!==32||typeBook.mine!==1||typeBook.styleButtons!==4||typeBook.visibleImages!==8||typeBook.gridColumns!==1)throw new Error('MONEY_PUBLIC_TYPE_BOOK_BAD:'+JSON.stringify(typeBook));
if(!typeBook.standalone||typeBook.htmlOverflow!=='hidden'||typeBook.bodyOverflow!=='hidden'||typeBook.rootOverflow!=='hidden'||typeBook.surfaceOverflowY==='hidden'||typeBook.surfaceScrollHeight<=typeBook.surfaceClientHeight+120)throw new Error('MONEY_PUBLIC_TYPE_BOOK_SCROLL_SETUP_BAD:'+JSON.stringify(typeBook));

const surface=page.locator('.mpp-job-book-standalone-surface');
const surfaceBox=await surface.boundingBox();
if(!surfaceBox)throw new Error('MONEY_PUBLIC_TYPE_BOOK_NO_SURFACE_BOX');
const scrollBefore=await surface.evaluate(el=>({top:el.scrollTop,height:el.scrollHeight,client:el.clientHeight,touchAction:getComputedStyle(el).touchAction}));

const x=Math.round(surfaceBox.x+surfaceBox.width*.5);
const yStart=Math.round(surfaceBox.y+surfaceBox.height*.80);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:yStart,id:1,radiusX:8,radiusY:8,force:1}]});
for(const y of [yStart-90,yStart-180,yStart-270,yStart-360,yStart-450]){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1,radiusX:8,radiusY:8,force:1}]});
  await page.waitForTimeout(25);
}
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await page.waitForTimeout(120);
const scrollAfter=await surface.evaluate(el=>el.scrollTop);
if(scrollAfter<120)throw new Error('MONEY_PUBLIC_TYPE_BOOK_TOUCH_SCROLL_FAILED:'+JSON.stringify({scrollBefore,scrollAfter}));

await surface.evaluate(el=>{el.scrollTop=0});
await page.waitForTimeout(80);

const enjoyButton=page.locator('.mpp-job-book-style-key>button').filter({hasText:'満足'});
await enjoyButton.click();
const enjoyActive=await enjoyButton.evaluate(el=>el.classList.contains('is-active')&&el.getAttribute('aria-pressed')==='true');
if(!enjoyActive)throw new Error('MONEY_PUBLIC_TYPE_BOOK_STYLE_NOT_INTERACTIVE');

const idpEnjoy=page.locator('.mpp-job-book-typechips>button').filter({hasText:'IDP-E'});
await idpEnjoy.click();
await page.locator('.mpp-job-book-detail').waitFor({state:'visible',timeout:2000});
const detailText=((await page.locator('.mpp-job-book-detail').textContent())||'').replace(/\s+/g,' ');
if(!detailText.includes('戦術ハンター')||!detailText.includes('満足'))throw new Error('MONEY_PUBLIC_TYPE_BOOK_DETAIL_BAD:'+detailText);
await page.getByRole('button',{name:'詳細を閉じる'}).click();
await page.locator('.mpp-job-book-detail').waitFor({state:'detached',timeout:2000}).catch(()=>{});

await screenshot('07-type-book-32');
await page.getByRole('button',{name:'獲得画面に戻る'}).click();
await page.getByRole('button',{name:'家計クエストへ進む'}).waitFor({state:'visible',timeout:5000});
await page.getByRole('button',{name:'家計クエストへ進む'}).click();
await page.locator('.mpp-next-routes').waitFor({state:'visible',timeout:3000});
await page.locator('.mpp-social-action--share').click();
await page.locator('.mpp-job-share').waitFor({state:'visible',timeout:3000});
const shareCardText=((await page.locator('.mpp-job-share-card').textContent())||'').replace(/\s+/g,' ');
if(!shareCardText.includes('1 / 32')||!shareCardText.includes('タイプ'))throw new Error('MONEY_PUBLIC_SHARE_IDENTITY_BAD:'+shareCardText);
if(/DRIVE STYLE|ENJOY STYLE|SECURE STYLE|OPTIMIZE STYLE/.test(shareCardText))throw new Error('MONEY_PUBLIC_SHARE_ENGLISH_STYLE_LEAK:'+shareCardText);
await screenshot('08-share-identity-card');
await page.getByRole('button',{name:'次のクエストを選ぶ'}).click();
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

const report={ok:true,answered,resumeChecked,sawAdaptive,sawSeparator,capturedProfileResult:true,capturedNextRoutes:true,personalizedResult:true,resultV17:true,firstQuestionGeometry,resultV17Geometry,resultScroll:{...resultScrollBefore,verifiedScrollY:resultScrollY},telemetry:{formId:telemetry.payload.formId,responseCount:telemetry.payload.responseCount,jobCode:telemetry.payload.quality.jobCode,primaryStyle:telemetry.payload.quality.primaryStyle,resultContentVersion:telemetry.payload.quality.resultContentVersion},handoff:{jobCode:telemetry.handoff.jobCode,primaryStyle:telemetry.handoff.primaryStyle,resultContentVersion:telemetry.handoff.resultContentVersion}};
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify({ok:true,flow:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_BROWSER_V1',...report}));
