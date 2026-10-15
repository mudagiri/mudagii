import assert from 'node:assert/strict';
import type {Category} from './mudagiri-diagnosis-v2';
import type {ProfileV4} from './mudagiri-profile-v4';
import {emptyExpenseRecordsV4} from './expense-record-v4';
import {buildComparisonFactsV4} from './benchmark-router-v4';
import {runDiagnosisAdapterV4} from './diagnosis-adapter-v4';
import {buildFinalJudgementsV4} from './final-judgement-v4';
import {resolveComparableV2,resolveComparableV2LegacyIncome0930} from './comparable-resolver-v2';

/** This is a NEW 100-case deterministic replacement QA, not a claim of
 * replaying the unreadable 9/28 workbook's original 100 scenarios.
 */
const cats=['energy','food','daily','fun'] as const satisfies readonly Category[];
const ages=[25,35,45,60,75];
let cases=0,baselineShifts=0,statusShifts=0;
const details:Record<string,number>={};
for(const householdSize of [2,3,4,5,6]){
 for(const age of ages){
  for(const category of cats){
   const childCount=householdSize-2;
   const profile:ProfileV4={
    diagnosisScope:'household',householdSize,adultCount:2,childCount,
    relationships:childCount?['partner','children']:['partner'],expenseSharing:'self_all',
    householdContributionMode:null,bundledContributionAmount:null,prefecture:'東京都',age,
    housingTenure:'rental',housingSubtype:'private_rental',monthlyTakeHome:680000,
    annualIncomeBand:'800_999'
   };
   const args={household:'multi' as const,householdSize,age,annualIncome:9_000_000,
    prefecture:'東京都',month:2,housingType:'賃貸'};
   const current=resolveComparableV2(args)[category];
   const historical=resolveComparableV2LegacyIncome0930(args)[category];
   assert.ok(current?.value!==null&&current?.value!==undefined&&historical?.value!==null&&historical?.value!==undefined);
   const alignedYen=current!.value!,oldYen=historical!.value!;
   // Use a deterministic amount around the benchmark threshold, not an
   // invented user expense from the real 100-case validation workbook.
   const expense=Math.max(1,Math.round((alignedYen+oldYen)/2*1.17));
   const records=emptyExpenseRecordsV4();
   records[category]={...records[category],diagnosisAmount:expense,
     personalBurden:null,known:true};
   const facts=buildComparisonFactsV4({profile,records,month:2});
   assert.equal(facts[category].benchmark,alignedYen,'candidate comparison uses direct contract');
   const oldFacts={...facts,[category]:{...facts[category],benchmark:oldYen,
      benchmarkMeta:historical!,sourceVersion:historical!.sourceVersion,
      difference:expense-oldYen}}; 
   const appraisal={
    energy:{energyPersistence:'persistent' as const},
    daily:{dailyPersistence:'persistent' as const},
    food:{satisfaction:'waste' as const},
    fun:{satisfaction:'verySatisfied' as const}
   };
   const a=runDiagnosisAdapterV4({profile,records,comparisons:facts,appraisal});
   const b=runDiagnosisAdapterV4({profile,records,comparisons:oldFacts,appraisal});
   const finalA=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:a.diagnosis,categoryResults:a.categoryResults,appraisal});
   const finalB=buildFinalJudgementsV4({records,comparisons:oldFacts,diagnosis:b.diagnosis,categoryResults:b.categoryResults,appraisal});
   assert.equal(finalA.confirmedMonthly,finalB.confirmedMonthly,
    'changing benchmark must not manufacture or eliminate confirmed savings');
   assert.equal(finalA.confirmedMonthly,0,'no independently verified contract action means zero confirmed');
   const statusA=finalA.categories.find(x=>x.category===category)?.status;
   const statusB=finalB.categories.find(x=>x.category===category)?.status;
   assert.ok(statusA&&statusB,'every source category must receive a verdict');
   if(alignedYen!==oldYen)baselineShifts++;
   if(statusA!==statusB){statusShifts++;details[category]=(details[category]??0)+1;}
   cases++;
  }
 }
}
assert.equal(cases,100,'synthetic 100-case matrix incomplete');
assert.ok(baselineShifts>0,'historic 9/30 differences should remain visible');
console.log('FINAL_CONTRACT_SYNTHETIC_100_QA_PASS',JSON.stringify({cases,baselineShifts,statusShifts,statusShiftCategories:details,confirmedAlwaysZero:true,originalFrozenWorkbookReplayed:false}));
