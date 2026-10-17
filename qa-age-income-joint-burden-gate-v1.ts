import assert from 'node:assert/strict';
import {
 AGE_INCOME_JOINT_MIN_SAMPLE,AGE_INCOME_JOINT_SOURCE_V1,
 VERIFIED_2024_JOINT_BURDEN_CELLS_V1,resolveJointBurdenV1,
 type JointAgeIncomeRowV1,
} from './age-income-joint-burden-gate-v1';
const fixture:JointAgeIncomeRowV1={
 household:'single',workStatus:'worker',ageBand:'30～34（５歳階級）',
 grossAnnualIncomeBand:'500～550万円',approximateSample:40,
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
assert.equal(AGE_INCOME_JOINT_MIN_SAMPLE,30);
assert.equal(AGE_INCOME_JOINT_SOURCE_V1.statsDataId,'0004039867');
assert.equal(AGE_INCOME_JOINT_SOURCE_V1.table,'1-29-1');
assert.equal(VERIFIED_2024_JOINT_BURDEN_CELLS_V1.length,0,
 'Must not ship fabricated official age-income reference figures');
assert.equal(resolveJointBurdenV1(input,VERIFIED_2024_JOINT_BURDEN_CELLS_V1).available,false);
assert.equal(resolveJointBurdenV1(input,[{...fixture,verifiedOfficialCell:false}]).reason,'RAW_CELLS_NOT_VERIFIED');
assert.equal(resolveJointBurdenV1(input,[{...fixture,approximateSample:29}]).reason,'JOINT_CELL_SMALL_OR_SUPPRESSED');
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
console.log('CHAPTER2_AGE_INCOME_JOINT_FAIL_CLOSED_QA_PASS');
