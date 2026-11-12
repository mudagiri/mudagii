import assert from "node:assert/strict";
import {validateChapter3Answers,evaluateChapter3} from "./chapter3-three-forces-v11.mjs";
const base={goal:"future",horizon:"over10",forces:{capital:"interested",time:"active",credit:"unknown"},concern:"none",topics:["investBasics"]};
const wrap=(a={},c={})=>({answers:{...base,...a},...c});
let tests=0;
function check(ok,msg){assert.ok(ok,msg);tests++;}
const normal=evaluateChapter3(wrap());
check(normal.ok,"normal valid");
check(normal.storyKey==="existing","active -> goal alignment");
check(normal.financialEligibilityAssessed===false&&normal.loanCapacityAssessed===false,"no financial/credit scoring");
check(normal.investmentAmountJPY===null&&!normal.automatedPartnerReferralAllowed,"no investable amount or auto-referral");
check(normal.share.financialAmounts===null,"share safe");
const contexts={
 anonymousUserId:"anon-01",
 chapter1:{verified:true,anonymousUserId:"anon-01",job:"FDM",style:"DRIVE"},
 chapter2:{verified:true,anonymousUserId:"anon-01",sourceVersion:"V5",confirmedSavingMonthlyJPY:1800,reviewCandidateUpperMonthlyJPY:15000}
};
const linked=evaluateChapter3(wrap({},contexts));
check(linked.chapter1.job==="FDM","verified job inherited");
check(linked.chapter2.confirmedSavingMonthlyJPY===1800&&linked.chapter2.reviewCandidateUpperMonthlyJPY===15000,"sums never mixed");
check(linked.investmentAmountJPY===null,"confirmed saving is not investment budget");
const invalidIdentity=evaluateChapter3(wrap({},{...contexts,chapter2:{...contexts.chapter2,anonymousUserId:"different"},chapter1:{...contexts.chapter1,verified:false}}));
check(invalidIdentity.chapter1===null&&invalidIdentity.chapter2===null,"foreign/unverified chapter data dropped");
check(evaluateChapter3(wrap({concern:"living",topics:["propertyLearning"]})).safeEducationFirst===true,"financial pressure -> education only");
check(evaluateChapter3(wrap({concern:"debt",topics:["consult"]})).storyKey==="household","debt takes precedence");
check(evaluateChapter3(wrap({goal:"undecided",horizon:"unknown"})).storyKey==="no_goal","undecided honored");
check(evaluateChapter3(wrap({horizon:"under3"})).storyKey==="short_active","short + active => liquidity question");
check(evaluateChapter3(wrap({horizon:"under3",forces:{capital:"notNow",time:"notNow",credit:"unknown"}})).storyKey==="short","short, no active => timing");
check(evaluateChapter3(wrap({topics:["career"]})).storyKey==="earning","earning interest acknowledged");
check(evaluateChapter3(wrap({goal:"family",forces:{capital:"notNow",time:"notNow",credit:"interested"},topics:["propertyLearning"]})).storyKey==="borrowing","borrow education only");
check(evaluateChapter3(wrap({topics:["resultOnly"]})).primaryAction.kind==="save","no lead pressure");
check(!validateChapter3Answers({...base,topics:["resultOnly","consult"]}).ok,"result-only exclusive");
check(!validateChapter3Answers({...base,topics:["consult","consult"]}).ok,"duplicate invalid");
check(!validateChapter3Answers({...base,topics:["career","sideWork","skills"]}).ok,"max 2 topics");
check(!validateChapter3Answers({...base,forces:{capital:"maybe",time:"active",credit:"unknown"}}).ok,"invalid force");
for(const goal of ["stability","future","retirement","family","freedom","undecided"])
for(const horizon of ["under3","threeTo10","over10","unknown"])
for(const concern of ["living","debt","dontKnow","loss","busy","none","skip"])
for(const topic of ["investBasics","propertyLearning","sideWork","career","skills","insurance","budget","consult","resultOnly"])
for(const status of ["active","interested","notNow","unknown"]){
 const r=evaluateChapter3(wrap({goal,horizon,concern,topics:[topic],forces:{capital:status,time:status,credit:status}}));
 check(r.ok&&typeof r.insight.question==="string"&&r.insight.question.length>0,"complete rule coverage");
 check(r.investmentAmountJPY===null&&!r.automatedPartnerReferralAllowed&&r.share.financialAmounts===null,"safety invariant");
 check(!(concern==="living"||concern==="debt")||r.storyKey==="household","living/debt priority");
}
console.log("PASS chapter3 v1.1:",tests,"assertions (synthetic inputs; no user research / browser QA)");
