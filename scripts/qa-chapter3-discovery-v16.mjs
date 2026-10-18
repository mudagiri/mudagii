import assert from "node:assert/strict";
import {GOALS,HORIZONS,PREPARATIONS,OBSTACLES,PRIORITIES,ROUTES,validateAnswers,buildDiscovery} from "../public/pilot/chapter3-v16/engine.mjs";

let count=0;const routes=new Set();
for(const goal of Object.keys(GOALS))
 for(const horizon of Object.keys(HORIZONS))
  for(const preparation of Object.keys(PREPARATIONS))
   for(const obstacle of Object.keys(OBSTACLES))
    for(const priority of Object.keys(PRIORITIES)){
     const answers={goal,horizon,preparation,obstacle,priority};
     const x=buildDiscovery(answers);
     assert.equal(x.ok,true,JSON.stringify(answers));
     assert.ok(x.routeTitle&&x.headline&&x.action&&x.dream&&x.premise&&x.synthesis);
     assert.ok(x.premise.includes(GOALS[goal].label));
     assert.ok(x.premise.includes(PREPARATIONS[preparation].label));
     assert.ok(x.synthesis.includes(PRIORITIES[priority].label));
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
     routes.add(x.routeId);count++;
    }
assert.deepEqual([...routes].sort(),Object.keys(ROUTES).sort(),"all 8 routes reachable");
assert.deepEqual(validateAnswers({}).errors,["goal","horizon","preparation","obstacle","priority"]);
assert.equal(buildDiscovery(null).ok,false);
assert.equal(buildDiscovery({goal:"future",horizon:"under3",preparation:"unknown",obstacle:"none",priority:"garbage"}).ok,false);
console.log("CH3_V16_5AXIS_DISCOVERY_QA_PASS",count,"valid combinations /",routes.size,"routes");
