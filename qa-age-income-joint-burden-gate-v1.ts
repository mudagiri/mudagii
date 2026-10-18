import assert from 'node:assert/strict';
import {
 AGE_INCOME_JOINT_MIN_SAMPLE,AGE_INCOME_JOINT_SOURCE_V1,
 VERIFIED_2024_JOINT_BURDEN_CELLS_V1,resolveJointBurdenV1,
 type JointAgeIncomeRowV1,
 resolve2024SingleWorkerPeerBurdenV1,resolve2024MultiWorkerPeerBurdenV1,
 resolve2024DeclaredWorkerPeerV1,
} from './age-income-joint-burden-gate-v1';
const fixture:JointAgeIncomeRowV1={
 household:'single',workStatus:'worker',ageBand:'30～34（５歳階級）',
 grossAnnualIncomeBand:'500～550万円',approximateSample:60,
 averageMonthlyDisposableYen:300000,
 expenseYen:{food:62000,energy:12000,daily:4800},
 sourceStatsDataId:AGE_INCOME_JOINT_SOURCE_V1.statsDataId,
 verifiedOfficialCell:true,
};
// IMPORTANT: all numbers above are SYNTHETIC QA ONLY and do not appear
// in the production reference matrix or any real visitor result.
const input={
 household:'single' as const,workStatus:'worker' as const,
 ageBand:fixture.ageBand,publishedGrossIncomeBands:['500～550万円'],
 expense:'food' as const,respondentAgeIsHouseholdHead:true
};
assert.equal(AGE_INCOME_JOINT_MIN_SAMPLE,50);
assert.equal(AGE_INCOME_JOINT_SOURCE_V1.statsDataId,'0004039867');
assert.equal(AGE_INCOME_JOINT_SOURCE_V1.table,'1-29-1');
assert.equal(VERIFIED_2024_JOINT_BURDEN_CELLS_V1.length,79,
 'Only previously audited original eStat 2024 age×income single-worker cells permitted');
assert.equal(resolveJointBurdenV1(input,VERIFIED_2024_JOINT_BURDEN_CELLS_V1).available,false,
 'Synthetic fixture age/income never silently aliases official 2024 rows');
const published=resolve2024SingleWorkerPeerBurdenV1(35,'500_599','food');
assert.equal(published.available,true);
assert.equal(published.usedCells,2);
assert.equal(published.ratePctLow,12.2);
assert.equal(published.ratePctHigh,17.8);
assert.equal(published.sourceStatsDataId,'0004039867');
const otherAge=resolve2024SingleWorkerPeerBurdenV1(25,'500_599','food');
assert.equal(otherAge.available,true);
assert.equal(otherAge.ratePctLow,11.0);
assert.equal(otherAge.ratePctHigh,14.4);
const small=resolve2024SingleWorkerPeerBurdenV1(63,'500_599','food');
assert.equal(small.available,false,'n=30 approximate in one of two original subcells is below conservative 50');
assert.equal(small.reason,'JOINT_CELL_SMALL_OR_SUPPRESSED');
assert.equal(resolve2024SingleWorkerPeerBurdenV1(35,'600plus','food').available,false);
assert.equal(resolve2024SingleWorkerPeerBurdenV1(75,'400_499','food').available,false);
assert.equal(resolveJointBurdenV1(input,[{...fixture,verifiedOfficialCell:false}]).reason,'RAW_CELLS_NOT_VERIFIED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,approximateSample:29}]).reason,'JOINT_CELL_SMALL_OR_SUPPRESSED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,approximateSample:49}]).reason,'JOINT_CELL_SMALL_OR_SUPPRESSED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,approximateSample:'X'}]).reason,'JOINT_CELL_SMALL_OR_SUPPRESSED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,approximateSample:'-'}]).reason,'JOINT_CELL_SMALL_OR_SUPPRESSED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,averageMonthlyDisposableYen:null}]).reason,'DISPOSABLE_OR_EXPENSE_UNVERIFIED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,expenseYen:{...fixture.expenseYen,food:null}}]).reason,'DISPOSABLE_OR_EXPENSE_UNVERIFIED');
assert.equal(resolveJointBurdenV1({...input,respondentAgeIsHouseholdHead:false},[fixture]).reason,'HOUSEHOLD_HEAD_AGE_NOT_VERIFIED');
assert.equal(resolveJointBurdenV1({...input,workStatus:'non_worker'},[fixture]).reason,'JOINT_SOURCE_CELL_MISSING');
assert.equal(resolveJointBurdenV1({...input,household:'multi'},[fixture]).reason,'JOINT_SOURCE_CELL_MISSING');
assert.equal(resolveJointBurdenV1({...input,ageBand:'35～39（５歳階級）'},[fixture]).reason,'JOINT_SOURCE_CELL_MISSING');
assert.equal(resolveJointBurdenV1({...input,publishedGrossIncomeBands:['500～550万円','550～600万円']},[fixture]).reason,'JOINT_SOURCE_CELL_MISSING');
assert.equal(resolveJointBurdenV1({...input,publishedGrossIncomeBands:[]},[fixture]).reason,'INCOME_CLASSES_NOT_PROVEN');
assert.equal(resolveJointBurdenV1({...input,publishedGrossIncomeBands:['500～550万円','500～550万円']},[fixture]).reason,'INCOME_CLASSES_NOT_PROVEN');
const allowed=resolveJointBurdenV1(input,[fixture]);
assert.equal(allowed.available,true);
assert.equal(allowed.ratePctLow,20.7);
assert.equal(allowed.ratePctHigh,20.7);
assert.equal(allowed.sourceStatsDataId,'0004039867');
const multi30=resolve2024MultiWorkerPeerBurdenV1(34,'500_599','food',true);
assert.equal(multi30.available,true);
assert.equal(multi30.usedCells,2);
assert.equal(multi30.ratePctLow,19.5);
assert.equal(multi30.ratePctHigh,20.3);
assert.equal(multi30.eligibleForReviewBuffer,false);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(34,'500_599','food',false).reason,'HOUSEHOLD_HEAD_AGE_NOT_VERIFIED');
assert.equal(resolve2024MultiWorkerPeerBurdenV1(45,'800_999','food',true).ratePctLow,18.4);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(45,'800_999','food',true).ratePctHigh,19.8);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(29,'500_599','food',true).available,false,'under30 fails when one original 50万円 income class n<50');
assert.equal(resolve2024MultiWorkerPeerBurdenV1(72,'900_999','food',true).available,false,'unknown 900_999 income subgroup is not a profile band');
assert.equal(resolve2024MultiWorkerPeerBurdenV1(72,'800_999','food',true).available,false,'both 900+ original classes n<50 for older households');
assert.equal(resolve2024MultiWorkerPeerBurdenV1(55,'1000plus','food',true).available,false,'broad open-ended annual income is not an exact official bin');
assert.equal(resolve2024MultiWorkerPeerBurdenV1(34,'unknown','food',true).available,false);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(34,'500_599','daily',true).available,true);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(34,'500_599','energy',true).available,true);
for(const household of ['single','multi'] as const){
 const args={household,age:35,grossBand:'500_599',expense:'food' as const,headAgeConfirmed:true};
 assert.equal(resolve2024DeclaredWorkerPeerV1({...args,headWorkerConfirmed:false}).reason,
  'HOUSEHOLD_HEAD_WORK_STATUS_NOT_VERIFIED',
  'Never claim same-age worker rate unless household head explicitly confirms wage/salary work');
 assert.equal(resolve2024DeclaredWorkerPeerV1({...args,headWorkerConfirmed:true}).available,true);
}
assert.equal(resolve2024DeclaredWorkerPeerV1({household:'multi',age:35,grossBand:'500_599',
 expense:'food',headAgeConfirmed:false,headWorkerConfirmed:true}).available,false,
 'Worker status does not override unverified household head age');
assert.equal(resolve2024DeclaredWorkerPeerV1({household:'multi',age:35,grossBand:'1000plus',
 expense:'food',headAgeConfirmed:true,headWorkerConfirmed:true}).available,false,
 'No high-income cross-cell guessing until complete independently verified official source');
console.log('CHAPTER2_AGE_INCOME_JOINT_FAIL_CLOSED_QA_PASS');
