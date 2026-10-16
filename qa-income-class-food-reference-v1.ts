import assert from 'node:assert/strict';
import {
 foodIncomeBandFromOfficial2025,resolveFoodIncomeReferenceForProfileV1,
 INCOME_CLASS_FOOD_SOURCE_VERSION,FOOD_INCOME_SOURCE
} from './income-class-food-reference-v1';

const multi500=foodIncomeBandFromOfficial2025('multi_all','500_599');
assert.equal(multi500.available,true);
assert.equal(multi500.monthlyMeanLowYen,89676); // 2025 550-600: 1,076,110 /12
assert.equal(multi500.monthlyMeanHighYen,90249); // 2025 500-550: 1,082,985 /12
assert.equal(multi500.matchedIncomeCells,2);
assert.equal(multi500.minCellSampleHouseholds,390);
assert.deepEqual(multi500.incomeBandLabels,['500～550万円','550～600万円']);
assert.equal(multi500.rangeOfObservedCellMeans,true);
assert.equal(multi500.modelEstimate,false);
assert.equal(multi500.neverUseForSaving,true);
assert.equal(multi500.source?.table,'第4-2表');

const multiUnder=foodIncomeBandFromOfficial2025('multi_all','under500');
assert.equal(multiUnder.monthlyMeanLowYen,62156);
assert.equal(multiUnder.monthlyMeanHighYen,89153);
assert.equal(multiUnder.matchedIncomeCells,7);
const multiHigh=foodIncomeBandFromOfficial2025('multi_all','1000plus');
assert.equal(multiHigh.monthlyMeanLowYen,116235);
assert.equal(multiHigh.monthlyMeanHighYen,144294);
assert.equal(multiHigh.matchedIncomeCells,3);
assert.ok((multiHigh.monthlyMeanLowYen??0)>(multiUnder.monthlyMeanHighYen??0),
 'A genuine official marginal income reference must vary between broad income groups');

const single500=foodIncomeBandFromOfficial2025('single_all','500_599');
assert.equal(single500.monthlyMeanLowYen,54590);
assert.equal(single500.monthlyMeanHighYen,54590);
assert.equal(single500.minCellSampleHouseholds,32);
assert.equal(single500.source?.table,'第12表');
const singleOver=foodIncomeBandFromOfficial2025('single_all','1000plus');
assert.equal(singleOver.monthlyMeanLowYen,69413);
assert.match(singleOver.scopeWarning,/公表区分が入力の年収帯より広い/);
assert.deepEqual(singleOver.incomeBandLabels,['600万円以上'],
 '2025 single income table must not invent ¥10m+ income cells');
assert.equal(foodIncomeBandFromOfficial2025('multi_all','unknown').available,false);

const multiProfile={
 diagnosisScope:'household' as const,householdSize:4,annualIncomeBand:'500_599' as const
};
assert.deepEqual(resolveFoodIncomeReferenceForProfileV1(multiProfile),multi500);
assert.equal(resolveFoodIncomeReferenceForProfileV1({...multiProfile,diagnosisScope:'personal'}),null,
 'Personal paid food expenses must not compare to all-household annual-food means');
assert.equal(resolveFoodIncomeReferenceForProfileV1({...multiProfile,annualIncomeBand:'unknown'}),null,
 'Never infer gross income from monthly take-home');
assert.equal(resolveFoodIncomeReferenceForProfileV1({diagnosisScope:'personal',householdSize:1,annualIncomeBand:'unknown'}),null,
 'Current single-person chapter does not ask annual gross income');
assert.equal(resolveFoodIncomeReferenceForProfileV1(null),null);

for(const population of ['multi_all','single_all'] as const){
 const src=FOOD_INCOME_SOURCE[population];
 assert.equal(src.year,2025);
 assert.ok(src.sourceUrl.includes(population==='multi_all'?'000040409547':'000040409846'));
 assert.equal(src.category,'食料');
 assert.equal(src.annualFoodYen,true);
}
assert.match(INCOME_CLASS_FOOD_SOURCE_VERSION,/FIES_2025/);
console.log('OFFICIAL_2025_INCOME_FOOD_REFERENCE_QA_PASS');
