/**
 * Integration-shaped QA: generate an actual V5 result using the frozen V5 builder,
 * then project it through the isolated Chapter3 adapter.
 * Synthetic income/profile/expenses; never production financial data.
 */
import type {Category} from '../mudagiri-diagnosis-v2';
import {buildResultViewModelV5} from '../result-view-model-v5';
// @ts-ignore V2 prototype is an isolated .mjs module without a TS declaration.
import {buildChapter3HandoffFromV5,C3_HANDOFF_CONSENT} from '../chapter3-v2/handoff-adapter.mjs';
// @ts-ignore V2 decision POC .mjs is isolated.
import {validateHandoff,planNextAction} from '../chapter3-v2/decision-core.mjs';

const cats:Category[]=[
 'mobile','energy','sub','car','food','daily','fun','beautyFashion',
 'rent','insurance','childEducation','selfDevelopment'
];
const profile:any={
 diagnosisScope:'personal',householdSize:1,adultCount:1,childCount:0,relationships:[],
 expenseSharing:null,householdContributionMode:null,bundledContributionAmount:null,
 prefecture:'東京都',age:35,housingTenure:'rental',housingSubtype:'private_rental',
 monthlyTakeHome:400000,annualIncomeBand:'600_699'
};
function category(category:Category,o:any={}){
 const amount=o.amount??0,benchmark=o.benchmark??null;
 const diff=benchmark===null?null:amount-benchmark;
 return {category,
 record:{category,diagnosisAmount:amount,personalBurden:amount,householdTotal:null,
  comparisonAmount:amount,comparisonBenchmark:benchmark,comparisonQuality:benchmark===null?'none':'exact',
  known:true,applicability:'applicable',metadata:{}},
 comparison:{category,amount,benchmark,quality:benchmark===null?'none':'exact',
  amountScope:'personal',sourceVersion:'QA',difference:diff,
  engineComparableAllowed:benchmark!==null,autoSavingAllowed:false,benchmarkMeta:null,reason:'QA'},
 engine:null,status:o.status??'safe',confirmedSaving:o.confirmedSaving??0,screeningDelta:diff,
 attentionFlag:false,reasonCode:'QA',appraisal:o.appraisal??null} as any;
}
const finalCategories=cats.map(c=>{
 if(c==='sub')return category(c,{amount:5000,confirmedSaving:1800,status:'cut',
  appraisal:{subUnusedAmount:1800,subCancellationConfirmed:true,subUsage:'one'}});
 if(c==='rent')return category(c,{amount:150000,appraisal:{rentPreference:'burdenSome'}});
 if(c==='mobile')return category(c,{amount:12000,appraisal:{mobileScope:'mobileOnly',mobileCarrier:'major'}});
 return category(c);
});
const vm=buildResultViewModelV5({
 diagnosisId:'QA-REALV5',toneMode:'serious',profile,finalCategories
});
let checks=0;
function ok(v:any,m:string){checks++;if(!v)throw new Error('QA_REALVM_FAIL_'+checks+': '+m);}
ok(vm.version==='MUDAGIRI_RESULT_VM_V5_0','V5 vm UI version');
ok(vm.methodologyVersion==='MUDAGIRI_RESULT_VM_V5_2','V5 vm methodology');
ok(vm.rows.length===12,'real builder created twelve rows');
const rawC1={
 version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',anonymousUserId:'qa-user',
 sessionId:'qa-session',completedAt:'2026-10-20T12:00:00Z',
 jobCode:'IDP',jobName:'戦術ハンター',primaryStyle:'ENJOY'
};
const input={
 consent:C3_HANDOFF_CONSENT,anonymousUserId:'qa-user',diagnosisId:'QA-REALV5',
 chapter2Vm:vm,chapter2Goal:'home',chapter1Handoff:rawC1,createdAt:'2026-10-21T00:00:00Z'
};
const bridged=buildChapter3HandoffFromV5(input);
ok(bridged.ok,'actual V5 builder output accepted: '+(bridged.error??''));
ok(bridged.handoff.chapter1.jobCode==='IDP','C1 raw source retained');
ok(bridged.handoff.chapter2.rows.length===12,'sanitized 12 rows');
ok(bridged.handoff.chapter2.potential.confirmedA===1800,'A accurately projected as opportunity');
ok(bridged.handoff.chapter2.potential.cUpper===6000,'mobile C from builder remains unconfirmed');
const json=JSON.stringify(bridged.handoff);
ok(!json.includes('monthlyTakeHome')&&!json.includes('400000')&&!json.includes('comparisonDifference'),'no profile/baseline leaked');
const decision=planNextAction(validateHandoff(bridged.handoff,'qa-user'),{horizon:'near'});
ok(decision.ok&&decision.actionId==='housing_contract','housing review connects to concrete first step');
ok(decision.shareSafe.requiresExplicitConsent===true,'opt-in share default');
const wrong={...input,diagnosisId:'another-diagnosis'};
ok(!buildChapter3HandoffFromV5(wrong).ok,'diagnosis mismatch rejected');
const noConsent={...input,consent:null};
ok(!buildChapter3HandoffFromV5(noConsent).ok,'no implicit transfer');
console.log('CHAPTER3_V2_ACTUAL_VM_BUILDER_PASS',JSON.stringify({passed:checks,failed:0,kind:'actual_V5_builder_synthetic_inputs'}));
