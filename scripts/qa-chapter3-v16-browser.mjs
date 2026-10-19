import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {chromium,webkit} from "playwright";
const url=process.env.CH3_V16_URL||"http://127.0.0.1:4173/pilot/chapter3-v16/";
const output="artifacts/chapter3-v16";fs.mkdirSync(output,{recursive:true});
let checks=0;
for(const [engine,browserType] of [["chromium",chromium],["webkit",webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [320,375,390,430]){
   const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
   const errors=[];const backend=[];
   page.on("pageerror",err=>errors.push(String(err)));
   page.on("response",res=>{if(res.status()>=400)errors.push(res.status()+" "+res.url());});
   page.on("request",req=>{if(/script\.google\.com|google-analytics|line\.me|\/(api|webhook)\//i.test(req.url()))backend.push(req.url());});
   await page.goto(url,{waitUntil:"networkidle"});
   assert.match(await page.title(),/V1\.6/);
   await page.waitForFunction(()=>[...document.querySelectorAll(".speech-mascot")].every(x=>x.complete&&x.naturalWidth>0));
   await page.screenshot({path:path.join(output,engine+"-"+width+"-intro.png"),fullPage:false});
   await page.getByRole("button",{name:/5つの問いで/}).click();
   assert.equal(await page.locator("button.answer-option").count(),6);
   await page.getByRole("button",{name:/将来のお金の心配を減らしたい/}).click();
   assert.equal(await page.locator("button.answer-option").count(),4);
   await page.getByRole("button",{name:/3〜10年後/}).click();
   assert.equal(await page.locator("button.answer-option").count(),4,"Q3 must be 4 choices, not 12");
   await page.screenshot({path:path.join(output,engine+"-"+width+"-q3.png"),fullPage:false});
   await page.getByRole("button",{name:/始めたけど、このままでいいか迷う/}).click();
   assert.equal(await page.locator("button.answer-option").count(),7);
   await page.getByRole("button",{name:/何から始めればいいか分からない/}).click();
   assert.equal(await page.locator("button.answer-option").count(),5);
   await page.getByRole("button",{name:/今の楽しみ/}).click();
   assert.match(await page.title(),/作戦書/);
   assert.match(await page.locator(".v16-route-name").innerText(),/進路を整える戦術家/);
   const info=await page.locator(".v16-insight").innerText();
   assert.match(info,/将来のお金の心配を減らしたい/);
   assert.match(info,/始めたけど、このままでいいか迷う/);
   assert.match(info,/何から始めればいいか分からない/);
   assert.match(info,/今の楽しみ/);
   const discovery=await page.locator(".v16-discovery-hero").innerText();
   assert.match(discovery,/将来のお金の心配を減らしたい/);
   assert.match(discovery,/今の楽しみ/);
   assert.match(await page.locator(".v16-timeframe").innerText(),/時期/);
   await page.screenshot({path:path.join(output,engine+"-"+width+"-result.png"),fullPage:false});
   await page.getByRole("button",{name:/設計図に必要な3つのこと/}).click();
   assert.match(await page.locator(".v16-unlocked").innerText(),/必要/);
   await page.getByRole("button",{name:/資産運用の基本/}).click();
   await page.getByRole("button",{name:/ライフプランの整理/}).click();
   await page.getByRole("button",{name:/選んだテーマの攻略ヒントを見る/}).click();
   assert.equal(await page.locator(".v16-guide").count(),2);
   await page.getByRole("button",{name:/相談で整理できる3つのこと/}).click();
   assert.equal(await page.locator(".v16-consult-items li").count(),3);
   assert.match(await page.locator(".v16-consult").innerText(),/今の楽しみ/);
   assert.ok((await page.locator(".v16-guide").first().innerText()).includes("今日の一歩"));
   const screen=await page.evaluate(()=>({w:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll("button")].every(b=>{const r=b.getBoundingClientRect();return r.width>=0;})}));
   assert.ok(screen.html<=screen.w+1,engine+" "+width+" horizontal overflow "+JSON.stringify(screen));
   assert.deepEqual(errors,[],engine+" "+width+" console / image errors");
   assert.deepEqual(backend,[],engine+" "+width+" unexpected external requests");
   await page.screenshot({path:path.join(output,engine+"-"+width+"-guide.png"),fullPage:false});
   await page.getByRole("button",{name:/最初から、未来を探索し直す/}).click();
   assert.match(await page.title(),/V1\.6/);
   await page.close();
   checks++;console.log("CH3_V16_BROWSER_PASS",engine,width);
  }
 }finally{await browser.close();}
}
assert.equal(checks,8);
console.log("CH3_V16_MOBILE_CHROMIUM_WEBKIT_ALL_PASS");
