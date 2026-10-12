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
 const get=(c)=>{const r=byCat.get(c);return r&&r.applicability!=='na'&&r.known===true&&typeof r.amount==='number'&&Number.isFinite(r.amount)&&r.amount>0?r:null;};
 const fun=get('fun');
 if(chapter1.primaryStyle==='ENJOY'&&fun){
  if(positive.has(fun.appraisal?.satisfaction)&&fun.v5Status==='protect')
   add('resonance','fun','楽しみは削らない。家計でも「守る」と答えていた。','第1章では楽しさを重視。第2章では娯楽・趣味の支出に満足し、守りたいと答えました。両方とも本人の回答で、支出額から性格を証明したわけではありません。','娯楽・趣味：本人の満足度回答＋守る判定');
  else if(negative.has(fun.appraisal?.satisfaction))
   add('question','fun','楽しさは大事。でも、この娯楽費は見直したい。','第1章で重視した「楽しさ」と、第2章で「見直したい」と答えた娯楽・趣味の支出。矛盾や浪費の証明ではなく、満足できる使い方を探す手がかりです。','娯楽・趣味：本人が見直し意向を回答');
 }
 const self=get('selfDevelopment');
 if(chapter1.primaryStyle==='DRIVE'&&self&&self.v5Status==='protect'&&['purpose','results'].includes(self.appraisal?.selfDevelopmentValue)){
   add('resonance','selfDevelopment','前に進むための自己投資。家計でも「守る」を選んだ。','第1章では前進やできることを増やす価値を重視。第2章では自己投資に目的・成果があると答え、守る判定になりました。実際の成果や投資適性を証明するものではありません。','自己投資：目的・成果についての本人回答＋守る判定');
 }
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
 const reviewed=byCat.size;
 const limited=cards.slice(0,2).map(card=>({...card,
  monthlySnapshot:moneySnapshot(byCat.get(card.category),card.category==='sub')
 }));
 return {status:limited.length?'context_found':'no_supported_link',
  headline:limited.length?'お金の価値観と家計の回答、重ねてみたら…':'第1章と第2章の答え合わせ',
  cards:limited,
  explanation:limited.length?'今回の共通点・気づきはどちらも本人の回答に基づく「ヒント」。独立に測定した行動証拠でも、性格診断の正解判定でもありません。':EMPTY,
  coverage:{reviewedCategoryCount:reviewed,directMatchRulesApplied:limited.length,axesVerified:0},
  cannotInfer:['時間軸の正しさ','直感／熟考の正しさ','お金の把握頻度の正しさ','全12カテゴリとの一致率','節約の実行','投資適性','資金不足'],
  nextStep:limited[0]?.category==='sub'?'契約一覧で、未使用分の停止・解約条件を確認する':
    limited[0]?.category==='selfDevelopment'?'続けたい自己投資と、その目的を一つ確認する':
    limited[0]?.kind==='question'?'使ってよかった娯楽費と、見直したいものを一つずつ分ける':
    limited[0]?.kind==='resonance'?'この楽しみを来年も守りたいか、今の優先順位を確認する':
    '自分が大切にしたい支出と、今の支出を一つ見比べる',
  sensitivity:'private_only',shareAllowed:false,
  source:'same-person-self-report',score:null};
}
