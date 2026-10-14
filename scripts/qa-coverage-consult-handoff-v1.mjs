import {coverageConsultHandoff,externalLineContext} from './coverage-consult-handoff-v1.mjs';
import assert from 'node:assert/strict';
const good=coverageConsultHandoff('diag-privacy-safe','MG-TEST123');
assert.deepEqual(good,{
 diagnosisId:'diag-privacy-safe',firstQuest:null,placement:'coverage_review',
 handoffCode:'MG-TEST123',goal:null,consultPrimary:'lifeplan',
 consultSelectedTopic:'insurance',insuranceReview:true
});
for(const [a,b] of [[undefined,'MG-CODE'],['diag',undefined],['','MG-CODE'],['diag','']]){
 assert.equal(coverageConsultHandoff(a,b),null,'reject missing identity or referral context');
}
assert.equal(Object.keys(good).sort().join(','),'consultPrimary,consultSelectedTopic,diagnosisId,firstQuest,goal,handoffCode,insuranceReview,placement','sensitive medical or financial info not in LINE URL/context');
assert.ok(!('coverageAmounts' in good)&&!('insurancePurpose' in good)&&!('diagnosisResults' in good),'no insurance content or amounts transferred');
assert.equal(Object.keys(good).length,8,'minimal exact handoff payload');
const augmented={...good,confirmedMonthly:99000,rawExpenses:{insurance:{amount:11000}},medicalHistory:'private',profile:{name:'private'}};
assert.deepEqual(externalLineContext(augmented,augmented),good,'coverage external callback contains only safe handoff fields');
assert.equal(Object.keys(externalLineContext(augmented,augmented)).length,8,'no sensitive extra fields survive');
assert.equal(externalLineContext({placement:'coverage_review',diagnosisId:'',handoffCode:'x'},augmented),null,'invalid coverage context does not leak fallback payload');
assert.strictEqual(externalLineContext({placement:'consult_route'},augmented),augmented,'general lifeplan route is unchanged');
assert.equal(externalLineContext(null,augmented),augmented,'noncoverage behavior unchanged');
console.log(JSON.stringify({status:'PASS',checks:13,coverageLINE:{placement:good.placement,consultSelectedTopic:good.consultSelectedTopic,insuranceReview:good.insuranceReview},note:'CTA intent, not appointment booking'}));
