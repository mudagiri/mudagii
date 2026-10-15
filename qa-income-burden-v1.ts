import assert from 'node:assert/strict';
import {buildIncomeBurdenLensV1} from './income-burden-lens-v1';
import type { ProfileV4 } from './mudagiri-profile-v4';
const profile=(scope:'personal'|'household',monthlyTakeHome:number|null)=>({
 diagnosisScope:scope,monthlyTakeHome,householdContributionMode:null,bundledContributionAmount:null
} as Pick<ProfileV4,'diagnosisScope'|'monthlyTakeHome'|'householdContributionMode'|'bundledContributionAmount'>);
const spend=[
 {category:'food',label:'食費',known:true,applicability:'applicable',amount:65000,diagnosisAmount:65000,comparisonAmount:120000,householdTotal:120000},
 {category:'rent',label:'住居費',known:true,applicability:'applicable',amount:92000,diagnosisAmount:92000,householdTotal:160000},
 {category:'energy',label:'光熱費',known:true,applicability:'applicable',amount:12000,diagnosisAmount:12000},
 {category:'sub',label:'サブスク',known:true,applicability:'applicable',amount:0,diagnosisAmount:0},
 {category:'car',label:'車',known:false,applicability:'na',amount:null,diagnosisAmount:null},
 {category:'childEducation',label:'教育費',known:false,applicability:'applicable',amount:null,diagnosisAmount:null}
];
const low=buildIncomeBurdenLensV1(profile('personal',300000),spend);
assert.equal(low.version,'MUDAGIRI_INCOME_BURDEN_LENS_V1');
assert.equal(low.available,true);
assert.equal(low.knownMonthlyExpenses,169000);
assert.equal(low.knownCategoryCount,4);
assert.equal(low.missingCategoryCount,1);
assert.equal(low.excludedCategoryCount,1);
assert.equal(low.expenseShareOfTakeHomePct,56.3);
assert.equal(low.categories.find(x=>x.category==='food')?.shareOfTakeHomePct,21.7);
assert.equal(low.categories.find(x=>x.category==='rent')?.shareOfTakeHomePct,30.7);
assert.equal(low.categories.find(x=>x.category==='sub')?.shareOfTakeHomePct,0);
assert.equal(low.benchmarkAverageRatePct,null);
assert.equal(low.denominatorSource,'USER_INPUT_MONTHLY_TAKE_HOME');
const high=buildIncomeBurdenLensV1(profile('personal',900000),spend);
assert.equal(high.knownMonthlyExpenses,low.knownMonthlyExpenses);
assert.equal(high.expenseShareOfTakeHomePct,18.8);
assert.equal(high.categories.find(x=>x.category==='food')?.shareOfTakeHomePct,7.2);
assert.equal(high.benchmarkAverageRatePct,null);
// A personal expense / household market reference must never use the whole household's total.
assert.equal(low.categories.find(x=>x.category==='food')?.monthlyAmount,65000);
assert.equal(low.categories.find(x=>x.category==='rent')?.monthlyAmount,92000);
// Known zero, missing and N/A must be distinct.
assert.equal(low.categories.length,4);
assert.equal(buildIncomeBurdenLensV1(profile('household',null),spend).available,false);
assert.equal(buildIncomeBurdenLensV1(profile('household',0),spend).expenseShareOfTakeHomePct,null);
assert.equal(buildIncomeBurdenLensV1(undefined,spend).reason,'INVALID_SCOPE');
const bundle=buildIncomeBurdenLensV1({...profile('personal',250000),householdContributionMode:'bundled',bundledContributionAmount:80000},spend);
assert.equal(bundle.bundledContributionExcluded,true);
assert.equal(bundle.knownMonthlyExpenses,169000);
const duplicate=buildIncomeBurdenLensV1(profile('personal',300000),[...spend,spend[0]]);
assert.equal(duplicate.knownCategoryCount,4);
assert.equal(duplicate.knownMonthlyExpenses,169000);
// Negative, NaN and infinity are not known expenses. Rates greater than 100% are allowed.
const extreme=buildIncomeBurdenLensV1(profile('household',100000),[{category:'rent',known:true,applicability:'applicable',diagnosisAmount:150000,amount:150000},{category:'food',known:true,applicability:'applicable',diagnosisAmount:-5000,amount:-5000}]);
assert.equal(extreme.expenseShareOfTakeHomePct,150);
assert.equal(extreme.missingCategoryCount,1);
console.log('INCOME_BURDEN_V1_QA_PASS: user-input scope, missing/N-A, source separation, no invented averages or savings');
