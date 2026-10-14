import assert from 'node:assert/strict';
import {resolveComparableV2,__resolverV2Audit} from './comparable-resolver-v2';
import {compareIncomeModelsAgainstFinalContractV1,CONTRACT_POLICY_CONFLICT_STATUS,FINAL_CONTRACT_V1_SOURCE} from './contract-benchmark-projection-v1';

assert.equal(CONTRACT_POLICY_CONFLICT_STATUS,'P0_UNRESOLVED_DO_NOT_MERGE');
assert.equal(FINAL_CONTRACT_V1_SOURCE,'MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0_20260928');
let audited=0,divergent=0;
const base={household:'multi' as const,householdSize:4,age:40,annualIncome:8_000_000,prefecture:'東京都',month:2,housingType:'賃貸'};
const original=resolveComparableV2(base),rows=compareIncomeModelsAgainstFinalContractV1(base);
assert.deepEqual(rows.map(x=>x.category),['energy','food','daily','fun']);
assert.equal(rows.find(x=>x.category==='food')?.contractProjection,103384,'FOOD household-size direct baseline');
assert.equal(rows.find(x=>x.category==='daily')?.contractProjection,7469,'DAILY household-size direct baseline');
assert.equal(rows.find(x=>x.category==='fun')?.contractProjection,11067,'FUN household-size direct baseline');
assert.notEqual(rows.find(x=>x.category==='food')?.frozenValue,103384,'P0 model conflict must be exposed');
assert.equal(original.rent?.value,99065,'housing comparator is unaffected');
assert.equal(original.mobile?.value,null,'no fictional mobile mean');
assert.equal(original.sub?.value,null,'no fictional subscription mean');
assert.equal(original.selfDevelopment?.value,null,'no fictional self-development mean');
assert.equal(original.car?.value,null,'no fictional car owner mean');

// Thousands of attribute combinations: projection is equal to the V2 official
// base at neutral income, while the FROZEN income-ratio result is preserved.
const provinces=Object.keys(__resolverV2Audit.REGION);
assert.equal(provinces.length,47);
for(const prefecture of provinces){
 for(const month of [1,2,6,12]){
  for(const householdSize of [2,3,4,5,6]){
   for(const annualIncome of [0,4_999_999,5_000_000,8_000_000]){
    const args={...base,prefecture,month,householdSize,annualIncome};
    const neutral=resolveComparableV2({...args,annualIncome:null});
    const current=resolveComparableV2(args);
    const report=compareIncomeModelsAgainstFinalContractV1(args);
    for(const item of report){
     assert.equal(item.contractProjection,neutral[item.category]?.value,'official base projection must not multiply household income');
     assert.equal(item.frozenValue,current[item.category]?.value,'frozen model may not be silently replaced');
     if(annualIncome<5_000_000)assert.equal(item.discrepancyYen,0,'below ¥5m model must already be neutral');
     if(item.discrepancyYen!==0)divergent++;
    }
    audited++;
   }
  }
 }
}
const single=compareIncomeModelsAgainstFinalContractV1({...base,household:'single',householdSize:1,age:30});
assert.ok(single.every(x=>x.discrepancyYen===0),'single households must retain age-only baseline');
const example=rows.map(x=>`${x.category}: frozen=${x.frozenValue} contract=${x.contractProjection} delta=${x.discrepancyYen}`).join('; ');
console.log('FINAL_CONTRACT_PROJECTION_QA_PASS',audited,'profiles /',audited*4,'category positions;',divergent,'nonzero model differences');
console.log('FINAL_CONTRACT_POLICY_CONFLICT_P0',example);
