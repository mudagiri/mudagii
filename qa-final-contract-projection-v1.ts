import assert from 'node:assert/strict';
import {resolveComparableV2,resolveComparableV2LegacyIncome0930,__resolverV2Audit,RESOLVER_V2_POLICY} from './comparable-resolver-v2';
import {compareIncomeModelsAgainstFinalContractV1,CONTRACT_POLICY_CONFLICT_STATUS,FINAL_CONTRACT_V1_SOURCE} from './contract-benchmark-projection-v1';

/** Isolated final-contract candidate, not production. Compare against the
 * historic 2026-09-30 calculation without throwing away any official tables.
 */
assert.equal(CONTRACT_POLICY_CONFLICT_STATUS,'P0_CANDIDATE_VALIDATION_DO_NOT_MERGE');
assert.equal(FINAL_CONTRACT_V1_SOURCE,'MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0_20260928');
assert.equal(RESOLVER_V2_POLICY,FINAL_CONTRACT_V1_SOURCE);
const base={household:'multi' as const,householdSize:4,age:40,annualIncome:8_000_000,prefecture:'東京都',month:2,housingType:'賃貸'};
const contract=resolveComparableV2(base),historical=resolveComparableV2LegacyIncome0930(base);
const rows=compareIncomeModelsAgainstFinalContractV1(base);
assert.deepEqual(rows.map(x=>x.category),['energy','food','daily','fun']);
assert.deepEqual(rows.map(x=>x.contractProjection),[32642,103384,7469,11067],'official household base and permitted region/month preserved');
assert.deepEqual(rows.map(x=>x.frozenValue),[32678,103397,7543,10469],'exact archived FROZEN 9/30 model retained');
assert.equal(contract.energy?.confidence,'MODEL','region and month composite remains marked MODEL');
for(const c of ['food','daily','fun'] as const){
 assert.equal(contract[c]?.confidence,'DIRECT','final-contract household-size direct statistic '+c);
 assert.notEqual(contract[c]?.meta?.modelEstimate,true,'no artificial income cross for '+c);
 assert.equal(historical[c]?.meta?.modelEstimate,true,'archive synthetic ratio provenance for '+c);
 assert.equal(historical[c]?.meta?.crossTableObserved,false,'archive never claims cross-observation for '+c);
}
assert.equal(historical.energy?.meta?.modelEstimate,true,'old energy income composite preserved');
for(const cat of ['rent','mobile','insurance','sub','car','selfDevelopment','beautyFashion','childEducation'] as const){
 assert.deepEqual(contract[cat],historical[cat],'nonincome category not silently modified: '+cat);
}
for(const cat of ['sub','car','selfDevelopment'] as const)
 assert.equal(contract[cat]?.value,null,'AUDIT never invents a category average: '+cat);

let profiles=0,contrasts=0,differences=0;
const provinces=Object.keys(__resolverV2Audit.REGION);
assert.equal(provinces.length,47);
for(const prefecture of provinces){
 for(let month=1;month<=12;month++){
  for(let householdSize=2;householdSize<=6;householdSize++){
   for(const annualIncome of [0,4_999_999,5_000_000,8_000_000]){
    const args={...base,prefecture,month,householdSize,annualIncome};
    const neutral=resolveComparableV2({...args,annualIncome:null});
    const aligned=resolveComparableV2(args);
    const legacy=resolveComparableV2LegacyIncome0930(args);
    const report=compareIncomeModelsAgainstFinalContractV1(args);
    for(const item of report){
     assert.equal(item.contractProjection,neutral[item.category]?.value,'final-contract comparison must be independent of income');
     assert.equal(item.contractProjection,aligned[item.category]?.value,'final-contract code remains active');
     assert.equal(item.frozenValue,legacy[item.category]?.value,'archived FROZEN remains exactly recoverable');
     assert.equal(item.discrepancyYen,(legacy[item.category]?.value??0)-(aligned[item.category]?.value??0),'signed historical difference');
     if(annualIncome<5_000_000)assert.equal(item.discrepancyYen,0,'old model neutral below 5m');
     if(item.discrepancyYen!==0)differences++;
     contrasts++;
    }
    // Attribute rule: unrelated references never inherit the synthetic ratio.
    assert.equal(aligned.food?.value,__resolverV2Audit.MULTI.food[householdSize-2],'household food amount matches direct table by size');
    profiles++;
   }
  }
 }
}
const single=compareIncomeModelsAgainstFinalContractV1({...base,household:'single',householdSize:1,age:30});
assert.ok(single.every(x=>x.discrepancyYen===0),'single age-based baseline remains invariant');
assert.equal(profiles,47*12*5*4);
assert.equal(contrasts,profiles*4);
assert.ok(differences>0,'legacy comparison retains meaningful diff: no false policy parity');
console.log('FINAL_CONTRACT_PROJECTION_QA_PASS',profiles,'profiles /',contrasts,'positions;',differences,'historical differences');
console.log('FINAL_CONTRACT_POLICY_CANDIDATE',rows.map(x=>`${x.category}: frozen=${x.frozenValue} contract=${x.contractProjection} delta=${x.discrepancyYen}`).join('; '));
