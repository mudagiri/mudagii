import type { Category } from './mudagiri-diagnosis-v2';
import { communicationScreenV3, encounterStrengthV31, type AnnualIncomeBand, type FinalCategoryV3, type FinalStatus } from './mudagiri-integration-v3';

export const RESULT_VM_VERSION='MUDAGIRI_RESULT_VM_V3.3' as const;
export type ComparatorKind='optimization_rule'|'statistical_comparator'|'direct_benchmark'|'none';
export interface ComparatorMetaV3 {kind:ComparatorKind;label:string;sourceKey:string|null}

const LABEL:Record<Category,string>={mobile:'通信費',energy:'光熱費',sub:'サブスク',car:'車関連費',food:'食費',daily:'日用品',fun:'娯楽・交際費',beautyFashion:'美容・服飾費',rent:'住居費',insurance:'保険料',childEducation:'子どもの教育費',selfDevelopment:'自己投資'};
const ENEMY:Record<Category,string>={mobile:'通信ザウルス',energy:'電気ウナギ魔人',sub:'サブスクサキュバス',car:'ムダカー',food:'クイダオーレ',daily:'チリツモコビト',fun:'アソビスギー',beautyFashion:'ミエハリーヌ',rent:'ヤチンダー',insurance:'ホケンミエナイダー',childEducation:'マナビンボー',selfDevelopment:'ジコトウシン'};

export function comparatorMetaV3(c:Category, comparable:number|null, benchmarkMeta?:FinalCategoryV3['benchmarkMeta']):ComparatorMetaV3{
 if(c==='childEducation'&&comparable!==null)return {kind:'direct_benchmark',label:'学校段階に応じた教育費の参考目安',sourceKey:'mext_education'};
 if(c==='rent'&&comparable!==null)return {kind:'statistical_comparator',label:'同じ都道府県の民営賃貸の家賃目安',sourceKey:'housing_v2_private_rent'};
 if(c==='beautyFashion'&&comparable!==null){
  const sex=benchmarkMeta?.meta?.sex;
  const fallback=benchmarkMeta?.meta?.sexFallback;
  const label=sex==='male'?'男性×年齢の比較目安':sex==='female'?'女性×年齢の比較目安':fallback==='all'?'男女計×年齢の比較目安':'美容・服飾費の比較目安';
  return {kind:'statistical_comparator',label,sourceKey:benchmarkMeta?.sourceVersion??'beauty_fashion_v1'};
 }
 if(c==='mobile')return {kind:'statistical_comparator',label:'回線タイプ別の携帯料金帯（参考）',sourceKey:benchmarkMeta?.sourceVersion??'communication_v1'};
 if(['energy','food','daily','fun','beautyFashion'].includes(c)&&comparable!==null)return {kind:'statistical_comparator',label:'あなたに近い世帯の比較目安',sourceKey:benchmarkMeta?.sourceVersion??'comparable_v2'};
 return {kind:'none',label:'比較情報なし',sourceKey:null};
}
function appraisalIntent(x:FinalCategoryV3):string|null{
 const a=x.appraisal;if(!a)return null;
 if(x.category==='mobile'&&a.mobileCarrier){
  const label=({major:'大手キャリア系',mvno:'格安SIM系',unknown:'回線タイプ不明'} as Record<string,string>)[a.mobileCarrier]??'回線タイプ不明';
  const s=communicationScreenV3(x.raw.amount??0,a.mobileCarrier);
  const band=({standard:'一般的な料金帯',higher:'一般的な料金帯より高め',check:'やや高めの目安以上',detail:'かなり高めの目安以上',unknown:'価格帯照合保留'} as Record<string,string>)[s.band];
  return `${label} / ${band}`;
 }
 if(x.category==='sub'){
  if((a.subUnusedAmount??0)>0)return '使っていない月額を具体的に確認できたため';
  if(a.subUsage==='one'||a.subUsage==='several')return '使っていない契約がありそうという回答だったため';
 }
 if(x.category==='car'){
  if(a.carNeed==='burden')return '維持費の負担が気になるという回答だったため';
  if(a.carNeed==='notNeeded')return 'なくても困らないかもしれないという回答だったため';
 }
 if(x.category==='rent'){
  if(a.rentPreference==='burdenHigh')return '住居費をかなり負担に感じているという回答だったため';
  if(a.rentPreference==='burdenSome')return '住居費を少し負担に感じているという回答だったため';
 }
 if(x.category==='insurance'){
  if(a.insuranceLastReview==='over3y'||a.insuranceLastReview==='never')return '保険をしばらく見直していないという回答だったため';
  if(a.insurancePurpose==='unclear')return '保障目的がよく分からないという回答だったため';
  if(a.insuranceDuplicate==='possible')return '保障が重複している可能性があるため';
 }
 if(x.category==='childEducation'){
  if(a.educationPreference==='reviewHigh')return '教育費をかなり見直したいという回答だったため';
  if(a.educationPreference==='reviewSome')return '教育費の負担を少し感じているという回答だったため';
 }
 if(x.category==='selfDevelopment'){
  if(a.selfDevelopmentValue==='inertia')return '自己投資が惰性になっているという回答だったため';
  if(a.selfDevelopmentValue==='unclear')return '自己投資の効果がよく分からないという回答だったため';
 }
 if((x.category==='food'||x.category==='fun'||x.category==='beautyFashion')){
  if(a.satisfaction==='waste')return 'かなり見直したいという回答だったため';
  if(a.satisfaction==='inertia')return '少し見直したいという回答だったため';
 }
 return null;
}
function reason(x:FinalCategoryV3):string{
 if(x.status==='na')return 'この診断では対象外です。';
 if(!x.raw.known)return '金額を把握していないため、ムダとは断定していません。まず金額や契約内容を確認します。';
 if(x.status==='protect'){
  if(x.category==='insurance'&&x.appraisal?.insurancePurpose==='clear')return '保障目的をかなり把握しているという回答のため、保険料の金額だけでは見直し対象にしません。';
  if(x.category==='car'&&x.appraisal?.carNeed==='essential')return '生活・仕事に必須という回答のため、金額だけでは見直し対象にしません。';
  if(x.category==='car'&&x.appraisal?.carNeed==='useful')return 'あるとかなり便利という回答のため、必要性を優先して守ります。';
  if(x.category==='rent'&&(x.appraisal?.rentPreference==='protect'||x.appraisal?.rentPreference==='reasonable'))return '住環境を優先・現在の家賃を妥当とする回答を踏まえ、比較差だけでは見直し対象にしません。';
  if(x.category==='childEducation'&&(x.appraisal?.educationPreference==='necessary'||x.appraisal?.educationPreference==='protect'))return '必要・優先して守りたい教育費という回答を踏まえ、参考値との差だけでは見直し対象にしません。';
  if(x.category==='selfDevelopment'&&x.appraisal?.selfDevelopmentValue==='purpose')return '目的が明確という回答のため、金額だけでは見直し対象にしません。';
  if(x.category==='selfDevelopment'&&x.appraisal?.selfDevelopmentValue==='results')return '成果につながっているという回答のため、価値のある自己投資として守ります。';
  if((x.category==='food'||x.category==='fun'||x.category==='beautyFashion')&&x.appraisal?.satisfaction)return '満足度・価値判断を踏まえ、比較目安を上回っていても金額だけでは見直し対象にしません。';
  return '金額だけで斬らず、確認できた必要性・価値を踏まえて守ります。';
 }
 if(x.status==='review'){
  if(x.category==='mobile'){
   const carrier=x.appraisal?.mobileCarrier??'unknown';
   const s=communicationScreenV3(x.raw.amount??0,carrier);
   const carrierLabel=carrier==='major'?'大手キャリア':carrier==='mvno'?'格安SIM':'回線タイプ不明';
   const bandLabel=({standard:'一般的な料金帯',higher:'一般的な料金帯より高め',check:'やや高めの目安以上',detail:'かなり高めの目安以上',unknown:'料金帯との照合は保留'} as Record<string,string>)[s.band];
   return `${carrierLabel}の調査価格帯では${bandLabel}です。ただし入力額はスマホ＋自宅インターネット合計のため、携帯料金帯との差だけでムダ・削減額とは判定していません。`;
  }
  if(x.category==='energy'){
   if(x.appraisal?.energyPersistence==='persistent')return '比較目安を上回る状態が2〜3か月続いているため、明細確認の対象です。差額は改善額には含めていません。';
   return '単月の金額だけではムダと断定せず、継続性や請求周期を追加確認します。';
  }
  if(x.category==='daily'){
   if(x.appraisal?.dailyPersistence==='persistent')return '比較目安を上回る日用品費が2〜3か月続いているため、明細確認の対象です。差額は改善額には含めていません。';
   return '単月の金額だけではムダと断定せず、継続性を追加確認します。';
  }
  if(x.category==='beautyFashion'&&x.comparable===null){
   const intent=appraisalIntent(x);
   return intent?`${intent}、複数世帯向けの根拠十分な比較値は置かず、あなた自身の価値判断で確認しています。改善額はまだ確定していません。`:'複数世帯向けの根拠十分な比較値を置かず、あなた自身の価値判断で確認しています。改善額はまだ確定していません。';
  }
  if(x.category==='sub'){
   if((x.appraisal?.subUnusedAmount??0)>0&&x.appraisal?.subCancellationConfirmed!==true)return '未使用額は確認できていますが、解約・停止できる確認が取れていないため改善額には含めていません。';
   return '使っていない可能性はありますが、未使用額が確定していないため改善額には含めていません。';
  }
  if(x.category==='car'){
   if(x.appraisal?.carNeed==='burden')return '維持費の負担を感じているため、内訳を確認する対象です。手放す・削減できる金額はまだ確定していません。';
   if(x.appraisal?.carNeed==='notNeeded')return 'なくても困らない可能性があるため、保有コストの内訳を確認する対象です。削減額はまだ確定していません。';
   return '車は金額だけでムダ判定せず、生活・仕事上の必要性と保有コストの内訳を確認します。';
  }
  if(x.category==='insurance'){
   if(x.appraisal?.insurancePurpose==='unclear')return '保障目的がよく分からないため、契約内容を確認する対象です。保険料の金額だけでムダ・削減額とは判定していません。';
   if(x.appraisal?.insuranceLastReview==='over3y'||x.appraisal?.insuranceLastReview==='never'||x.appraisal?.insuranceLastReview==='unknown')return '保障目的は一部把握していますが、見直しから時間が経っている・時期が不明なため契約内容を確認します。削減額はまだ確定していません。';
   return '保障内容や目的の追加確認が必要です。保険料の金額だけではムダ・削減額とは判定していません。';
  }
  if(x.category==='rent'){
   const intent=appraisalIntent(x);
   return intent?`${intent}、住環境の優先度とあわせて確認します。比較差だけを削減額にはしていません。`:'住環境や負担感を含めて判断する必要があるため、要鑑定です。';
  }
  if(x.category==='childEducation'){
   const intent=appraisalIntent(x);
   return intent?`${intent}、教育段階・進路とあわせて確認します。参考ベンチマークとの差は削減額ではありません。`:'子どもの教育段階・進路・必要性を含めて判断するため、要鑑定です。';
  }
  if(x.category==='selfDevelopment'){
   if(x.appraisal?.selfDevelopmentValue==='inertia')return '惰性になっているという回答のため、続ける目的と利用状況を確認する対象です。金額だけでムダ・削減額とは判定していません。';
   if(x.appraisal?.selfDevelopmentValue==='unclear')return '効果がよく分からないという回答のため、目的と成果のつながりを確認する対象です。削減額はまだ確定していません。';
   return '目的・利用状況・成果を含めて判断するため、要鑑定です。金額だけではムダ判定していません。';
  }
  if(x.category==='food'||x.category==='fun'||x.category==='beautyFashion'){
   const intent=appraisalIntent(x);
   if(intent)return `${intent}、内容を確認する対象です。比較目安との差はムダ額・削減額には含めていません。`;
  }
  return '追加情報が必要なため、まだムダとは断定していません。';
 }
 if(x.status==='battle'){
  if(x.battleBasis==='confirmed')return '具体的に不要・削減可能と確認できたため、討伐対象です。確定した実額だけを改善額に含めています。';
  return '削減額まで確認できた項目だけを討伐対象として表示します。';
 }
 return '現在の診断条件では、優先して見直す支出には入りませんでした。';
}
function appraisalSummary(x:FinalCategoryV3):string|null{
 const a=x.appraisal;if(!a)return null;
 if(x.category==='energy'&&a.energyPersistence)return ({persistent:'2〜3か月くらい続いている',temporary:'今月だけ高い',unknown:'継続しているか分からない'} as Record<string,string>)[a.energyPersistence]??null;
 if(x.category==='daily'&&a.dailyPersistence)return ({persistent:'2〜3か月くらい続いている',temporary:'今月だけ高い',unknown:'継続しているか分からない'} as Record<string,string>)[a.dailyPersistence]??null;
 if(x.category==='sub'){if(a.subUsage==='none')return 'ほぼ全部使っている';if(a.subUnusedAmount&&a.subUnusedAmount>0)return `未使用分 月¥${a.subUnusedAmount.toLocaleString('ja-JP')}を確認`;if(a.subUsage==='one')return '使っていない契約が1つくらいありそう';if(a.subUsage==='several')return '使っていない契約が2〜3個ありそう';if(a.subUsage==='unknown')return '契約状況を把握できていない';}
 if(x.category==='car'&&a.carNeed)return ({essential:'生活・仕事に必須',useful:'あるとかなり便利',burden:'負担が気になってる',notNeeded:'なくても困らないかも'} as Record<string,string>)[a.carNeed]??null;
 if(x.category==='rent'&&a.rentPreference)return ({burdenHigh:'かなり負担を感じる',burdenSome:'少し負担を感じる',reasonable:'今の家なら妥当',protect:'今の住環境を優先'} as Record<string,string>)[a.rentPreference]??null;
 if((x.category==='food'||x.category==='fun'||x.category==='beautyFashion')&&a.satisfaction)return ({verySatisfied:'かなり満足・守りたい',satisfied:'今くらいでいい',inertia:'少し見直したい',waste:'かなり見直したい'} as Record<string,string>)[a.satisfaction]??null;
 if(x.category==='insurance'&&a.insurancePurpose){
  if(a.insurancePurpose==='clear')return 'かなり把握している';
  if(a.insuranceLastReview==='over3y'||a.insuranceLastReview==='never')return 'しばらく見直していない';
  if(a.insurancePurpose==='unclear')return 'よく分からない';
  return 'だいたい把握している';
 }
 if(x.category==='childEducation'){
  const stageLabels={publicKindergarten:'幼稚園・保育相当（公立）',privateKindergarten:'幼稚園・保育相当（私立）',publicElementary:'小学校（公立）',privateElementary:'小学校（私立）',publicJuniorHigh:'中学校（公立）',privateJuniorHigh:'中学校（私立）',publicHigh:'高校（公立）',privateHigh:'高校（私立）'} as Record<string,string>;
  const children=a.educationChildren?.length?a.educationChildren.map((child,i)=>`${i+1}人目:${stageLabels[child.stage]??child.stage}`).join(' / '):null;
  const stage=!children&&a.educationStage?stageLabels[a.educationStage]:null;
  const pref=a.educationPreference?({reviewHigh:'かなり見直したい',reviewSome:'少し負担を感じる',necessary:'必要な教育費',protect:'優先して守りたい'} as Record<string,string>)[a.educationPreference]:null;
  return [children??stage,pref].filter(Boolean).join(' / ')||null;
 }
 if(x.category==='selfDevelopment'&&a.selfDevelopmentValue)return ({inertia:'惰性になってる',unclear:'効果がよく分からない',purpose:'目的は明確',results:'成果につながってる'} as Record<string,string>)[a.selfDevelopmentValue]??null;
 return null;
}
function referenceDetail(x:FinalCategoryV3):string|null{
 if(x.category!=='mobile'||!x.appraisal?.mobileCarrier)return null;
 const carrier=x.appraisal.mobileCarrier;
 const m=x.benchmarkMeta?.meta??{};
 const label=carrier==='major'?'大手キャリア系':carrier==='mvno'?'格安SIM系':null;
 if(!label)return '回線タイプが不明なため、料金帯との照合は保留';
 const p50=carrier==='major'?m.majorP50:m.mvnoP50;
 const p75=carrier==='major'?m.majorP75:m.mvnoP75;
 const p90=carrier==='major'?m.majorP90:m.mvnoP90;
 return p50&&p75&&p90?`${label}：一般的な料金帯 ${p50}円 / やや高めの目安 ${p75}円 / かなり高めの目安 ${p90}円`:null;
}
function evidenceLabel(x:FinalCategoryV3):string{
 if(x.comparable!==null)return comparatorMetaV3(x.category,x.comparable,x.benchmarkMeta).label;
 if(x.category==='mobile'&&x.appraisal?.mobileCarrier)return '回線タイプ別の料金帯で照合';
 if(x.category==='insurance')return '平均額ではなく保障目的・見直し状況で判定';
 if(x.category==='sub')return '平均額ではなく未使用契約・未使用額で判定';
 if(x.category==='car')return '平均額ではなく必要性・維持費構造で判定';
 if(x.category==='selfDevelopment')return '平均額ではなく目的・利用状況・成果で判定';
 if(x.category==='rent')return '賃貸以外は民営賃貸の参考値を流用せず回答内容で判定';
 if(x.category==='beautyFashion')return 'あなたに合う十分な比較データがないため、満足度・価値判断で判定';
 return '数値比較できる基準なし・回答内容で判定';
}
function nextCheck(x:FinalCategoryV3):string{
 if(x.status==='na')return '確認不要';
 if(!x.raw.known)return x.category==='insurance'?'保険料と保障内容が分かる資料を確認':'直近の明細・請求額を確認';
 if(x.category==='mobile')return 'スマホ・自宅回線の契約プランを確認';
 if(x.category==='energy')return '直近の電気・ガス・水道明細を確認';
 if(x.category==='sub')return '契約中サービスと実際の利用状況を確認';
 if(x.category==='car')return 'ローン・駐車場・保険・燃料費を分けて確認';
 if(x.category==='rent')return '手取りに対する住居費負担と住環境の優先度を確認';
 if(x.category==='insurance')return '保障目的と、最後に見直した時期を確認';
 if(x.category==='childEducation')return '教育段階と今後必要な教育費を確認';
 if(x.category==='selfDevelopment')return '目的・利用状況・成果を確認';
 return '直近1〜3か月の明細を確認';
}
const INCOME_LABEL:Record<AnnualIncomeBand,string>={under500:'500万円未満','500_599':'500〜599万円','600_699':'600〜699万円','700_799':'700〜799万円','800_999':'800〜999万円','1000plus':'1,000万円以上',unknown:'未回答'};
function comparisonContext(x:FinalCategoryV3,profile:{prefecture:string;age:number;household:string;householdSize:number;workStyle:string;housingType:string;monthlyTakeHome:number}|null,annualIncomeBand:AnnualIncomeBand){
 const m=x.benchmarkMeta?.meta??{}; const bits:string[]=[]; const single=profile?.household==='single'; const multi=profile?.household==='multi';
 const ageBucket=profile?.age?(profile.age<=34?'34歳以下':profile.age<=59?'35〜59歳':'60歳以上'):null;
 if(single&&['energy','food','daily','fun','beautyFashion'].includes(x.category)&&profile?.age)bits.push(`${profile.age}歳（比較上は${ageBucket}）`);
 if(multi&&['energy','food','daily','fun'].includes(x.category))bits.push(`${profile?.householdSize||2}人世帯`);
 if(x.category==='energy'&&multi&&profile?.prefecture)bits.push(profile.prefecture);
 if(x.category==='energy'&&multi&&typeof m.month==='number')bits.push(`${m.month}月`);
 if(x.category==='rent'&&profile?.prefecture)bits.push(`${profile.prefecture}・民営賃貸`);
 if(x.category==='beautyFashion'&&m.sex==='male')bits.push('男性'); else if(x.category==='beautyFashion'&&m.sex==='female')bits.push('女性'); else if(x.category==='beautyFashion'&&m.sexFallback)bits.push('性別横断の比較目安');
 if(x.category==='childEducation'&&x.appraisal?.educationChildren?.length)bits.push(`子ども${x.appraisal.educationChildren.length}人・学校段階別`);
 const incomeApplied=multi&&annualIncomeBand!=='unknown'&&annualIncomeBand!=='under500'&&['energy','food','daily','fun'].includes(x.category); if(incomeApplied)bits.push(`年収${INCOME_LABEL[annualIncomeBand]}`);
 return {displayAge:profile?.age??null,ageBucket,household:profile?.household??null,householdSize:profile?.householdSize??null,prefecture:profile?.prefecture??null,housingType:profile?.housingType??null,incomeBand:annualIncomeBand,incomeBandLabel:INCOME_LABEL[annualIncomeBand],incomeApplied,criteria:bits,confidence:x.benchmarkMeta?.confidence??null,sourceVersion:x.benchmarkMeta?.sourceVersion??null,benchmarkMeta:m};
}

export function buildResultViewModelV3(args:{diagnosisId:string;type:{code:string;name:string;description?:string;catchphrase?:string;strengthLabel?:string;blindSpot?:string;shareHook?:string;axes?:{fv:number;pi:number;au:number};axisStrength?:{fv:number;pi:number;au:number};nearMiddle?:{fv:boolean;pi:boolean;au:boolean}};toneMode:string;profile?:{prefecture:string;age:number;household:string;householdSize:number;workStyle:string;housingType:string;monthlyTakeHome:number};finalCategories:FinalCategoryV3[];monthlyImprovement:number;annualIncomeBand:AnnualIncomeBand}){
 const counts=(['battle','protect','safe','review','na'] as FinalStatus[]).reduce((o,k)=>({...o,[k]:args.finalCategories.filter(x=>x.status===k).length}),{} as Record<FinalStatus,number>);
 const rows=args.finalCategories.map(x=>({
  category:x.category,label:LABEL[x.category],enemyName:ENEMY[x.category],status:x.status,attentionFlag:x.attentionFlag,
  amount:x.raw.amount,known:x.raw.known,applicability:x.raw.applicability,
  comparable:x.comparable,comparisonDifference:x.comparisonDifference,
  comparator:comparatorMetaV3(x.category,x.comparable,x.benchmarkMeta),
  diagnosisState:x.engine?.state??null,reasonCodes:x.engine?.reasonCodes??[],needsReview:x.engine?.needsReview??false,
  battleBasis:x.battleBasis,encounterStrength:encounterStrengthV31(x),confirmedSaving:x.engine?.confirmedSaving??null,reducible:x.reducible,priority:x.priority,
  appraisal:x.appraisal,appraisalSummary:appraisalSummary(x),evidenceLabel:evidenceLabel(x),referenceDetail:referenceDetail(x),reason:reason(x),nextCheck:nextCheck(x),comparisonContext:comparisonContext(x,args.profile??null,args.annualIncomeBand)
 }));
 const battle=rows.filter(x=>x.status==='battle').sort((a,b)=>(b.battleBasis==='confirmed'?2:1)-(a.battleBasis==='confirmed'?2:1)||(b.comparisonDifference??0)-(a.comparisonDifference??0)).slice(0,3);
 const reviewPriority=(x:(typeof rows)[number])=>{
  // Review items are not confirmed savings. Explicit user answers outrank benchmark-only signals.
  // attentionFlag is secondary; a positive benchmark gap is only a tie-breaker and never a saving.
  const explicit=x.appraisalSummary?3:x.attentionFlag?2:1;
  const gap=x.comparisonDifference!==null&&x.comparisonDifference>0?x.comparisonDifference:0;
  return explicit*1_000_000+gap;
 };
 const review=rows.filter(x=>x.status==='review').sort((a,b)=>reviewPriority(b)-reviewPriority(a));
 const encounter=rows.filter(x=>x.encounterStrength==='strong').sort((a,b)=>reviewPriority(b)-reviewPriority(a)).slice(0,3);
 const secondaryReview=rows.filter(x=>x.encounterStrength==='medium').sort((a,b)=>reviewPriority(b)-reviewPriority(a));
 const firstQuest=battle[0]??encounter[0]??secondaryReview[0]??review[0]??null;
 const benchmarkRows=rows.filter(x=>x.known&&x.applicability==='applicable'&&x.amount!==null&&x.comparable!==null&&(x.comparator.kind==='statistical_comparator'||x.comparator.kind==='direct_benchmark'));
 const benchmarkUserMonthly=benchmarkRows.reduce((n,x)=>n+(x.amount??0),0);
 const benchmarkReferenceMonthly=benchmarkRows.reduce((n,x)=>n+(x.comparable??0),0);
 const benchmarkDeltaMonthly=benchmarkUserMonthly-benchmarkReferenceMonthly;
 const benchmarkSummary={available:benchmarkRows.length>0,scope:'comparable_categories' as const,label:'比較可能な項目の基準との差',userMonthly:benchmarkUserMonthly,benchmarkMonthly:benchmarkReferenceMonthly,deltaMonthly:benchmarkDeltaMonthly,deltaAnnual:benchmarkDeltaMonthly*12,categoryCount:benchmarkRows.length,excludedCount:rows.filter(x=>x.known&&x.applicability==='applicable').length-benchmarkRows.length,categories:benchmarkRows.map(x=>x.category)};
 return {version:RESULT_VM_VERSION,diagnosisId:args.diagnosisId,type:args.type,toneMode:args.toneMode,profile:args.profile??null,annualIncomeBand:args.annualIncomeBand,counts,benchmarkSummary,improvement:{monthly:args.monthlyImprovement,annual:args.monthlyImprovement*12,fiveYear:args.monthlyImprovement*60},battleTargets:battle,encounterTargets:encounter,secondaryReviewTargets:secondaryReview,rows,firstQuest,share:{includeFinancialAmounts:false,includeProfile:false,modeBadge:args.toneMode}};
}
