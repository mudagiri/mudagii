import assert from "node:assert/strict";
import {GOALS,HORIZONS,PREPARATIONS,OBSTACLES,PRIORITIES,ROUTES,validateAnswers,classify,buildDiscovery} from "../public/pilot/chapter3-v16/engine.mjs";
export const CASES=Object.freeze([
 {id:"protect",goal:"future",horizon:"threeTo10",preparation:"unknown",obstacle:"debt",priority:"joy"},
 {id:"deadline",goal:"family",horizon:"under3",preparation:"regular",obstacle:"dontKnow",priority:"people"},
 {id:"time",goal:"freedom",horizon:"over10",preparation:"notYet",obstacle:"busy",priority:"freedom"},
 {id:"navigate",goal:"undecided",horizon:"unknown",preparation:"unknown",obstacle:"none",priority:"peace"},
 {id:"course",goal:"future",horizon:"threeTo10",preparation:"regular",obstacle:"dontKnow",priority:"joy"},
 {id:"brave",goal:"family",horizon:"over10",preparation:"notYet",obstacle:"loss",priority:"people"},
 {id:"launch",goal:"future",horizon:"threeTo10",preparation:"notYet",obstacle:"dontKnow",priority:"growth"},
 {id:"expand",goal:"future",horizon:"threeTo10",preparation:"regular",obstacle:"none",priority:"freedom"}
]);
assert.equal(CASES.length,Object.keys(ROUTES).length,"all routes have examples");
for(const example of CASES){
 const {id,...a}=example;
 assert.deepEqual(validateAnswers(a),{ok:true,errors:[]},id+" answers");
 assert.equal(classify(a),id,id+" classification");
 const r=buildDiscovery(a);
 assert.equal(r.ok,true,id);
 assert.equal(r.routeId,id,id+" result route");
 for(const key of ["routeTitle","headline","premise","synthesis","action","why","firstCheck"]){
  assert.equal(typeof r[key],"string",id+" "+key);
  assert.ok(r[key].length>12,id+" "+key+" nontrivial");
 }
 assert.ok(r.premise.includes(GOALS[a.goal].label),id+" user reported goal");
 assert.ok(r.premise.includes(HORIZONS[a.horizon]),id+" user reported horizon");
 assert.ok(r.premise.includes(PREPARATIONS[a.preparation].label),id+" user reported preparation");
 assert.ok(r.synthesis.includes(PRIORITIES[a.priority].label),id+" user reported priority");
 assert.equal(r.chapter1Linked,false);assert.equal(r.chapter2Linked,false);
 for(const k of ["goalAmountJPY","currentAssetsJPY","gapJPY","confirmedSavingMonthlyJPY","reviewCandidateUpperMonthlyJPY"])assert.equal(r[k],null,id+" never invents "+k);
 assert.equal(r.loanEligibleAssessed,false);assert.equal(r.suitabilityAssessed,false);
 assert.ok(!r.shareText.includes(r.obstacle),"never share user concern");
}
for(const [key,map] of [["goal",GOALS],["horizon",HORIZONS],["preparation",PREPARATIONS],["obstacle",OBSTACLES],["priority",PRIORITIES]]){
 assert.ok(Object.keys(map).length>=4,key+" meaningful options");
 assert.equal(validateAnswers({...CASES[0],[key]:"__malicious__"}).ok,false,"reject invalid "+key);
}
assert.equal(buildDiscovery(null).ok,false,"reject null");
assert.equal(buildDiscovery({}).ok,false,"reject incomplete");
const x=buildDiscovery({...CASES[0],obstacle:"none"});
assert.equal(x.ok,true);
assert.ok(!/不安を探|危険です|損をする/.test(x.headline),"no manufactured fear for none");
console.log("CHAPTER3_V16_DISCOVERY_8_ROUTES_AND_SAFETY_PASS");