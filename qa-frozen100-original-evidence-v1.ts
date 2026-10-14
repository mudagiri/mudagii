import assert from 'node:assert/strict';
import {__resolverV2Audit,resolveComparableV2,resolveComparableV2LegacyIncome0930} from './comparable-resolver-v2';
import {categoryDiagnosis} from './mudagiri-diagnosis-v2';

/**
 * Extracted and manually cross-checked from:
 * MUDAGIRI_FINAL_100CASE_VALIDATION_V2_0_FROZEN.xlsx
 * - EXEC_SUMMARY / CATEGORY_COUNTS / FROZEN_DECISION
 * - 1200_RESULTS: first 1000 indexed rows (case IDs 1..83 plus 4 rows of 84)
 *
 * The indexed file reader truncated the last 200 rows; raw workbook bytes,
 * respondent profiles, and the original execution engine are unavailable.
 * These are HISTORICAL REFERENCE and SEMANTIC regression checks, NOT a
 * replay of 100 complete source profiles or the new V5 verdict taxonomy.
 */
const frozenReport={cases:100,cells:1200,stressCases:50,confirmedStatusCount:0,
 noUnsupportedSavingViolations:0} as const;
assert.equal(frozenReport.cells,frozenReport.cases*12);
assert.equal(frozenReport.stressCases,50);
assert.equal(frozenReport.confirmedStatusCount,0);

// These official age/household-size means appeared in the historical 100-case
// output and are identical to the archived per-category benchmark workbooks.
const archivedSingle={
 energy:[8291,13299,15380],
 food:[41992,47405,44364],
 daily:[3409,3174,2593],
 fun:[24242,23453,17041]
} as const;
const archivedMulti={
 energy:[22691,25626,25942,28271,33534],
 food:[79340,92240,103384,112019,123241],
 daily:[5139,6621,7469,8014,8320]
} as const;
for(const category of ['energy','food','daily','fun'] as const)
 assert.deepEqual(__resolverV2Audit.SINGLE[category],archivedSingle[category],
  'do not discard original one-person age series: '+category);
for(const category of ['energy','food','daily'] as const)
 assert.deepEqual(__resolverV2Audit.MULTI[category],archivedMulti[category],
  'do not discard original multi-person size series: '+category);

// SINGLE is age-based and income-independent, without unsupported geographic
// multipliers. Check all original age cuts with annualIncome high and low.
for(const [age,index] of [[27,0],[46,1],[70,2]] as const){
 for(const income of [0,4_999_999,9_000_000]){
  const b=resolveComparableV2({household:'single',age,annualIncome:income,
   prefecture:'東京都',month:12,housingType:'賃貸'});
  for(const category of ['energy','food','daily','fun'] as const)
   assert.equal(b[category]?.value,archivedSingle[category][index],
    'single baseline from frozen 100-case evidence: '+category);
 }
}

// MULTI entertainment in old 100-case workbook used the published
// '教養娯楽 TOTAL'. The later finalized entertainment workbook deliberately
// uses the '他の教養娯楽サービス' MONTHLY_CORE, excluding travel, lodging,
// lessons and durable goods. Conflating them would degrade the 12-category
// no-double-counting contract and inflate supposed personal "waste".
const legacyMultiFunTotal=[28411,29433,36710,35859,36390] as const;
const finalMultiFunCore=[9324,9604,11067,9956,9043] as const;
assert.deepEqual(__resolverV2Audit.MULTI.fun,finalMultiFunCore,
 'multi entertainment must retain the item-mapped monthly core, not total');
for(let i=0;i<legacyMultiFunTotal.length;i++){
 assert.ok(legacyMultiFunTotal[i]>finalMultiFunCore[i],
  'a gross all-entertainment series may not substitute the overlap-free monthly core');
 assert.notEqual(legacyMultiFunTotal[i],finalMultiFunCore[i]);
}

// Original detailed source cases recovered from the 100-case workbook:
// ID 76 high income, content with entertainment: 71,000 vs gross 36,710,
// status CHECK ("do not enemy-mark solely because expensive").
// ID 77 low-income with below-average food: 71,406 vs 79,340, NORMAL.
// These V2 audit results must not be called a V5 exact verdict replay.
const highIncomeSatisfied={caseId:76,foodAmount:224400,foodBenchmark:103384,
 funAmount:71000,grossFunBenchmark:36710,funStatus:'CHECK'};
const lowIncomeBelowMean={caseId:77,foodAmount:71406,foodBenchmark:79340,foodStatus:'NORMAL'};
assert.ok(highIncomeSatisfied.foodAmount>highIncomeSatisfied.foodBenchmark);
assert.equal(highIncomeSatisfied.grossFunBenchmark,legacyMultiFunTotal[2]);
assert.ok(lowIncomeBelowMean.foodAmount<lowIncomeBelowMean.foodBenchmark);
assert.equal(lowIncomeBelowMean.foodBenchmark,archivedMulti.food[0]);

// The historical workbook lists four source rows as AUDIT with positive
// confirmed_saving (unused sub 1,800, idle course 3,000, twice each) while
// saying "解約可能なら" / "停止可能なら": it does not contain the
// cancellation facts necessary to prove these were really CONFIRMED.
// Do not backfill those old reported amounts into modern CONFIRMED savings.
const oldConditionallyPositive=[
 {caseId:56,category:'sub',amount:1800,state:'AUDIT'},
 {caseId:58,category:'selfDevelopment',amount:3000,state:'AUDIT'},
 {caseId:71,category:'sub',amount:1800,state:'AUDIT'},
 {caseId:73,category:'selfDevelopment',amount:3000,state:'AUDIT'}
] as const;
assert.equal(oldConditionallyPositive.reduce((s,v)=>s+v.amount,0),9600);
const oldSub=categoryDiagnosis({category:'sub',actual:1800,comparable:null,
 unusedAmount:1800,cancellationConfirmed:false});
assert.equal(oldSub.state,'NORMAL');
assert.equal(oldSub.confirmedSaving,null,
 'historical conditional wording is NOT proof that cancellation is confirmed');
const confirmedSub=categoryDiagnosis({category:'sub',actual:1800,comparable:null,
 unusedAmount:1800,cancellationConfirmed:true});
assert.equal(confirmedSub.state,'CONFIRMED');
assert.equal(confirmedSub.confirmedSaving,1800);
const idleCourse=categoryDiagnosis({category:'selfDevelopment',actual:3000,comparable:null});
assert.equal(idleCourse.state,'AUDIT');
assert.equal(idleCourse.confirmedSaving,null,
 'do not create confirmed savings from unattended self-investment absent a validated stop action');

const current=resolveComparableV2({household:'multi',householdSize:4,age:46,
 prefecture:'東京都',month:2,annualIncome:9_000_000,housingType:'賃貸'});
const old=resolveComparableV2LegacyIncome0930({household:'multi',householdSize:4,age:46,
 prefecture:'東京都',month:2,annualIncome:9_000_000,housingType:'賃貸'});
assert.equal(current.food?.value,103384);
assert.equal(current.daily?.value,7469);
assert.equal(current.fun?.value,11067);
assert.notEqual(current.food?.value,old.food?.value,
 'old income multiplier remains in an explicitly labelled historical comparator only');

console.log('FROZEN100_ORIGINAL_EVIDENCE_QA_PASS',JSON.stringify({
 source:'V2.0 FROZEN 100case / source workbook 6 tabs',
 claimedCases:100,claimedCategoryResults:1200,
 recoverableIndexedRows:1000,
 unsupportedForFullReplay:200,
 actualPersonLevelInputs:'NOT_IN_SOURCE_WORKBOOK',
 baselineCategoriesVerified:['energy','food','daily','single_fun'],
 oldMultiFunTotalNotCore:true,
 positiveHistoricalConditionalSavingRows:4,
 conditionalSavingAutomaticallyConfirmed:false
}));
