import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium,webkit} from "playwright";

const dir="public/pilot/chapter3-v12";
for(const file of ["index.html","stage.mjs","stage.css"])assert.ok(fs.existsSync(dir+"/"+file),"missing "+file);
const html=fs.readFileSync(dir+"/index.html","utf8");
const code=fs.readFileSync(dir+"/stage.mjs","utf8");
const css=fs.readFileSync(dir+"/stage.css","utf8");
assert.match(html,/noindex,nofollow/);
assert.match(code,/evaluateChapter3,validateChapter3Answers/);
assert.ok(!/(localStorage|sessionStorage|fetch\s*\(|sendBeacon|XMLHttpRequest|window\.open|navigator\.share)/.test(code),"no persistence/referral/network");
assert.match(code,/screen="intro"/);
assert.match(code,/screen="quest"/);
assert.match(code,/screen="result"/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/new-world-scene/);
assert.match(css,/reward-reveal/);
const url=process.env.CHAPTER3_STAGE_URL||"http://127.0.0.1:4173/pilot/chapter3-v12/";
fs.mkdirSync("artifacts/chapter3-stage",{recursive:true});
for(const [name,engine] of [["chromium",chromium],["webkit",webkit]]){
 const browser=await engine.launch({headless:true});
 try{
  for(const width of [320,375,390,430]){
   const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   const errors=[],requests=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(!r.url().startsWith(new URL(url).origin))requests.push(r.url());});
   const response=await page.goto(url,{waitUntil:"networkidle"});
   assert.equal(response.status(),200,name+" "+width+" served");
   assert.ok(await page.locator(".new-world-scene").isVisible(),"intro must show new area");
   assert.ok((await page.locator(".world-title").innerText()).includes("未来の大陸"));
   const introImages=await page.locator(".speech-mascot").evaluateAll(xs=>xs.map(x=>({url:x.src,loaded:x.complete&&x.naturalWidth>0})));
   assert.ok(introImages.every(x=>x.loaded),"official mascot loads");
   await page.screenshot({path:"artifacts/chapter3-stage/"+name+"-"+width+"-intro.png",fullPage:false});
   await page.getByRole("button",{name:/第3章をはじめる/}).click();
   assert.equal(await page.locator(".progress-spot").count(),5);
   assert.equal(await page.locator(".gold-cta").isDisabled(),true,"cannot skip Q1 without an answer");
   await page.locator(".answer-option").nth(4).click(); // freedom
   await page.getByRole("button",{name:/次の問いへ/}).click();
   await page.locator(".answer-option").nth(1).click(); // 3-10 years
   await page.getByRole("button",{name:/次の問いへ/}).click();
   assert.equal(await page.locator("fieldset.force-question").count(),3);
   await page.locator('[data-force="capital"] .answer-option').nth(2).click();
   await page.locator('[data-force="time"] .answer-option').nth(2).click();
   await page.locator('[data-force="credit"] .answer-option').nth(3).click();
   await page.getByRole("button",{name:/次の問いへ/}).click();
   await page.locator(".answer-option").nth(4).click(); // busy
   await page.getByRole("button",{name:/次の問いへ/}).click();
   await page.locator(".answer-option").nth(3).click(); // career
   await page.locator(".answer-option").nth(2).click(); // side gig
   assert.match(await page.locator(".chosen-count").innerText(),/2 \/ 2/);
   await page.getByRole("button",{name:/作戦書をひらく/}).click();
   assert.ok(await page.locator(".reward-reveal").isVisible(),"stage clear reward");
   assert.ok((await page.locator(".result-scroll h2").innerText()).includes("稼ぐ"),"personalized earning insight");
   assert.equal(await page.locator(".power-tile").count(),3);
   assert.ok(await page.locator(".earn-power").isVisible(),"earning power must appear");
   assert.equal(await page.locator(".idea-row").count(),2,"selected topics carry over");
   const exposed=await page.locator("#chapter3-stage").innerText();
   assert.ok(!exposed.includes("¥1,800"),"no fake Chapter 2 inheritance");
   assert.ok(!exposed.includes("融資可能額"),"no credit scoring");
   assert.ok(!exposed.includes("円削減"),"not fabricate saving");
   await page.getByRole("button",{name:/選んだ2つの選択肢を見る/}).click();
   assert.ok(await page.locator("#action-panel").isVisible(),"CTA works locally");
   await page.getByRole("button",{name:/結果パターンを試す/}).click();
   assert.ok(await page.locator("#demo-choices").isVisible(),"QA-only cases accessible");
   for(let i=0;i<8;i++){
    await page.locator(".demo-select").selectOption(String(i));
    assert.equal(await page.locator(".result-scroll h2").count(),1,"all results map to insight");
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,"mobile horizontal overflow width "+width+" case "+i+" delta "+overflow);
   }
   await page.locator(".demo-select").selectOption("4");
   await page.screenshot({path:"artifacts/chapter3-stage/"+name+"-"+width+"-result.png",fullPage:false});
   await page.getByRole("button",{name:/もう一度、未来を探索する/}).click();
   assert.ok(await page.locator(".new-world-scene").isVisible(),"reset returns to new world");
   assert.deepEqual(errors,[],"JS errors");
   assert.deepEqual(requests,[],"no outbound requests");
   await page.close();
   console.log("PASS "+name+" "+width+" stage intro -> 5 quests -> rewards -> 8 cases -> reset");
  }
 }finally{await browser.close();}
}
console.log("CHAPTER3_V12_NEW_STAGE_ALL_QA_PASS");
