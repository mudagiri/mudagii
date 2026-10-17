import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium,webkit} from "playwright";

const dir="public/pilot/chapter3-v12";
for(const file of ["index.html","stage.mjs","stage.css","story.mjs","story.css","ux-v15.css","next-guide.mjs","motivation.mjs","motivation.css"])assert.ok(fs.existsSync(dir+"/"+file),"missing "+file);
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
   assert.equal(await page.locator(".relic-archive").count(),1,"all three chapters are explained even when C1/C2 disconnected");
   assert.ok((await page.locator(".relic-disclosure").innerText()).includes("未連携"),"no fake chapter clear");
   assert.equal(await page.locator(".fog-riddle").count(),1,"future fog is the current antagonist");
   await page.getByRole("button",{name:/前章を引き継ぐ演出/}).click();
   assert.ok((await page.locator(".relic-job-img").getAttribute("src")).includes("JOB_01_FDM_elephant.webp"),"official C1 job asset in clearly marked sample");
   await page.waitForFunction(()=>{const img=document.querySelector(".relic-job-img");return Boolean(img&&img.complete&&img.naturalWidth>0);},undefined,{timeout:8000}); // allow asynchronous image decode after re-render
   assert.ok((await page.locator(".relic-disclosure").innerText()).includes("架空"),"sample clearly labeled");
   assert.ok((await page.locator(".relic-archive").innerText()).includes("見直し候補"),"confirmed and unconfirmed house savings are distinct");
   await page.getByRole("button",{name:/未来の霧を晴らしに行く/}).click();
   assert.equal(await page.locator(".progress-spot").count(),5);
   assert.equal(await page.locator(".gold-cta").isDisabled(),true,"cannot skip Q1 without an answer");
   await page.locator(".answer-option").nth(4).click(); // freedom
   await page.getByRole("button",{name:/霧の向こうへ進む/}).click();
   await page.locator(".answer-option").nth(1).click(); // 3-10 years
   await page.getByRole("button",{name:/霧の向こうへ進む/}).click();
   assert.equal(await page.locator("fieldset.force-question").count(),3);
   await page.locator('[data-force="capital"] .answer-option').nth(2).click();
   await page.locator('[data-force="time"] .answer-option').nth(2).click();
   await page.locator('[data-force="credit"] .answer-option').nth(3).click();
   await page.getByRole("button",{name:/霧の向こうへ進む/}).click();
   await page.locator(".answer-option").nth(4).click(); // busy
   await page.getByRole("button",{name:/霧の向こうへ進む/}).click();
   await page.locator(".answer-option").nth(3).click(); // career
   await page.locator(".answer-option").nth(2).click(); // side gig
   assert.match(await page.locator(".chosen-count").innerText(),/2 \/ 2/);
   await page.getByRole("button",{name:/地図の第一片を獲得/}).click();
   assert.ok(await page.locator(".reward-reveal").isVisible(),"stage clear reward");
   assert.ok((await page.locator(".reward-reveal").innerText()).includes("第一片を獲得"),"not falsely claim map complete");
   assert.equal(await page.locator(".fragment-tile").count(),3,"three financial plan components");
   assert.equal(await page.locator(".fragment-earned").count(),1,"only first fragment earned by five questions");
   assert.equal(await page.locator(".fragment-locked").count(),2,"amount and gap remain unresolved");
   assert.equal(await page.locator(".relic-archive").count(),1,"C1/C2 story lineage appears in result");
   assert.ok((await page.locator(".relic-archive").innerText()).includes("サンプル"),"sample marker persisted");

   const resultOrder=await page.locator(".stage-shell > *").evaluateAll(xs=>xs.map(el=>el.className));
   assert.ok(resultOrder.indexOf("instant-aha")<resultOrder.indexOf("mission-choice"),"personal aha precedes actions");
   assert.ok(resultOrder.indexOf("mission-choice")<resultOrder.indexOf("story-evidence"),"first CTA precedes long evidence");
   assert.equal(await page.locator(".story-evidence").getAttribute("open"),null,"long explanations collapsed by default");
   assert.ok((await page.locator(".instant-aha-copy").innerText()).length>25,"personal moment visible outside accordion");
   await page.locator(".story-evidence-trigger").click();
   assert.ok(await page.locator(".benefit-bridge").isVisible(),"user may inspect rationale optionally");
   assert.ok((await page.locator(".result-scroll h2").innerText()).includes("稼ぐ"),"personalized earning insight");
   assert.equal(await page.locator(".motivation-mirror").count(),1,"pain/gain is part of the actual Chapter 3 result");
   assert.ok((await page.locator(".aha-card strong").innerText()).length>25,"cross-answer aha before the pain gain cards");
   assert.ok((await page.locator(".gain-card strong").innerText()).includes("お金の事情"),"goal gain expressed in visitor terms");
   assert.ok((await page.locator(".pain-card strong").innerText()).includes("考える時間"),"pain from self-reported Q4");
   assert.equal(await page.locator(".benefit-step").count(),3,"two-step benefit chain");
   assert.ok((await page.locator(".gap-slot").innerText()).includes("算出できません"),"unknown gap not faked");
   assert.ok(await page.locator(".share-quest").isVisible(),"opt-in viral moment available");
   assert.equal(await page.locator(".power-tile").count(),3);
   assert.ok(await page.locator(".earn-power").isVisible(),"earning power must appear");
   assert.equal(await page.locator(".idea-row").count(),2,"selected topics carry over");
   const exposed=await page.locator("#chapter3-stage").innerText();
   assert.ok(!exposed.includes("¥1,800"),"no fake Chapter 2 inheritance");
   assert.ok(!exposed.includes("融資可能額"),"no credit scoring");
   assert.ok(!exposed.includes("円削減"),"not fabricate saving");
   await page.getByRole("button",{name:/選んだ2つの選択肢を見る/}).click();
   assert.ok(await page.locator("#action-panel").isVisible(),"CTA works locally");
   assert.equal(await page.locator(".next-guide-card").count(),2,"selected interests produce two real learning guides");
   assert.ok((await page.locator("#action-panel").innerText()).includes("転職"),"career guidance visible");
   assert.ok((await page.locator("#action-panel").innerText()).includes("副業"),"side-work guidance visible");
   assert.equal(await page.locator(".guide-checks li").count(),6,"each topic gives three check questions");
   await page.getByRole("button",{name:/結果パターンを試す/}).click();
   assert.ok(await page.locator("#demo-choices").isVisible(),"QA-only cases accessible");
   for(let i=0;i<8;i++){
    await page.locator(".demo-select").selectOption(String(i));
    assert.equal(await page.locator(".result-scroll h2").count(),1,"all results map to insight");
    assert.equal(await page.locator(".benefit-step").count(),3,"every route must show visitor benefit");
    if(i===2||i===3||i===5){
      assert.ok((await page.locator(".pain-card .motivation-body").textContent()).includes("叶えたい未来"),"no fake fear when no concern");
    }else{
      assert.ok((await page.locator(".pain-card .motivation-body").textContent()).length>20,"self-reported concern has a conditional explanation");
    }
    assert.ok((await page.locator(".gap-slot").innerText()).includes("算出できません"),"no fake finance");

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,"mobile horizontal overflow width "+width+" case "+i+" delta "+overflow);
   }
   await page.locator(".demo-select").selectOption("4");
   await page.screenshot({path:"artifacts/chapter3-stage/"+name+"-"+width+"-result.png",fullPage:false});
   assert.ok((await page.locator(".share-quest").innerText()).includes("第一片"),"viral copy matches still-incomplete map");
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
