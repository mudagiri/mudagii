import {webkit} from 'playwright';
import fs from 'node:fs/promises';

const OUT='visual-smoke-v5/ios-webkit';
await fs.mkdir(OUT,{recursive:true});
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173/';
const browser=await webkit.launch({headless:true});
const errors=[];
const reports=[];
function assert(value,message){if(!value)throw new Error(message)}
async function geometry(page,label){
  const m=await page.evaluate(()=>{
    const w=window.innerWidth;
    const visible=[...document.querySelectorAll('button')].filter(x=>{const s=getComputedStyle(x),r=x.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0});
    const buttons=visible.map(x=>{const r=x.getBoundingClientRect();return {label:x.textContent?.trim().slice(0,50),h:r.height,left:r.left,right:r.right}});
    return {width:w,scrollWidth:document.documentElement.scrollWidth,buttons,small:buttons.filter(b=>b.h<42),outside:buttons.filter(b=>b.left<-2||b.right>w+2)};
  });
  assert(m.scrollWidth<=m.width+2,'IOS_WEBKIT_HORIZONTAL_OVERFLOW:'+label+':'+JSON.stringify(m));
  assert(!m.outside.length,'IOS_WEBKIT_BUTTON_OUTSIDE:'+label+':'+JSON.stringify(m.outside));
  assert(!m.small.length,'IOS_WEBKIT_BUTTON_TOO_SMALL:'+label+':'+JSON.stringify(m.small));
  return m;
}
async function contextAt(width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'ja-JP',colorScheme:'dark'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'?adaptive=money-type&debug=1',{waitUntil:'networkidle'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
  await page.reload({waitUntil:'networkidle'});
  return {context,page};
}
try{
  for(const vp of [{width:375,height:812,name:'iphone-compact'},{width:390,height:844,name:'iphone-regular'}]){
    const {context,page}=await contextAt(vp.width,vp.height);
    await page.getByRole('button',{name:'診断をはじめる'}).waitFor({state:'visible'});
    const intro=await geometry(page,vp.name+'-intro');
    assert((await page.locator('.mpp-intro-copy').innerText()).includes('つい使うところ'),'IOS_WEBKIT_INTRO_OLD');
    await page.screenshot({path:`${OUT}/01-${vp.name}-intro.png`,fullPage:true});
    await page.getByRole('button',{name:'診断をはじめる'}).tap();
    await page.locator('.mpp-question-card').waitFor({state:'visible'});
    const question=await geometry(page,vp.name+'-question');
    await page.screenshot({path:`${OUT}/02-${vp.name}-question.png`,fullPage:true});
    if(vp.width===375){reports.push({viewport:vp.name,intro,question});await context.close();continue}
    let answered=0,sawSSR=false;
    for(let guard=0;guard<82;guard++){
      if(await page.locator('.mpp17-page').count())break;
      if(await page.locator('.mpp-class-unlock').count()){
        sawSSR=true;
        await page.getByRole('button',{name:'結果を見る'}).waitFor({state:'visible',timeout:16000});
        await page.waitForFunction(()=>{
          const img=document.querySelector('.mpp-class-unlock .mpp-job-character img');
          const card=document.querySelector('.mpp-class-unlock .mpp-job-character');
          if(!(img instanceof HTMLImageElement)||!img.complete||img.naturalWidth<10||!card)return false;
          const s=getComputedStyle(card),r=card.getBoundingClientRect();
          return r.width>=120&&r.height>=120&&Number.parseFloat(s.opacity||'0')>=0.95;
        },{timeout:8000});
        await page.waitForTimeout(150);
        await page.screenshot({path:`${OUT}/03-${vp.name}-ssr.png`,fullPage:true});
        await page.getByRole('button',{name:'結果を見る'}).tap();
        break;
      }
      const separator=page.locator('.mpp-separator-options button');
      if(await separator.count())await separator.first().tap();
      else if(await page.locator('.mpp-scale button').count())await page.locator('.mpp-scale button').nth(2).tap();
      else if(await page.locator('.mpp-answer-list button').count())await page.locator('.mpp-answer-list button').nth(2).tap();
      else throw new Error('IOS_WEBKIT_NO_ANSWER_CONTROL:'+answered);
      answered++;
      await page.waitForTimeout(190);
    }
    await page.locator('.mpp17-page').waitFor({state:'visible',timeout:12000});
    assert(answered>=30,'IOS_WEBKIT_TOO_FEW_ANSWERS:'+answered);
    assert(sawSSR,'IOS_WEBKIT_SSR_MISSING');
    const result=await geometry(page,vp.name+'-result');
    const card=await page.locator('.mpp17-profile').evaluate(el=>{
      const r=el.getBoundingClientRect();return {left:r.left,right:r.right, width:r.width};
    });
    assert(card.left>=-2&&card.right<=vp.width+2,'IOS_WEBKIT_RESULT_CARD_OVERFLOW:'+JSON.stringify(card));
    await page.screenshot({path:`${OUT}/04-${vp.name}-result.png`,fullPage:true});
    const share=page.locator('.mpp17-share');
    await share.scrollIntoViewIfNeeded();
    const shareUi=await geometry(page,vp.name+'-share');
    assert(await page.getByRole('button',{name:'画像カードをシェアする'}).isVisible(),'IOS_WEBKIT_SHARE_CTA_MISSING');
    assert(await page.getByRole('button',{name:'Threadsに文章で投稿'}).isVisible(),'IOS_WEBKIT_THREADS_CTA_MISSING');
    assert(await page.getByRole('button',{name:'Instagram用に画像を保存'}).isVisible(),'IOS_WEBKIT_INSTAGRAM_SAVE_MISSING');
    const readable=await page.evaluate(()=>{
      const font=sel=>parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
      const h=sel=>document.querySelector(sel).getBoundingClientRect().height;
      return {more:font('.mpp17-more summary'),style:font('.mpp17-style-detail summary'),axis:font('.mpp17-details summary'),body:font('.mpp17-scene-list p'),moreTap:h('.mpp17-more summary'),styleTap:h('.mpp17-style-detail summary'),axisTap:h('.mpp17-details summary'),shareCount:document.querySelectorAll('.mpp17-share-buttons button').length};
    });
    assert(readable.more>=15&&readable.style>=15&&readable.axis>=15&&readable.body>=14&&readable.moreTap>=56&&readable.styleTap>=56&&readable.axisTap>=56&&readable.shareCount===5,'IOS_WEBKIT_DETAILS_OR_READABILITY_BAD:'+JSON.stringify(readable));
    await page.locator('.mpp17-style-detail summary').tap();
    const disclosure=await page.locator('.mpp17-style-detail').evaluate(el=>({open:el.open,closed:getComputedStyle(el.querySelector('.mpp-disclosure-closed')).display,opened:getComputedStyle(el.querySelector('.mpp-disclosure-open')).display}));
    assert(disclosure.open&&disclosure.closed==='none'&&disclosure.opened!=='none','IOS_WEBKIT_DISCLOSURE_NOT_OBVIOUS:'+JSON.stringify(disclosure));
    await page.screenshot({path:`${OUT}/05-${vp.name}-share.png`,fullPage:false});
    await page.reload({waitUntil:'networkidle'});
    await page.locator('.mpp17-page').waitFor({state:'visible',timeout:9000});
    assert(await page.locator('.mpp-class-unlock').count()===0,'IOS_WEBKIT_SSR_REPLAYED');
    await page.getByRole('button',{name:'32タイプ図鑑を見る'}).tap();
    await page.locator('.mpp-job-book').waitFor({state:'visible',timeout:8000});
    const book=await geometry(page,vp.name+'-book');
    const bookFonts=await page.evaluate(()=>{
      const font=sel=>parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
      return {lead:font('.mpp-job-book-hero p'),axis:font('.mpp-job-book-axes article>p'),chip:font('.mpp-job-book-typechips small')};
    });
    assert(bookFonts.lead>=13.5&&bookFonts.axis>=12&&bookFonts.chip>=11.5,'IOS_WEBKIT_TYPE_BOOK_TINY_TEXT:'+JSON.stringify(bookFonts));
    await page.screenshot({path:`${OUT}/06-${vp.name}-book.png`,fullPage:false});
    await page.getByRole('button',{name:'獲得画面に戻る'}).tap();
    await page.locator('.mpp17-page').waitFor({state:'visible',timeout:8000});
    reports.push({viewport:vp.name,answered,sawSSR,intro,question,result,shareUi,book,card});
    await context.close();
  }
  assert(!errors.length,'IOS_WEBKIT_JS_ERROR:'+errors.join(';'));
  await fs.writeFile(`${OUT}/report.json`,JSON.stringify({ok:true,engine:'WebKit',simulatedIphone:true,notPhysicalSafari:true,reports},null,2));
  console.log(JSON.stringify({ok:true,flow:'MONEY_PERSONALITY_IOS_WEBKIT_V1',reports:reports.map(x=>({viewport:x.viewport,answered:x.answered,sawSSR:x.sawSSR})),errors}));
}finally{
  await browser.close();
}
