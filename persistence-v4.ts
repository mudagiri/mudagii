import type { Category } from './mudagiri-diagnosis-v2';
import type { ProfileV4 } from './mudagiri-profile-v4';
import type { FinalCategoryV4 } from './final-judgement-v4';

export interface DiagnosisPersistenceV4 {
 schemaVersion:'MUDAGIRI_PERSISTENCE_V4';
 diagnosisId:string;
 anonymousUserId:string;
 createdAt:string;
 diagnosisScope:ProfileV4['diagnosisScope'];
 householdSize:number;
 adultCount:number;
 childCount:number;
 prefecture:string;
 age:number;
 housingTenure:string;
 housingSubtype:string|null;
 bundledContributionAmount:number|null;
 monthlyTakeHome:number|null;
 categories:CategoryPersistenceV4[];
}

export interface CategoryPersistenceV4 {
 category:Category;
 diagnosisAmount:number|null;
 amountState:'known'|'unknown'|'na';
 personalBurden:number|null;
 householdTotal:number|null;
 comparisonAmount:number|null;
 comparisonAmountScope:string;
 comparisonBenchmark:number|null;
 comparisonQuality:'exact'|'reference'|'none';
 comparisonSourceVersion:string|null;
 outcome:FinalCategoryV4['status'];
 confirmedSaving:number;
 benchmarkEligible:boolean;
}

export function buildPersistencePayloadV4(a:{diagnosisId:string;anonymousUserId:string;createdAt?:string;profile:ProfileV4;finalCategories:FinalCategoryV4[]}):DiagnosisPersistenceV4{
 const categories:CategoryPersistenceV4[]=a.finalCategories.map(x=>{
  const amountState=x.record.applicability==='na'?'na':x.record.known?'known':'unknown';
  const benchmarkEligible=
   amountState==='known'&&
   x.comparison.amount!==null&&
   x.comparison.quality!=='none';
  return {
   category:x.category,
   diagnosisAmount:x.record.diagnosisAmount,
   amountState,
   personalBurden:x.record.personalBurden,
   householdTotal:x.record.householdTotal,
   comparisonAmount:x.comparison.amount,
   comparisonAmountScope:x.comparison.amountScope,
   comparisonBenchmark:x.comparison.benchmark,
   comparisonQuality:x.comparison.quality,
   comparisonSourceVersion:x.comparison.sourceVersion,
   outcome:x.status,
   confirmedSaving:x.confirmedSaving,
   benchmarkEligible,
  };
 });
 return {
  schemaVersion:'MUDAGIRI_PERSISTENCE_V4',
  diagnosisId:a.diagnosisId,
  anonymousUserId:a.anonymousUserId,
  createdAt:a.createdAt??new Date().toISOString(),
  diagnosisScope:a.profile.diagnosisScope,
  householdSize:a.profile.householdSize,
  adultCount:a.profile.adultCount,
  childCount:a.profile.childCount,
  prefecture:a.profile.prefecture,
  age:a.profile.age,
  housingTenure:a.profile.housingTenure,
  housingSubtype:a.profile.housingSubtype??null,
  bundledContributionAmount:a.profile.bundledContributionAmount,
  monthlyTakeHome:a.profile.monthlyTakeHome,
  categories,
 };
}

export const PERSISTENCE_V4_VERSION='MUDAGIRI_PERSISTENCE_V4';
