import assert from 'node:assert/strict';
import {resolveComparableV2} from './comparable-resolver-v2';

const categories=['energy','food','daily','fun','beautyFashion','rent','insurance','mobile','sub','car','selfDevelopment','childEducation'] as const;
const scenarios=[
 {id:'single_450',household:'single' as const,householdSize:1,age:35,annualIncome:4_500_000,prefecture:'東京都',month:10,housingType:'賃貸'},
 {id:'single_1500',household:'single' as const,householdSize:1,age:35,annualIncome:15_000_000,prefecture:'東京都',month:10,housingType:'賃貸'},
 {id:'multi_450',household:'multi' as const,householdSize:4,age:35,annualIncome:4_500_000,prefecture:'東京都',month:10,housingType:'賃貸'},
 {id:'multi_900',household:'multi' as const,householdSize:4,age:35,annualIncome:9_000_000,prefecture:'東京都',month:10,housingType:'賃貸'},
 {id:'multi_1500',household:'multi' as const,householdSize:4,age:35,annualIncome:15_000_000,prefecture:'東京都',month:10,housingType:'賃貸'},
];
const results=scenarios.map(a=>({id:a.id,income:a.annualIncome,rows:resolveComparableV2(a)}));
const read=(id:string,c:typeof categories[number])=>results.find(x=>x.id===id)!.rows[c];
for(const c of categories){
 const low=read('single_450',c),high=read('single_1500',c);
 assert.equal(low?.value,high?.value,'Single income must not silently change official direct comparator: '+c);
 if(low?.confidence==='AUDIT')assert.equal(low.value,null,'AUDIT may not invent an average: '+c);
}
for(const id of ['multi_450','multi_900','multi_1500']){
 for(const c of categories){
  const x=read(id,c);
  if(x?.confidence==='AUDIT')assert.equal(x.value,null,'AUDIT may not invent an average: '+id+'/'+c);
 }
}
const changed=categories.filter(c=>read('multi_450',c)?.value!==read('multi_900',c)?.value);
console.log('COMPARABLE_INCOME_MATRIX_V1',JSON.stringify({
 scenarios:results.map(x=>({id:x.id,rows:Object.fromEntries(categories.map(c=>[c,{value:x.rows[c]?.value??null,confidence:x.rows[c]?.confidence??'MISSING',sourceVersion:x.rows[c]?.sourceVersion??'MISSING'}]))})),
 multiIncomeChangedCategories:changed,
 multiIncomeFactorUsesFrozenV1:true,
 warning:'Multi-income ratio is applied to 2025 household-size/region/month reference despite absent joint source lineage; treat as MODEL pending provenance review; do not interpret as savings.'
},null,2));
assert.ok(changed.length>0,'Legacy income factor must be explicitly tracked and audited rather than silently lost');
console.log('COMPARABLE_INCOME_MATRIX_V1_QA_PASS');
