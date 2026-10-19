import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium,webkit} from "playwright";

/** CDN-backed GitHub preview smoke test, not a test of GitHub Pages or Vercel. */
const sha=process.env.CH3_V16_SOURCE_SHA;
assert.match(sha||"",/^[a-f0-9]{40}$/,"verified Git commit required");
const url="https://raw.githack.com/mudagiri/mudagii/"+sha+"/public/pilot/chapter3-v16/index.html";
fs.mkdirSync("artifacts/chapter3-v16",{recursive:true});
for(const [name,type] of [["chromium",chromium],["webkit",webkit]]){
 const browser=await type.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  // The preview host documents this cookie for automated browsers so they skip
  // its first-visit confirmation screen. No private data is transmitted.
  await context.addCookies([{name:"__Http-phish",value:"1",domain:"raw.githack.com",path:"/",secure:true,httpOnly:true}]);
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",err=>errors.push("JS "+String(err)));
  page.on("response",res=>{if(res.status()>=400)errors.push("HTTP "+res.status()+" "+res.url());});
  await page.goto(url,{waitUntil:"networkidle",timeout:60000});
  assert.match(await page.title(),/V1\.6/,"expected actual Chapter 3 HTML, not a confirmation page");
  await page.waitForFunction(()=>[...document.querySelectorAll(".speech-mascot")].every(el=>el.complete&&el.naturalWidth>0),{timeout:15000});
  await page.screenshot({path:"artifacts/chapter3-v16/remote-"+name+"-intro.png"});
  await page.getByRole("button",{name:/5つの問いで/}).click();
  for(const term of [
   "将来のお金の心配を減らしたい",
   "3〜10年後",
   "始めたけど、このままでいいか迷う",
   "何から始めればいいか分からない",
   "今の楽しみ"
  ]) await page.getByRole("button",{name:new RegExp(term)}).click();
  assert.match(await page.locator(".v16-route-name").innerText(),/進路を整える戦術家/);
  assert.match(await page.locator(".v16-discovery-hero").innerText(),/今の楽しみ/);
  await page.getByRole("button",{name:/設計図に必要な3つのこと/}).click();
  assert.equal(await page.locator(".v16-unlocked").count(),1);
  await page.getByRole("button",{name:/相談で整理できる3つのこと/}).click();
  assert.equal(await page.locator(".v16-consult-items li").count(),3);
  await page.screenshot({path:"artifacts/chapter3-v16/remote-"+name+"-result.png"});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=1,"horizontal overflow "+overflow);
  assert.deepEqual(errors,[],"Remote missing assets/scripts or runtime exceptions");
  console.log("REMOTE_BROWSER_PASS "+name+" "+url);
  await context.close();
 }finally{await browser.close();}
}
