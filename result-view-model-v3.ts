import type { Category } from './mudagiri-diagnosis-v2';
import type { AnnualIncomeBand, FinalCategoryV3, FinalStatus } from './mudagiri-integration-v3';

export const RESULT_VM_VERSION='MUDAGIRI_RESULT_VM_V3.2' as const;
export type ComparatorKind='optimization_rule'|'statistical_comparator'|'direct_benchmark'|'none';
export interface ComparatorMetaV3 {kind:ComparatorKind;label:string;sourceKey:string|null}

const LABEL:Record<Category,string>={mobile:'通信費',energy:'光熱費',sub:'サブスク',car:'車関連費',food:'食費',daily:'日用品',fun:'娯楽・交際費',beautyFashion:'美容・服飾費',rent:'住居費',insurance:'保険料',childEducation:'子どもの教育費',selfDevelopment:'自己投資'};
const ENEMY:Record<Category,string>={mobile:'通信ザウルス',energy:'電気ウナギ魔人',sub:'サブスクサキュバス',car:'ムダカー',food:'クイダオーレ',daily:'チリツモコビト',fun:'アソビスギー',beautyFashion:'ミエハリーヌ',rent:'ヤチンダー',insurance:'ホケンミエナイダー',childEducation:'マナビンボー',selfDevelopment:'ジコトウシン'};

export function comparatorMetaV3(c:Category, comparable:number|null):ComparatorMetaV3{
 if(c==='childEducation'&&comparable!==null)return {kind:'direct_benchmark',label:'参考ベンチマーク',sourceKey:'mext_education'};
 if(['mobile','energy','food','daily','fun','beautyFashion'].includes(c)&&comparable!==null)return {kind:'statistical_comparator',label:'あなたに近い世帯の比較目安',sourceKey:'comparable_v1'};
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
  if(x.battleBasis==='confirmed')return '具体的に不要・削減可能と確認できたため、討伐対象です。確定した実額だけを改善額に含めています。';
  if(x.battleBasis==='appraisal_review')return x.comparable!==null&&((x.comparisonDifference??0)>0)?'比較目安に加え、あなた自身も見直し意向を示したため優先クエストです。平均との差は改善額には含めません。':'追加鑑定で、あなた自身が見直し余地を示したため優先クエストです。改善額はまだ確定していません。';
  return '比較データ上で見直しシグナルが出たため、討伐クエストの対象です。削減額はまだ確定していません。';
 }
 return '現在の診断条件では、優先して見直す支出には入りませんでした。';
}
function appraisalSummary(x:FinalCategoryV3):string|null{
 const a=x.appraisal;if(!a)return null;
 if(x.category==='sub'){if(a.subUsage==='none')return 'ほぼ全部使っている';if(a.subUnusedAmount&&a.subUnusedAmount>0)return `未使用分 月¥${a.subUnusedAmount.toLocaleString('ja-JP')}を確認`;if(a.subUsage==='one')return '使っていない契約が1つくらいありそう';if(a.subUsage==='several')return '使っていない契約が2〜3個ありそう';if(a.subUsage==='unknown')return '契約状況を把握できていない';}
 if(x.category==='car')return ({essential:'生活・仕事に必須',useful:'あるとかなり便利',burden:'維持費の負担が気になる',notNeeded:'なくても困らないかも'} as any)[a.carNeed]??null;
 if(x.category==='rent')return ({burdenHigh:'かなり負担を感じる',burdenSome:'少し負担を感じる',reasonable:'今の家なら妥当',protect:'今の住環境を優先'} as any)[a.rentPreference]??null;
 if(x.category==='food'||x.category==='fun'||x.category==='beautyFashion')return ({verySatisfied:'かなり満足・守りたい',satisfied:'今くらいでいい',inertia:'少し見直したい',waste:'かなり見直したい'} as any)[a.satisfaction]??null;
 if(x.category==='insurance')return ({clear:'目的まで把握している',mostly:'目的はだいたい把握',unclear:'保障目的が曖昧'} as any)[a.insurancePurpose]??null;
 if(x.category==='childEducation')return ({reviewHigh:'かなり見直したい',reviewSome:'少し負担を感じる',necessary:'必要な教育費',protect:'優先して守りたい'} as any)[a.educationPreference]??null;
 if(x.category==='selfDevelopment')return ({inertia:'惰性になっている',unclear:'効果がよく分からない',purpose:'目的は明確',results:'成果につながっている'} as any)[a.selfDevelopmentValue]??null;
 return null;
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
 const rows=args.finalCategories.map(x=>({
  category:x.category,label:LABEL[x.category],enemyName:ENEMY[x.category],status:x.status,attentionFlag:x.attentionFlag,
  amount:x.raw.amount,known:x.raw.known,applicability:x.raw.applicability,
  comparable:x.comparable,comparisonDifference:x.comparisonDifference,
  comparator:comparatorMetaV3(x.category,x.comparable),
  diagnosisState:x.engine?.state??null,reasonCodes:x.engine?.reasonCodes??[],needsReview:x.engine?.needsReview??false,
  battleBasis:x.battleBasis,confirmedSaving:x.engine?.confirmedSaving??null,reducible:x.reducible,priority:x.priority,
  appraisal:x.appraisal,appraisalSummary:appraisalSummary(x),reason:reason(x),nextCheck:nextCheck(x)
 }));
 const battle=rows.filter(x=>x.status==='battle').sort((a,b)=>(b.battleBasis==='confirmed'?2:1)-(a.battleBasis==='confirmed'?2:1)||(b.comparisonDifference??0)-(a.comparisonDifference??0)).slice(0,3);
 const firstQuest=battle[0]??rows.find(x=>x.status==='review')??null;
 return {version:RESULT_VM_VERSION,diagnosisId:args.diagnosisId,type:args.type,toneMode:args.toneMode,annualIncomeBand:args.annualIncomeBand,counts,improvement:{monthly:args.monthlyImprovement,annual:args.monthlyImprovement*12,fiveYear:args.monthlyImprovement*60},battleTargets:battle,rows,firstQuest,share:{includeFinancialAmounts:false,includeProfile:false,modeBadge:args.toneMode}};
}
