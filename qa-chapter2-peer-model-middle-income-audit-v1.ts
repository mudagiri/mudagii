import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditLegacy2025VsOfficialMiddleIncome2024V1,
 LEGACY_2025_MIDDLE_INCOME_ANCHORS_V1} from './chapter2-peer-model-middle-income-audit-v1';
import {OBSERVED_2024_MULTI_WORKER_CELLS} from './age-income-joint-multi-2024-official-v1';
assert.equal(OBSERVED_2024_MULTI_WORKER_CELLS.length,59);
assert.equal(LEGACY_2025_MIDDLE_INCOME_ANCHORS_V1.food[0][0],500);
assert.equal(LEGACY_2025_MIDDLE_INCOME_ANCHORS_V1.food.at(-1)![0],1000);
const food=auditLegacy2025VsOfficialMiddleIncome2024V1('food');
const energy=auditLegacy2025VsOfficialMiddleIncome2024V1('utilities');
for(const audit of [food,energy]){
 assert.equal(audit.summary.rows,49);
 assert.equal(audit.cells.length,49);
 assert.ok(audit.cells.every(x=>x.approximateSample>=50));
 assert.ok(audit.cells.every(x=>x.assumedIncomeMidpointMan>=500&&x.assumedIncomeMidpointMan<1000));
 assert.ok(audit.cells.every(x=>x.officialAverageDisposableMonthlyYen>0));
 assert.equal(audit.summary.calibrationSourceYear,2025);
 assert.equal(audit.summary.validationYear,2024);
 assert.equal(audit.summary.productionEligibility,'RESEARCH_ONLY_NOT_DEPLOYABLE');
 assert.equal(audit.summary.imputedIncomeMidpoint,true);
 assert.ok(audit.summary.wapePct>0);
}
assert.equal(food.summary.mapePct,12.93);
assert.equal(food.summary.wapePct,12.21);
assert.equal(food.summary.meanSignedRelativeErrorPct,12.02);
assert.equal(food.summary.maxAbsolutePercentageErrorPct,31.82);
assert.equal(energy.summary.mapePct,8.45);
assert.equal(energy.summary.wapePct,7.99);
assert.equal(energy.summary.meanSignedRelativeErrorPct,7.55);
assert.equal(energy.summary.maxAbsolutePercentageErrorPct,25.92);
const under30=food.cells.find(x=>x.ageClass.startsWith('30歳未満'));
assert.ok(under30,'under-30 n>=50 official row must be included with its own factor');
assert.equal(under30.observedExpenseMonthlyYen,55064);
assert.equal(under30.predictedExpenseMonthlyYen,72584);
assert.equal(under30.assumedIncomeMidpointMan,575);
assert.ok(food.summary.mapePct>12,
 'Food high-income MAPE 4.12% must not be generalized to middle-income rows');
assert.ok(food.summary.meanSignedRelativeErrorPct>10,
 'Systematic overprediction invalidates an unlabelled same-attribute official mean');
for(const path of ['ResultScreenChapter2V32.tsx','mudagiri-diagnosis-v2.ts','benchmark-router-v4.ts']){
 assert.ok(!readFileSync(path,'utf8').includes('chapter2-peer-model-middle-income-audit-v1'),
  'Research audit must never drive user-visible result, confirmed savings, or benchmark');
}
console.log('CHAPTER2_MIDDLE_INCOME_MODEL_STRESS_TEST_PASS');
console.log('RESULTS '+JSON.stringify([food.summary,energy.summary]));
