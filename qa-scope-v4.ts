import { strict as A } from 'node:assert';
import { emptyExpenseRecordsV4 } from './expense-record-v4';
import { buildComparisonFactsV4 } from './benchmark-router-v4';
import { runDiagnosisAdapterV4 } from './diagnosis-adapter-v4';
import { buildFinalJudgementsV4 } from './final-judgement-v4';
import { requiresHouseholdTotalV4 } from './scope-flow-v4';
import { buildResultViewModelV4 } from './result-view-model-v4';
import { buildPersistencePayloadV4 } from './persistence-v4';
import type { ProfileV4 } from './mudagiri-profile-v4';
import { emptyProfileDraftV4, profileStepsV4, finalizeProfileV4, shouldOfferAnnualIncomeCalibrationV4 } from './mudagiri-profile-v4';

const base=(patch:Partial<ProfileV4>={}):ProfileV4=>({
 diagnosisScope:'personal',
 householdSize:1,
 adultCount:1,
 childCount:0,
 relationships:[],
 expenseSharing:null,
 householdContributionMode:null,
 prefecture:'東京都',
 age:35,
 housingTenure:'rental',
 housingSubtype:'private_rental',
 monthlyTakeHome:350000,
 annualIncomeBand:'unknown',
 ...patch,
});

const amount=(records:ReturnType<typeof emptyExpenseRecordsV4>,category:keyof ReturnType<typeof emptyExpenseRecordsV4>,diagnosisAmount:number,extra:Partial<(typeof records)[typeof category]>={})=>{
 records[category]={...records[category],diagnosisAmount,personalBurden:diagnosisAmount,known:true,...extra};
};

{
 const profile=base();
 const records=emptyExpenseRecordsV4();
 amount(records,'food',50000);
 const facts=buildComparisonFactsV4({profile,records,month:1});
 A.equal(facts.food.amount,50000);
 A.ok((facts.food.benchmark??0)>0);
 A.equal(facts.food.engineComparableAllowed,true);
}

{
 const profile=base({householdSize:2,adultCount:2,relationships:['partner'],expenseSharing:'split'});
 const records=emptyExpenseRecordsV4();
 amount(records,'food',40000,{householdTotal:80000});
 const facts=buildComparisonFactsV4({profile,records,month:1});
 A.equal(facts.food.amount,80000);
 A.ok((facts.food.benchmark??0)>0);
 A.equal(facts.food.engineComparableAllowed,false);
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts});
 const food=dx.diagnosis?.categories.find(x=>x.category==='food');
 A.equal(food?.actual,40000);
 A.equal(food?.comparable,null);
 const final=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:dx.diagnosis,appraisal:{food:{satisfaction:'inertia'}}});
 A.equal(final.categories.find(x=>x.category==='food')?.status,'review');
 A.equal(requiresHouseholdTotalV4(profile,'food'),true);
}

{
 const profile=base({householdSize:2,adultCount:2,relationships:['partner'],expenseSharing:'split'});
 const records=emptyExpenseRecordsV4();
 amount(records,'beautyFashion',20000);
 const facts=buildComparisonFactsV4({profile,records});
 A.equal(facts.beautyFashion.quality,'none');
 A.equal(facts.beautyFashion.engineComparableAllowed,false);
}

{
 const profile=base({diagnosisScope:'household',householdSize:2,adultCount:2,relationships:['partner'],monthlyTakeHome:600000,annualIncomeBand:'600_699'});
 const records=emptyExpenseRecordsV4();
 amount(records,'food',80000,{personalBurden:null});
 const facts=buildComparisonFactsV4({profile,records,month:1});
 A.equal(facts.food.amount,80000);
 A.equal(facts.food.engineComparableAllowed,true);
}

{
 const profile=base();
 const records=emptyExpenseRecordsV4();
 amount(records,'mobile',20000,{metadata:{mobileIncludes:['mobile','home_internet','device']}});
 const facts=buildComparisonFactsV4({profile,records});
 A.equal(facts.mobile.benchmark,null);
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts});
 const mobile=dx.diagnosis?.categories.find(x=>x.category==='mobile');
 A.equal(mobile?.comparable,null);
 A.equal(mobile?.confirmedSaving,null);
}

{
 const profile=base({householdSize:2,adultCount:2,relationships:['partner'],expenseSharing:'split'});
 const records=emptyExpenseRecordsV4();
 amount(records,'rent',100000,{householdTotal:200000});
 const facts=buildComparisonFactsV4({profile,records});
 A.equal(facts.rent.amount,200000);
 A.ok((facts.rent.benchmark??0)>0);
 A.equal(facts.rent.engineComparableAllowed,false);
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts});
 const rent=dx.diagnosis?.categories.find(x=>x.category==='rent');
 A.equal(rent?.actual,100000);
 A.equal(rent?.comparable,null);
 const final=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:dx.diagnosis,appraisal:{rent:{rentPreference:'reasonable'}}});
 A.equal(final.categories.find(x=>x.category==='rent')?.status,'protect');
}

{
 const profile=base();
 const records=emptyExpenseRecordsV4();
 amount(records,'sub',10000);
 const facts=buildComparisonFactsV4({profile,records});
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts,appraisal:{sub:{subUnusedAmount:1980,subCancellationConfirmed:true}}});
 const sub=dx.diagnosis?.categories.find(x=>x.category==='sub');
 A.equal(sub?.state,'CONFIRMED');
 A.equal(sub?.confirmedSaving,1980);
 const final=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:dx.diagnosis,appraisal:{sub:{subUnusedAmount:1980,subCancellationConfirmed:true,subUsage:'one'}}});
 A.equal(final.confirmedMonthly,1980);
 A.equal(final.categories.find(x=>x.category==='sub')?.status,'cut');
}

{
 const profile=base({monthlyTakeHome:null});
 const records=emptyExpenseRecordsV4();
 amount(records,'food',50000);
 const facts=buildComparisonFactsV4({profile,records});
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts});
 A.equal(dx.diagnosis,null);
 A.equal(dx.skippedReason,'monthly_take_home_unknown_or_zero');
 A.equal(dx.categoryResults.find(x=>x.category==='food')?.actual,50000);
 A.ok((facts.food.benchmark??0)>0);
}

console.log('SCOPE_V4_QA PASS');


{
 const d=emptyProfileDraftV4();
 d.diagnosisScope='personal';
 d.householdSize=1;
 d.prefecture='東京都';
 d.age=35;
 d.housingTenure='rental';
 d.housingSubtype='private_rental';
 d.monthlyTakeHome=350000;
 d.monthlyTakeHomeAnswered=true;
 A.deepEqual(profileStepsV4(d),['scope','householdSize','prefecture','age','housing','income']);
 const p=finalizeProfileV4(d);
 A.equal(p.householdSize,1);
 A.equal(p.adultCount,1);
}

{
 const d=emptyProfileDraftV4();
 d.diagnosisScope='personal';
 d.householdSize=2;
 d.relationships=['partner'];
 d.expenseSharing='split';
 d.prefecture='東京都';
 d.age=35;
 d.housingTenure='rental';
 d.housingSubtype='private_rental';
 d.monthlyTakeHome=350000;
 d.monthlyTakeHomeAnswered=true;
 A.deepEqual(profileStepsV4(d),['scope','householdSize','relationships','expenseSharing','prefecture','age','housing','income']);
}

{
 const d=emptyProfileDraftV4();
 d.diagnosisScope='household';
 d.householdSize=4;
 d.relationships=['partner','children'];
 d.childCount=2;
 d.prefecture='東京都';
 d.age=40;
 d.housingTenure='owned';
 d.housingSubtype='mortgage';
 d.monthlyTakeHome=600000;
 d.monthlyTakeHomeAnswered=true;
 A.deepEqual(profileStepsV4(d),['scope','householdSize','relationships','childCount','prefecture','age','housing','income']);
 const p=finalizeProfileV4(d);
 A.equal(p.adultCount,2);
 A.equal(p.childCount,2);
}

{
 const d=emptyProfileDraftV4();
 d.diagnosisScope='personal';
 d.householdSize=3;
 d.relationships=['parents'];
 d.expenseSharing='other_more';
 d.householdContributionMode='bundled';
 d.prefecture='東京都';
 d.age=28;
 d.housingTenure='family_home';
 d.monthlyTakeHome=250000;
 d.monthlyTakeHomeAnswered=true;
 A.deepEqual(profileStepsV4(d),['scope','householdSize','relationships','expenseSharing','contribution','prefecture','age','housing','income']);
}


{
 const profile=base({housingSubtype:'public_rental'});
 const records=emptyExpenseRecordsV4();
 amount(records,'rent',60000);
 const facts=buildComparisonFactsV4({profile,records});
 A.equal(facts.rent.benchmark,null);
 A.equal(facts.rent.quality,'none');
}

{
 const personalMulti=base({householdSize:2,adultCount:2,relationships:['partner'],expenseSharing:'split'});
 const householdMulti=base({diagnosisScope:'household',householdSize:2,adultCount:2,relationships:['partner']});
 A.equal(shouldOfferAnnualIncomeCalibrationV4(personalMulti),false);
 A.equal(shouldOfferAnnualIncomeCalibrationV4(householdMulti),true);
}


{
 const profile=base({monthlyTakeHome:null});
 const records=emptyExpenseRecordsV4();
 amount(records,'sub',5000);
 const facts=buildComparisonFactsV4({profile,records});
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts,appraisal:{sub:{subUnusedAmount:1980,subCancellationConfirmed:true}}});
 A.equal(dx.diagnosis,null);
 A.equal(dx.categoryResults.find(x=>x.category==='sub')?.confirmedSaving,1980);
 const final=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:null,categoryResults:dx.categoryResults,appraisal:{sub:{subUnusedAmount:1980,subCancellationConfirmed:true,subUsage:'one'}}});
 A.equal(final.confirmedMonthly,1980);
 A.equal(final.categories.find(x=>x.category==='sub')?.status,'cut');
}


{
 const profile=base({householdSize:2,adultCount:2,relationships:['partner'],expenseSharing:'split'});
 const records=emptyExpenseRecordsV4();
 amount(records,'food',40000,{householdTotal:80000});
 amount(records,'rent',100000,{householdTotal:200000});
 const facts=buildComparisonFactsV4({profile,records,month:1});
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts});
 const final=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:dx.diagnosis,categoryResults:dx.categoryResults,appraisal:{food:{satisfaction:'satisfied'},rent:{rentPreference:'reasonable'}}});
 const vm=buildResultViewModelV4({profile,finalCategories:final.categories});
 const food=vm.rows.find(x=>x.category==='food')!;
 A.equal(food.diagnosisAmount,40000);
 A.equal(food.personalBurden,40000);
 A.equal(food.householdTotal,80000);
 A.equal(food.comparison.amount,80000);
 A.equal(food.comparison.amountLabel,'家全体の支出');
 const rent=vm.rows.find(x=>x.category==='rent')!;
 A.equal(rent.diagnosisAmount,100000);
 A.equal(rent.comparison.amount,200000);
 A.equal(rent.comparison.amountLabel,'住まい全体');
 A.ok(vm.comparisonGroups.some(x=>x.scopeLabel==='家全体の支出'));
 A.ok(vm.comparisonGroups.some(x=>x.scopeLabel==='住まい全体'));
 A.equal(vm.comparisonAggregationRule,'NEVER_MIX_AMOUNT_SCOPES');
}


{
 const profile=base({householdSize:2,adultCount:2,relationships:['partner'],expenseSharing:'split'});
 const records=emptyExpenseRecordsV4();
 amount(records,'food',40000,{householdTotal:80000});
 const facts=buildComparisonFactsV4({profile,records,month:1});
 const dx=runDiagnosisAdapterV4({profile,records,comparisons:facts});
 const final=buildFinalJudgementsV4({records,comparisons:facts,diagnosis:dx.diagnosis,categoryResults:dx.categoryResults,appraisal:{food:{satisfaction:'satisfied'}}});
 const saved=buildPersistencePayloadV4({diagnosisId:'dx_scope_test',anonymousUserId:'anon_scope_test',createdAt:'2026-10-01T00:00:00+09:00',profile,finalCategories:final.categories});
 const food=saved.categories.find(x=>x.category==='food')!;
 A.equal(food.diagnosisAmount,40000);
 A.equal(food.personalBurden,40000);
 A.equal(food.householdTotal,80000);
 A.equal(food.comparisonAmount,80000);
 A.equal(food.comparisonAmountScope,'household');
 A.equal(food.benchmarkEligible,true);
}
