import {strict as A} from 'node:assert';
import {
  emptyProfileDraftV4, profileStepsV4, finalizeProfileV4,
  shouldOfferAnnualIncomeCalibrationV4, type ProfileDraftV4, type ProfileV4
} from './mudagiri-profile-v4';
import {
  emptyExpenseRecordsV4, type ExpenseRecordsV4
} from './expense-record-v4';
import {applyDiagnosisAmountV4, applyHouseholdTotalV4, requiresHouseholdTotalV4} from './scope-flow-v4';
import {buildComparisonFactsV4} from './benchmark-router-v4';
import {runDiagnosisAdapterV4} from './diagnosis-adapter-v4';
import {buildFinalJudgementsV4, type FinalAppraisalsV4} from './final-judgement-v4';
import {buildResultViewModelV4} from './result-view-model-v4';
import {buildPersistencePayloadV4} from './persistence-v4';
import type {Category} from './mudagiri-diagnosis-v2';

const completeBase=(d:ProfileDraftV4)=>{
  d.prefecture='東京都';
  d.age=35;
  d.housingTenure='rental';
  d.housingSubtype='private_rental';
  d.monthlyTakeHome=350000;
  d.monthlyTakeHomeAnswered=true;
  return d;
};

const setAmount=(profile:ProfileV4, records:ExpenseRecordsV4, category:Category, amount:number, householdTotal?:number|null)=>{
  records[category]=applyDiagnosisAmountV4(profile,records[category],amount);
  if(householdTotal!==undefined)records[category]=applyHouseholdTotalV4(records[category],householdTotal);
};

const run=(profile:ProfileV4, records:ExpenseRecordsV4, appraisal:FinalAppraisalsV4={})=>{
  const comparisons=buildComparisonFactsV4({profile,records,month:1});
  const dx=runDiagnosisAdapterV4({profile,records,comparisons,appraisal});
  const final=buildFinalJudgementsV4({
    records,comparisons,diagnosis:dx.diagnosis,categoryResults:dx.categoryResults,appraisal
  });
  const vm=buildResultViewModelV4({diagnosisId:'persona',toneMode:'serious',profile,finalCategories:final.categories});
  const saved=buildPersistencePayloadV4({
    diagnosisId:'persona',anonymousUserId:'anon',createdAt:'2026-10-01T00:00:00+09:00',profile,finalCategories:final.categories
  });
  return {comparisons,dx,final,vm,saved};
};

// 1) 一人暮らし PERSONAL: 6 profile decisions and direct single-person comparison.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=1;
  A.deepEqual(profileStepsV4(d),['scope','householdSize','prefecture','age','housing','income']);
  const p=finalizeProfileV4(d);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'food',50000);
  const x=run(p,records);
  A.equal(p.householdSize,1);
  A.equal(x.comparisons.food.amount,50000);
  A.equal(x.comparisons.food.engineComparableAllowed,true);
}

// 2) 夫婦・同棲 PERSONAL: partner question and wallet-sharing question are unnecessary.
// User burden 100k / home total 200k must remain separate.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=2; d.compositionConfirmed=true; d.relationships=[];
  A.deepEqual(profileStepsV4(d),['scope','householdSize','composition','prefecture','age','housing','income']);
  const p=finalizeProfileV4(d);
  A.equal(p.expenseSharing,null);
  A.deepEqual(p.relationships,[]);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'rent',100000,200000);
  setAmount(p,records,'food',40000,80000);
  const x=run(p,records,{rent:{rentPreference:'reasonable'},food:{satisfaction:'satisfied'}});
  A.equal(requiresHouseholdTotalV4(p,'rent'),true);
  A.equal(x.comparisons.rent.amount,200000);
  A.equal(x.comparisons.rent.engineComparableAllowed,false);
  A.equal(x.vm.rows.find(r=>r.category==='rent')?.diagnosisAmount,100000);
  A.equal(x.vm.rows.find(r=>r.category==='rent')?.comparisonAmount,200000);
  A.equal(x.saved.categories.find(r=>r.category==='rent')?.personalBurden,100000);
  A.equal(x.saved.categories.find(r=>r.category==='rent')?.householdTotal,200000);
}

// 3) 夫婦・同棲 HOUSEHOLD: no wallet branch; entered amount itself is household amount.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='household'; d.householdSize=2; d.compositionConfirmed=true; d.relationships=[];
  d.monthlyTakeHome=600000;
  const p=finalizeProfileV4(d);
  A.equal(shouldOfferAnnualIncomeCalibrationV4(p),true);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'food',80000);
  const x=run(p,records,{food:{satisfaction:'satisfied'}});
  A.equal(requiresHouseholdTotalV4(p,'food'),false);
  A.equal(records.food.householdTotal,80000);
  A.equal(x.comparisons.food.amount,80000);
  A.equal(x.comparisons.food.engineComparableAllowed,true);
}

// 4) 夫婦＋子2 HOUSEHOLD: child count is exact and education branch is active.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='household'; d.householdSize=4; d.compositionConfirmed=true;
  d.relationships=['children']; d.childCount=2; d.monthlyTakeHome=650000;
  const p=finalizeProfileV4(d);
  A.equal(p.adultCount,2); A.equal(p.childCount,2);
  A.deepEqual(profileStepsV4(d),['scope','householdSize','composition','childCount','prefecture','age','housing','income']);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'childEducation',90000);
  records.childEducation={...records.childEducation,metadata:{educationChildren:[{stage:'publicElementary'},{stage:'publicJuniorHigh'}]}};
  const x=run(p,records,{childEducation:{educationPreference:'necessary'}});
  A.notEqual(x.comparisons.childEducation.benchmark,null);
  A.equal(x.final.categories.find(r=>r.category==='childEducation')?.status,'protect');
}

// 5) ひとり親＋子 PERSONAL: no spouse question required.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=2; d.compositionConfirmed=true;
  d.relationships=['children']; d.childCount=1;
  const p=finalizeProfileV4(d);
  A.equal(p.adultCount,1); A.equal(p.childCount,1);
  A.equal(p.relationships.includes('partner'),false);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'food',45000,70000);
  const x=run(p,records,{food:{satisfaction:'satisfied'}});
  A.equal(x.comparisons.food.amount,70000);
  A.equal(x.comparisons.food.engineComparableAllowed,false);
}

// 6) 親同居・まとめ払い PERSONAL: 50k bundle must not be guessed across rent/food/utilities.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=3; d.compositionConfirmed=true;
  d.relationships=['parents']; d.householdContributionMode='bundled'; d.bundledContributionAmount=50000;
  d.housingTenure='family_home'; d.housingSubtype=null;
  const p=finalizeProfileV4(d);
  A.equal(requiresHouseholdTotalV4(p,'rent'),false);
  A.equal(requiresHouseholdTotalV4(p,'food'),false);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'food',12000); // only direct spend outside bundled contribution.
  const x=run(p,records);
  A.equal(x.vm.bundledContribution?.amount,50000);
  A.equal(x.saved.bundledContributionAmount,50000);
  A.equal(records.food.diagnosisAmount,12000);
  A.equal(records.food.householdTotal,null);
}

// 7) 親同居・項目別 PERSONAL: ordinary shared-category total follow-up still works.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=3; d.compositionConfirmed=true;
  d.relationships=['parents']; d.householdContributionMode='itemized';
  d.housingTenure='family_home'; d.housingSubtype=null;
  const p=finalizeProfileV4(d);
  A.equal(requiresHouseholdTotalV4(p,'food'),true);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'food',30000,85000);
  const x=run(p,records);
  A.equal(x.comparisons.food.amount,85000);
}

// 8) ルームシェア PERSONAL: treated like any other multi-adult household, no relationship label required.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=3; d.compositionConfirmed=true; d.relationships=[];
  const p=finalizeProfileV4(d);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'energy',7000,21000);
  const x=run(p,records,{energy:{energyPersistence:'persistent'}});
  A.equal(p.adultCount,3);
  A.equal(x.comparisons.energy.amount,21000);
  A.equal(x.comparisons.energy.engineComparableAllowed,false);
}

// 9) 三世代 PERSONAL: children + parents can coexist; bundled rule still prevents fake allocation.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=5; d.compositionConfirmed=true;
  d.relationships=['children','parents']; d.childCount=2;
  d.householdContributionMode='bundled'; d.bundledContributionAmount=60000;
  d.housingTenure='family_home'; d.housingSubtype=null;
  const p=finalizeProfileV4(d);
  A.equal(p.adultCount,3);
  A.equal(p.childCount,2);
  A.equal(requiresHouseholdTotalV4(p,'energy'),false);
}

// 10) Communication scope: combined mobile+internet may never become confirmed saving.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=1;
  const p=finalizeProfileV4(d);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'mobile',20000);
  const x=run(p,records,{mobile:{mobileScope:'mobileInternet'}});
  const row=x.final.categories.find(r=>r.category==='mobile')!;
  A.equal(row.status,'review'); A.equal(row.confirmedSaving,0);
  A.equal(row.reasonCode,'MOBILE_SCOPE_REQUIRES_CONTRACT_REVIEW');
}

// 11) Unknown take-home: category diagnosis and confirmed unused-sub saving still survive.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='personal'; d.householdSize=1; d.monthlyTakeHome=null; d.monthlyTakeHomeAnswered=true;
  const p=finalizeProfileV4(d);
  const records=emptyExpenseRecordsV4();
  setAmount(p,records,'sub',5000);
  const x=run(p,records,{sub:{subUnusedAmount:1980,subCancellationConfirmed:true,subUsage:'one'}});
  A.equal(x.dx.diagnosis,null);
  A.equal(x.final.confirmedMonthly,1980);
}

// Universal invariant: a benchmark/reference gap alone never becomes confirmed saving.
{
  const d=completeBase(emptyProfileDraftV4());
  d.diagnosisScope='household'; d.householdSize=2; d.compositionConfirmed=true; d.relationships=[];
  const p=finalizeProfileV4(d);
  const records=emptyExpenseRecordsV4();
  for(const cat of ['energy','food','daily','rent'] as Category[]) setAmount(p,records,cat,200000);
  const x=run(p,records);
  for(const cat of ['energy','food','daily','rent'] as Category[]){
    const row=x.final.categories.find(r=>r.category===cat)!;
    A.equal(row.confirmedSaving,0,cat+' benchmark gap must not be confirmed saving');
  }
}

console.log('PERSONA_V4_E2E_PASS 12 scenarios');
