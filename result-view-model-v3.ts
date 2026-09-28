import type { Category } from './mudagiri-diagnosis-v2';
import type { AnnualIncomeBand, FinalCategoryV3, FinalStatus } from './mudagiri-integration-v3';

export const RESULT_VM_VERSION='MUDAGIRI_RESULT_VM_V3.1' as const;
export type ComparatorKind='optimization_rule'|'statistical_comparator'|'direct_benchmark'|'none';
export interface ComparatorMetaV3 {kind:ComparatorKind;label:string;sourceKey:string|null}

const LABEL:Record<Category,string>={mobile:'通信費',energy:'光熱費',sub:'サブスク',car:'車関連費',food:'食費',daily:'日用品',fun:'娯楽・交際費',beautyFashion:'美容・服飾費',rent:'住居費',insurance:'保険料',childEducation:'子どもの教育費',selfDevelopment:'自己投資'};
const ENEMY:Record<Category,string>={mobile:'通信ザウルス',energy:'電気ウナギ魔人',sub:'サブスクサキュバス',car:'ムダカー',food:'クイダオーレ',daily:'チリツモコビト',fun:'アソビスギー',beautyFashion:'ミエハリーヌ',rent:'ヤチンダー',insurance:'ホケンミエナイダー',childEducation:'マナビンボー',selfDevelopment:'ジコトウシン'};

export function comparatorMetaV3(c:Category, comparable:number|null):ComparatorMetaV3{
 if(c==='mobile')return {kind:'optimization_rule',label:'見直し基準',sourceKey:'mobile_fixed_4000'};
 if(c==='car'&&comparable!==null)return {kind:'direct_benchmark',label:'参考ベンチマーク',sourceKey:'car_14100'};
 if(c==='childEducation'&&comparable!==null)return {kind:'direct_benchmark',label:'参考ベンチマーク',sourceKey:'mext_education'};
 if(['energy','food','daily','fun','beautyFashion'].includes(c)&&comparable!==null)return {kind:'statistical_comparator',label:'あなたに近い世帯の比較目安',sourceKey:'comparable_v1'};
 return {kind:'none',label:'比較情報なし',sourceKey:null};
}
function reason(x:FinalCategoryV3):string{
 if(x.status==='na')return 'この診断では対象外です。';
 if(!x.raw.known)return '金額を把握していないため、ムダとは断定していません。まず金額や契約内容を確認します。';
 if(x.status==='protect')return '金額だけで斬らず、あなたが価値を感じている支出として守ります。';
 if(x.status==='review'){
  if(x.category==='sub')return '使っていない可能性はありますが、未使用額が分からないため改善額には含めていません。';
  if(x.category==='insurance')return '保障内容や目的まで確認しないと、金額だけではムダ判定できません。';
  if(x.category==='rent')return '住環境や負担感を含めて判断する必要があるため、要鑑定です。';
  if(x.category==='childEducation')return '子どもの年齢・進路・必要性を含めて判断するため、要鑑定です。';
  if(x.category==='selfDevelopment')return '目的・利用状況・成果を含めて判断するため、要鑑定です。';
  return '追加情報が必要なため、まだムダとは断定していません。';
 }
 if(x.status==='battle'){
  if(x.category==='mobile')return '月4,000円の見直し基準を超える部分の80%を改善余地として算定しています。';
  if(x.category==='energy')return '比較目安の120%を超える部分の60%を改善余地として算定しています。';
  if(x.category==='sub')return '使っていないと確認できた実額だけを改善余地に含めています。';
  if(x.category==='car')return '参考ベンチマークを超える部分の40%を改善余地として算定しています。';
  if(x.category==='daily')return '比較目安の130%を超える部分の40%を改善余地として算定しています。';
  return '比較目安を超える部分に、本人の満足度を反映して改善余地を算定しています。';
 }
 return '現在の診断条件では、優先して見直す支出には入りませんでした。';
}
function nextCheck(x:FinalCategoryV3):string{
 if(x.status==='na')return '確認不要';
 if(!x.raw.known)return x.category==='insurance'?'保険料と保障内容が分かる資料を確認':'直近の明細・請求額を確認';
 if(x.category==='mobile')return 'スマホ・自宅回線の契約プランを確認';
 if(x.category==='energy')return '直近の電気・ガス・水道明細を確認';
 if(x.category==='sub')return '契約中サービスと実際の利用状況を確認';
 if(x.category==='car')return 'ローン・駐車場・保険・燃料費を分けて確認';
 if(x.category==='rent')return '手取りに対する住居費負担と住環境の優先度を確認';
 if(x.category==='insurance')return '保障目的・保障額・期間・重複を確認';
 if(x.category==='childEducation')return '教育段階と今後必要な教育費を確認';
 if(x.category==='selfDevelopment')return '目的・利用状況・成果を確認';
 return '直近1〜3か月の明細を確認';
}
export function buildResultViewModelV3(args:{diagnosisId:string;type:{code:string;name:string;description?:string};toneMode:string;finalCategories:FinalCategoryV3[];monthlyImprovement:number;annualIncomeBand:AnnualIncomeBand}){
 const counts=(['battle','protect','safe','review','na'] as FinalStatus[]).reduce((o,k)=>({...o,[k]:args.finalCategories.filter(x=>x.status===k).length}),{} as Record<FinalStatus,number>);
 const rows=args.finalCategories.map(x=>({category:x.category,label:LABEL[x.category],enemyName:ENEMY[x.category],status:x.status,attentionFlag:x.attentionFlag,amount:x.raw.amount,known:x.raw.known,applicability:x.raw.applicability,comparable:x.category==='mobile'?4000:x.comparable,comparator:comparatorMetaV3(x.category,x.category==='mobile'?4000:x.comparable),reducible:x.reducible,priority:x.priority,reason:reason(x),nextCheck:nextCheck(x)}));
 const battle=rows.filter(x=>x.status==='battle').sort((a,b)=>b.priority-a.priority).slice(0,3);
 const firstQuest=battle[0]??rows.find(x=>x.status==='review')??null;
 return {version:RESULT_VM_VERSION,diagnosisId:args.diagnosisId,type:args.type,toneMode:args.toneMode,annualIncomeBand:args.annualIncomeBand,counts,improvement:{monthly:args.monthlyImprovement,annual:args.monthlyImprovement*12,fiveYear:args.monthlyImprovement*60},battleTargets:battle,rows,firstQuest,share:{includeFinancialAmounts:false,includeProfile:false,modeBadge:args.toneMode}};
}
