import assert from 'node:assert/strict';
import {dailyIncomeReferenceForProfileV1,singleDailyReferenceForExplicitAnnualBracketV1,INCOME_CLASS_DAILY_SOURCE_VERSION} from './income-class-daily-reference-v1';

const profile={diagnosisScope:'household' as const,householdSize:4,annualIncomeBand:'500_599' as const};
const mid=dailyIncomeReferenceForProfileV1(profile);
assert.ok(mid);
assert.equal(mid.source.table,'第4-2表');
assert.equal(mid.source.category,'家事雑貨＋家事用消耗品');
assert.equal(mid.monthlyLowYen,5849); // 26638 + 43545, annual / 12 rounded
assert.equal(mid.monthlyHighYen,6288); // 28315 + 47140, annual / 12 rounded
assert.deepEqual(mid.coveredPublishedBrackets,['500～550万円','550～600万円']);
assert.equal(mid.matchedCells,2);
assert.equal(mid.minSampleHouseholds,390);
assert.equal(mid.observedComponentAggregate,true);
assert.equal(mid.modelEstimate,false);
assert.equal(mid.impactsSaving,false);
const high=dailyIncomeReferenceForProfileV1({...profile,annualIncomeBand:'1000plus'});
assert.ok(high);
assert.equal(high.monthlyLowYen,7749);
assert.equal(high.monthlyHighYen,8941);
assert.equal(high.matchedCells,3);
assert.equal(dailyIncomeReferenceForProfileV1({...profile,annualIncomeBand:'unknown'}),null);
assert.equal(dailyIncomeReferenceForProfileV1({...profile,diagnosisScope:'personal'}),null,'Personal category cannot borrow whole-household comparator');
assert.equal(dailyIncomeReferenceForProfileV1({...profile,householdSize:1}),null,'No annual-gross inference in single profile');
const single=singleDailyReferenceForExplicitAnnualBracketV1('400_499');
assert.ok(single);
assert.equal(single.monthlyLowYen,3575);
assert.equal(single.monthlyHighYen,3575);
assert.equal(single.minSampleHouseholds,49);
assert.equal(single.source.table,'第12表');
const singleHigh=singleDailyReferenceForExplicitAnnualBracketV1('600plus');
assert.ok(singleHigh);
assert.equal(singleHigh.monthlyLowYen,3476);
assert.equal(singleHigh.matchedCells,1);
assert.equal(singleDailyReferenceForExplicitAnnualBracketV1('outside' as any),null);
assert.match(INCOME_CLASS_DAILY_SOURCE_VERSION,/44_45/);
console.log('OFFICIAL_2025_INCOME_DAILY_REFERENCE_QA_PASS');
