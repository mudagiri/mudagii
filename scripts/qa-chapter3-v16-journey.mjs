import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {chromium,webkit} from "playwright";
import {CASES} from "./qa-chapter3-v16-discovery.mjs";
import {GOALS,HORIZONS,PREPARATIONS,OBSTACLES,PRIORITIES,buildDiscovery} from "../public/pilot/chapter3-v16/engine.mjs";

const url=process.env.CH3_V16_URL||"http://127.0.0.1:4173/pilot/chapter3-v16/";
const maps={goal:GOALS,horizon:HORIZONS,preparation:PREPARATIONS,obstacle:OBSTACLES,priority:PRIORITIES};
const fields=["goal","horizon","preparation","obstacle","priority"];
const output="artifacts/chapter3-v16";fs.mkdirSync(output,{recursive:true});
let passes=0;
for(const [browserName,engine] of [["chromium",chromium],["webkit",webkit]]){
 const browser=await engine.launch({headless:true});
 try{
  const suites=[...CASES.map(x=>({scenario:x,width:390})),...[320,375,430].map(w=>({scenario:CASES[0],width:w}))];
  for(const {scenario,width} of suites){
   const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
   const errors=[],outside=[];
   page.on("pageerror",err=>errors.push(err.message));
   page.on("request",req=>{
    const parsed=new URL(req.url()),current=new URL(url);
    if(parsed.origin!==current.origin&&parsed.protocol!=="data:"&&parsed.protocol!=="blob:")outside.push(req.url());
   });
   try{
    const response=await page.goto(url,{waitUntil:"networkidle",timeout:30000});
    assert.equal(response.status(),200,"page HTTP 200");
    assert.match(await page.title(),/第3章/);
    assert.match(await page.locator("h1").innerText(),/未来の大陸/);
    const introImages=await page.locator("img").evaluateAll(els=>els.map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})));
    assert.ok(introImages.length>=1&&introImages.every(x=>x.loaded),"all intro image assets load");
    if(scenario.id==="protect")await page.screenshot({path:path.join(output,browserName+"-"+width+"-intro.png")});
    await page.getByRole("button",{name:/未来の霧を晴らす/}).click();
    for(let i=0;i<fields.length;i++){
     const key=fields[i],value=scenario[key];
     assert.equal(await page.locator(".answer-choice").count(),Object.keys(maps[key]).length,"choices "+key);
     const index=Object.keys(maps[key]).indexOf(value);
     assert.ok(index>=0,"scenario "+key+" valid");
     const selected=page.locator(".answer-choice").nth(index);
     const box=await selected.boundingBox();
     assert.ok(box&&box.height>=48,"choice tap target >=48px "+key);
     await selected.click();
     assert.equal(await page.locator(".answer-choice.selected").count(),1,"one selection "+key);
     await page.getByRole("button",{name:i===4?/未来の地図をひらく/:/次の霧を晴らす/}).click();
    }
    const discovery=buildDiscovery(scenario);
    assert.equal(await page.locator(".route-name").innerText(),discovery.routeTitle,"route matches engine");
    assert.ok((await page.locator(".aha-lead").innerText()).includes(discovery.headline),"individual insight");
    assert.ok((await page.locator(".first-action").innerText()).includes(discovery.action),"action matches route");
    assert.equal(await page.locator(".map-tile.unlocked").count(),1,"single earned fragment");
    assert.equal(await page.locator(".map-tile.locked").count(),2,"unknown numbers remain locked");
    assert.ok((await page.locator(".main-discovery").innerText()).includes(PRIORITIES[scenario.priority].label),"priority reflected");
    assert.ok((await page.locator(".main-discovery").innerText()).includes(GOALS[scenario.goal].label),"goal reflected");
    await page.getByRole("button",{name:/未来の地図の続きを見る/}).click();
    assert.equal(await page.locator(".planning-row").count(),3,"three-step next quest revealed");
    assert.ok((await page.locator(".consult-value").innerText()).includes("ライフプラン相談"),"consult benefit explained");
    assert.equal(await page.locator(".why-details").count(),1,"evidence accessible");
    assert.equal(await page.locator(".why-details").getAttribute("open"),null,"evidence collapsed by default");
    await page.locator(".why-details summary").click();
    assert.equal(await page.locator(".why-details").getAttribute("open"),"","evidence expands");
    assert.ok((await page.locator(".why-details").innerText()).includes("未連携"),"no fake C1/C2 inheritance");
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"no horizontal overflow");
    const imgs=await page.locator("img").evaluateAll(els=>els.filter(x=>x.offsetWidth>0).map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})));
    assert.ok(imgs.length>=1&&imgs.every(x=>x.loaded),"result images load");
    assert.deepEqual(errors,[],"no JS errors");
    assert.deepEqual(outside,[],"no third-party network request");
    if(width===390||scenario.id==="protect")await page.screenshot({path:path.join(output,browserName+"-"+width+"-"+scenario.id+"-result.png"),fullPage:false});
    if(scenario.id==="protect"){
     await page.getByRole("button",{name:/もう一度、未来を探索する/}).click();
     assert.match(await page.locator("h1").innerText(),/未来の大陸/,"replay works");
    }
    passes++;
    console.log("CHAPTER3_V16_PASS",browserName,width,scenario.id);
   }finally{await page.close();}
  }
 }finally{await browser.close();}
}
assert.equal(passes,22,"8 routes x 2 browsers + 3 mobile sizes x 2 browsers");
console.log("CHAPTER3_V16_BROWSER_22_COMPLETE_JOURNEYS_PASS");