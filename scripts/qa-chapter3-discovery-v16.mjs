import assert from "node:assert/strict";
import {GOALS,HORIZONS,PREPARATIONS,OBSTACLES,PRIORITIES,ROUTES,validateAnswers,buildDiscovery} from "../public/pilot/chapter3-v16/engine.mjs";

let count=0;const routes=new Set();const routeCounts=Object.fromEntries(Object.keys(ROUTES).map(k=>[k,0]));
for(const goal of Object.keys(GOALS))
 for(const horizon of Object.keys(HORIZONS))
  for(const preparation of Object.keys(PREPARATIONS))
   for(const obstacle of Object.keys(OBSTACLES))
    for(const priority of Object.keys(PRIORITIES)){
     const answers={goal,horizon,preparation,obstacle,priority};
     const x=buildDiscovery(answers);
     assert.equal(x.ok,true,JSON.stringify(answers));
     assert.ok(x.routeTitle&&x.headline&&x.action&&x.dream&&x.premise&&x.synthesis);
     assert.ok(x.discovery.includes(PRIORITIES[priority].label),"discovery reflects what the user protects");
     assert.ok(x.discovery.length>=35&&x.discovery.length<=165,"personal discovery needs a concise reasoned insight");
     assert.ok(!/保証|必ず叶う|儲かる|誰でも/.test(x.discovery),"no performance guarantees");
     if(["none","skip"].includes(obstacle)&&["notYet","unknown"].includes(preparation)&&
        goal!=="undecided"&&!["under3","unknown"].includes(horizon))
      assert.equal(x.routeId,"launch","not-yet-started must not be classified as already expanding");
     if(obstacle==="none"&&preparation==="regular"&&
        goal!=="undecided"&&!["under3","unknown"].includes(horizon))
      assert.equal(x.routeId,"expand","ready, no reported obstacle should permit expansion");
     assert.ok(x.benefit&&x.obstacleCue&&x.timeframeCue,"result needs a defensible, concrete benefit");
     assert.ok(x.action.length>12&&x.action.length<120,"single actionable next step");
     if(goal==="undecided"&&!["living","debt"].includes(obstacle))
      assert.equal(x.routeId,"navigate","unknown goal must not be mistaken for a concrete deadline");
     if(obstacle==="skip"){
      assert.ok(!/強い障害が報告されていない|困りごとがない/.test(x.why),"skipping is not evidence of no obstacle");
      assert.ok(/答えない/.test(x.obstacleCue),"preserve voluntary disclosure");
      assert.ok(!/大きな障害を感じていない|今は大きな障害を感じていない/.test(x.discovery),"never infer that skipped means no obstacle");
     }
     if(obstacle==="none")assert.ok(!/恐怖|失敗が怖い/.test(x.synthesis),"no invented pain");
     assert.ok(x.premise.includes(GOALS[goal].label));
     assert.ok(x.premise.includes(PREPARATIONS[preparation].label));
     assert.ok(x.synthesis.includes(x.obstacleCue),"synthesis should respond to the chosen obstacle");
     assert.equal(x.chapter1Linked,false);
     assert.equal(x.chapter2Linked,false);
     for(const key of ["confirmedSavingMonthlyJPY","reviewCandidateUpperMonthlyJPY","goalAmountJPY","currentAssetsJPY","gapJPY"])assert.equal(x[key],null);
     assert.equal(x.suitabilityAssessed,false);
     assert.equal(x.loanEligibleAssessed,false);
     assert.ok(!x.shareText.includes(OBSTACLES[obstacle].label),"concern must never appear in share");
     assert.ok(!x.shareText.includes(GOALS[goal].label),"private stated goal must never appear in share");
     assert.ok(!/円|万円|年収|貯蓄額/.test(x.shareText),"share includes no personal amount");
     if(obstacle==="none")assert.ok(!/気になっている/.test(x.premise));
     if(obstacle==="skip")assert.ok(/答えない/.test(x.premise));
     routes.add(x.routeId);routeCounts[x.routeId]++;count++;
    }
assert.deepEqual([...routes].sort(),Object.keys(ROUTES).sort(),"all 8 routes reachable");
assert.ok(Object.values(routeCounts).every(n=>n>0),"every result type must actually occur");
assert.equal(buildDiscovery({goal:"undecided",horizon:"under3",preparation:"notYet",obstacle:"none",priority:"joy"}).routeId,"navigate");
assert.equal(buildDiscovery({goal:"family",horizon:"threeTo10",preparation:"uncertain",obstacle:"none",priority:"people"}).routeId,"course");
assert.equal(buildDiscovery({goal:"future",horizon:"threeTo10",preparation:"unknown",obstacle:"loss",priority:"peace"}).routeId,"brave");
assert.equal(buildDiscovery({goal:"freedom",horizon:"threeTo10",preparation:"notYet",obstacle:"busy",priority:"growth"}).routeId,"time");
assert.equal(buildDiscovery({goal:"future",horizon:"over10",preparation:"notYet",obstacle:"none",priority:"joy"}).routeId,"launch");
assert.equal(buildDiscovery({goal:"family",horizon:"over10",preparation:"unknown",obstacle:"skip",priority:"people"}).routeId,"launch");
assert.equal(buildDiscovery({goal:"freedom",horizon:"threeTo10",preparation:"regular",obstacle:"none",priority:"freedom"}).routeId,"expand");
const sample=buildDiscovery({goal:"future",horizon:"threeTo10",preparation:"uncertain",obstacle:"dontKnow",priority:"joy"});
assert.match(sample.discovery,/準備は始めているけれど/);
assert.match(sample.discovery,/今の楽しみ/);
assert.match(sample.discovery,/目標につながるか/);
assert.deepEqual(validateAnswers({}).errors,["goal","horizon","preparation","obstacle","priority"]);
assert.equal(buildDiscovery(null).ok,false);
assert.equal(buildDiscovery({goal:"future",horizon:"under3",preparation:"unknown",obstacle:"none",priority:"garbage"}).ok,false);
console.log("CH3_V16_5AXIS_DISCOVERY_QA_PASS",count,"valid combinations /",routes.size,"routes",routeCounts);
