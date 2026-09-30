import type { Category } from './mudagiri-diagnosis-v2';
import type { ProfileV4 } from './mudagiri-profile-v4';
import type { FinalCategoryV4, FinalStatusV4 } from './final-judgement-v4';

const LABEL:Record<Category,string>={
 mobile:'通信費',energy:'光熱費',sub:'サブスク',car:'車関連費',food:'食費',daily:'日用品',
 fun:'娯楽・交際費',beautyFashion:'美容・服飾費',rent:'住居費',insurance:'保険料',
 childEducation:'子どもの教育費',selfDevelopment:'自己投資'
};

const scopeLabel=(scope:string)=>{
 if(scope==='personal')return 'あなたの支出';
 if(scope==='household')return '家全体の支出';
 if(scope==='property')return '住まい全体';
 if(scope==='contract')return '契約単位';
 if(scope==='child')return '教育費合計';
 return '比較対象';
};

export interface ResultRowV4 {
 category:Category;
 label:string;
 status:FinalStatusV4;
 diagnosisAmount:number|null;
 diagnosisAmountLabel:string;
 personalBurden:number|null;
 householdTotal:number|null;
 comparison:{
  available:boolean;
  amount:number|null;
  amountLabel:string;
  benchmark:number|null;
  difference:number|null;
  quality:'exact'|'reference'|'none';
  sourceVersion:string|null;
  reason:string;
 };
 confirmedSaving:number;
 attentionFlag:boolean;
 reasonCode:string;
}

export function buildResultViewModelV4(a:{profile:ProfileV4;finalCategories:FinalCategoryV4[]}){
 const rows:ResultRowV4[]=a.finalCategories.map(x=>{
  const diagnosisAmountLabel=a.profile.diagnosisScope==='personal'?'あなたの負担':'家全体の支出';
  return {
   category:x.category,
   label:LABEL[x.category],
   status:x.status,
   diagnosisAmount:x.record.diagnosisAmount,
   diagnosisAmountLabel,
   personalBurden:x.record.personalBurden,
   householdTotal:x.record.householdTotal,
   comparison:{
    available:x.comparison.quality!=='none'&&x.comparison.amount!==null&&x.comparison.benchmark!==null,
    amount:x.comparison.amount,
    amountLabel:scopeLabel(x.comparison.amountScope),
    benchmark:x.comparison.benchmark,
    difference:x.comparison.difference,
    quality:x.comparison.quality,
    sourceVersion:x.comparison.sourceVersion,
    reason:x.comparison.reason,
   },
   confirmedSaving:x.confirmedSaving,
   attentionFlag:x.attentionFlag,
   reasonCode:x.reasonCode,
  };
 });
 const counts=(['cut','review','protect','safe','na'] as FinalStatusV4[]).reduce((acc,k)=>{
  acc[k]=rows.filter(x=>x.status===k).length;
  return acc;
 },{} as Record<FinalStatusV4,number>);
 const confirmedMonthly=rows.reduce((sum,x)=>sum+x.confirmedSaving,0);
 const comparisonGroups=rows.filter(x=>x.comparison.available).reduce((acc,row)=>{
  const key=row.comparison.amountLabel;
  const current=acc[key]??{scopeLabel:key,userMonthly:0,benchmarkMonthly:0,categoryCount:0,categories:[] as Category[]};
  current.userMonthly+=row.comparison.amount??0;
  current.benchmarkMonthly+=row.comparison.benchmark??0;
  current.categoryCount+=1;
  current.categories.push(row.category);
  acc[key]=current;
  return acc;
 },{} as Record<string,{scopeLabel:string;userMonthly:number;benchmarkMonthly:number;categoryCount:number;categories:Category[]}>);
 return {
  version:'MUDAGIRI_RESULT_VM_V4_0' as const,
  profile:{
   diagnosisScope:a.profile.diagnosisScope,
   householdSize:a.profile.householdSize,
   adultCount:a.profile.adultCount,
   childCount:a.profile.childCount,
   prefecture:a.profile.prefecture,
   age:a.profile.age,
   housingTenure:a.profile.housingTenure,
  },
  counts,
  improvement:{monthly:confirmedMonthly,annual:confirmedMonthly*12,fiveYear:confirmedMonthly*60},
  rows,
  comparisonGroups:Object.values(comparisonGroups).map(x=>({...x,differenceMonthly:x.userMonthly-x.benchmarkMonthly})),
  comparisonAggregationRule:'NEVER_MIX_AMOUNT_SCOPES' as const,
 };
}

export const RESULT_VM_V4_VERSION='MUDAGIRI_RESULT_VM_V4_0';
