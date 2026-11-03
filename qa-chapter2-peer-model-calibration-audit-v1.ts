import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 auditLegacy2025VsOfficialHighIncome2024V1,
 LEGACY_2025_HIGH_INCOME_ANCHORS_V1,
 LEGACY_2025_BASE_MONTHLY_V1,
 LEGACY_2025_SCOPE_GUARDS_V1,
 LEGACY_PEER_AUDIT_REPRODUCIBILITY,
} from './chapter2-peer-model-calibration-audit-v1';
import {OBSERVED_2024_HIGH_MULTI_WORKER_CELLS} from './age-income-joint-high-2024-official-v1';

assert.equal(Object.keys(LEGACY_2025_HIGH_INCOME_ANCHORS_V1).length,6,
 'Old six official statistical headings cannot be silently treated as the 12 diagnosis categories');
assert.equal(LEGACY_2025_BASE_MONTHLY_V1.food,98127.99);
assert.equal(LEGACY_2025_HIGH_INCOME_ANCHORS_V1.food[1000],1.0653);
assert.equal(LEGACY_2025_HIGH_INCOME_ANCHORS_V1.food[1500],1.3);
assert.equal(LEGACY_2025_HIGH_INCOME_ANCHORS_V1.utilities[1500],1.0321);
assert.equal(LEGACY_2025_SCOPE_GUARDS_V1.individualSingleHighIncomeEstimateAllowed,false);
assert.equal(LEGACY_2025_SCOPE_GUARDS_V1.hasExpenseMatch.recreation,'NO_12_CATEGORY_MATCH');
assert.equal(LEGACY_2025_SCOPE_GUARDS_V1.hasExpenseMatch.transport_comm,'NO_12_CATEGORY_MATCH');
assert.equal(LEGACY_2025_SCOPE_GUARDS_V1.savingsEligibility,false);
assert.equal(LEGACY_PEER_AUDIT_REPRODUCIBILITY.officialCellCount,12);
assert.equal(LEGACY_PEER_AUDIT_REPRODUCIBILITY.historicalWorkbookSha256.length,64);
assert.equal(LEGACY_PEER_AUDIT_REPRODUCIBILITY.official2024WorkbookSha256.length,64);
assert.equal(OBSERVED_2024_HIGH_MULTI_WORKER_CELLS.length,12);

const food=auditLegacy2025VsOfficialHighIncome2024V1('food');
const energy=auditLegacy2025VsOfficialHighIncome2024V1('utilities');
for(const result of [food,energy]){
 assert.equal(result.summary.rows,12);
 assert.equal(result.cells.length,12);
 assert.equal(result.summary.productionEligibility,'RESEARCH_ONLY_NOT_DEPLOYABLE');
 assert.equal(result.summary.official2024CellOnly,true);
 assert.equal(result.summary.modelYear,2025);
 assert.ok(result.cells.every(c=>
  c.approximateSample>=50&&c.observedMonthlyExpenseYen>0&&
  c.officialAverageMonthlyDisposableYen>0&&
  Number.isFinite(c.predictedMonthlyExpenseYen)&&
  c.absolutePercentageErrorPct>=0));
 assert.ok(result.summary.wapePct>0);
 assert.ok(result.summary.maeYen>0);
}
assert.equal(food.summary.mapePct,4.12);
assert.equal(food.summary.maxAbsolutePercentageErrorPct,11.0);
assert.equal(food.summary.meanSignedRelativeErrorPct,0.67);
assert.equal(energy.summary.mapePct,8.63);
assert.equal(energy.summary.maxAbsolutePercentageErrorPct,23.3);
assert.equal(energy.summary.meanSignedRelativeErrorPct,-0.5);
const food40High=food.cells.find(x=>x.originalAgeClass.startsWith('40')&&x.originalIncomeClass.includes('1500万円以上'));
assert.ok(food40High);
assert.equal(food40High.observedMonthlyExpenseYen,132463);
assert.equal(food40High.officialAverageMonthlyDisposableYen,965121);
assert.equal(food40High.predictedMonthlyExpenseYen,131546);
assert.equal(food40High.officialObservedBurdenPct,13.73);
assert.equal(food40High.modelBurdenPctUsingOfficialDenominator,13.63);

const resultUi=readFileSync('ResultScreenChapter2V32.tsx','utf8');
const diagnosis=readFileSync('mudagiri-diagnosis-v2.ts','utf8');
const benchmark=readFileSync('benchmark-router-v4.ts','utf8');
assert.ok(!resultUi.includes('chapter2-peer-model-calibration-audit-v1'),
 'Research-only model cannot render as a verified peer rate');
assert.ok(!diagnosis.includes('chapter2-peer-model-calibration-audit-v1'),
 'Do not change frozen diagnostic logic');
assert.ok(!benchmark.includes('chapter2-peer-model-calibration-audit-v1'),
 'Legacy model may not create new official benchmark/confirmed savings');
console.log('CHAPTER2_LEGACY_HIGH_INCOME_MODEL_CALIBRATION_AUDIT_PASS');
console.log('RESULTS '+JSON.stringify([food.summary,energy.summary]));
