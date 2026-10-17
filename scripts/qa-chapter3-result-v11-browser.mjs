import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium,webkit} from "playwright";

const url=process.env.CH3_PREVIEW_URL||"http://127.0.0.1:4173/mudagii/pilot/chapter123-unified/pilot/chapter3-v11/";
fs.mkdirSync("artifacts/chapter3-v11",{recursive:true});
for(const [engine,browserType] of [["chromium",chromium],["webkit",webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [320,375,390,430]){
   const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
   const errors=[],remote=[];
   page.on("pageerror",e=>errors.push(String(e)));
   page.on("request",r=>{if(!r.url().startsWith("http://127.0.0.1:4173/"))remote.push(r.url())});
   const response=await page.goto(url,{waitUntil:"networkidle"});
   assert.equal(response.status(),200,engine+" "+width+" response");
   const selected=page.locator("#scenario");
   assert.equal(await selected.locator("option").count(),8,"8 cases");
   for(let i=0;i<8;i++){
     await selected.selectOption(String(i));
     assert.equal(await page.locator(".key-question").count(),1,"new insight should exist "+i);
     assert.ok((await page.locator(".key-question").innerText()).length>12,"insight copy "+i);
     assert.ok((await page.locator(".hero-sub").innerText()).includes(await page.locator(".insight h2").innerText()),"first-view insight is personalized "+i);
     assert.equal(await page.locator(".force-card").count(),3,"3 powers "+i);
     assert.equal(await page.locator(".primary").count(),1,"single primary CTA "+i);
     assert.ok(await page.locator(".primary").isVisible(),"CTA visible "+i);
     assert.equal(await page.locator(".two-figures").count(),[0,1,2,4,5,6].includes(i)?1:0,"ch2 source visibility "+i);
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
     assert.ok(overflow<=2,"horizontal overflow "+engine+" "+width+" "+i+": "+overflow);
     await page.locator(".primary").click();
     assert.ok(await page.locator("#action-panel").isVisible(),"tap responds "+i);
     assert.equal(await page.locator("#share-panel").isVisible(),false,"share data not auto-disclosed");
   }
   await selected.selectOption("5");
   const images=await page.locator(".hero-avatars img").evaluateAll(arr=>arr.map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})));
   assert.ok(images.every(x=>x.loaded),JSON.stringify(images));
   await page.locator("#sharePreview").click();
   assert.ok(await page.locator("#share-panel").isVisible(),"share preview");
   assert.ok(!(await page.locator("#share-panel").innerText()).includes("1,800"),"no share monetary info");
   assert.deepEqual(remote,[],"no remote requests");
   assert.deepEqual(errors,[],"no page errors");
   await page.screenshot({path:`artifacts/chapter3-v11/${engine}-${width}.png`,fullPage:true});
   await page.close();
  }
 }finally{await browser.close()}
 console.log(engine+" 320/375/390/430 responsive + 8 cases PASS");
}
