// Run from repository root: node scripts/qa-chapter3-v2-counterfactual.mjs

// Deterministic synthetic fixtures; no network, PII or production environment.

import {CATS,CHAPTER3_HANDOFF_VERSION,validateHandoff,planNextAction} from '../chapter3-v2/decision-core.mjs';

const runCases=function runCases(api){
 const {validateHandoff:v,planNextAction:p}=api;
 let n=0;const ok=(c,msg)=>{n++;if(!c)throw Error("assertion "+n+" failed: "+msg);};
 const make=()=>{
   const rows=CATS.map(category=>({category,v5Status:"ok",known:true,aAmount:0,cUpper:0}));
   return {version:CHAPTER3_HANDOFF_VERSION,anonymousUserId:"unit-id",
     chapter1:{anonymousUserId:"unit-id",sessionId:"s1",completedAt:"2026-10-20T00:00:00Z",jobCode:"IDP",primaryStyle:"ENJOY"},
     chapter2:{anonymousUserId:"unit-id",diagnosisId:"d1",vmVersion:"MUDAGIRI_RESULT_VM_V5_2",goal:"home",rows,potential:{confirmedA:0,cUpper:0}}};
 };
 const row=(g,k,status,A=0,C=0)=>{
   const r=g.chapter2.rows.find(r=>r.category===k);Object.assign(r,{v5Status:status,aAmount:A,cUpper:C});
   g.chapter2.potential.confirmedA=g.chapter2.rows.reduce((a,x)=>a+x.aAmount,0);
   g.chapter2.potential.cUpper=g.chapter2.rows.reduce((a,x)=>a+x.cUpper,0);return g;
 };
 const go=(g,a)=>p(v(g,"unit-id"),a);
 ok(v(make(),"unit-id").ok,"valid V5-shaped data");
 const home=make();row(home,"rent","inspect",0,6000);
 ok(go(home,{horizon:"near"}).actionId==="housing_contract","home inspection near");
 const protect=make();row(protect,"rent","protect");
 ok(go(protect,{horizon:"near"}).actionId==="preserve_housing","housing protected flips result");
 ok(go(home,{horizon:"far"}).actionId==="housing_long_term","housing horizon flips result");
 const ch=make();ch.chapter2.goal="challenge";row(ch,"mobile","inspect",0,20000);
 ok(go(ch,{horizon:"near"}).actionId==="challenge_candidate_uncertain","C candidate restricts financing language");
 const ch2=make();ch2.chapter2.goal="challenge";
 ok(go(ch2,{horizon:"near"}).actionId==="challenge_conditions","C removed changes result");
 const family=make();family.chapter2.goal="family";row(family,"childEducation","protect");
 ok(go(family,{horizon:"near"}).actionId==="education_now_future","education protected");
 row(family,"childEducation","na");
 ok(go(family,{horizon:"near"}).actionId==="family_intent","NA must not imply children");
 const old=make();old.chapter2.goal="retirement";row(old,"fun","protect");
 ok(go(old,{horizon:"far"}).actionId==="retirement_protect_fun","protect enjoyment");
 const old2=JSON.parse(JSON.stringify(old));old2.chapter1.primaryStyle="DRIVE";
 ok(go(old,{horizon:"far"}).reasonTags.includes("c1_enjoy_voice_only")&&!go(old2,{horizon:"far"}).reasonTags.includes("c1_enjoy_voice_only"),"style only affects explanation");
 const base=make();base.chapter2.goal="undecided";
 ok(go(base,{goal:"invest",horizon:"near",detail:"plannedExpense"}).actionId==="upcoming_expense","near planned expense");
 ok(go(base,{goal:"invest",horizon:"near",detail:"noPlannedExpense"}).actionId==="cash_buffer","near no planned expense");
 ok(Boolean(go(base,{goal:"invest",horizon:"near"}).question),"conditional invest question");
 ok(go(base,{goal:"invest",horizon:"far"}).actionId==="invest_time_and_liquidity","horizon changes invest");
 ok(go(base,{goal:"income",horizon:"near",detail:"outsideDemand"}).actionId==="outside_request","income demand");
 ok(go(base,{goal:"income",horizon:"near",detail:"atWork"}).actionId==="salary_conditions","income in work");
 ok(go(base,{goal:"income",horizon:"near",detail:"learningTime"}).actionId==="skill_demand","income learn");
 ok(Boolean(go(base,{goal:"income",horizon:"near"}).question),"income conditional question");
 ok(go(make(),{goal:"income",horizon:"near"}).goal==="home","C2 goal not silently overwritten");
 ok(go(make(),{goal:"income",goalOverrideConfirmed:true,horizon:"near"}).goal==="income","explicit override");
 const bad=make();bad.chapter1.anonymousUserId="other";
 ok(!v(bad,"unit-id").ok,"identity mismatch");
 ok(!v(make(),"another").ok,"root identity mismatch");
 const missing=make();missing.chapter2.rows.pop();
 ok(!v(missing,"unit-id").ok,"missing 12th category");
 const dup=make();dup.chapter2.rows[0].category=dup.chapter2.rows[1].category;
 ok(!v(dup,"unit-id").ok,"duplicate row");
 const totals=make();totals.chapter2.potential.confirmedA=1800;
 ok(!v(totals,"unit-id").ok,"A totals mismatch");
 const na=make();row(na,"rent","na",0,5000);
 ok(!v(na,"unit-id").ok,"NA amount prohibited");
 const badA=make();row(badA,"mobile","cut",1000,0);
 ok(!v(badA,"unit-id").ok,"A outside subscription rejected");
 const goodA=make();row(goodA,"sub","cut",1800,0);
 ok(v(goodA,"unit-id").ok,"A subscription accepted");
 const share=go(ch,{horizon:"near"});
 ok(!JSON.stringify(share.shareSafe).includes("20000"),"share has no candidate amount");
 ok(!JSON.stringify(share.shareSafe).includes("near"),"share has no exact horizon");
 const empty=make();empty.chapter1=null;empty.chapter2=null;
 ok(go(empty,{horizon:"unknown"}).actionId==="compare_goals","unknown goal fallback");
 ok(!p(v(make(),"unit-id"),{horizon:"invalid"}).ok,"invalid horizon");
 const fractional=make();row(fractional,"mobile","inspect",0,234.55);
 ok(v(fractional,"unit-id").ok,"V5 fractional C amounts accepted");
 const fracMismatch=make();row(fracMismatch,"mobile","inspect",0,234.55);fracMismatch.chapter2.potential.cUpper=234.65;
 ok(!v(fracMismatch,"unit-id").ok,"material fractional C mismatch rejected");
 const nonfinite=make();row(nonfinite,"mobile","inspect",0,Number.POSITIVE_INFINITY);
 ok(!v(nonfinite,"unit-id").ok,"nonfinite C rejected");
 ok(go(ch,{horizon:"near"}).shareSafe.requiresExplicitConsent===true,"sharing requires explicit consent");
 ok(go(ch,{horizon:"near"}).shareSafe.goalTheme===null,"goal never auto published");
 return {passed:n,failed:0,scope:"synthetic_V5-shaped_fixtures_only"};
};

const result=runCases({validateHandoff,planNextAction});

console.log('CHAPTER3_V2_COUNTERFACTUAL_QA_PASS',JSON.stringify(result));

