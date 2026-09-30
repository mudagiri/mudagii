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

const reasonText=(x:FinalCategoryV4)=>{
 const r=x.reasonCode;
 if(r==='CONFIRMED_AVOIDABLE_AMOUNT')return '不要・停止可能な金額まで確認できたため、確定した金額だけを削減候補にしました。';
 if(r==='VALUE_SPEND_PROTECTED')return '金額だけではなく、あなたの満足度を優先して守る支出にしました。';
 if(r==='USER_WANTS_REVIEW')return 'あなた自身が見直したいと回答しているため、確認優先度を上げました。';
 if(r==='HOUSING_VALUE_PROTECTED')return '住環境の価値を優先する回答のため、比較差だけではムダ判定していません。';
 if(r==='HOUSING_BURDEN_REVIEW')return '住居費の負担感があるため、家計負担と住環境を分けて確認する項目です。';
 if(r==='HOUSING_MARKET_POSITION_REVIEW')return '住まい全体の金額が比較目安より高めですが、差額を削減額とはしていません。';
 if(r==='ENERGY_PERSISTENT_ABOVE_REFERENCE')return '家全体の光熱費が比較目安より高い状態が続いているため、契約・使用量を確認します。';
 if(r==='ENERGY_TEMPORARY_SPIKE')return '一時的な上振れと回答しているため、今月だけでムダ判定していません。';
 if(r==='DAILY_PERSISTENT_ABOVE_REFERENCE')return '日用品費が比較目安より高い状態が続いているため、明細を確認します。';
 if(r==='INSURANCE_CONTENT_REVIEW_REQUIRED')return '保険料だけでは判断せず、保障目的と見直し状況を確認する項目です。';
 if(r==='INSURANCE_PURPOSE_UNDERSTOOD')return '保障目的と見直し状況を把握できているため、金額だけで削減対象にしていません。';
 if(r==='CAR_NECESSITY_CONFIRMED')return '生活・仕事上の必要性が確認できているため、保有額だけでムダ判定していません。';
 if(r==='CAR_COST_DETAIL_REVIEW')return '車の必要性と費用内訳を確認する項目です。';
 if(r==='SELF_INVESTMENT_VALUE_CONFIRMED')return '目的や成果につながっているため、守る支出として扱います。';
 if(r==='SELF_INVESTMENT_VALUE_REVIEW')return '目的・利用状況・成果とのつながりを確認する項目です。';
 if(r==='EDUCATION_PRIORITY_PROTECTED')return '教育方針を優先する回答のため、比較差だけでは削減対象にしていません。';
 if(r==='MOBILE_SCOPE_REQUIRES_CONTRACT_REVIEW')return '通信費は契約範囲を確認しないと同条件比較できないため、契約内容を確認します。';
 if(r==='AMOUNT_UNKNOWN')return '金額が未把握のため、明細確認が先です。';
 if(r==='ZERO_SPEND')return '現在の支出は0円です。';
 if(r==='NOT_APPLICABLE')return '今回の生活条件では対象外です。';
 return x.status==='safe'?'現時点では優先して見直すシグナルはありません。':'追加情報を確認してから判断します。';
};

const nextCheck=(category:Category)=>{
 if(category==='mobile')return 'スマホ・自宅回線・端末代を分けて確認';
 if(category==='energy')return '直近2〜3か月の電気・ガス・水道明細を確認';
 if(category==='sub')return '使っていない契約と停止できる金額を確認';
 if(category==='car')return 'ローン・駐車場・保険・燃料を分けて確認';
 if(category==='rent')return '本人負担と住まい全体の金額を分けて確認';
 if(category==='insurance')return '保障目的と最後の見直し時期を確認';
 if(category==='childEducation')return '教育段階と今後必要な教育費を確認';
 if(category==='selfDevelopment')return '目的・利用状況・成果を確認';
 return '直近1〜3か月の明細を確認';
};

const appraisalSummary=(x:FinalCategoryV4):string|null=>{
 const a=x.appraisal;if(!a)return null;
 if((x.category==='food'||x.category==='fun'||x.category==='beautyFashion')&&a.satisfaction)return ({verySatisfied:'かなり満足していて守りたい',satisfied:'満足していて今くらいでいい',inertia:'少し見直したい',waste:'かなり見直したい'} as Record<string,string>)[a.satisfaction]??null;
 if(x.category==='rent'&&a.rentPreference)return ({burdenHigh:'住居費をかなり負担に感じる',burdenSome:'住居費を少し負担に感じる',reasonable:'今の住居費は妥当',protect:'今の住環境を優先したい'} as Record<string,string>)[a.rentPreference]??null;
 if(x.category==='sub'&&(a.subUnusedAmount??0)>0)return `未使用分 月¥${Math.round(a.subUnusedAmount??0).toLocaleString('ja-JP')}${a.subCancellationConfirmed===true?' / 停止・解約可能を確認済み':''}`;
 if(x.category==='car'&&a.carNeed)return ({essential:'生活・仕事に必須',useful:'あるとかなり便利',burden:'維持費の負担が気になる',notNeeded:'なくても困らないかも'} as Record<string,string>)[a.carNeed]??null;
 if(x.category==='insurance'&&a.insurancePurpose)return ({clear:'保障目的を把握',mostly:'保障目的をだいたい把握',unclear:'保障目的がよく分からない'} as Record<string,string>)[a.insurancePurpose]??null;
 if(x.category==='selfDevelopment'&&a.selfDevelopmentValue)return ({inertia:'惰性になっている',unclear:'効果がよく分からない',purpose:'目的が明確',results:'成果につながっている'} as Record<string,string>)[a.selfDevelopmentValue]??null;
 return null;
};

const criteria=(profile:ProfileV4,x:FinalCategoryV4,annualIncomeBand?:string)=>{
 const out:string[]=[];
 const cat=x.category;
 const single=profile.householdSize===1;
 if(single&&['energy','food','daily','fun','beautyFashion'].includes(cat))out.push(`${profile.age}歳`);
 if(!single&&['energy','food','daily','fun'].includes(cat))out.push(`${profile.householdSize}人世帯`);
 if(cat==='energy'&&!single){out.push(profile.prefecture);const m=x.comparison.benchmarkMeta?.meta?.month;if(typeof m==='number')out.push(`${m}月`);}
 if(cat==='rent'&&x.comparison.benchmark!==null)out.push(`${profile.prefecture}・民営賃貸`);
 if(cat==='childEducation'&&x.record.metadata.educationChildren?.length)out.push(`子ども${x.record.metadata.educationChildren.length}人・学校段階別`);
 if(!single&&annualIncomeBand&&annualIncomeBand!=='unknown'&&annualIncomeBand!=='under500'&&['energy','food','daily','fun'].includes(cat))out.push('世帯年収帯補正');
 return out;
};

const reviewPotential=(x:FinalCategoryV4)=>{
 const delta=x.comparison.difference;
 const benchmark=x.comparison.benchmark;
 if(delta===null||benchmark===null||benchmark<=0)return {available:false as const,delta:null,ratio:null,level:'none' as const,label:'比較できる基準なし'};
 const ratio=delta/benchmark;
 if(delta<=0)return {available:true as const,delta,ratio,level:'low' as const,label:'基準内'};
 const level=delta>=30000||ratio>=.4?'high':delta>=10000||ratio>=.2?'medium':'low';
 return {available:true as const,delta,ratio,level,label:level==='high'?'見直しインパクト 大':level==='medium'?'見直しインパクト 中':'見直しインパクト 小'};
};

export function buildResultViewModelV4(a:{
 diagnosisId?:string;
 toneMode?:string;
 type?:any;
 annualIncomeBand?:string;
 profile:ProfileV4;
 finalCategories:FinalCategoryV4[];
}){
 const rows=a.finalCategories.map(x=>{
  const diagnosisAmountLabel=a.profile.diagnosisScope==='personal'?'あなたの負担':'家全体の支出';
  const compLabel=x.comparison.quality==='exact'?'近い条件との比較':x.comparison.quality==='reference'?'参考値との比較':'金額比較なし';
  const encounterStrength=x.status==='cut'?'strong':x.status==='review'&&x.attentionFlag?'medium':'none';
  return {
   category:x.category,label:LABEL[x.category],status:x.status==='cut'?'battle':x.status,
   diagnosisAmount:x.record.diagnosisAmount,diagnosisAmountLabel,
   personalBurden:x.record.personalBurden,householdTotal:x.record.householdTotal,
   known:x.record.known,applicability:x.record.applicability,amount:x.record.diagnosisAmount,
   comparisonAmount:x.comparison.amount,comparisonAmountLabel:scopeLabel(x.comparison.amountScope),
   comparable:x.comparison.benchmark,comparisonDifference:x.comparison.difference,
   comparisonQuality:x.comparison.quality,comparisonSourceVersion:x.comparison.sourceVersion,
   comparator:{kind:x.comparison.quality==='none'?'none':'scope_matched',label:compLabel},
   comparisonContext:{criteria:criteria(a.profile,x,a.annualIncomeBand),amountScope:x.comparison.amountScope,quality:x.comparison.quality,sourceVersion:x.comparison.sourceVersion},
   evidenceLabel:compLabel,referenceDetail:null,
   reviewPotential:reviewPotential(x),
   appraisal:x.appraisal,appraisalSummary:appraisalSummary(x),
   reason:reasonText(x),nextCheck:nextCheck(x.category),
   confirmedSaving:x.confirmedSaving,reducible:x.confirmedSaving,
   attentionFlag:x.attentionFlag,reasonCode:x.reasonCode,
   encounterStrength,
  };
 });
 const statusMap=(s:FinalStatusV4)=>s==='cut'?'battle':s;
 const counts={battle:0,protect:0,safe:0,review:0,na:0} as Record<string,number>;
 for(const x of a.finalCategories)counts[statusMap(x.status)]=(counts[statusMap(x.status)]??0)+1;
 const confirmedMonthly=rows.reduce((sum,x)=>sum+x.confirmedSaving,0);
 const comparisonGroups=rows.filter(x=>x.comparisonQuality!=='none'&&x.comparisonAmount!==null&&x.comparable!==null).reduce((acc,row)=>{
  const key=row.comparisonAmountLabel;
  const current=acc[key]??{scopeLabel:key,userMonthly:0,benchmarkMonthly:0,categoryCount:0,categories:[] as Category[]};
  current.userMonthly+=row.comparisonAmount??0;
  current.benchmarkMonthly+=row.comparable??0;
  current.categoryCount+=1;
  current.categories.push(row.category);
  acc[key]=current;
  return acc;
 },{} as Record<string,{scopeLabel:string;userMonthly:number;benchmarkMonthly:number;categoryCount:number;categories:Category[]}>);
 const groups=Object.values(comparisonGroups).map(x=>({...x,differenceMonthly:x.userMonthly-x.benchmarkMonthly,differenceAnnual:(x.userMonthly-x.benchmarkMonthly)*12}));
 const singleGroup=groups.length===1?groups[0]:null;
 const battleTargets=rows.filter(x=>x.status==='battle'&&x.confirmedSaving>0).sort((x,y)=>y.confirmedSaving-x.confirmedSaving).slice(0,3);
 const encounterTargets=rows.filter(x=>x.status==='review'&&x.attentionFlag).sort((x,y)=>(y.reviewPotential.delta??0)-(x.reviewPotential.delta??0)).slice(0,3);
 const secondaryReviewTargets=rows.filter(x=>x.status==='review'&&!x.attentionFlag);
 const firstQuest=battleTargets[0]??encounterTargets[0]??secondaryReviewTargets[0]??null;
 return {
  version:'MUDAGIRI_RESULT_VM_V4_1' as const,
  diagnosisId:a.diagnosisId??'',
  toneMode:a.toneMode??'serious',
  type:a.type??{code:'',name:'',axes:{fv:0,pi:0,au:0},axisStrength:{fv:0,pi:0,au:0},nearMiddle:{fv:true,pi:true,au:true}},
  annualIncomeBand:a.annualIncomeBand??'unknown',
  profile:a.profile,
  counts,
  improvement:{monthly:confirmedMonthly,annual:confirmedMonthly*12,fiveYear:confirmedMonthly*60},
  rows,battleTargets,encounterTargets,secondaryReviewTargets,firstQuest,
  comparisonGroups:groups,
  comparisonAggregationRule:'NEVER_MIX_AMOUNT_SCOPES' as const,
  benchmarkSummary:singleGroup?{available:true,scope:'single_scope_group',label:`${singleGroup.scopeLabel}の基準との差`,userMonthly:singleGroup.userMonthly,benchmarkMonthly:singleGroup.benchmarkMonthly,deltaMonthly:singleGroup.differenceMonthly,deltaAnnual:singleGroup.differenceAnnual,categoryCount:singleGroup.categoryCount,excludedCount:rows.length-singleGroup.categoryCount,categories:singleGroup.categories}:{available:false,scope:'mixed_or_none',label:'比較scope別に表示',userMonthly:0,benchmarkMonthly:0,deltaMonthly:0,deltaAnnual:0,categoryCount:0,excludedCount:rows.length,categories:[]},
  share:{includeFinancialAmounts:false,includeProfile:false,modeBadge:a.toneMode??'serious'},
 };
}

export const RESULT_VM_V4_VERSION='MUDAGIRI_RESULT_VM_V4_1';
