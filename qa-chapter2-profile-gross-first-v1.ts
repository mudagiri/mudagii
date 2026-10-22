import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 emptyProfileDraftV4,profileStepsV4,profileStepValidV4,finalizeProfileV4,
 type ProfileDraftV4,
} from './mudagiri-profile-v4';

const profile=(householdSize:number,diagnosisScope:'personal'|'household'):ProfileDraftV4=>({
 ...emptyProfileDraftV4(),diagnosisScope,householdSize,
 relationships:[],compositionConfirmed:true,childCount:null,
 prefecture:'東京都',age:35,housingTenure:'rental',
 housingSubtype:'private_rental',monthlyTakeHome:350000,monthlyTakeHomeAnswered:true,
});
const single=profile(1,'personal');
assert.deepEqual(profileStepsV4(single),['scope','householdSize','prefecture','age','housing','annualIncome','income']);
assert.equal(profileStepValidV4('annualIncome',single),false,'Main gross question requires deliberate response');
assert.equal(profileStepValidV4('income',single),true,'Net monthly take-home stays an independent question');
const singleKnown={...single,annualIncomeAnswered:true,singlePeerGrossBand2024:'400_499' as const};
assert.equal(profileStepValidV4('annualIncome',singleKnown),true);
const singleResult=finalizeProfileV4(singleKnown);
assert.equal(singleResult.singlePeerGrossBand2024,'400_499');
assert.equal(singleResult.annualIncomeBand,'unknown','No personal annual gross misrepresented as family household income');
assert.equal(singleResult.monthlyTakeHome,350000,'Gross selection does not overwrite net take-home');
assert.equal(finalizeProfileV4({...single,annualIncomeAnswered:true,singlePeerGrossBand2024:null}).singlePeerGrossBand2024,null,
 'Unknown/declined income remains allowed but produces no invented official match');
assert.equal(finalizeProfileV4({...single,annualIncomeAnswered:true,singlePeerGrossBand2024:'under400'}).singlePeerGrossBand2024,'under400',
 'Single under400 is explicitly represented, never relabeled as 400–499');

const household=profile(2,'household');
assert.ok(profileStepsV4(household).includes('annualIncome'));
assert.ok(profileStepsV4(household).indexOf('annualIncome')<profileStepsV4(household).indexOf('income'));
assert.equal(profileStepValidV4('annualIncome',household),false);
const high=finalizeProfileV4({...household,annualIncomeBand:'1000plus',annualIncomeAnswered:true});
assert.equal(high.annualIncomeBand,'1000plus');
assert.equal(high.singlePeerGrossBand2024,null);
assert.equal(high.monthlyTakeHome,350000);
assert.equal(finalizeProfileV4({...household,annualIncomeAnswered:true}).annualIncomeBand,'unknown');
assert.equal(profileStepValidV4('annualIncome',{...household,annualIncomeBand:'500_599'}),true,
 'Legacy resumed draft with a previously selected gross bucket remains valid');

const personalMulti=profile(2,'personal');
assert.ok(!profileStepsV4(personalMulti).includes('annualIncome'),
 'Personal-only spending in a shared household cannot be compared with a whole-household gross bracket');
const personalResult=finalizeProfileV4({...personalMulti,annualIncomeBand:'1000plus',annualIncomeAnswered:true});
assert.equal(personalResult.annualIncomeBand,'unknown','Stale household gross band is not silently carried into personal-expense results');

const scene=readFileSync('ProfileV4Scene.tsx','utf8');
assert.ok(scene.includes('PROFILE_GROSS_ANNUAL_PRIMARY'));
assert.ok(scene.includes('わからない・答えたくない'));
assert.ok(scene.includes('あなたの額面年収は？')&&scene.includes('世帯全体の額面年収は？'));
assert.ok(scene.includes('annualIncomeAnswered:true'));
assert.ok(!scene.includes('PROFILE_OPTIONAL_GROSS_ANNUAL'));
for(const p of ['mudagiri-diagnosis-v2.ts','benchmark-router-v4.ts','result-view-model-v5.ts']){
 assert.ok(!readFileSync(p,'utf8').includes('annualIncomeAnswered'),
  'Annual gross answer is outside V1 frozen diagnostic decisions and confirmedA');
}
console.log('CHAPTER2_GROSS_INCOME_FIRST_PROFILE_AND_RESULT_HANDOFF_QA_PASS');
