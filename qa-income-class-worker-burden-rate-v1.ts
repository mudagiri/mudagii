import assert from 'node:assert/strict';
import {MIN_WORKER_BURDEN_SAMPLE,workerBurdenRateGapV1,workerBurdenReferenceForProfileV1} from './income-class-worker-burden-rate-v1';
const profile={diagnosisScope:'household' as const,householdSize:3,annualIncomeBand:'500_599' as const};
const multi=workerBurdenReferenceForProfileV1(profile);
assert.ok(multi.available);
assert.equal(multi.source?.sourceTableId,'000040409526');
assert.equal(multi.source?.table,'第2-3表');
assert.equal(multi.label,'500～599万円');
assert.equal(multi.matchedPublishedCells,2);
assert.equal(multi.sampleMinimum,249);
assert.deepEqual(multi.categories.food?.cells.map(x=>[x.label,x.sample,x.monthlyDisposableIncomeYen,x.monthlyExpenseYen]),
 [['500～550万円',249,370307,78411],['550～600万円',260,401408,82570]]);
const exactPct=(78411/370307)*100;
assert.equal(multi.categories.food?.ratePctHigh,Math.round(exactPct*10)/10);
assert.ok(multi.categories.food!.ratePctLow < multi.categories.food!.ratePctHigh);
assert.deepEqual(multi.categories.energy?.cells.map(x=>x.monthlyExpenseYen),[23128,24038]);
assert.deepEqual(multi.categories.daily?.cells.map(x=>x.monthlyExpenseYen),[6130,6107]);
assert.equal(multi.categories.daily?.cells[0].monthlyExpenseYen,2419+3711);
assert.equal(multi.meanOfHouseholdIndividualRates,false);
assert.equal(multi.populationMatchesVisitorEmployment,'UNVERIFIED');
assert.equal(multi.neverUseForSavings,true);
assert.equal(MIN_WORKER_BURDEN_SAMPLE,30);
const high=workerBurdenReferenceForProfileV1({...profile,annualIncomeBand:'1000plus'});
assert.ok(high.available&&high.matchedPublishedCells===3);
assert.equal(high.categories.food?.cells[2].monthlyExpenseYen,138858);
assert.equal(high.categories.food?.cells[2].monthlyDisposableIncomeYen,1064358);
// Suppress an ENTIRE broad range if it contains any cell below the cutoff.
const smallMulti=workerBurdenReferenceForProfileV1({...profile,annualIncomeBand:'under500'});
assert.equal(smallMulti.available,false);
assert.equal(smallMulti.reason,'SMALL_SAMPLE');
assert.deepEqual(smallMulti.categories,{});
const singleProf={diagnosisScope:'personal' as const,householdSize:1,annualIncomeBand:'unknown' as const};
const single=workerBurdenReferenceForProfileV1(singleProf,'400_499');
assert.ok(single.available);
assert.equal(single.source?.sourceTableId,'000040409819');
assert.equal(single.source?.table,'第5表');
assert.equal(single.categories.food?.cells[0].monthlyExpenseYen,46856);
assert.equal(single.categories.food?.cells[0].monthlyDisposableIncomeYen,322112);
assert.equal(single.categories.energy?.cells[0].monthlyExpenseYen,11094);
assert.equal(single.categories.daily?.cells[0].monthlyExpenseYen,3466);
for(const b of ['under100','100_199','500_599'] as const){
 const tiny=workerBurdenReferenceForProfileV1(singleProf,b);
 assert.equal(tiny.available,false,'suppressed low n '+b);
 assert.equal(tiny.reason,'SMALL_SAMPLE');
}
assert.equal(workerBurdenReferenceForProfileV1(singleProf).reason,'INCOME_BAND_MISSING');
assert.ok(workerBurdenReferenceForProfileV1(singleProf,'600plus').note.includes('600万円以上'));
const raw=single.categories.food!;
const gap=workerBurdenRateGapV1({
 ownMonthlySpendingYen:70000,ownMonthlyTakeHomeYen:300000,
 reference:raw,primaryReferenceYen:55000,sameExpenseScope:true
});
const benchmarkExact=46856/322112;
assert.equal(gap.available,true);
assert.equal(gap.counterfactualLowYen,Math.round(300000*benchmarkExact));
assert.equal(gap.counterfactualHighYen,Math.round(300000*benchmarkExact));
assert.equal(gap.excessAboveHighestRateYen,70000-Math.round(300000*benchmarkExact));
assert.equal(gap.overlapWithPrimaryYen,Math.min(70000-55000,gap.excessAboveHighestRateYen!));
// Cases that could overstate saving or compare unlike scopes must be unavailable.
for(const wrong of [
 {ownMonthlySpendingYen:70000,ownMonthlyTakeHomeYen:300000,reference:raw,primaryReferenceYen:55000,sameExpenseScope:false},
 {ownMonthlySpendingYen:70000,ownMonthlyTakeHomeYen:0,reference:raw,primaryReferenceYen:55000,sameExpenseScope:true},
 {ownMonthlySpendingYen:null,ownMonthlyTakeHomeYen:300000,reference:raw,primaryReferenceYen:55000,sameExpenseScope:true}
]){
 assert.equal(workerBurdenRateGapV1(wrong).available,false);
}
assert.equal(workerBurdenRateGapV1({ownMonthlySpendingYen:70000,ownMonthlyTakeHomeYen:300000,reference:raw,primaryReferenceYen:null,sameExpenseScope:true}).overlapWithPrimaryYen,null);
assert.equal(workerBurdenRateGapV1({ownMonthlySpendingYen:1000,ownMonthlyTakeHomeYen:300000,reference:raw,primaryReferenceYen:55000,sameExpenseScope:true}).overlapWithPrimaryYen,0);
console.log('FIES_2025_WORKER_SAME_POPULATION_BURDEN_QA_PASS');
