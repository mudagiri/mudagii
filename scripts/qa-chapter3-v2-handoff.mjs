// Chapter3 adapter test using V5-shaped result rows; actual V5 builder integration is separate.
import {CATS,planNextAction,validateHandoff} from '../chapter3-v2/decision-core.mjs';
import {buildChapter3HandoffFromV5,C3_HANDOFF_CONSENT} from '../chapter3-v2/handoff-adapter.mjs';

const testDate='2026-10-20T02:00:00.000Z';
const rawC1=()=>{
 return {version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',anonymousUserId:'same-user',
  sessionId:'s-1',completedAt:testDate,jobCode:'IDP',jobName:'戦術ハンター',primaryStyle:'ENJOY'};
};
const makeVm=()=>{
 const rows=CATS.map(category=>({category,known:true,applicability:'applicable',
    v5Status:'ok',aAmount:0,cUpper:0,comparisonDifference:100000,
    diagnosisAmount:45678,comparisonSourceVersion:'not-for-C3'}));
 return {version:'MUDAGIRI_RESULT_VM_V5_0',
  methodologyVersion:'MUDAGIRI_RESULT_VM_V5_2',diagnosisId:'d-1',
  rows,potential:{confirmedA:0,cUpper:0,upper:99999999,lower:0},
  profile:{monthlyTakeHome:99999999,prefecture:'SECRET'},annualIncomeBand:'SECRET',
  chapter1Link:{schemaVersion:'MUDAGIRI_CHAPTER1_LINKAGE_V1',
     chapter1SessionId:'s-1',chapter1JobCode:'IDP',chapter1StyleCode:'ENJOY'}};
};
const args=()=>({consent:C3_HANDOFF_CONSENT,anonymousUserId:'same-user',diagnosisId:'d-1',
                 chapter2Vm:makeVm(),chapter2Goal:'home',chapter1Handoff:rawC1(),createdAt:testDate});
let passed=0;
function assert(ok,description){passed++;if(!ok)throw new Error('FAILED '+passed+': '+description)}
function fail(a,error){const r=buildChapter3HandoffFromV5(a);assert(!r.ok&&r.error===error,
    error+' instead received '+JSON.stringify(r));}
function edit(vm,category,status,A=0,C=0){
 const row=vm.rows.find(x=>x.category===category);
 Object.assign(row,{v5Status:status,aAmount:A,cUpper:C});
 vm.potential.confirmedA=vm.rows.reduce((s,x)=>s+x.aAmount,0);
 vm.potential.cUpper=vm.rows.reduce((s,x)=>s+x.cUpper,0);
}
let a=args(),b=buildChapter3HandoffFromV5(a);
assert(b.ok,'valid opt-in entry');
assert(b.handoff.chapter2.rows.length===12,'exactly 12 categories');
assert(b.handoff.chapter2.goal==='home','selected chapter2 goal retained');
assert(b.handoff.chapter1.jobCode==='IDP','C1 JOB from identity-checked source');
assert(validateHandoff(b.handoff,'same-user').ok,'decision-core consumes bridge');
assert(planNextAction(validateHandoff(b.handoff,'same-user'),{horizon:'near'}).ok,
 'downstream planner consumes sanitized bridge');
let json=JSON.stringify(b.handoff);
assert(!json.includes('99999999')&&!json.includes('SECRET'),'no raw income, comparison, profile or potential upper');
assert(!json.includes('diagnosisAmount')&&!json.includes('comparisonDifference'),'no extra financial fields');

a=args();a.consent=null;fail(a,'EXPLICIT_C3_ENTRY_REQUIRED');
a=args();a.consent=true;fail(a,'EXPLICIT_C3_ENTRY_REQUIRED');
a=args();a.anonymousUserId='someone-else';fail(a,'INVALID_OR_FOREIGN_CHAPTER1');
a=args();a.diagnosisId='another-diagnosis';fail(a,'WRONG_V5_RESULT_OR_DIAGNOSIS_ID');
a=args();a.chapter2Vm.version='MUDAGIRI_RESULT_VM_V4_1';fail(a,'WRONG_V5_RESULT_OR_DIAGNOSIS_ID');
a=args();a.chapter2Vm.methodologyVersion='MUDAGIRI_RESULT_VM_V5_0';fail(a,'WRONG_V5_RESULT_OR_DIAGNOSIS_ID');
a=args();a.chapter2Goal='wrong';fail(a,'INVALID_CHAPTER2_GOAL');
a=args();a.chapter1Handoff={...rawC1(),jobCode:'NOT_JOB'};fail(a,'INVALID_OR_FOREIGN_CHAPTER1');
a=args();a.chapter2Vm.chapter1Link.chapter1StyleCode='DRIVE';fail(a,'CHAPTER1_LINK_CONFLICT');
a=args();a.chapter2Vm.rows.pop();fail(a,'V5_ROWS_OR_POTENTIAL_MISSING');
a=args();a.chapter2Vm.rows[0].category='sub';fail(a,'INVALID_V5_ROW');
a=args();a.chapter2Vm.potential.confirmedA=1000;fail(a,'V5_TOTALS_NOT_RECONCILED');
a=args();a.chapter2Vm.rows[0].cUpper=25;fail(a,'V5_TOTALS_NOT_RECONCILED');
a=args();edit(a.chapter2Vm,'rent','na',0,25);fail(a,'INVALID_V5_ROW');
a=args();edit(a.chapter2Vm,'mobile','cut',1800,0);fail(a,'INVALID_V5_ROW');
a=args();edit(a.chapter2Vm,'sub','cut',1800,0);
b=buildChapter3HandoffFromV5(a);
assert(b.ok&&b.handoff.chapter2.potential.confirmedA===1800,'subscription A accepted but is not realized cash');
a=args();edit(a.chapter2Vm,'mobile','inspect',0,212.35);
b=buildChapter3HandoffFromV5(a);
assert(b.ok&&b.handoff.chapter2.potential.cUpper===212.35,'V5 fractional C accepted');
a=args();edit(a.chapter2Vm,'mobile','inspect',0,212.35);a.chapter2Vm.potential.cUpper=212.4;
fail(a,'V5_TOTALS_NOT_RECONCILED');
a=args();edit(a.chapter2Vm,'mobile','inspect',0,NaN);fail(a,'INVALID_V5_ROW');
a=args();a.chapter1Handoff=null;
b=buildChapter3HandoffFromV5(a);
assert(b.ok&&b.handoff.chapter1===null,'C1 absent does not borrow vm linkage');
a=args();a.chapter2Goal=null;
b=buildChapter3HandoffFromV5(a);
assert(b.ok&&b.handoff.chapter2.goal===null,'unselected future goal is not invented');
a=args();a.createdAt='invalid';fail(a,'INVALID_CAPTURE_TIME');
a=args();a.chapter2Vm.rows[0].known=false;a.chapter2Vm.rows[0].cUpper=1;
fail(a,'INVALID_V5_ROW');
console.log('CHAPTER3_V2_HANDOFF_QA_PASS',JSON.stringify({passed,failed:0,kind:'synthetic_vm_only'}));
