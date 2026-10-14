/**
 * Chapter1 × Chapter2 answer-check DISCOVERY EXPERIMENT.
 * NOT a frozen diagnostic rule and NOT a statistical validity/correlation claim.
 * C1: already-validated summarized handoff; C2: self-reported household appraisals.
 * Neither spending amounts nor JOB code predict behavioral traits.
 */
export const CATEGORY_IDS=Object.freeze(['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment']);
const STYLES=new Set(['DRIVE','ENJOY','SECURE','OPTIMIZE']);
const STATUS=new Set(['cut','optimize','protect','inspect','ok','na','review']);
const positive=new Set(['satisfied','verySatisfied']);
const negative=new Set(['waste','inertia']);
// Preserve the choices the participant actually saw, never collapse a
// mild review wish and an emphatic one into the same self-reported quote.
const SAT_ANSWER_LABELS={
 waste:'かなり見直したい',inertia:'少し見直したい',
 satisfied:'今くらいでいい',verySatisfied:'大切なので守りたい'
};
const SELF_ANSWER_LABELS={purpose:'目的は明確',results:'成果につながってる'};
const EMPTY='回答を重ね合わせるだけでは、今は確かな共通点を見つけられませんでした。第1章のタイプが間違いという意味でもありません。';
const unavailable=(reason)=>({status:'unavailable',reason,headline:'答え合わせはまだできません',cards:[],coverage:{reviewedCategoryCount:0,directMatchRulesApplied:0,axesVerified:0},cannotInfer:['性格の一致率','衝動買いの有無','金融商品の適合性']});
const recognized=(x)=>typeof x==='string'&&x.length>0;
const human=(kind,category,title,body,reason)=>({kind,category,title,body,evidence:{chapter1:'本人が回答したお金の価値観（主STYLE）',chapter2:reason},confidence:'self_report_context_only',financialResult:false});
/** Descriptive spending only; cannot verify traits or imply a savings opportunity. */
const moneySnapshot=(row,unused=false)=>{
 const original=unused?row?.appraisal?.subUnusedAmount:row?.amount;
 if(!row||row.known!==true||row.applicability==='na'||typeof original!=='number'||!Number.isFinite(original)||original<=0)return null;
 const monthlyYen=Math.round(original);
 if(!Number.isSafeInteger(monthlyYen)||monthlyYen<=0||!Number.isSafeInteger(monthlyYen*12))return null;
 return {kind:unused?'declared_unused_contract':'declared_monthly_spend',monthlyYen,annualYen:monthlyYen*12,
  label:unused?'本人が未使用と回答した契約分':(row.diagnosisAmountLabel||'入力した月額支出'),
  scope:unused?'contract_self_report':(row.diagnosisAmountLabel||'diagnosis_input'),
  caveat:unused?'本人申告の未使用契約分。解約・節約実行後の金額ではありません。':'現在の月額を単純に12倍した参考値。節約額や将来の支出予測ではありません。',
  notSavings:true,
 };};

export function assessChapter12AnswerCheck({chapter1,chapter2}={}){
 if(!chapter1||!chapter2)return unavailable('NO_JOINED_DATA');
 if(chapter1.version!=='MUDAGIRI_MONEY_TYPE_HANDOFF_V1')return unavailable('INVALID_CH1_VERSION');
 if(!recognized(chapter1.anonymousUserId)||chapter1.anonymousUserId!==chapter2.anonymousUserId)return unavailable('IDENTITY_MISMATCH');
 if(!recognized(chapter1.sessionId)||!recognized(chapter2.diagnosisId))return unavailable('MISSING_SESSION');
 if(!STYLES.has(chapter1.primaryStyle))return unavailable('INVALID_CH1_STYLE');
 if(!Array.isArray(chapter2.rows))return unavailable('NO_CATEGORY_ROWS');
 const byCat=new Map();
 for(const x of chapter2.rows){
  if(!x||!CATEGORY_IDS.includes(x.category)||byCat.has(x.category))return unavailable('INVALID_OR_DUPLICATE_CATEGORY');
  if(!STATUS.has(x.v5Status))return unavailable('INVALID_STATUS');
  byCat.set(x.category,x);
 }
 if(byCat.size!==CATEGORY_IDS.length)return unavailable('INCOMPLETE_DIAGNOSIS');
 const cards=[],add=(kind,category,title,body,reason)=>cards.push(human(kind,category,title,body,reason));
 const get=(c)=>{const r=byCat.get(c);return r&&r.applicability!=='na'&&r.applicability!=='notApplicable'&&r.known===true&&typeof r.amount==='number'&&Number.isFinite(r.amount)&&r.amount>0?r:null;};
 const fun=get('fun');
 if(chapter1.primaryStyle==='ENJOY'&&fun){
  if(positive.has(fun.appraisal?.satisfaction)&&fun.v5Status==='protect')
   add('resonance','fun','楽しさを大切にする。実際の娯楽費も「守る」判定だった。',
    `第1章では「楽しさ」を重視。第2章では「${SAT_ANSWER_LABELS[fun.appraisal.satisfaction]}」と回答し、診断では「守る」と判定されました。これは本人の回答を重ねたヒントで、性格の的中を証明したものではありません。`,
    `娯楽・趣味：本人が「${SAT_ANSWER_LABELS[fun.appraisal.satisfaction]}」を選択／診断で「守る」判定`);
  else if(negative.has(fun.appraisal?.satisfaction)&&['review','inspect','optimize','cut'].includes(fun.v5Status))
   add('question','fun','楽しさは大事。でも今の娯楽費には見直す余地がありそう。',
    `第1章では「楽しさ」を大切にすると回答。第2章では娯楽・趣味を「${SAT_ANSWER_LABELS[fun.appraisal.satisfaction]}」と選択しました。性格の矛盾や浪費の証明ではなく、満足できる使い方を考えるヒントです。`,
    `娯楽・趣味：本人が「${SAT_ANSWER_LABELS[fun.appraisal.satisfaction]}」を選択`);
 }
 const self=get('selfDevelopment');
 if(chapter1.primaryStyle==='DRIVE'&&self&&self.v5Status==='protect'&&['purpose','results'].includes(self.appraisal?.selfDevelopmentValue)){
   add('resonance','selfDevelopment','前に進むための自己投資。家計では「守る」判定。',
     `第1章では「前進」を重視。第2章では自己投資について「${SELF_ANSWER_LABELS[self.appraisal.selfDevelopmentValue]}」と選択し、診断では「守る」と判定されました。実際の成果や投資適性を証明するものではありません。`,
     `自己投資：本人が「${SELF_ANSWER_LABELS[self.appraisal.selfDevelopmentValue]}」を選択／診断で「守る」判定`);
 }
 // DRIVE: self-reported aim and self-reported "inertia" may suggest a question, not a measured contradiction.
 if(chapter1.primaryStyle==='DRIVE'&&self&&self.appraisal?.selfDevelopmentValue==='inertia'&&self.v5Status==='cut'){
  add('question','selfDevelopment','前に進みたい。いまの自己投資は惰性になっていない？',
   '第1章は成長や前進を重視。第2章では自己投資を「惰性」と答えました。人格の矛盾でも浪費額の証明でもありません。続けるものと見直すものを本人が決めるための手がかりです。',
   '自己投資：本人が惰性と回答＋見直し判定');
 }
 // Insurance coverage awareness is delivered to all styles by CoverageAwarenessCard.
 // It is intentionally NOT used as an evidence of personality accuracy.
 const sub=get('sub');
 if(chapter1.primaryStyle==='OPTIMIZE'&&sub
  &&sub.appraisal?.subCancellationConfirmed===true
  &&Number.isFinite(sub.appraisal?.subUnusedAmount)&&sub.appraisal.subUnusedAmount>0
  &&Number.isFinite(sub.aAmount)&&sub.aAmount>0
  &&sub.v5Status==='cut'){
   add('question','sub','納得して使いたい。でも未使用の契約が残っていた。','第1章は「納得できるお金の使い方」を大切にする価値観。第2章では未使用かつ解約可能と回答した契約を確認しました。性格との不一致ではなく、次に確認できる具体的な契約です。まだ解約や節約を実行した意味ではありません。','サブスク：未使用額＋解約可能の自己申告＋確認済み改善機会');
 }
 // Strict: neither awareness nor intuition/time preference is independently
 // observed by a one-off list of household spending amounts.
 // An optional action contrast, never a personality match or available cash.
 // Show only when this same person has BOTH an independently protected enjoyment
 // expense and a separately confirmed, unused+cancellable subscription opportunity.
 let protectedVsReview=null;
 const subCandidate=byCat.get('sub');
 const unused=subCandidate?.appraisal?.subUnusedAmount;
 const primaryStyle=chapter1.primaryStyle;
 // Explicit value + protected status; OPTIMIZE comparison is an action lens,
 // not a claim that preference predicts the user's entertainment expenses.
 const protectedCategory=primaryStyle==='DRIVE'?'selfDevelopment':'fun';
 const protectedRow=byCat.get(protectedCategory);
 const protectedValued=primaryStyle==='DRIVE'
   ?(['purpose','results'].includes(protectedRow?.appraisal?.selfDevelopmentValue)&&
       cards.some(c=>c.category==='selfDevelopment'&&c.kind==='resonance'))
   :(positive.has(protectedRow?.appraisal?.satisfaction)&&
     (primaryStyle==='ENJOY'?cards.some(c=>c.category==='fun'&&c.kind==='resonance'):primaryStyle==='OPTIMIZE'));
 const reviewValid=Number.isSafeInteger(unused)&&unused>0&&
  Number.isSafeInteger(subCandidate?.amount)&&unused<=subCandidate.amount&&
  Number.isSafeInteger(subCandidate?.aAmount)&&subCandidate.aAmount>0&&subCandidate.aAmount<=unused;
 if(['ENJOY','DRIVE','OPTIMIZE'].includes(primaryStyle)&&protectedValued&&
  protectedRow?.known===true&&protectedRow?.applicability!=='na'&&protectedRow?.applicability!=='notApplicable'&&
  protectedRow?.v5Status==='protect'&&Number.isSafeInteger(protectedRow?.amount)&&protectedRow.amount>0&&
  subCandidate?.known===true&&subCandidate?.applicability!=='na'&&subCandidate?.applicability!=='notApplicable'&&
  subCandidate?.v5Status==='cut'&&subCandidate.appraisal?.subCancellationConfirmed===true&&reviewValid){
   protectedVsReview={
    kind:'protect_vs_confirmed_review',
    primaryStyle,
    protect:{category:protectedCategory,label:protectedCategory==='fun'?'娯楽・趣味':'自己投資',monthlyYen:protectedRow.amount,source:'第2章の入力支出＋本人の満足・目的と守る判定',isSaving:false},
    review:{category:'sub',label:'未使用サブスク',monthlyYen:subCandidate.aAmount,source:'本人申告の未使用・解約可能＋確認済み改善機会',isSavingRealized:false},
    nextStep:(protectedCategory==='fun'?'娯楽・趣味':'自己投資')+'は削る前に、未使用サブスクの停止・解約条件を確認する',
    caveat:'左は守りたい支出、右はまだ実行していない確認済み改善機会。2つを差し引いたり、右を貯蓄済みのお金として扱ったりしません。',
    privacy:'private_only',
   };
 }
 const reviewed=byCat.size;
 const limited=cards.slice(0,2).map(card=>({...card,
  monthlySnapshot:moneySnapshot(byCat.get(card.category),card.category==='sub')
 }));
 return {status:limited.length?'context_found':'no_supported_link',
  headline:limited.length?'お金の価値観と家計の回答、重ねてみたら…':'第1章と第2章の答え合わせ',
  cards:limited,
  protectedVsReview,
  explanation:limited.length?'今回の共通点・気づきはどちらも本人の回答に基づく「ヒント」。独立に測定した行動証拠でも、性格診断の正解判定でもありません。':EMPTY,
  coverage:{reviewedCategoryCount:reviewed,directMatchRulesApplied:limited.length,axesVerified:0},
  cannotInfer:['時間軸の正しさ','直感／熟考の正しさ','お金の把握頻度の正しさ','全12カテゴリとの一致率','節約の実行','投資適性','資金不足'],
  nextStep:protectedVsReview?protectedVsReview.nextStep:
    limited[0]?.category==='insurance'?'保障目的・対象・最後の確認時期を確認する（加入や解約を決める前に）':
    limited[0]?.category==='sub'?'契約一覧で、未使用分の停止・解約条件を確認する':
    limited[0]?.category==='selfDevelopment'?
      (limited[0].kind==='question'?'惰性になっている自己投資と、続けたいものを一つずつ分ける':'続けたい自己投資と、その目的を一つ確認する'):
    limited[0]?.kind==='question'?'使ってよかった娯楽費と、見直したいものを一つずつ分ける':
    limited[0]?.kind==='resonance'?'この楽しみを来年も守りたいか、今の優先順位を確認する':
    '自分が大切にしたい支出と、今の支出を一つ見比べる',
  sensitivity:'private_only',shareAllowed:false,
  source:'same-person-self-report',score:null};
}
