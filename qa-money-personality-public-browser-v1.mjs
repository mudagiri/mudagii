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
  if(await page.locator('.mpp-class-unlock').count()){
    await page.getByRole('button',{name:'結果を見る'}).waitFor({state:'visible',timeout:10000});
    await page.waitForFunction(()=>{
      const el=document.querySelector('.mpp-class-unlock .mpp-job-character');
      const img=el?.querySelector('img');
      return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0&&el.getBoundingClientRect().width>=120&&parseFloat(getComputedStyle(el).opacity)>=0.95;
    },{timeout:8000});
    await page.waitForTimeout(120);
    await screenshot('05-ssr-job-unlock');
    await page.getByRole('button',{name:'結果を見る'}).click();
    await page.locator('.mpp17-page').waitFor({state:'visible',timeout:6000});
    break;
  }

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
await page.reload({waitUntil:'networkidle'});
await page.locator('.mpp17-page').waitFor({state:'visible',timeout:6000});
if(await page.locator('.mpp-class-unlock').count())throw new Error('MONEY_PUBLIC_SSR_REPEATS_AFTER_RELOAD');
const payoffOrder=await page.evaluate(()=>{
  const selectors=['.mpp17-profile','.mpp17-recognition','.mpp17-share','.mpp17-style-detail','.mpp17-core'];
  return selectors.map(selector=>({selector,top:document.querySelector(selector)?.getBoundingClientRect().top||0}));
});
if(payoffOrder.some((p,i)=>i>0&&p.top<=payoffOrder[i-1].top))throw new Error('MONEY_PUBLIC_PAYOFF_ORDER_BAD:'+JSON.stringify(payoffOrder));
const moreScenes=page.locator('.mpp17-more');
await moreScenes.locator('summary').click();
await page.waitForTimeout(80);
const openMore=await moreScenes.evaluate(el=>({open:el.open,opened:getComputedStyle(el.querySelector('.mpp-disclosure-open')).display,closed:getComputedStyle(el.querySelector('.mpp-disclosure-closed')).display,summarySize:parseFloat(getComputedStyle(el.querySelector('summary')).fontSize),summaryHeight:el.querySelector('summary').getBoundingClientRect().height}));
if(!openMore.open||openMore.opened==='none'||openMore.closed!=='none'||openMore.summarySize<15||openMore.summaryHeight<56)throw new Error('MONEY_PUBLIC_DISCLOSURE_AFFORDANCE_BAD:'+JSON.stringify(openMore));
const visibleMore=await moreScenes.locator('div > article').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden'&&r.height>0}).length);
if(visibleMore!==4)throw new Error('MONEY_PUBLIC_RESULT_V17_MORE_NOT_VISIBLE:'+visibleMore);
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
if(resultV17Geometry.primarySceneCount!==2||resultV17Geometry.extraSceneCount!==4)throw new Error('MONEY_PUBLIC_RESULT_V17_SCENE_COUNT_BAD:'+JSON.stringify(resultV17Geometry));
if(!resultV17Geometry.hasMore)throw new Error('MONEY_PUBLIC_RESULT_V17_MORE_MISSING');
if(resultV17Geometry.socialButtons!==5)throw new Error('MONEY_PUBLIC_RESULT_SOCIAL_BUTTONS_BAD:'+JSON.stringify(resultV17Geometry));
if(await page.locator('.mpp17-share-button--primary').count()!==1)throw new Error('MONEY_PUBLIC_NATIVE_IMAGE_SHARE_CTA_MISSING');
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
if(!text.includes('同じ場面でも、考えることが違う'))throw new Error('MONEY_PUBLIC_RESULT_V17_COMPARE_MISSING');
const resultStyleDetail=page.locator('.mpp17-style-detail');
await resultStyleDetail.locator('summary').click();
const detailCue=await resultStyleDetail.evaluate(el=>({summarySize:parseFloat(getComputedStyle(el.querySelector('summary')).fontSize),summaryHeight:el.querySelector('summary').getBoundingClientRect().height,closeVisible:getComputedStyle(el.querySelector('.mpp-disclosure-open')).display!=='none'}));
if(detailCue.summarySize<15||detailCue.summaryHeight<56||!detailCue.closeVisible)throw new Error('MONEY_PUBLIC_STYLE_DETAIL_DISCOVERABILITY_BAD:'+JSON.stringify(detailCue));
const cueTextColor=await resultStyleDetail.locator('.mpp-disclosure-open').evaluate(el=>getComputedStyle(el).color);
if(cueTextColor!=='rgb(255, 250, 240)')throw new Error('MONEY_PUBLIC_DISCLOSURE_CLOSED_TEXT_CONTRAST_BAD:'+cueTextColor);
const expandedStyleText=(await resultStyleDetail.textContent())||'';
if(!(await resultStyleDetail.evaluate(el=>el.hasAttribute('open')))||!/(できることを増やしたい|楽しいことに使いたい|あとで困りたくない|余計な出費はしたくない)/.test(expandedStyleText))throw new Error('MONEY_PUBLIC_STYLE_RESULT_DETAIL_MISSING:'+expandedStyleText);
await page.waitForTimeout(100);
const funnel=await page.evaluate(()=>JSON.parse(localStorage.getItem('mudagiri_money_type_funnel_v1')||'[]'));
const funnelEvents=new Set(funnel.map(x=>x.event));
for(const event of ['intro_started','ssr_claimed','result_seen']){
  if(funnel.filter(x=>x.event===event).length!==1)throw new Error('MONEY_PUBLIC_FUNNEL_MILESTONE_DUPLICATED:'+event+':'+JSON.stringify(funnel));
}
for(const event of ['intro_started','intro_resumed','ssr_claimed','result_seen','scenes_expanded','style_expanded']){
  if(!funnelEvents.has(event))throw new Error('MONEY_PUBLIC_FUNNEL_EVENT_MISSING:'+event+':'+JSON.stringify(funnel));
}
if(funnel.some(x=>Object.keys(x).some(key=>!['version','sessionId','event','at','target'].includes(key))))throw new Error('MONEY_PUBLIC_FUNNEL_SENSITIVE_DATA:'+JSON.stringify(funnel));
const humanDesign=await page.evaluate(()=>{
  const stylePanel=document.querySelector('.mpp17-style-detail');
  const detail=document.querySelector('.mpp17-style-detail-body p');
  const speech=document.querySelector('.mpp17-mudagiri-talk p');
  const scene=document.querySelector('.mpp17-scene-list p');
  const color=(el,kind='color')=>getComputedStyle(el)[kind];
  return {
    panelBackground:color(stylePanel,'backgroundColor'),
    panelText:color(stylePanel),
    descriptionText:color(detail),
    speechText:color(speech),
    descriptionSize:parseFloat(color(detail,'fontSize')),
    speechSize:parseFloat(color(speech,'fontSize')),
    sceneSize:parseFloat(color(scene,'fontSize')),
    family:color(speech,'fontFamily')
  };
});
const channels=value=>(value.match(/[0-9.]+/g)||[]).map(Number);
const bg=channels(humanDesign.panelBackground),panel=channels(humanDesign.panelText),speech=channels(humanDesign.speechText);
if(bg.length<3||bg.slice(0,3).some(v=>v<230)||(bg[3]!==undefined&&bg[3]<.95)||panel.slice(0,3).some(v=>v>120)||speech.slice(0,3).some(v=>v>120))throw new Error('MONEY_PUBLIC_HUMAN_DESIGN_CONTRAST_BAD:'+JSON.stringify(humanDesign));
if(humanDesign.descriptionSize<14||humanDesign.speechSize<13||humanDesign.sceneSize<14||!humanDesign.family.includes('Noto Sans JP'))throw new Error('MONEY_PUBLIC_HUMAN_DESIGN_TYPO_BAD:'+JSON.stringify(humanDesign));
if(!text.includes('次にやるなら、これ'))throw new Error('MONEY_PUBLIC_NEXT_MOVE_MISSING');
if(!text.includes('なんでこのタイプになった？'))throw new Error('MONEY_PUBLIC_AXES_MISSING');
const axisV17=await page.evaluate(()=>({
  axisCount:document.querySelectorAll('.mpp17-axis-list article').length,
  compareCards:document.querySelectorAll('.mpp17-compare-row article').length,
  compactMore:document.querySelectorAll('.mpp17-more > div > article').length,
}));
if(axisV17.axisCount!==3)throw new Error('MONEY_PUBLIC_AXIS_V17_BAD:'+JSON.stringify(axisV17));
if(axisV17.compareCards!==2)throw new Error('MONEY_PUBLIC_COMPARE_V17_BAD:'+JSON.stringify(axisV17));
if(axisV17.compactMore!==4)throw new Error('MONEY_PUBLIC_MORE_V17_BAD:'+JSON.stringify(axisV17));
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
if(!text.includes('これ、友だちに見せたくない？')||!text.includes('友だちと比べるなら'))throw new Error('MONEY_PUBLIC_SOCIAL_RESULT_SECTIONS_MISSING');
if(answered<30)throw new Error('MONEY_PUBLIC_COMPLETED_BEFORE_CORE30:'+answered);
if(!resumeChecked)throw new Error('MONEY_PUBLIC_RESUME_NOT_EXERCISED');
if(!sawAdaptive)throw new Error('MONEY_PUBLIC_ADAPTIVE_NOT_EXERCISED');
if(!sawSeparator)throw new Error('MONEY_PUBLIC_SEPARATOR_NOT_EXERCISED');

// X sharing must happen inside the user's click activation, and use the public intro URL.
await page.evaluate(()=>{
  window.__mudagiriShareProbe=null;
  window.open=(url,target)=>{
    window.__mudagiriShareProbe={url:String(url),target:String(target)};
    return null;
  };
});
await page.getByRole('button',{name:'𝕏 に文章で投稿'}).click();
const shareProbe=await page.evaluate(()=>window.__mudagiriShareProbe);
if(!shareProbe?.url?.startsWith('https://twitter.com/intent/tweet?text=')||shareProbe.target!=='_blank')throw new Error('MONEY_PUBLIC_X_SHARE_NOT_SYNCHRONOUS:'+JSON.stringify(shareProbe));
const shareMessage=new URL(shareProbe.url).searchParams.get('text')||'';
if(!shareMessage.includes('adaptive=money-type')||!shareMessage.includes('あなたは何タイプ？')||shareMessage.includes('resumeResult=')||shareMessage.includes('debug='))throw new Error('MONEY_PUBLIC_X_SHARE_URL_BAD:'+shareMessage);
await page.getByRole('button',{name:'Threadsに文章で投稿'}).click();
const threadsProbe=await page.evaluate(()=>window.__mudagiriShareProbe);
if(!threadsProbe?.url?.startsWith('https://www.threads.com/intent/post?text='))throw new Error('MONEY_PUBLIC_THREADS_SHARE_INTENT_BAD:'+JSON.stringify(threadsProbe));
await page.getByRole('button',{name:'32タイプ図鑑を見る'}).click();
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
const bookReadability=await page.evaluate(()=>{
  const size=sel=>parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
  return {
    lead:size('.mpp-job-book-hero p'),
    axis:size('.mpp-job-book-axes article>p'),
    style:size('.mpp-job-book-style-key button span'),
    chips:size('.mpp-job-book-typechips small'),
    job:size('.mpp-job-book-jobcopy b')
  };
});
if(bookReadability.lead<13.5||bookReadability.axis<12||bookReadability.style<11.5||bookReadability.chips<11.5||bookReadability.job<17)throw new Error('MONEY_PUBLIC_BOOK_TEXT_TOO_SMALL:'+JSON.stringify(bookReadability));

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

const enjoyButton=page.locator('.mpp-job-book-style-key>button').filter({hasText:'ENJOY'});
await enjoyButton.click();
const enjoyActive=await enjoyButton.evaluate(el=>el.classList.contains('is-active')&&el.getAttribute('aria-pressed')==='true');
if(!enjoyActive)throw new Error('MONEY_PUBLIC_TYPE_BOOK_STYLE_NOT_INTERACTIVE');
const styleExplain=page.locator('.mpp-job-book-style-explain');
await styleExplain.waitFor({state:'visible',timeout:2500});
if(!((await styleExplain.textContent())||'').includes('楽しいことに使いたい'))throw new Error('MONEY_PUBLIC_TYPE_BOOK_STYLE_EXPLANATION_MISSING');

const idpEnjoy=page.locator('.mpp-job-book-typechips>button').filter({hasText:'IDP-E'});
await idpEnjoy.click();
await page.locator('.mpp-job-book-detail').waitFor({state:'visible',timeout:2000});
const detailText=((await page.locator('.mpp-job-book-detail').textContent())||'').replace(/\s+/g,' ');
if(!detailText.includes('戦術ハンター')||!detailText.includes('ENJOY')||!detailText.includes('楽しいことに使いたい'))throw new Error('MONEY_PUBLIC_TYPE_BOOK_DETAIL_BAD:'+detailText);
await page.getByRole('button',{name:'詳細を閉じる'}).click();
await page.locator('.mpp-job-book-detail').waitFor({state:'detached',timeout:2000}).catch(()=>{});

await screenshot('07-type-book-32');
await page.getByRole('button',{name:'獲得画面に戻る'}).click();
await page.locator('.mpp17-page').waitFor({state:'visible',timeout:5000});
const shareCardText=((await page.locator('.mpp17-share-preview').textContent())||'').replace(/\s+/g,' ');
if(!shareCardText.includes('32 TYPES')||!shareCardText.includes('タイプ'))throw new Error('MONEY_PUBLIC_SHARE_IDENTITY_BAD:'+shareCardText);
if(!/DRIVE|ENJOY|SECURE|OPTIMIZE/.test(shareCardText))throw new Error('MONEY_PUBLIC_SHARE_STYLE_ENGLISH_MISSING:'+shareCardText);
await screenshot('08-early-share-identity-card');
const unfoldedResult=await page.evaluate(()=>{
  const wrap=document.querySelector('.mpp17-wrap')?.getBoundingClientRect();
  const share=document.querySelector('.mpp17-share')?.getBoundingClientRect();
  const buttons=[...document.querySelectorAll('.mpp17-share-buttons button')].map(el=>({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width}));
  return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,wrap:wrap&&{left:wrap.left,right:wrap.right,width:wrap.width},share:share&&{left:share.left,right:share.right,width:share.width},buttons};
});
if(unfoldedResult.viewport!==690||unfoldedResult.documentWidth>692||!unfoldedResult.wrap||unfoldedResult.wrap.width>524||unfoldedResult.wrap.left<0||unfoldedResult.wrap.right>692)throw new Error('MONEY_PUBLIC_FOLD_UNFOLDED_RESULT_OVERFLOW:'+JSON.stringify(unfoldedResult));
if(!unfoldedResult.share||unfoldedResult.share.left<-2||unfoldedResult.share.right>692||unfoldedResult.buttons.length!==5||unfoldedResult.buttons.some(b=>b.height<43||b.width<85))throw new Error('MONEY_PUBLIC_FOLD_SHARE_TARGET_TOO_SMALL:'+JSON.stringify(unfoldedResult));
await screenshot('08b-fold-unfolded-result-690');


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

await page.getByRole('button',{name:/特典の中身を見る/}).click();
await page.locator('.mpp-line-bonus').waitFor({state:'visible',timeout:5000});
const rewardText=await page.locator('.mpp-line-bonus').innerText();
if(!rewardText.includes('攻略ガイド')||!rewardText.includes('配布を準備中'))throw new Error('MONEY_PUBLIC_LINE_REWARD_PREVIEW_OR_HONEST_STATE_MISSING');
if(await page.getByRole('button',{name:'公式LINEで攻略ガイドを受け取る'}).count())throw new Error('MONEY_PUBLIC_UNCONFIGURED_LINE_CTA_LEAK');
await screenshot('08c-optional-line-guide-preview');
await page.getByRole('button',{name:'診断結果に戻る'}).click();
await page.locator('.mpp17-page').waitFor({state:'visible',timeout:5000});
const lineFunnel=await page.evaluate(()=>JSON.parse(localStorage.getItem('mudagiri_money_type_funnel_v1')||'[]'));
if(!lineFunnel.some(x=>x.event==='line_bonus_preview_opened'))throw new Error('MONEY_PUBLIC_LINE_REWARD_PREVIEW_EVENT_MISSING');
await page.getByRole('button',{name:'家計クエストへ進む'}).click();
await page.waitForURL(url=>!new URL(url).searchParams.has('adaptive'),{timeout:8000});
const finalFunnel=await page.evaluate(()=>JSON.parse(localStorage.getItem('mudagiri_money_type_funnel_v1')||'[]'));
for(const event of ['type_book_opened','household_cta_clicked']){
  if(!finalFunnel.some(x=>x.event===event))throw new Error('MONEY_PUBLIC_FUNNEL_CONVERSION_EVENT_MISSING:'+event);
}
const report={ok:true,answered,resumeChecked,sawAdaptive,sawSeparator,capturedProfileResult:true,directHousehold:true,earlyShare:true,personalizedResult:true,resultV17:true,firstQuestionGeometry,resultV17Geometry,resultScroll:{...resultScrollBefore,verifiedScrollY:resultScrollY},telemetry:{formId:telemetry.payload.formId,responseCount:telemetry.payload.responseCount,jobCode:telemetry.payload.quality.jobCode,primaryStyle:telemetry.payload.quality.primaryStyle,resultContentVersion:telemetry.payload.quality.resultContentVersion},handoff:{jobCode:telemetry.handoff.jobCode,primaryStyle:telemetry.handoff.primaryStyle,resultContentVersion:telemetry.handoff.resultContentVersion}};
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify({ok:true,flow:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_BROWSER_V1',...report}));
