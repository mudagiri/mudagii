import type { Category } from './mudagiri-diagnosis-v2';
import type { ExpenseRecordV4 } from './expense-record-v4';
import type { ProfileV4 } from './mudagiri-profile-v4';

const SHARED=new Set<Category>(['rent','energy','food','daily','childEducation']);

export function requiresHouseholdTotalV4(profile:ProfileV4,category:Category){
 if(profile.diagnosisScope!=='personal'||profile.householdSize<2)return false;
 if(profile.householdContributionMode==='bundled')return false;
 return SHARED.has(category);
}

export function householdTotalPromptV4(category:Category){
 if(category==='rent')return {question:'家全体では、住居費はいくら？',helper:'住まいそのものの金額と、あなたの負担を分けて見ます'};
 if(category==='energy')return {question:'家全体では、光熱費はいくら？',helper:'電気・ガス・水道の合計'};
 if(category==='food')return {question:'家全体の食費も分かる？',helper:'分からなければ無理に入力しなくてOK'};
 if(category==='daily')return {question:'家全体の日用品費も分かる？',helper:'共用している日用品の月額'};
 if(category==='childEducation')return {question:'家全体で払っている教育費はいくら？',helper:'子どもの教育費の合計'};
 return {question:'家全体ではいくら？',helper:''};
}

export function applyDiagnosisAmountV4(profile:ProfileV4,record:ExpenseRecordV4,amount:number):ExpenseRecordV4{
 const base={...record,diagnosisAmount:amount,known:true,applicability:'applicable' as const};
 if(profile.diagnosisScope==='personal')return {...base,personalBurden:amount};
 return {...base,householdTotal:amount};
}

export function applyHouseholdTotalV4(record:ExpenseRecordV4,amount:number|null):ExpenseRecordV4{
 return {...record,householdTotal:amount};
}

export const SCOPE_FLOW_V4_VERSION='MUDAGIRI_SCOPE_FLOW_V4_0';
