import React,{useEffect,useRef,useState} from 'react';
import {buildIncomeBurdenLensV1} from './income-burden-lens-v1';
import {twoReferenceLensV1} from './chapter2-two-reference-lens-v1';
import {workerBurdenReferenceForProfileV1,type WorkerBurdenCategory} from './income-class-worker-burden-rate-v1';
import {resolve2024SingleWorkerPeerBurdenV1,resolve2024MultiWorkerPeerBurdenV1,resolve2024DeclaredWorkerPeerV1,resolve2024HighMultiWorkerPeerBurdenV1,ageBandForObserved2024V1,type JointBurdenExpense,type HighGrossBand2024V1} from './age-income-joint-burden-gate-v1';
import {resolveFoodIncomeReferenceForProfileV1,singleFoodReferenceForExplicitAnnualBracketV1,SINGLE_INCOME_FOOD_OPTIONS,type SingleIncomeFoodOptionV1} from './income-class-food-reference-v1';
import {energyIncomeReferenceForProfileV1,singleEnergyReferenceForExplicitAnnualBracketV1} from './income-class-energy-reference-v1';
import {dailyIncomeReferenceForProfileV1,singleDailyReferenceForExplicitAnnualBracketV1} from './income-class-daily-reference-v1';
import {ENEMY_ASSETS} from './enemy-assets-v1';
import {CoinPouch,TreasureChest} from './Chapter2V31RewardIcons';
import {V31CSS} from './chapter2-v31-rpg-css';
import {V32CSS} from './chapter2-v32-rpg-css';
import {V32READABILITYCSS} from './chapter2-v32-readability-css';
import {V19SCENECSS} from './chapter2-v19-scene-css';
import {V20BRIDGECSS} from './chapter2-v20-bridge-css';
import {V21GATEBCSS} from './chapter2-v21-gateb-css';
import {V22COMPARISONCSS} from './chapter2-v22-comparison-css';
import {JOB_CHARACTER_ASSETS} from './src/features/money-personality/job-character-assets-v1';
import {chapter2V2ShareText,chapter2V2ReferralUrl,chapter2V2SignedComparisonYen,type Chapter1HandoffV1} from './chapter2-v2-contract';
import Chapter12AnswerCheckCard from './Chapter12AnswerCheckCard';
import CoverageAwarenessCard from './CoverageAwarenessCard';
import {chapter2RecognitionV1} from './chapter2-recognition-v1';
import {validatedChapter1LinkageV1} from './chapter1-linkage-v1';
import {coverageConsultHandoff} from './scripts/coverage-consult-handoff-v1.mjs';

type Props={
 vm:any;
 chapter1?:Chapter1HandoffV1|null;
 answerCheckEnabled?:boolean;
 answerCheckAnonymousUserId?:string|null;
 answerCheckDemo?:boolean;
 pilotNoExternalActions?:boolean;
 /** Isolated QA-only interception of coverage handoff; all other preview outbound remains blocked. */
 coverageDryRun?:boolean;
 onLine?:(x:any)=>void;
 onEvent?:(name:string,data?:Record<string,unknown>)=>void;
 onRestart?:()=>void;
 onBeforeExternal?:()=>void;
};

const ART={
 hero:'./assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
 rewardHall:'./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp',
 result:'./assets/mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp',
 guide:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
 quest:'./assets/battle1/MUDAGIRI_BATTLE_SWING.png'
};
const TALK_POSES={
 check:'./assets/mudagiri/poses/v1/MUDAGIRI_POSE_20_CHECK.webp',
 explain:'./assets/mudagiri/poses/v1/MUDAGIRI_POSE_04_EXPLAIN.webp',
 proud:'./assets/mudagiri/poses/v1/MUDAGIRI_POSE_12_PROUD.webp',
 guide:'./assets/mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp',
 share:'./assets/mudagiri/poses/v1/MUDAGIRI_POSE_24_SHARE.webp',
} as const;
// Inherit Chapter 1's icon + speech pattern, retain Chapter 2 RPG palette.
function MudagiriBeat({pose,line}:{pose:keyof typeof TALK_POSES;line:string}){
 return <aside className="c2v32-mudagiri-beat" data-section="MUDAGIRI_TALK">
  <img src={TALK_POSES[pose]} alt="ムダギリくん" loading="lazy"/>
  <div className="c2v32-mudagiri-talk"><small>ムダギリくん</small><p>{line}</p></div>
 </aside>;
}
const JOB_STYLE_COLORS:Record<string,string>={DRIVE:'#ff625f',ENJOY:'#ff86c8',SECURE:'#62d9e8',OPTIMIZE:'#7bdc91'};
const JOB_STYLE_LABELS:Record<string,string>={DRIVE:'前進',ENJOY:'楽しさ',SECURE:'安心',OPTIMIZE:'納得'};

const GOALS=[
 ['home','住まい'],['family','家族・教育'],['travel','旅行・趣味'],['invest','資産形成'],
 ['challenge','独立・挑戦'],['safety','もしもの備え'],['retirement','老後'],['undecided','まだ決めていない']
] as const;
const STATUS:Record<string,{name:string;mark:string;description:string}>={
 cut:{name:'斬る',mark:'⚔️',description:'回答から停止・削減を確認できた項目'},
 optimize:{name:'整える',mark:'✨',description:'使う価値を残して内訳を確認する項目'},
 protect:{name:'守る',mark:'🛡️',description:'大切な支出として維持する項目'},
 inspect:{name:'見極める',mark:'🔎',description:'詳細が分かるまで削減額を決めつけない項目'},
 ok:{name:'そのままでOK',mark:'○',description:'今は特に優先する変更がない項目'},
 na:{name:'対象外',mark:'—',description:'この条件では比較対象にならない項目'},
 review:{name:'確認する',mark:'🔎',description:'詳細確認が必要な項目'}
};
const yen=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.max(0,Math.round(n||0)));
const money=(n:number)=>'¥'+yen(n);
const nonnegative=(n:unknown)=>Math.max(0,Number.isFinite(Number(n))?Number(n):0);
const handoffCode=(id:string)=>'MG-'+(String(id||'').replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(-12)||'UNKNOWN');
/** A conditional review clue, not proof of waste or realized savings. */
function candidateReason(x:any):string{
 if(x.cMethod==='mobile')return x.appraisal?.mobileCarrier==='major'
  ?'大手のスマホ1回線で、月6,000円を超える部分を参考上限として抽出（対象額は月20,000円まで）'
  :x.appraisal?.mobileCarrier==='mvno'
   ?'格安SIMのスマホ1回線で、月3,000円を超える部分を参考上限として抽出（対象額は月10,000円まで）'
   :'スマホ1回線の契約区分別の確認基準額を超える部分を、参考候補として抽出';
 if(x.cMethod==='wide')return '比較できる目安の約1.15倍を超えた支出の一部を、確認候補として抽出';
 if(x.cMethod==='standard')return '比較できる目安の約1.10倍を超えた支出の一部を、確認候補として抽出';
 return '入力した支出について、確認が必要な候補。比較条件の詳細は敵図鑑で確認';
}


/** Comparison is not savings. Null/AUDIT references MUST NOT become invented averages. */
function comparisonInputAmount(x:any):number|null{
 // An explicitly unavailable comparison scope must never fall back to the
 // diagnosis amount. Legacy synthetic fixtures simply omit this field.
 const a=Object.prototype.hasOwnProperty.call(x,'comparisonAmount')?x.comparisonAmount:x.amount;
 return a===null||a===undefined||!Number.isFinite(Number(a))?null:Number(a);
}
/** V5's display-only reference can exist even when the V4 comparisonQuality
 * was 'none'. V5 keeps the V4 flags unchanged, so a result screen must read
 * the V5 primary lens explicitly, rather than hide an available reference. */
function comparisonPrimaryV5(x:any):{monthly:number;criteria:string[];sourceVersion:string;label:string;note:string}|null{
 if(!['insurance','rent','car'].includes(String(x?.category))||x?.known!==true
  ||(x?.applicability==='na'||x?.applicability==='notApplicable')||x?.amount===null||x?.amount===undefined
  ||!Number.isFinite(Number(x.amount)))return null;
 const ref=x?.v5ReferencePrimary;
 if(!ref||ref.monthly===null||ref.monthly===undefined
   ||!Number.isFinite(Number(ref.monthly))||Number(ref.monthly)<=0)return null;
 return ref;
}
function comparisonAvailable(x:any):boolean{
 if(comparisonPrimaryV5(x))return true;
 return x?.applicability!=='na'&&x?.applicability!=='notApplicable'&&x?.comparisonQuality!=='none'
  &&x?.comparable!==null&&x?.comparable!==undefined
  &&Number.isFinite(Number(x.comparable))&&Number(x.comparable)>0
  &&x?.known===true&&comparisonInputAmount(x)!==null;
}
function comparisonReferenceAmount(x:any):number|null{
 const ref=comparisonPrimaryV5(x);
 return ref?Number(ref.monthly):comparisonAvailable(x)?Number(x.comparable):null;
}
function comparisonReferenceType(x:any):string{
 if(comparisonPrimaryV5(x))return '属性に合わせた参考値';
 // Published household-size data and separate income tables were multiplied in
 // the V2 frozen runtime. Never label the derived cell as a direct official mean.
 if(x?.comparisonModelEstimate===true)return '統計を組み合わせた推計値';
 if(x?.comparisonMethodologyModelEstimate===true)return '属性等を使った推計値';
 return x?.comparisonQuality==='reference'?'参考値':'近い条件との比較';
}
function comparisonTargetAmount(x:any):number|null{
 // Mortgage references describe a whole property's repayment. A personal
 // contribution is not the matched comparison amount in a shared household.
 if(comparisonPrimaryV5(x)&&x?.category==='rent')return comparisonInputAmount(x);
 return comparisonPrimaryV5(x)?Number(x.amount):comparisonInputAmount(x);
}
function comparisonBasis(x:any):string{
 const raw=comparisonPrimaryV5(x)?.criteria??x?.comparisonContext?.criteria;
 const criteria=Array.isArray(raw)?raw.filter((v:unknown)=>typeof v==='string'&&v.trim().length>0):[];
 // The beauty tables have different populations: single sex×age,
 // single combined-age, and multi-household age MODEL. Do not collapse them
 // into a generic "same household" claim.
 if(x?.category==='beautyFashion'&&comparisonAvailable(x)){
  const source=String(x?.comparisonSourceVersion??'');
  if(source.includes('MULTI_AGE_MODEL'))criteria.push('年代別の参考モデル（世帯人数別ではない）');
  else if(source.includes('SINGLE_SEX_AGE'))criteria.push('性別と年代を組み合わせた比較');
  else if(source.includes('SINGLE_'))criteria.push('単身・年代別の比較');
 }
 return criteria.length?criteria.join('・'):(typeof x?.comparisonAmountLabel==='string'&&x.comparisonAmountLabel?x.comparisonAmountLabel+'（詳しい属性条件は未表示）':'詳細な属性条件は未表示');
}
function comparisonReference(x:any):string{
 const primary=comparisonPrimaryV5(x);
 if(primary){
  if(primary.sourceVersion.startsWith('JILI_'))return '生命保険文化センターの調査（'+(primary.sourceVersion.includes('2025')?'2025年':'2024年')+'）';
  if(primary.sourceVersion.includes('STAT_GO_JP_FIES'))return '家計調査（2025年）・住宅ローン返済世帯';
  if(primary.sourceVersion.includes('SONY_SONPO'))return '全国カーライフ実態調査（2025年）';
  return primary.label;
 }
 const source=String(x?.comparisonSourceVersion??x?.comparisonContext?.sourceVersion??'');
 if(source.includes('HOUSING'))return '住宅・土地統計調査（2023年）';
 if(/UTILITY|FOOD|DAILY|ENTERTAINMENT|BEAUTY_FASHION/.test(source))return '家計調査（2025年）をもとにした参考目安';
 if(source.includes('INSURANCE'))return '保険の参照調査（属性別）';
 if(source.includes('CHILD_EDUCATION'))return '子どもの教育段階別参考値';
 if(x?.evidenceLabel&&typeof x.evidenceLabel==='string')return x.evidenceLabel;
 return 'カテゴリ別の参考条件';
}
function numericOrDash(x:any):string{
 return x?.known===true&&Number.isFinite(Number(x?.amount))&&x?.amount!==null?money(Number(x.amount)):'未入力・対象外';
}
/** Status- and category-based guidance instead of shouting "no benchmark".
 * No numeric reference is synthesized for AUDIT-only categories. */
function nonNumericBasis(x:any):{title:string;detail:string}{
 if(x?.v5Status==='na'||(x?.applicability==='na'||x?.applicability==='notApplicable'))
  return {title:'今回は対象外',detail:'診断条件に当てはまらないため、比較をしていません。'};
 if(x?.known!==true||x?.amount===null||x?.amount===undefined)
  return {title:'入力内容を確認',detail:'金額を確認できると、判定を詳しく見られるよ。'};
 switch(x?.category){
  case 'sub':return {title:'利用状況で判断',detail:'使っていない契約・重複・解約可能かどうかを確認するよ。'};
  case 'mobile':return {title:'契約プランで判断',detail:x.cMethod==='mobile'?candidateReason(x):'回線数・通信会社・料金プランを確認するよ。'};
  case 'selfDevelopment':return {title:'使う目的で判断',detail:'学びや経験の目的・満足度を確認するよ。'};
  case 'insurance':return {title:'保障の中身を確認',detail:'保険料だけでなく、必要な保障・給付条件を確認するよ。'};
  case 'car':return {title:'維持費と使い方を確認',detail:'購入費と維持費の範囲・車の利用状況を確認するよ。'};
  case 'rent':return {title:'住まいの条件で判断',detail:'住居形態や契約内容に合わせて確認するよ。'};
  case 'childEducation':return {title:'学校段階に合わせて確認',detail:'子どもの学校段階・公私立などを確認するよ。'};
  case 'food':return {title:'食費の使い方で判断',detail:'外食・自炊の内訳と、使い方への満足度を確かめよう。'};
  case 'energy':return {title:'季節・人数で判断',detail:'季節・住まい・世帯人数の条件を確認しよう。'};
  case 'daily':return {title:'日用品の内訳で判断',detail:'普段使う消耗品と、一度きりの買い物を分けて確認しよう。'};
  case 'fun':return {title:'楽しさを大切に判断',detail:'使う価値や満足度を優先。好きなことを無理に減らさなくていい。'};
  case 'beautyFashion':return {title:'目的と満足度で判断',detail:'美容・服への満足度と、日用品との重複を確かめよう。'};
  default:return {title:'使い方で判断',detail:'本人の回答と費目の内訳から判断しよう。'};
 }
}
function noBenchmarkReason(x:any):string{return nonNumericBasis(x).detail;}

function loadImage(url:string):Promise<HTMLImageElement|null>{
 return new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=url;
 });
}

/** Social card contains only quest completion and no amounts, locations, incomes or type claim. */
async function createQuestShareCard(jobCode?:string):Promise<File|null>{
 // An intentionally shared JOB is the only personalized data in this image.
 const job=jobCode&&Object.prototype.hasOwnProperty.call(JOB_CHARACTER_ASSETS,jobCode)
  ?JOB_CHARACTER_ASSETS[jobCode as keyof typeof JOB_CHARACTER_ASSETS]:null;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.fillStyle='#0e2434';ctx.fillRect(0,0,1080,1350);
 const world=await loadImage(ART.rewardHall);
 if(world?.naturalWidth&&world?.naturalHeight){
  const scale=Math.max(1080/world.naturalWidth,1350/world.naturalHeight);
  const cw=1080/scale,ch=1350/scale;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(world,(world.naturalWidth-cw)/2,(world.naturalHeight-ch)/2,cw,ch,0,0,1080,1350);
  const shade=ctx.createLinearGradient(0,0,0,1350);
  shade.addColorStop(0,'rgba(0,21,28,.80)');
  shade.addColorStop(.45,'rgba(0,26,31,.52)');
  shade.addColorStop(1,'rgba(0,18,25,.92)');
  ctx.fillStyle=shade;ctx.fillRect(0,0,1080,1350);
 }
 ctx.fillStyle='#f3cd65';ctx.fillRect(42,42,996,7);ctx.fillRect(42,1301,996,7);
 ctx.textAlign='center';
 ctx.fillStyle='#ffe9aa';ctx.font='bold 40px sans-serif';ctx.fillText('ムダギリ診断',540,134);
 ctx.fillStyle='#ffffff';ctx.font='bold 75px sans-serif';ctx.fillText('家計クエスト',540,250);
 ctx.fillText('完全クリア！',540,340);
 const [img,mascot]=await Promise.all([loadImage(job?.file||ART.result),job?loadImage(ART.result):Promise.resolve(null)]);
 if(img&&img.naturalWidth&&img.naturalHeight){
  const sc=Math.min(540/img.naturalWidth,530/img.naturalHeight);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,540-img.naturalWidth*sc/2,440,img.naturalWidth*sc,img.naturalHeight*sc);
 }
 if(mascot&&mascot.naturalWidth&&mascot.naturalHeight){
  const sc=Math.min(195/mascot.naturalWidth,200/mascot.naturalHeight);
  ctx.drawImage(mascot,850-mascot.naturalWidth*sc/2,785,mascot.naturalWidth*sc,mascot.naturalHeight*sc);
 }
 ctx.fillStyle='#ffe9aa';ctx.font=job?'bold 53px sans-serif':'bold 52px sans-serif';
 ctx.fillText(job?'冒険者：'+job.name:'12カテゴリ鑑定完了',540,1047);
 ctx.fillStyle='#d7e3eb';ctx.font='bold 28px sans-serif';
 ctx.fillText(job?'12カテゴリ鑑定完了！好きなものは守って、ムダだけ斬る。':'好きなものは守って、ムダだけ斬る。',540,1128);
 ctx.fillStyle='#f4d76b';ctx.font='bold 29px sans-serif';ctx.fillText('あなたの家計にも、隠れた敵がいるかも。',540,1198);
 ctx.fillStyle='#9eb4c1';ctx.font='24px sans-serif';ctx.fillText('#ムダギリ診断  ｜  あなたも冒険してみる？',540,1240);
 const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/png'));
 return blob?new File([blob],'mudagiri-household-quest.png',{type:'image/png'}):null;
}

export default function ResultScreenChapter2V32({vm,chapter1,answerCheckEnabled=false,answerCheckAnonymousUserId=null,answerCheckDemo=false,pilotNoExternalActions=false,coverageDryRun=false,onLine,onEvent,onRestart,onBeforeExternal}:Props){
 const [opened,setOpened]=useState<string|null>(null);
 const [comparisonEvidence,setComparisonEvidence]=useState<string|null>(null);
 const [singleGrossBand,setSingleGrossBand]=useState<SingleIncomeFoodOptionV1|null>(null);
 const [multiHeadAgeConfirmed,setMultiHeadAgeConfirmed]=useState(false);
 const [multiHighGrossBand,setMultiHighGrossBand]=useState<HighGrossBand2024V1|null>(null);
 const [headWorkerConfirmed,setHeadWorkerConfirmed]=useState(false);
 const [goal,setGoal]=useState<string|null>(null);
 const [showLine,setShowLine]=useState(false);
 const [showCoverageLine,setShowCoverageLine]=useState(false);
 const [coverageCopyError,setCoverageCopyError]=useState('');
 const [shareStatus,setShareStatus]=useState('');
 const [shareBusy,setShareBusy]=useState(false);
 const [shareReady,setShareReady]=useState(false);
 const shareFile=useRef<File|null>(null);
 // Prepare the image before the user's tap: iOS/Web Share may reject a share
 // triggered only after an asynchronous image load loses transient activation.
 useEffect(()=>{
  let mounted=true;
  void createQuestShareCard(chapter1?.jobCode).then(file=>{
   if(!mounted)return;
   shareFile.current=file;
   setShareReady(Boolean(file));
  }).catch(()=>{if(mounted)setShareReady(false)});
  return ()=>{mounted=false};
 },[chapter1?.jobCode]);
 const rows=Array.isArray(vm.rows)?vm.rows:[];
 const incomeBurdenInput=buildIncomeBurdenLensV1(vm.profile,Array.isArray(vm.rows)?vm.rows:[]);
 const incomeBurden=incomeBurdenInput.available?incomeBurdenInput:null;
 // Official income-class view is separate from the frozen primary household-size
 // comparator. No synthetic income factor and never a savings estimate.
 const incomeFoodReference=vm.profile?.householdSize===1
  ?(singleGrossBand?singleFoodReferenceForExplicitAnnualBracketV1(singleGrossBand):null)
  :resolveFoodIncomeReferenceForProfileV1(vm.profile);
 const incomeEnergyReference=vm.profile?.householdSize===1
  ?(singleGrossBand?singleEnergyReferenceForExplicitAnnualBracketV1(singleGrossBand):null)
  :energyIncomeReferenceForProfileV1(vm.profile);
 const incomeDailyReference=vm.profile?.householdSize===1
  ?(singleGrossBand?singleDailyReferenceForExplicitAnnualBracketV1(singleGrossBand):null)
  :dailyIncomeReferenceForProfileV1(vm.profile);
 const workerBurdenReference=workerBurdenReferenceForProfileV1(vm.profile,singleGrossBand);
 const scopedWorkerCategory=(category:string)=>
  workerBurdenReference.available&&['food','energy','daily'].includes(category)
   ?workerBurdenReference.categories[category as WorkerBurdenCategory]??null:null;
 // Official age×gross-income comparison is age-of-HOUSEHOLD-HEAD for
 // multi-person households. The respondent must opt in only if their age
 // equals head's age; do not infer employment status or potential savings.
 const multiCohort=vm.profile?.householdSize>1&&vm.profile?.diagnosisScope==='household';
 const multiGrossBand=multiCohort?vm.profile?.annualIncomeBand??null:null;
 const rawProfileAge=typeof vm.profile?.age==='number'?vm.profile.age:null;
 const householdAnnualBandLabel=multiCohort&&multiGrossBand==='1000plus'
  ?({'1000_1249':'1,000～1,249万円','1250_1499':'1,250～1,499万円',
     '1500plus':'1,500万円以上'} as Record<string,string>)[String(multiHighGrossBand)]??'1,000万円以上（未細分化）'
  :multiCohort?({
   '500_599':'500～599万円','600_699':'600～699万円',
   '700_799':'700～799万円','800_999':'800～999万円',
  } as Record<string,string>)[String(multiGrossBand)]??null
   :singleGrossBand==='400_499'?'400～499万円':singleGrossBand==='500_599'?'500～599万円':null;
 const highPeerFor=(expense:JointBurdenExpense,headAgeConfirmed:boolean,headWorkerConfirmed:boolean)=>
  resolve2024HighMultiWorkerPeerBurdenV1(rawProfileAge,multiHighGrossBand,expense,headAgeConfirmed,headWorkerConfirmed);
 const highIncomePublishedReference=multiCohort&&multiGrossBand==='1000plus'&&multiHighGrossBand
  ?highPeerFor('food',true,true):null;
 const multiHasAvailablePeerSource=multiCohort&&(
  multiGrossBand==='1000plus'
   ?highIncomePublishedReference?.available===true
   :resolve2024MultiWorkerPeerBurdenV1(rawProfileAge,multiGrossBand,'food',true).available);
 const singleHasAvailablePeerSource=vm.profile?.householdSize===1&&
  resolve2024SingleWorkerPeerBurdenV1(rawProfileAge,singleGrossBand,'food').available;
 const peerRateFor=(expense:JointBurdenExpense)=>multiCohort&&multiGrossBand==='1000plus'
  ?highPeerFor(expense,multiHeadAgeConfirmed,headWorkerConfirmed)
  :resolve2024DeclaredWorkerPeerV1({
   household:multiCohort?'multi':'single',
   age:multiCohort?rawProfileAge:vm.profile?.householdSize===1?rawProfileAge:null,
   grossBand:multiCohort?multiGrossBand:singleGrossBand,
   expense,headAgeConfirmed:!multiCohort||multiHeadAgeConfirmed,
   headWorkerConfirmed,
  });
 const jointPeerReferenceByCategory:Record<JointBurdenExpense,ReturnType<typeof resolve2024SingleWorkerPeerBurdenV1>>={
  food:peerRateFor('food'),energy:peerRateFor('energy'),daily:peerRateFor('daily'),
 };
 const peerReferenceFor=(category:string)=>category==='food'||category==='energy'||category==='daily'
  ?jointPeerReferenceByCategory[category]:null;
 const anyJointRateAvailable=Object.values(jointPeerReferenceByCategory).some(x=>x.available);
 // Verified peer statistics are a separate comparison, NOT a verified monthly
 // savings opportunity (worker status and identical expense mix not confirmed).
 const independentReferenceClues:{category:string;label:string;gap:number;method:'verified_age_income'}[]=[];
 const independentReferenceGap=0;
 const counts=vm.v5Counts||{};
 const confirmed=nonnegative(vm.potential?.confirmedA);
 // Display and compound from the same yen-rounded upper bound; never imply
 // extra fractions of a yen can be saved when the monthly card shows integers.
 const reviewUpper=Math.round(nonnegative(vm.potential?.cUpper));
 const candidates=rows.filter((x:any)=>x&&nonnegative(x.cUpper)>0)
  .sort((a:any,b:any)=>nonnegative(b.cUpper)-nonnegative(a.cUpper));
 const primaryCandidate=candidates[0]??null;
 const next=primaryCandidate??vm.firstQuest??null;
 // All available categories (including protected and N/A) are shown without
 // labeling them as waste. Status keeps the original V5 meaning.
 const filtered=rows.filter((x:any)=>x&&x.category);
 const highlighted=filtered.filter((x:any)=>['cut','optimize','inspect'].includes(x.v5Status));
 const featured=(highlighted.length?highlighted:filtered).slice(0,3);
 const shown=filtered;
 // This optional lineage was validated against the anonymousUserId when it
 // was written by the diagnosis journey. Do not infer STYLE from spending.
 const verifiedChapter1Style=validatedChapter1LinkageV1(vm?.chapter1Link)?.chapter1StyleCode??null;
 const recognition=chapter2RecognitionV1(shown,verifiedChapter1Style);
 const selectedGoal=GOALS.find(g=>g[0]===goal)?.[1]??null;
 const jobAsset=chapter1&&Object.prototype.hasOwnProperty.call(JOB_CHARACTER_ASSETS,chapter1.jobCode)
  ?JOB_CHARACTER_ASSETS[chapter1.jobCode as keyof typeof JOB_CHARACTER_ASSETS]:null;
 const jobStyleName=chapter1?JOB_STYLE_LABELS[chapter1.primaryStyle]??'':null;
 const jobStyleColor=chapter1?JOB_STYLE_COLORS[chapter1.primaryStyle]??'#f5c84c':null;
 const continuityStyle=jobAsset?{'--c2-job-accent':jobAsset.accent,'--c2-style-accent':jobStyleColor} as React.CSSProperties:undefined;

 function jumpToSection(target:string){
  const el=document.querySelector('[data-section="'+target+'"]');
  if(el instanceof HTMLElement){
   el.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
 }
 function consultation(placement:'after_rewards'|'goal_quest'='after_rewards'){
  onEvent?.('chapter2_v2_consultation_cta_clicked',{placement,goal:goal??null,confirmedSavingAvailable:confirmed>0});
  onEvent?.('chapter2_v31_consultation_modal_opened',{placement,goal:goal??null});
  setShowLine(true);
 }
 function confirmConsultation(){
  if(pilotNoExternalActions){setShowLine(false);setShareStatus('調査用のサンプルです。予約やLINE連携は行われません。');return;}
  const code=handoffCode(vm.diagnosisId);
  onEvent?.('line_clicked',{placement:'consult_route',chapter:'household',typeCode:null});
  onEvent?.('chapter2_v31_consultation_line_outbound',{placement:'consult_route',goal:goal??null});
  onBeforeExternal?.();
  onLine?.({diagnosisId:vm.diagnosisId,firstQuest:next?.category??null,placement:'consult_route',
    handoffCode:code,goal:goal??null,consultPrimary:'lifeplan',consultSelectedTopic:'lifeplan',
    insuranceReview:!!vm.consultRoute?.insuranceReview});
  if(!onLine)window.location.href='https://lin.ee/ZeLu7i6';
 }
 // LINE friend-add URLs do not prefill a conversation. Give users a short
 // non-sensitive message with a correlation code they can paste into the chat.
 const coverageLineMessage='保障内容の確認について相談したいです。\n引継ぎコード：'+handoffCode(vm.diagnosisId);
 function consultCoverage(){
  if(pilotNoExternalActions&&!coverageDryRun)return;
  onEvent?.('chapter2_v32_coverage_consultation_clicked',{placement:'coverage_review',topic:'insurance',noSavingsClaim:true});
  setCoverageCopyError('');
  setShowCoverageLine(true);
 }
 function openCoverageLine(){
  if(pilotNoExternalActions&&!coverageDryRun)return;
  const payload=coverageConsultHandoff(vm.diagnosisId,handoffCode(vm.diagnosisId));
  if(!payload){setCoverageCopyError('引継ぎコードを作れませんでした。結果画面を開き直してからお試しください。');return;}
  onBeforeExternal?.();
  onEvent?.('chapter2_v32_coverage_line_message_outbound',{placement:'coverage_review',consultSelectedTopic:'insurance'});
  onEvent?.('line_clicked',{placement:'coverage_review',chapter:'household',typeCode:null});
  onEvent?.('chapter2_v31_consultation_line_outbound',{placement:'coverage_review',goal:null});
  setShowCoverageLine(false);
  onLine?.(payload);
  if(!onLine)window.location.href='https://lin.ee/ZeLu7i6';
 }
 async function copyAndOpenCoverageLine(){
  if(pilotNoExternalActions&&!coverageDryRun)return;
  try {
   if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');
   await navigator.clipboard.writeText(coverageLineMessage);
   onEvent?.('chapter2_v32_coverage_line_copy_success',{placement:'coverage_review'});
  }catch{
   onEvent?.('chapter2_v32_coverage_line_copy_failed',{placement:'coverage_review'});
   setCoverageCopyError('コピーできませんでした。下の文章を長押ししてコピーし、公式LINEへ進んでください。');
   return;
  }
  openCoverageLine();
 }
 function shareUrl(platform:string){
  return chapter2V2ReferralUrl(window.location.href,platform);
 }

 function downloadCard(file:File){
  const url=URL.createObjectURL(file);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=file.name;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  onEvent?.('chapter2_v31_share_export',{method:'download',content:'quest_card'});
 }
 function saveImage(){
  if(pilotNoExternalActions){setShareStatus('調査用のサンプルでは画像保存を実行しません。');return;}
  const file=shareFile.current;
  if(!file){setShareStatus('画像の準備ができていません。画面を開き直して試してね。');return;}
  try{
   downloadCard(file);
   setShareStatus('画像カードを保存したよ。SNSで画像を添付してね。招待リンクも下からコピーできるよ。');
  }catch{
   setShareStatus('画像を保存できませんでした。別のブラウザでも試してみてね。');
  }
 }
 async function shareImage(){
  if(pilotNoExternalActions){setShareStatus('調査用のサンプルでは共有を実行しません。');return;}
  if(shareBusy)return;
  setShareBusy(true);setShareStatus('');
  onEvent?.('chapter2_v2_share_clicked',{format:'image'});
  onEvent?.('chapter2_v31_share_intent',{method:'native_image',content:'quest_card'});
  try{
   const file=shareFile.current;
   if(!file){setShareStatus('画像カードを準備できませんでした。');return;}
   let canShareFile=false;
   try{
    canShareFile=typeof navigator.share==='function'&&
     (typeof navigator.canShare!=='function'||navigator.canShare({files:[file]}));
   }catch{canShareFile=false;}
   if(canShareFile){
    try{
     onBeforeExternal?.();
     await navigator.share({
      title:'ムダギリ診断｜家計クエスト',
      text:chapter2V2ShareText(shareUrl('native')),
      files:[file]
     });
     setShareStatus('共有画面から戻ったよ。投稿できたかは共有先のアプリで確認してね。');
     onEvent?.('chapter2_v2_share_completed',{format:'image',delivery:'native_sheet_returned'});
     onEvent?.('chapter2_v31_share_export',{method:'native_sheet_returned',content:'quest_card'});
     return;
    }catch(e){
     if((e as Error)?.name==='AbortError'){
      setShareStatus('共有をキャンセルしたよ。画像はここからいつでも共有できる。');
      onEvent?.('chapter2_v31_share_cancelled',{method:'native_image'});
      return;
     }
    }
   }
   downloadCard(file);
   setShareStatus('このブラウザは画像の直接共有に対応していないため、画像を保存したよ。SNSから画像を添付してね。');
  }catch{setShareStatus('画像の共有・保存ができませんでした。');}
  finally{setShareBusy(false);}
 }
 function shareText(platform:'x'|'line'){
  if(pilotNoExternalActions){setShareStatus('調査用のサンプルではSNS投稿を実行しません。');return;}
  onEvent?.('chapter2_v2_share_clicked',{format:'text',platform});
  onEvent?.('chapter2_v31_share_intent',{method:platform+'_text'});
  const text=chapter2V2ShareText(shareUrl(platform));
  onBeforeExternal?.();
  if(platform==='x')window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
  else window.location.href='https://line.me/R/share?text='+encodeURIComponent(text);
 }
 async function copyInviteLink(){
  if(pilotNoExternalActions){setShareStatus('調査用のサンプルでは招待リンクを配布しません。');return;}
  const url=shareUrl('copy');
  onEvent?.('chapter2_v31_share_intent',{method:'copy_link'});
  try{
   if(!navigator.clipboard?.writeText)throw new Error('clipboard_unavailable');
   await navigator.clipboard.writeText(url);
   setShareStatus('招待リンクをコピーしたよ。画像と一緒に友達に送ってね。');
   onEvent?.('chapter2_v31_share_export',{method:'copy_link'});
  }catch{
   setShareStatus('自動コピーできなかったので、このURLを選んでコピーしてね： '+url);
  }
 }
 function categoryDetail(x:any){
  const isOpen=opened===x.category;
  const enemy=(ENEMY_ASSETS as Record<string,any>)[x.category];
  const status=STATUS[x.v5Status]??STATUS.review;
  return <div className={isOpen?'c2v2-entry c2v32-enemy-record is-expanded':'c2v2-entry c2v32-enemy-record'} key={x.category}>
   <button className="c2v2-enemy c2v32-enemy-tile" type="button" aria-expanded={isOpen} onClick={()=>{
    setOpened(isOpen?null:x.category);onEvent?.('chapter2_v2_category_detail_clicked',{category:x.category});
   }}>
    {enemy?.normal?<img src={enemy.normal} alt={enemy.name} loading="lazy"/>:<span className="c2v2-enemy-icon">⚔️</span>}
    <span className="c2v2-enemy-text"><b>{enemy?.name||x.label||x.category}</b><small>{x.label||x.category}</small><span>{status.mark} {status.name} {isOpen?'／ 閉じる ↑':'／ 詳細を見る ↓'}</span></span>
   </button>
   {isOpen&&<div className="c2v2-detail">
    <p>{x.reason||'回答内容をもとに確認しています。'}</p>
    {x.known&&Number.isFinite(Number(x.amount))&&<p>あなたの支出：<b>{money(Number(x.amount))}/月</b></p>}
    {comparisonAvailable(x)?<>
     <p>比較の目安：{money(comparisonReferenceAmount(x)!)} /月（{comparisonReferenceType(x)}）</p>
     <p>比較条件：{comparisonBasis(x)}</p>
     <p>参照元：{comparisonReference(x)}</p>
     {comparisonPrimaryV5(x)?.note&&<p>参照データの注意：{comparisonPrimaryV5(x)!.note}</p>}
     {comparisonTargetAmount(x)!==null&&comparisonReferenceAmount(x)!==null&&
      <p>基準との差：{chapter2V2SignedComparisonYen(comparisonTargetAmount(x)!-comparisonReferenceAmount(x)!)}/月
       <small>※この差はムダ額・改善額ではありません</small>
      </p>}
    </>:<p>判定の手がかり：{noBenchmarkReason(x)}</p>}
    {x.aAmount>0&&<p>回答から確認できた改善額：<b>{money(Number(x.aAmount))}/月</b></p>}
    {x.cUpper>0&&<p>追加の確認余地：最大 {money(Number(x.cUpper))}/月 <small>※削減できると確定した金額ではありません</small></p>}
    <p className="c2v2-next-check"><b>次の確認：</b>{x.nextAction||x.nextCheck||'支出の内容を確認'}</p>
   </div>}
  </div>;
 }

 return <main data-result-version="v32" className="c2v2-root c2v3-world c2v31-rpg c2v32-rpg"><style>{CSS+V3CSS+V31CSS+V32CSS+V19SCENECSS+V20BRIDGECSS+V21GATEBCSS+V22COMPARISONCSS+V32READABILITYCSS}</style><div className="c2v2-page c2v31-page">
  <section className="c2v2-hero c2v3-hero c2v31-hero c2v20-hero" data-section="CHAPTER2_QUEST_COMPLETE" style={continuityStyle}>
   <nav className="c2v20-quest-log" aria-label="ムダギリの冒険進行">
    <span className="c2v20-quest-log-eyebrow">MUDAGIRI QUEST LOG</span>
    <div className="c2v20-quest-stages">
     <span className={jobAsset?'is-complete':'is-unlinked'}>⚔ 第1章 <b>JOB獲得</b><small>{jobAsset?'クリア！':'未連携'}</small></span>
     <span className="c2v20-quest-arrow" aria-hidden="true">›</span>
     <span className="is-current" aria-current="step">🏰 第2章 <b>家計バトル</b><small>クリア！</small></span>
    </div>
   </nav>
   <span className="c2v2-eyebrow c2v31-hero-kicker">QUEST CLEAR!</span>
   <h1 className="c2v31-quest-title"><span>家計クエスト</span><em>完全クリア！</em></h1>
   {jobAsset&&chapter1&&<aside className="c2v31-job-card c2v3-job-card c2v20-hero-job" aria-label="第1章から引き継いだ冒険者" data-section="CHAPTER1_JOB_BRIDGE">
    <div className="c2v20-job-portrait"><img src={jobAsset.file} alt={jobAsset.name+"のJOB画像"} loading="eager"/></div>
    <div className="c2v20-job-identity">
     <span>第1章で獲得した冒険者</span>
     <strong>{jobAsset.name}</strong>
     <div className="c2v20-job-style"><b>{jobStyleName}重視</b><small>そのJOBで家計クエストもクリア！</small></div>
    </div>
   </aside>}
   <div className="c2v31-hero-stage">
    <div className="c2v31-dialogue"><strong>ムダギリくん</strong><p>{jobAsset?'「そのJOBで家計バトルもクリア！一緒に戦った戦果を見よう。」':<>「おつかれ！<br/>宝箱の中身を見てみよう！」</>}</p></div>
    <img src={ART.result} alt="勝利を祝うムダギリくん" className="c2v31-hero-mascot"/>
   </div>
   <div className="c2v32-hero-teaser" data-section="POTENTIAL_HERO">
    <span>まだ見直せるかもしれないお金</span>
    {reviewUpper>0?<strong>月 最大 {money(reviewUpper)}</strong>:<strong>候補額はまだ未特定</strong>}
    <small>※未確定の参考上限。削減できると決まった金額ではありません。</small>
   </div>
   {reviewUpper>0?<button type="button" className="c2v2-scroll-cue c2v31-scroll-cue c2v32-reward-jump c2v21-evidence-jump" data-section="CANDIDATE_EVIDENCE_JUMP"
    onClick={()=>{onEvent?.('chapter2_v21_candidate_evidence_jump_clicked',{target:candidates.length?'candidate_breakdown':'treasure_report'});
     document.querySelector(candidates.length?'[data-section="CANDIDATE_BREAKDOWN"]':'[data-section="POTENTIAL_TREASURE"]')?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}}>
    {candidates.length?'✦ まず、見直し候補の理由を見る ↓':'✦ 見直し候補を確認する ↓'}
   </button>:<span className="c2v2-scroll-cue c2v31-scroll-cue">▼ ギルドからの報告を読む</span>}
  </section>
  <nav className="c2v32-result-shortcuts" aria-label="結果画面の見たい場所へ移動" data-section="RESULT_SHORTCUTS">
   <button type="button" onClick={()=>jumpToSection(candidates.length?'CANDIDATE_BREAKDOWN':'POTENTIAL_TREASURE')}>
    <span aria-hidden="true">⚔</span>{candidates.length?'見直し候補':'宝箱'}
   </button>
   <button type="button" onClick={()=>jumpToSection('CATEGORY_COMPARISON_OVERVIEW')}>
    <span aria-hidden="true">📖</span>12カテゴリ比較
   </button>
   <button type="button" onClick={()=>jumpToSection('CONSULTATION_CTA_TOP')}>
    <span aria-hidden="true">⚑</span>相談する
   </button>
  </nav>
  <section className="c2v32-treasure-lead" data-section="POTENTIAL_TREASURE">
   <div className="c2v31-section-heading"><span>🔑 TREASURE REPORT</span><small>今回の見直し候補</small></div>
   <h2>宝箱に眠っていたお金</h2>
   <section className="c2v31-treasure-unknown" data-section="UNAPPRAISED_TREASURE" aria-label="未確定の見直し可能性">
    <div className="c2v31-unknown-heading"><span>未鑑定の宝箱</span><small>未確定</small></div>
    <div className="c2v31-unknown-layout">
     <TreasureChest className="c2v31-chest-art" locked/>
     <div className="c2v31-unknown-details">
      {reviewUpper>0?<><span>確認が必要な見直し候補</span><strong>{candidates.length>0?`${candidates.length}カテゴリ`:'内訳を確認中'}</strong></>:<>
       <strong>今は未確認</strong><span>追加で見直せる可能性は、まだ特定されていません。</span>
      </>}
     </div>
    </div>
    <p>追加で見直せる可能性がある金額。<strong>実際に削減できるかは、支出の内容を確認してから判断します。</strong></p>
   </section>
   {independentReferenceClues.length>0&&<aside className="c2v32-statistical-buffer" data-section="REFERENCE_RECHECK_BUFFER">
    <span>🔎 同年代×同所得帯の比較 ／ 原表確認済み</span>
    <strong>{independentReferenceClues.length}カテゴリで複数の目安を上回る</strong>
    <p className="c2v32-statistical-gap">比較上のチェック余地：月 <b>{money(independentReferenceGap)}</b></p>
    <div className="c2v32-statistical-gap-items">{independentReferenceClues.map(x=><span key={x.category}>{x.label} <b>{money(x.gap)}/月</b><small>同年代×同所得帯の交差集計</small></span>)}</div>
    <small>実際に同じ年齢階級・所得階級・世帯区分で公表された原表セルだけを比較に使用します。削減保証ではなく、未確定の確認材料です。</small>
    <button type="button" onClick={()=>jumpToSection('CATEGORY_COMPARISON_OVERVIEW')}>どの支出か、12カテゴリの比較で確認する ↓</button>
   </aside>}
   {candidates.length>0&&<section className="c2v32-candidate-breakdown" data-section="CANDIDATE_BREAKDOWN" aria-label="改善できるかもしれない金額の内訳">
    <div className="c2v32-breakdown-title"><span>⚔ 宝箱の中身はこれ！</span><small>月額の未確定候補／すべて表示</small></div>
    <p className="c2v32-breakdown-intro">月最大 {money(reviewUpper)} の内訳。<strong>まだ削減できると決まった金額ではないよ。</strong></p>
    <div className="c2v32-breakdown-entries">{candidates.map((x:any)=>{
     const enemy=(ENEMY_ASSETS as Record<string,any>)[x.category];
     return <div className="c2v32-breakdown-entry" data-candidate-category={x.category} key={x.category}>
      <div className="c2v32-breakdown-entry-head">
       {enemy?.normal?<img src={enemy.normal} alt="" loading="lazy"/>:<span className="c2v32-breakdown-icon" aria-hidden="true">⚔</span>}
       <div className="c2v32-breakdown-name"><strong>{x.label||x.category}</strong><small>{enemy?.name||'見直し候補'}</small></div>
       <div className="c2v32-breakdown-amount"><strong>最大 {money(nonnegative(x.cUpper))}</strong><small>月額・未確定</small></div>
      </div>
      {x.known===true&&Number.isFinite(Number(x.amount))&&Number(x.amount)>0&&<p className="c2v32-breakdown-basis"><b>今回の入力：</b>{money(Number(x.amount))}/月
       {Number.isFinite(Number(x.comparable))&&Number(x.comparable)>0&&x.cMethod!=='mobile'&&<> ／ <b>比較の目安：</b>{money(Number(x.comparable))}/月 <small>（平均との差がそのまま削減額になるわけではありません）</small></>}
      </p>}
      <p className="c2v32-breakdown-reason"><b>候補になった理由：</b>{candidateReason(x)}</p>
      <p className="c2v32-breakdown-action"><b>確かめること：</b>{x.nextAction||'支出の内訳や契約を確認する'}</p>
     </div>;
    })}</div>
    <p className="c2v32-breakdown-footnote">※すべて確認前の参考上限。平均・基準との差額をそのままムダ額・改善額にはしていません。12カテゴリの比較一覧で、比較目安と条件を確認できるよ。</p>
   </section>}
   {primaryCandidate&&<div className="c2v32-first-action c2v32-first-action--compact" data-section="FIRST_REVIEW_ACTION">
    <span>⚔ 最初に確かめるなら：{primaryCandidate.label||primaryCandidate.category}</span>
    <p>{primaryCandidate.nextAction||'契約や支出の内訳を確認しよう。'}</p>
   </div>}
  </section>

  <section className="c2v31-future c2v3-future" data-section="FUTURE_REWARDS" aria-label="未来の戦利品">
   <div className="c2v31-section-heading"><span>⌛ FUTURE REWARD</span><small>戦利品を積み重ねると…</small></div>
   <h2>{reviewUpper>0?'未来の戦利品':'未来の作戦は、ここから。'}</h2>
   {reviewUpper>0&&<p className="c2v32-future-condition">もし見直し候補を<span>全部</span>毎月減らせたら？<small>まだ確定した金額じゃないよ。実際に減らせるかは確認してから。</small></p>}
   {reviewUpper>0?<div className="c2v3-rewards">
    <div className="c2v3-reward-mini c2v31-reward-mini">
     <div><span className="c2v31-coin-symbol" aria-hidden="true">✦</span><small>1年間</small><strong>{money(reviewUpper*12)}</strong></div>
     <div><span className="c2v31-coin-symbol" aria-hidden="true">✦ ✦</span><small>5年間</small><strong>{money(reviewUpper*60)}</strong></div>
    </div>
    <div className="c2v3-reward-ten c2v31-reward-ten">
     <div className="c2v31-ten-details"><span>✦ 10年間で積み重ねたら ✦</span><strong>{money(reviewUpper*120)}</strong><small className="c2v31-ten-qualifier">月 最大 {money(reviewUpper)} をすべて改善できた場合</small></div>
     <TreasureChest className="c2v31-ten-chest"/>
    </div>
    <p className="c2v3-future-footnote">※未確定の見直し候補（月最大 {money(reviewUpper)}）をすべて改善でき、その状態が毎月続いた場合の単純累計。実際の削減額や将来の結果を保証するものではなく、運用益も含みません。</p>
   </div>:<div className="c2v3-future-empty">
    <strong>見直し候補の金額は、まだ特定できていない。</strong>
    <p>無理にムダを決めず、確認できることから進めよう。</p>
   </div>}
  </section>
  <MudagiriBeat pose="explain" line={reviewUpper>0?"この未来の金額は、全部見直せた場合の話。無理に全部斬らなくていいぞ！":"今は数字を作らず、分かっている支出を大切にしていこう！"}/>


  {/* Experimental answer-check: enabled only for preview; complete same-person proof required. */}
  {answerCheckEnabled&&<Chapter12AnswerCheckCard
   enabled={answerCheckEnabled} chapter1={chapter1}
   anonymousUserId={answerCheckAnonymousUserId} diagnosisId={vm?.diagnosisId}
   rows={vm?.rows} demo={answerCheckDemo}
  />}

  <section className="c2v31-battle-report c2v2-card" data-section="HOUSEHOLD_BATTLE_RESULTS" data-observation-kind={recognition?.kind??"no_supported_observation"}>
   <div className="c2v31-section-heading"><span>⚔ BATTLE REPORT</span><small>12カテゴリ鑑定完了</small></div>
   <h2>今回の戦果</h2>
   <div className="c2v2-counts c2v31-counts">
    {(['cut','optimize','protect','inspect'] as const).map(key=><div key={key}>
     <span>{STATUS[key].mark}<br/>{STATUS[key].name}</span><strong>{nonnegative(counts[key])}<small>件</small></strong>
    </div>)}
   </div>
   {(nonnegative(counts.ok)>0||nonnegative(counts.na)>0)&&<p className="c2v31-remaining-counts">ほかに、問題なし {nonnegative(counts.ok)}件・対象外 {nonnegative(counts.na)}件</p>}
   {featured.length>0&&<div className="c2v32-enemy-encounters" data-section="ENEMY_BATTLE_PREVIEW">
    <h3>今回出会った敵たち</h3>
    <div className="c2v32-enemy-preview-grid">{featured.map((x:any)=>{
     const monster=(ENEMY_ASSETS as Record<string,any>)[x.category];
     const status=STATUS[x.v5Status]??STATUS.review;
     return <div key={x.category} className="c2v32-enemy-preview">
      {monster?.normal?<img src={monster.normal} alt={monster.name} loading="lazy"/>:<span aria-hidden="true">⚔️</span>}
      <strong>{monster?.name||x.label||x.category}</strong>
      <small>{x.label||x.category} ／ {status.name}</small>
     </div>;
    })}</div>
   </div>}
   <section className="c2v31-reward-confirmed" data-section="CONFIRMED_REWARD" aria-label="回答から確認できた改善額。節約済みかは別途確認が必要">
    <div className="c2v31-confirmed-heading">回答から確認できた改善額</div>
    <div className="c2v31-confirmed-content">
     <CoinPouch className="c2v31-coin-art"/>
     <div className="c2v31-confirmed-amount"><span>毎月</span><strong>{money(confirmed)}</strong></div>
    </div>
    <span className="c2v31-confirmed-caption">{confirmed>0?'回答で確認した改善額。実行・節約済みかは別途確認が必要です。':'回答から確認できた改善額はまだありません'}</span>
   </section>
   <p className="c2v2-note c2v31-accounting-note">※平均との差を改善額にはせず、未確定候補も合算していません。「確認できた改善額」は本人の回答に基づくもので、契約変更・解約などが完了した実績ではありません。</p>
   {shown.length>0&&<button type="button" className="c2v22-ledger-jump" data-section="COMPARISON_OVERVIEW_JUMP"
    onClick={()=>document.querySelector('[data-section="CATEGORY_COMPARISON_OVERVIEW"]')?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}>
    12カテゴリの比較基準を一覧で見る ↓
   </button>}
  </section>
  <MudagiriBeat pose="proud" line={recognition?.line??(filtered.some((x:any)=>x.v5Status==='protect'||x.v5Status==='ok')
   ?'「守る」「そのままでOK」も、今回の戦果だ。全部直さなくていい。まずは今できることを1つ！'
   :'全部いっぺんに直さなくていい。まずは今できることを1つ、確かめよう！')}/>
  <CoverageAwarenessCard rows={rows} onConsultCoverage={consultCoverage} pilotNoExternalActions={pilotNoExternalActions&&!coverageDryRun}/>

  <section className="c2v2-card c2v2-decision c2v3-decision c2v31-nextgate" data-section="CONSULTATION_CTA_TOP">
   <span className="c2v31-next-head">⚑ NEXT QUEST</span>
   <h2>次の冒険は、<br/>未来の作戦会議。</h2>
   <p>{primaryCandidate?<>「{primaryCandidate.label||primaryCandidate.category}」が本当に見直せるか、一緒に確かめよう。「いつかやりたいこと」を、今日できる一歩に変える作戦も考えよう。</>:'無理に削らず、今の家計を守りながら考えよう。「いつかやりたいこと」を、今日できる小さな一歩につなげよう。'}</p>
   <div className="c2v31-destinations" aria-hidden="true"><span>住まい</span><span>教育</span><span>老後</span><span>夢の実現</span></div>
   <button className="c2v2-primary" onClick={()=>consultation('after_rewards')}>無料ライフプラン相談の案内を見る →</button>
   <small>LINEで相談内容を確認できます。追加だけでは予約は確定しません。</small>
  </section>

  <section className="c2v2-card c2v31-followup" data-section="NEXT_QUEST">
   <details className="c2v32-optional-detail" data-optional="first-step">
    <summary>最初の確認ポイントをもう一度見る</summary>
   {next?<div className="c2v2-quest">
    <img src={(ENEMY_ASSETS as Record<string,any>)[next.category]?.normal||ART.quest} alt="" loading="lazy"/>
    <div><b>{(ENEMY_ASSETS as Record<string,any>)[next.category]?.name||next.label}</b><small>{next.label||next.category}</small><p>{next.nextAction||'この支出の内訳を確認しよう。'}</p>
    {next.aAmount>0&&<strong>確認済み：月 {money(Number(next.aAmount))}</strong>}</div>
   </div>:<div className="c2v2-quest"><img src={ART.guide} alt="" loading="lazy"/><p>無理にムダを探さなくてもOK。今の状態を守るところから始めよう。</p></div>}
   </details>
  </section>

  <section className="c2v2-card c2v31-encyclopedia" data-section="CATEGORY_ENCYCLOPEDIA">
   <span className="c2v2-kicker">ENEMY ATLAS ／ 敵図鑑</span>
   <h2 className="c2v22-ledger-title">12カテゴリの比較一覧</h2>
   <p className="c2v22-ledger-intro">12体の敵と、あなたの支出・判定をまとめたぞ。数字で比べられる項目は条件も表示。比べられない項目は使い方から判断するよ。</p>
   <div className="c2v32-peer-guide" data-section="JOINT_PEER_COMPARISON_GUIDE">
    <strong>比べるのは「同年代 × 世帯区分 × 額面年収帯」</strong>
    <p>あなたは「支出 ÷ 月手取り」で計算。比べる相手は全国の<strong>同じ年代（10歳区分）・単身／二人以上・同じ額面年収帯の勤労者世帯</strong>。2024年の原表に十分な標本がある場合、食費・光熱水道・日用品について「同一交差セルの平均支出 ÷ 平均可処分所得」を参考として表示します。</p>
    <small>※二人以上は家族の人数まで一致する意味ではありません。他のカテゴリは現時点では同じ3条件を満たす平均負担率を保証できず、属性別支出目安と区別して表示します。</small>
   </div>
   {incomeBurden?<section className="c2v32-income-burden c2v32-income-burden--compact" data-section="INCOME_BURDEN_CONTEXT" aria-label="比較一覧の手取り基準">
    <div className="c2v32-income-burden-head"><span>あなたの支出割合の分母（統計の平均分母ではありません）</span><strong>あなたの月手取り {money(Number(incomeBurden.monthlyTakeHome))}</strong></div>
    <p>入力済み{incomeBurden.knownCategoryCount}カテゴリの支出は {money(incomeBurden.knownMonthlyExpenses)}（手取りの <b>{incomeBurden.expenseShareOfTakeHomePct?.toFixed(1)??'—'}%</b>）。下の各カテゴリで、支出額・比較の目安・手取り比率をまとめて見られるよ。</p>
    {(incomeBurden.missingCategoryCount>0||incomeBurden.bundledContributionExcluded)&&<small>※未確定{incomeBurden.missingCategoryCount}カテゴリ{incomeBurden.bundledContributionExcluded?'／まとめ払いは内訳未配分':''}。家計支出の全体比率とは限りません。</small>}
   </section>:<p className="c2v32-income-burden-unavailable" data-section="INCOME_BURDEN_CONTEXT">月手取りが未入力なので割合は表示しないよ。金額と比較の目安はこのまま確認できる。</p>}
   {vm.profile?.householdSize===1&&<details open className="c2v32-income-food-single-optin" data-section="SINGLE_INCOME_CLASS_OPTIN">
    <summary>同年代・単身・同所得帯と比べる（任意）</summary>
    <label htmlFor="c2v32-single-income">額面の年間収入を選ぶ</label>
    <select id="c2v32-single-income" value={singleGrossBand??''} onChange={e=>{
     const next=e.target.value;
     setSingleGrossBand(SINGLE_INCOME_FOOD_OPTIONS.some(x=>x.value===next)?next as SingleIncomeFoodOptionV1:null);
    }}>
     <option value="">選ばずに進む</option>
     {SINGLE_INCOME_FOOD_OPTIONS.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}
    </select>
    <p>月手取りから年収は推定しないよ。2024年の公式交差集計が確認できた区分だけ同年代×単身×額面年収帯の率を示す。選択内容は診断結果やLINEに保存・送信しません。</p>
    {singleGrossBand&&<p className="c2v32-high-income-match-status" role="status" data-section="SINGLE_PEER_MATCH_STATUS" aria-live="polite">
      {singleHasAvailablePeerSource
       ?headWorkerConfirmed
        ?'同年代・単身・同額面年収帯の参考率を食費・光熱水道・日用品で表示中。'
        :'この年代と年収帯には公表データがあるよ。世帯主の働き方を確認すると同条件の率を表示できるよ。'
       :'この年代と年収帯は標本数などの条件を満たさないため、同条件の率を表示できません。年収帯だけの参考とは区別します。'}
     </p>}
   </details>}
   {multiCohort&&multiGrossBand==='1000plus'&&
    <details className="c2v32-income-food-single-optin" data-section="MULTI_HIGH_INCOME_CLASS_OPTIN">
     <summary>自分に近い世帯と比べてみる（任意・年収1,000万円以上）</summary>
     <label htmlFor="c2v32-multi-high-income">世帯全体の額面年収を選ぶ</label>
     <select id="c2v32-multi-high-income" value={multiHighGrossBand??''}
      onChange={e=>{
       const v=e.target.value;
       setMultiHighGrossBand(v==='1000_1249'||v==='1250_1499'||v==='1500plus'?v:null);
      }}>
      <option value="">選ばずに進む</option>
      <option value="1000_1249">1,000～1,249万円</option>
      <option value="1250_1499">1,250～1,499万円</option>
      <option value="1500plus">1,500万円以上</option>
     </select>
     <p>あなたと同じ年代・世帯年収の参考を探すよ。月手取りから年収を推測せず、この選択は画面表示だけに使い、診断結果・LINEへ保存や送信はしません。</p>
     {multiHighGrossBand&&<p className="c2v32-high-income-match-status"
       data-section="MULTI_HIGH_INCOME_MATCH_STATUS" role="status" aria-live="polite">
      {highIncomePublishedReference?.available===true
       ?multiHeadAgeConfirmed&&headWorkerConfirmed
        ?'比較の準備ができたよ。下の食費・光熱水道・日用品で、同年代×同年収帯の参考率を確認できるよ。'
        :'この年代と年収帯には、公表された参考データがあるよ。世帯主の年齢と働き方を確認すると、下の3カテゴリで比較できるよ。'
       :'この年代と年収帯は、標本数が少ないなどの理由で比較に必要な条件を満たしていないよ。同年代の率は表示せず、下には年収帯だけの参考を残すよ。'}
     </p>}
    </details>}
   {multiHasAvailablePeerSource&&householdAnnualBandLabel&&
    <div className="c2v32-peer-age-confirm" data-section="MULTI_PEER_HEAD_AGE_CONFIRM">
     <label htmlFor="c2v32-head-age-confirm">
      <input id="c2v32-head-age-confirm" type="checkbox" checked={multiHeadAgeConfirmed}
       onChange={e=>setMultiHeadAgeConfirmed(e.target.checked)}/>
      <span><strong>入力した{rawProfileAge}歳は、世帯主の年齢です</strong>
       <small>一致する場合のみチェック（同年代×同年収の参考を表示する）</small></span>
     </label>
     <p>公式統計は「世帯主の年齢」を使うよ。別の家族の年齢なら、チェックせずに進んでね。全国の勤労者世帯の参考で、確定した削減額ではありません。</p>
    </div>}
   {(multiHasAvailablePeerSource||singleHasAvailablePeerSource)&&
    <div className="c2v32-peer-age-confirm" data-section="PEER_WORKER_STATUS_CONFIRM">
     <label htmlFor="c2v32-worker-status-confirm">
      <input id="c2v32-worker-status-confirm" type="checkbox" checked={headWorkerConfirmed}
       onChange={e=>setHeadWorkerConfirmed(e.target.checked)}/>
      <span><strong>世帯主は会社員・公務員など、給与を受け取る立場です</strong>
       <small>当てはまる場合のみチェック（勤労者世帯の参考率を表示する）</small></span>
     </label>
     <p>この統計は世帯主が雇用されている世帯が対象だよ。世帯主が自営業・無職などの場合や、分からない場合はチェックしないでね。回答は画面表示だけに使い、保存・送信しません。</p>
    </div>}
   {incomeFoodReference?.available&&incomeFoodReference.monthlyMeanLowYen!==null&&incomeFoodReference.monthlyMeanHighYen!==null&&
    <section className="c2v32-income-food-context c2v32-income-food-context--merged" data-section="INCOME_CLASS_FOOD_CONTEXT" aria-label="年収階級別の独立した支出参考の前提">
     <span className="c2v2-kicker">2つの比較基準</span>
     <h3>年齢・世帯の目安と、年収帯の参考を一緒に見る</h3>
     <p>{anyJointRateAvailable
   ?<>プロフィールと同じ年代・年収帯を照合した<strong>2024年の公式交差集計を優先</strong>して、食費・光熱費・日用品に表示しています。本人の手取り割合も横に並べたよ。</>
   :<>年収 {incomeFoodReference.profileBandLabel}の全国参考を下のカテゴリ別カードで見られるよ。年齢を同時に照合できない場合は、その違いを明記しています。</>}</p>
     <p className="c2v32-income-food-note">{anyJointRateAvailable
   ?'※2024年の年齢×年収の交差集計は、2025年の年収帯のみの参考値とは別の統計です。両者を混ぜて平均を作りません。参考差をムダ額・削減額・見直し候補額に加えない。'
   :'※年齢・世帯の目安と2025年の年収帯参考は別々の統計で、両方を満たす世帯の平均ではありません。参考差をムダ額・削減額・見直し候補額に加えない。'}</p>
     <p className="c2v32-income-scope-warning">{incomeFoodReference.scopeWarning}</p>
     <p className="c2v32-income-source-inline">出典：総務省「家計調査」（2025年）・{incomeFoodReference.source?.table}／全国の年収階級別集計。</p>
     <p className="c2v32-worker-source-inline" data-section="AGE_INCOME_PEER_RATE_SOURCE_NOTICE"><b>同年代×同年収帯の平均負担率：</b>{anyJointRateAvailable
     ?<>総務省「2024年全国家計構造調査」第1-29-1表から、年齢・世帯年収を同時集計した<strong>全国の勤労者{multiCohort?'二人以上':'単身'}世帯</strong>の参考率を表示。世帯主が勤労者世帯に当てはまると確認した場合だけ表示します。各世帯の負担率の平均でも削減可能額でもありません。</>
     :multiCohort&&!multiHeadAgeConfirmed&&multiHasAvailablePeerSource
      ?<>入力した年齢が世帯主の年齢なら、上のチェックから参考率を確認できるよ。確認なしに「同世代の平均」は表示しません。</>
     :!headWorkerConfirmed&&(multiHasAvailablePeerSource||singleHasAvailablePeerSource)
      ?<>原表は勤労者世帯の統計だよ。世帯主の働き方が一致するときだけ、上のチェックから同年代×同年収帯の参考率を表示できます。</>
      :<>2024年の公式交差集計で、プロフィールに対応する十分な標本数・年収区分を確認できていません。所得帯だけの2025年参考率を同年代の平均として代用しません。</>}</p>
     <details className="c2v32-income-food-sources">
      <summary>使っている統計と対象範囲</summary>
      <p>出典：総務省「家計調査」（{incomeFoodReference.source?.year}年）、{incomeFoodReference.source?.table}。全国・{incomeFoodReference.source?.population}。食費は「食料」、光熱費は「光熱・水道」、日用品は「家事雑貨（4.4）＋家事用消耗品（4.5）」から作成。</p>
      <p>{incomeFoodReference.scopeWarning} 年収帯の幅が広い場合の範囲は、異なる公表所得階級の平均支出の最小～最大であり、個人差の分布幅ではありません。</p>
      <p>食費：対象の年収階級 {incomeFoodReference.incomeBandLabels.join('、')}（{incomeFoodReference.matchedIncomeCells}区分・最小集計世帯数 {incomeFoodReference.minCellSampleHouseholds}世帯）。年額を12で割り円単位に丸めています。</p>
      {incomeEnergyReference&&<p>光熱費：対象の年収階級 {incomeEnergyReference.coveredPublishedBrackets.join('、')}（{incomeEnergyReference.matchedCells}区分・最小集計世帯数 {incomeEnergyReference.minSampleHouseholds}世帯）。</p>}
      {incomeDailyReference&&<p>日用品：同じ年収階級で「家事雑貨（4.4）」と「家事用消耗品（4.5）」を年額で合計して月額に換算。「日用品」という単一の公式平均ではありません。</p>}
     </details>
    </section>}
   {shown.length?<div className="c2v22-comparison-ledger" data-section="CATEGORY_COMPARISON_OVERVIEW" aria-label="12カテゴリの支出・比較目安・比較条件の一覧">
    {shown.map((x:any)=>{
     const status=STATUS[x.v5Status]??STATUS.review;
     const enemy=(ENEMY_ASSETS as Record<string,any>)[x.category];
     const comparable=comparisonAvailable(x);
     const referenceAmount=comparisonReferenceAmount(x);
     const compareAmount=comparable?comparisonTargetAmount(x):null;
     const noNumber=nonNumericBasis(x);
     const differs=comparable&&x.known&&x.amount!==null&&Number.isFinite(Number(x.amount))&&compareAmount!==null&&Math.abs(compareAmount-Number(x.amount))>=1;
     // Income-class references remain independent of the primary comparable.
     const incomeRange=x.category==='food'&&incomeFoodReference?.available&&incomeFoodReference.monthlyMeanLowYen!==null&&incomeFoodReference.monthlyMeanHighYen!==null
      ?{low:incomeFoodReference.monthlyMeanLowYen,high:incomeFoodReference.monthlyMeanHighYen}
      :x.category==='energy'&&incomeEnergyReference
       ?{low:incomeEnergyReference.monthlyLowYen,high:incomeEnergyReference.monthlyHighYen}
       :x.category==='daily'&&incomeDailyReference
        ?{low:incomeDailyReference.monthlyLowYen,high:incomeDailyReference.monthlyHighYen}
        :null;
     const burdenRow=incomeBurden?.categories?.find((a:any)=>a.category===x.category);
     const ownScopeAmount=burdenRow?.monthlyAmount??null;
     const sameScope=ownScopeAmount!==null&&Number.isFinite(Number(x?.amount))
      &&x.known===true&&Math.abs(Number(ownScopeAmount)-Number(x.amount))<1
      &&(!comparable||compareAmount!==null&&Math.abs(Number(compareAmount)-Number(x.amount))<1);
     const lens=twoReferenceLensV1({
      currentAmountYen:x.known===true&&x.amount!==null&&Number.isFinite(Number(x.amount))?Number(x.amount):null,
      primaryReferenceYen:comparable&&compareAmount!==null&&Math.abs(Number(compareAmount)-Number(x.amount))<1?referenceAmount:null,
      incomeReferenceLowYen:incomeRange?.low??null,incomeReferenceHighYen:incomeRange?.high??null,
      ownMonthlyTakeHomeYen:sameScope?incomeBurden?.monthlyTakeHome??null:null
     });
     const workerCategory=scopedWorkerCategory(x.category);
     const sameAgeIncomePeer=peerReferenceFor(x.category);
     const peerUserShare=sameScope?lens.ownPct:null;

     const shareOfTakeHome=burdenRow?.shareOfTakeHomePct??null;
     const incomeMark=x.category==='food'?'INCOME_CLASS_FOOD_ROW':x.category==='energy'?'INCOME_CLASS_ENERGY_ROW':'INCOME_CLASS_DAILY_ROW';
     const deltaDescription=(delta:number|null,what:string)=>delta===null?''
      :delta>0?`${what}より月 ${money(delta)} 多め`
      :delta<0?`${what}より月 ${money(-delta)} 少なめ`
      :`${what}と同程度`;
     return <div key={x.category} className="c2v22-comparison-row" data-comparison-category={x.category} data-comparison-available={comparable?'true':'false'}>
      <div className="c2v22-comparison-head">
       {enemy?.normal?<img className="c2v23-comparison-enemy" src={enemy.normal} alt={enemy.name+'の敵キャラ'} loading="lazy"/>:<span className="c2v23-comparison-enemy-fallback" aria-hidden="true">⚔️</span>}
       <div className="c2v23-comparison-identity"><strong>{x.label||x.category}</strong>{enemy?.name&&<small>{enemy.name}</small>}</div>
       <span className="c2v23-comparison-status">{status.mark} {status.name}</span>
      </div>
      <div className="c2v22-comparison-values c2v32-merged-values">
       <span><small>あなたの支出</small><b>{numericOrDash(x)}{x.known&&Number.isFinite(Number(x.amount))&&x.amount!==null?'/月':''}</b>
        {shareOfTakeHome!==null&&<small className="c2v32-inline-percent">あなたの手取りの <b>{Number(shareOfTakeHome).toFixed(1)}%</b></small>}
       </span>
       <span className={!comparable?'c2v23-basis-mode':''}><small>{sameAgeIncomePeer?.available?'同年代×世帯区分×同年収帯の参考負担率':comparable?'属性別の支出目安（同条件の平均ではない）':'判定の手がかり'}</small>
        <b>{sameAgeIncomePeer?.available
          ?sameAgeIncomePeer.ratePctLow?.toFixed(1)+(sameAgeIncomePeer.ratePctLow===sameAgeIncomePeer.ratePctHigh?'':' ～ '+sameAgeIncomePeer.ratePctHigh?.toFixed(1))+'%'
          :comparable&&referenceAmount!==null?money(referenceAmount)+'/月':noNumber.title}</b>
        {sameAgeIncomePeer?.available&&<small className="c2v32-inline-percent">全国・勤労者{multiCohort?'二人以上':'単身'}世帯／2024年・同一交差集計</small>}
       </span>
      </div>
      {incomeRange&&!sameAgeIncomePeer?.available&&<div className="c2v32-income-inline" data-section={incomeMark}>
       <div><small>年収 {incomeFoodReference?.profileBandLabel??'選択した区分'}の全国参考</small>
        <b>{incomeRange.low===incomeRange.high?money(incomeRange.low):money(incomeRange.low)+' ～ '+money(incomeRange.high)}/月</b></div>
       <small>年収帯だけの支出参考であり、同年代の平均負担率ではありません。</small>
      </div>}
      {sameAgeIncomePeer?.available&&<div className="c2v32-worker-rate-card c2v32-worker-rate-card--age-income" data-age-income-worker-peer-category={x.category}>
       <div className="c2v32-worker-rate-head"><span><strong>同年代×同年収帯の参考負担率</strong><small>全国・勤労者{multiCohort?'二人以上':'単身'}世帯／2024年</small></span>
        <strong>{sameAgeIncomePeer.ratePctLow?.toFixed(1)}{sameAgeIncomePeer.ratePctLow===sameAgeIncomePeer.ratePctHigh?'':' ～ '+sameAgeIncomePeer.ratePctHigh?.toFixed(1)}%</strong></div>
       {peerUserShare!==null&&<div className="c2v32-worker-rate-comparison">
        <div><small>あなたの支出割合</small><b>{peerUserShare.toFixed(1)}%</b></div>
        <div><small>同年代・年収帯の参考</small><b>{sameAgeIncomePeer.ratePctLow?.toFixed(1)}{sameAgeIncomePeer.ratePctLow===sameAgeIncomePeer.ratePctHigh?'':' ～ '+sameAgeIncomePeer.ratePctHigh?.toFixed(1)}%</b></div>
       </div>}
       <p>あなたの{String(x.label||x.category)}は手取りの <b>{peerUserShare===null?'―':peerUserShare.toFixed(1)+'%'}</b>。同年代×同年収帯の勤労者{multiCohort?'二人以上':'単身'}世帯の参考は <b>{sameAgeIncomePeer.ratePctLow?.toFixed(1)}{sameAgeIncomePeer.ratePctLow===sameAgeIncomePeer.ratePctHigh?'':' ～ '+sameAgeIncomePeer.ratePctHigh?.toFixed(1)}%</b>。
        {peerUserShare!==null&&(sameAgeIncomePeer.ratePctHigh??0)<peerUserShare?' 公表参考の上限を上回っています。':peerUserShare!==null&&(sameAgeIncomePeer.ratePctLow??0)>peerUserShare?' 公表参考の下限を下回っています。':peerUserShare!==null?' 公表された参考の幅の中です。':''}
       </p>
       <p>世帯主年齢 {ageBandForObserved2024V1(Number(rawProfileAge))?.split('（')[0]}、世帯年収 {householdAnnualBandLabel}の<strong>同時集計</strong>を照合。原表{sameAgeIncomePeer.usedCells}区分から計算した参考率であり、複数階級の場合の表示幅も個々の世帯の分布幅ではありません。</p>
       <small>出典：総務省「2024年全国家計構造調査」第1-29-1表（e-Stat 0004039867）。平均費目支出 ÷ 同一交差セルの平均可処分所得。各原表セルの概数標本数は50世帯以上。世帯主の就労区分の一致は入力時の本人申告によるもの。平均との差を月額の削減額としては扱いません。</small>
      </div>}
      {workerCategory&&!sameAgeIncomePeer?.available&&<details className="c2v32-worker-rate-card c2v32-worker-rate-card--income-only" data-worker-rate-category={x.category}>
       <summary>年収帯のみの負担率参考（同年代とは限りません）</summary>
       <div className="c2v32-worker-rate-head"><span><strong>2025年・年収帯だけの勤労者世帯参考</strong></span><strong>{workerCategory.ratePctLow.toFixed(1)}{workerCategory.ratePctLow===workerCategory.ratePctHigh?'':' ～ '+workerCategory.ratePctHigh.toFixed(1)}%</strong></div>
       <p>年齢を照合した参考負担率ではないため、あなたとの差や月額の見直し余地は算出しません。</p>
       <small>出典：総務省「家計調査」（2025年）・{workerBurdenReference.source?.table}／{workerBurdenReference.source?.population}。同じ所得階級の平均支出 ÷ 平均可処分所得。年齢は未反映。</small>
      </details>}
      {lens.primaryDeltaYen!==null&&!sameAgeIncomePeer?.available&&<p className="c2v32-comparison-story" data-comparison-story={x.category}><b>今回の比較：</b>あなたの「{x.label||x.category}」は、{comparisonBasis(x)}の{deltaDescription(lens.primaryDeltaYen,'参考目安')}です。</p>}
      {incomeRange&&!sameAgeIncomePeer?.available&&lens.incomeDeltaYen!==null&&<p className="c2v32-comparison-story c2v32-income-story" data-income-story={x.category}>
       <b>年収帯の比較：</b>{lens.incomeDeltaYen===0?'あなたの支出は全国の年収帯別参考の範囲内です。':`あなたの「${x.label||x.category}」は全国の同年収帯の参考より月 ${money(Math.abs(lens.incomeDeltaYen))} ${lens.incomeDeltaYen>0?'多め':'少なめ'}です。`}
      </p>}
      {comparable?<div className="c2v22-comparison-source c2v32-comparison-context">
       <p className="c2v32-context-brief"><b>比較条件：</b>{comparisonBasis(x)}</p>
       <button type="button" className="c2v32-evidence-toggle"
        aria-expanded={comparisonEvidence===x.category}
        aria-controls={'c2v32-evidence-'+x.category}
        onClick={()=>{setComparisonEvidence(comparisonEvidence===x.category?null:x.category);
         onEvent?.('chapter2_v32_comparison_evidence_toggled',{category:x.category});}}>
        {comparisonEvidence===x.category?'出典を閉じる ↑':'出典と比較の注意点を見る ↓'}
       </button>
       <div id={'c2v32-evidence-'+x.category} hidden={comparisonEvidence!==x.category} className="c2v32-comparison-evidence">
        {differs&&<p>別の基準による参考支出：{referenceAmount===null?'―':money(referenceAmount)}/月（{x.comparisonAmountLabel||'比較対象額'}）。同年代×世帯区分×年収帯の平均ではありません。</p>}
        <p><b>参照元：</b>{comparisonReference(x)}／{comparisonReferenceType(x)}</p>
        <p>比較の目安との差は、そのままムダ額・節約額ではありません。</p>
        {comparisonPrimaryV5(x)?.note&&<p>{comparisonPrimaryV5(x)!.note}</p>}
       </div>
      </div>:<p className="c2v22-comparison-source is-unavailable"><b>{noNumber.title}：</b>{noNumber.detail}</p>}

      {nonnegative(x.cUpper)>0&&<p className="c2v22-comparison-review"><b>見直し候補：月最大 {money(nonnegative(x.cUpper))}（未確定）</b><span>{candidateReason(x)}</span></p>}
     </div>;
    })}
   </div>:<p className="c2v2-note">まだ比較できる家計データがないよ。</p>}
   <p className="c2v22-ledger-footnote">※「あなたの割合」は月手取りへの割合。「同年代×世帯区分×同所得帯」は2024年の勤労者世帯の同一交差セルが存在する場合の参考率です。年齢だけ・年収だけの平均金額をあなたの手取りで割って同条件の平均と呼びません。平均との差をムダ額・改善額・月額バッファには加えません。</p>
   <button type="button" className="c2v32-after-ledger-action" onClick={()=>jumpToSection('CONSULTATION_CTA_TOP')}>次の一歩：無料相談の案内を見る ↑</button>
   <details className="c2v32-optional-detail" data-optional="enemy-atlas">
    <summary>敵キャラと詳しい説明を見る（任意）</summary>
    <p>上の比較一覧が結果の基本だよ。ここからは12体のキャラと回答の理由を、好きなものだけ詳しく見られるぞ。</p>
    {shown.length?<div className="c2v32-enemy-grid" data-section="ENEMY_FULL_GALLERY">{shown.map(categoryDetail)}</div>:<p className="c2v2-note">鑑定結果がまだありません。</p>}
    <p className="c2v2-note">比較ができない項目に架空の平均は作っていません。</p>
   </details>
  </section>

  <section className="c2v2-card c2v31-goals" data-section="GOAL_QUEST">
   <span className="c2v2-kicker">YOUR DESTINATION ／ 目指す未来</span>
   <details className="c2v32-optional-detail" data-optional="future-goal">
    <summary>未来の目的地を選ぶ（任意）</summary>
    <p>やりたいことが決まっていたら選んでみよう。まだ決めなくても大丈夫。</p>
    <div className="c2v2-goals">{GOALS.map(([code,label])=><button type="button" key={code} className={goal===code?'is-selected':''} aria-pressed={goal===code} onClick={()=>{setGoal(code);onEvent?.('goal_selected',{goal:code,chapter:'household'});}}>{label}</button>)}</div>
    {selectedGoal&&<>
     <p className="c2v2-talk">次の目的地は「{selectedGoal}」。このテーマで相談することもできるよ。</p>
     <button className="c2v2-primary" onClick={()=>consultation('goal_quest')}>「{selectedGoal}」について相談する →</button>
    </>}
   </details>
  </section>


  <section className="c2v2-card c2v2-sharing c2v31-sharing" data-section="HOUSEHOLD_SHARE">
   <span className="c2v2-kicker">SHARE YOUR QUEST ／ 共有する</span><h2>この冒険、友達にも教える？</h2>
   <p>{jobAsset?'第1章で獲得した冒険者JOBとクリア記念のカードを共有できるよ。':'家計クエスト完全クリアの記念カードを共有できるよ。'}金額・家計情報は載せないよ。</p>
   <button className="c2v2-share-primary c2v31-share-primary" onClick={()=>void shareImage()} disabled={shareBusy||!shareReady}>{shareBusy?'共有画面を開いています…':shareReady?'画像付きでシェアする ↗':'画像カードを準備中…'}</button>
   <small className="c2v31-share-help">{pilotNoExternalActions?'調査用の画面です。SNS投稿・画像保存・招待リンク配布は実行されません。':'共有先はスマホの画面で選んでね。X・LINE・Instagram・Threadsなど、使えるアプリは端末によって異なるよ。'}</small>
   <details className="c2v31-share-alternatives">
    <summary>画像の保存・文章だけで共有 <span aria-hidden="true">⌄</span></summary>
    <div className="c2v31-share-alt-grid">
     <button type="button" onClick={saveImage} disabled={!shareReady}>画像を保存</button>
     <button type="button" onClick={()=>void copyInviteLink()}>招待リンクをコピー</button>
     <button type="button" onClick={()=>shareText('x')}>Xで文章を共有</button>
     <button type="button" onClick={()=>shareText('line')}>LINEで文章を共有</button>
    </div>
    <small>文章共有では画像は自動添付されないよ。画像を使いたい場合は、保存してSNSで添付してね。</small>
   </details>
   {shareStatus&&<p className="c2v2-share-status" role="status">{shareStatus}</p>}
  </section>

  {onRestart&&<button className="c2v2-restart" onClick={onRestart}>家計クエストを最初からやり直す</button>}
 </div>
 {showCoverageLine&&<div className="c2v2-overlay" role="presentation" onClick={()=>setShowCoverageLine(false)}>
  <section className="c2v2-modal" role="dialog" aria-modal="true" aria-labelledby="c2v32-coverage-title" onClick={e=>e.stopPropagation()} data-dialog="COVERAGE_LINE_HANDOFF">
   <span className="c2v2-kicker">🛡 保障の相談</span>
   <h2 id="c2v32-coverage-title">公式LINEで保障を確認しよう</h2>
   <p>LINEの友だち追加だけでは相談内容は伝わりません。下の短い文章をコピーし、LINEのトークに貼り付けて送信してください。</p>
   <textarea className="c2v32-coverage-message" readOnly aria-label="LINEに送る保障相談メッセージ" value={coverageLineMessage} rows={3}/>
   <small className="c2v32-coverage-note">家計金額・健康情報は、この文章に含まれません。友だち追加だけでは予約は確定しません。</small>
   {coverageCopyError&&<p className="c2v32-coverage-copy-error" role="status">{coverageCopyError}</p>}
   <button type="button" className="c2v2-primary" onClick={()=>void copyAndOpenCoverageLine()}>相談文をコピーして公式LINEへ →</button>
   {coverageCopyError&&<button type="button" className="c2v2-subtle" onClick={openCoverageLine}>手動でコピーして公式LINEを開く →</button>}
   <button type="button" className="c2v2-subtle" onClick={()=>setShowCoverageLine(false)}>今は結果を見る</button>
  </section>
 </div>}
 {showLine&&<div className="c2v2-overlay" role="presentation" onClick={()=>setShowLine(false)}>
  <section className="c2v2-modal" role="dialog" aria-modal="true" aria-labelledby="c2v2-modal-title" onClick={e=>e.stopPropagation()}>
   <span className="c2v2-kicker">NEXT QUEST / LIFE PLAN</span>
   <h2 id="c2v2-modal-title">ライフプラン相談の案内へ</h2>
   <p>{pilotNoExternalActions?'これは調査用の案内画面です。公式LINEへの移動や相談予約は行われません。':'公式LINEで案内を確認して、相談したい内容や日程を調整しよう。友だち追加だけでは予約は確定しません。'}</p>
   <p className="c2v2-code">引き継ぎコード：{handoffCode(vm.diagnosisId)}</p>
   <button className="c2v2-primary" onClick={confirmConsultation}>公式LINEで無料相談の案内を受け取る →</button>
   <button className="c2v2-subtle" onClick={()=>setShowLine(false)}>今は結果を見る</button>
  </section>
 </div>}
 </main>;
}

const CSS=[
 '.c2v2-root{min-height:100dvh;background:#0b1b29;color:#f4f8fb;font-family:system-ui,-apple-system,sans-serif;padding:0 0 46px;}',
 '.c2v2-root *{box-sizing:border-box}.c2v2-page{max-width:470px;margin:auto}',
 ".c2v2-hero{position:relative;min-height:322px;padding:26px 22px 66px;background:linear-gradient(155deg,#29445a,#10283b 65%,#081723);text-align:left;overflow:hidden}",
 ".c2v2-eyebrow,.c2v2-kicker{display:block;letter-spacing:.06em;font-size:14px;font-weight:850;color:#f5d178}",
 ".c2v2-hero h1{position:relative;z-index:2;font-size:clamp(32px,8vw,39px);line-height:1.2;margin:19px 0 12px;max-width:68%;letter-spacing:-.03em}",
 ".c2v2-hero em{color:#ffe18a;font-style:normal}.c2v2-hero>p{position:relative;z-index:2;font-size:16px;line-height:1.65;margin:0;max-width:58%}",
 ".c2v2-hero-art{position:absolute;bottom:30px;right:7px;width:145px;height:176px;object-fit:contain;image-rendering:pixelated;z-index:1}",
 ".c2v2-scroll-cue{position:absolute;bottom:18px;left:22px;font-size:14px;font-weight:850;color:#f5d178;z-index:2}",
 ".c2v2-handoff{position:relative;z-index:1;margin:12px 12px 0;padding:12px 16px;background:#112637;border:1px solid #557b86;border-radius:13px}",
 ".c2v2-handoff span,.c2v2-handoff small{display:block;font-size:14px;color:#c6d4df}.c2v2-handoff b{display:block;font-size:18px;margin:4px 0}",
 '.c2v2-card{margin:14px 12px;padding:22px 18px;background:#173046;border:1px solid #3b5870;border-radius:18px}',
 '.c2v2-card h2{font-size:25px;line-height:1.3;margin:7px 0 12px;letter-spacing:-.02em}',
 '.c2v2-card p{font-size:15px;line-height:1.75;margin:10px 0;color:#d5e1ea}',
 ".c2v2-card small{font-size:14px;line-height:1.55;color:#bbcbd6}",
 '.c2v2-decision{border-color:#d0a958;background:linear-gradient(145deg,#2e413c,#23333f)}',
 '.c2v2-primary,.c2v2-share-primary{display:block;width:100%;min-height:56px;margin-top:16px;padding:12px;border:0;border-radius:13px;background:#f2d47e;color:#18232d;font-weight:900;font-size:16px;cursor:pointer;touch-action:manipulation}',
 '.c2v2-primary:focus-visible,.c2v2-root button:focus-visible{outline:3px solid #8de0ff;outline-offset:2px}',
 '.c2v2-decision>small{display:block;margin-top:11px}',
 '.c2v2-talk{padding:12px;background:#11293b;border-left:3px solid #e5c56c;border-radius:6px}',
 '.c2v2-counts{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}',
 ".c2v2-counts>div{padding:12px 14px;background:#0e2535;border:1px solid #355264;border-radius:12px}",
 ".c2v2-counts span{font-size:15px;display:block}.c2v2-counts strong{display:block;font-size:30px;margin-top:5px}.c2v2-counts strong small{font-size:14px;margin-left:4px}",
 ".c2v2-totals{margin-top:13px;display:grid;gap:8px}.c2v2-totals>div{background:#eaf1ee;color:#162b37;border-radius:12px;padding:16px}.c2v2-totals>div.c2v2-unconfirmed{background:#102b40;color:#f4f8fb;border:1px solid #536c7b}.c2v2-unconfirmed span i{font-style:normal;display:inline-block;margin-left:5px;border:1px solid #b9cede;border-radius:6px;padding:2px 6px;font-size:12px;color:#d8e7f1}.c2v2-totals>div.c2v2-unconfirmed>small{display:block;margin-top:6px;color:#d0dce4;font-size:14px}",
 ".c2v2-totals span{display:block;font-size:15px;font-weight:850}.c2v2-totals strong{display:block;font-size:clamp(23px,7vw,32px);margin-top:5px}",
 ".c2v2-totals strong small{color:#345260;font-size:14px}.c2v2-totals .c2v2-unconfirmed strong small{color:#d0dce4}.c2v2-root .c2v2-note{font-size:14px;color:#bfd0db}",
 '.c2v2-accumulation{margin-top:12px;background:#10283a;border:1px solid #35586a;border-radius:10px;padding:10px 14px}',
 ".c2v2-accumulation summary{cursor:pointer;min-height:48px;display:flex;align-items:center;font-size:15px;font-weight:800}",
 '.c2v2-quest{display:flex;gap:12px;align-items:center;background:#10293b;border-radius:12px;padding:14px}',
 '.c2v2-quest img{width:90px;height:90px;object-fit:contain;image-rendering:pixelated;flex:0 0 auto}',
 '.c2v2-quest div{min-width:0}.c2v2-quest b{font-size:17px}.c2v2-quest p{font-size:15px;margin:5px 0}.c2v2-quest strong{font-size:14px;color:#ffe3a2}',
 '.c2v2-entry{margin-top:9px;border:1px solid #3e6073;border-radius:12px;overflow:hidden}',
 '.c2v2-enemy{width:100%;background:#0e2535;border:0;color:inherit;display:flex;gap:12px;align-items:center;text-align:left;padding:12px;min-height:76px;cursor:pointer}',
 '.c2v2-enemy>img,.c2v2-enemy-icon{width:72px;height:72px;object-fit:contain;flex:0 0 auto}',
 ".c2v2-enemy-text{display:grid;gap:3px;min-width:0}.c2v2-enemy-text b{font-size:16px}.c2v2-enemy-text small{font-size:14px}",
 '.c2v2-enemy-text>span{font-size:14px;font-weight:850;color:#f4d888}',
 ".c2v2-detail{padding:14px;background:#112d3e;border-top:1px solid #3e6073}.c2v2-detail p{font-size:15px;margin:0 0 10px}",
 ".c2v2-detail small{display:block;font-size:13px}.c2v2-next-check{padding-top:8px;border-top:1px solid #355264}",
 '.c2v2-subtle{background:transparent;color:#dfedf6;width:100%;margin-top:13px;border:1px solid #527288;border-radius:12px;min-height:50px;font-size:15px;font-weight:800;cursor:pointer}',
 '.c2v2-goals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}',
 '.c2v2-goals button{min-height:58px;text-align:left;border:1px solid #577386;border-radius:11px;background:#102639;color:#f4f8fb;padding:11px;font-size:15px;font-weight:850;cursor:pointer}',
 '.c2v2-goals button.is-selected{border:2px solid #f5d178;background:#3b3e39}',
 '.c2v2-sharing{border-color:#55717c}.c2v2-share-primary{background:#d8e8ef;color:#12293a}',
 '.c2v2-share-primary:disabled{opacity:.55}.c2v2-text-shares{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}',
 ".c2v2-text-shares button{min-height:48px;border:1px solid #58798a;background:#12293d;border-radius:11px;color:#eef6fc;font-size:15px;font-weight:850}",
 '.c2v2-root .c2v2-share-status{color:#ffe19a;font-weight:800}',
 '.c2v2-restart{display:block;margin:28px auto 0;padding:12px 16px;background:transparent;border:0;color:#c2d4e0;font-size:14px;text-decoration:underline;cursor:pointer;min-height:48px}',
 '.c2v2-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:50;display:grid;place-items:center;padding:16px}',
 '.c2v2-modal{width:min(100%,440px);background:#153047;border:1px solid #8fa8b8;border-radius:17px;padding:24px;color:#fff}',
 '.c2v2-modal h2{font-size:26px;line-height:1.3;margin:10px 0}.c2v2-modal p{font-size:15px;line-height:1.7}',
 ".c2v2-code{background:#10273a;padding:10px;border-radius:9px;font-size:14px!important;word-break:break-word}",
 '.c2v32-coverage-message{width:100%;display:block;min-height:82px;resize:vertical;padding:12px;border-radius:10px;border:1px solid #92b4b8;background:#092431;color:#fff7d4;font:700 15px/1.65 system-ui;user-select:text}.c2v32-coverage-note{display:block;font-size:13px;line-height:1.6;margin-top:9px;color:#d9e8e8}.c2v32-coverage-copy-error{color:#ffe29c!important}.c2v2-modal{max-height:calc(100dvh - 32px);overflow:auto}',
 "@media(max-width:350px){.c2v2-hero-art{opacity:.45;right:-3px}.c2v2-hero h1,.c2v2-hero>p{max-width:90%}.c2v2-hero{min-height:342px}}",
 '@media(prefers-reduced-motion:reduce){.c2v2-root *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}'
].join('');

const V3CSS=[
  '.c2v3-world{background:#09252a;--c2v3-gold:#ffdc7a;--c2v3-panel:rgba(1,32,37,.92)}',
  '.c2v3-world .c2v2-page{max-width:470px;background:linear-gradient(180deg,rgba(11,49,55,.15),#083039 46%,#071d26);min-height:100dvh}',
  '.c2v3-world .c2v3-hero{min-height:340px;margin:0!important;padding:24px 20px 56px!important;background-image:linear-gradient(180deg,rgba(1,23,33,.12) 0%,rgba(1,23,33,.35) 30%,rgba(0,22,31,.78) 82%,rgba(0,24,29,.94)),url("./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp");background-color:#07323b;background-position:center 34%;background-size:cover;isolation:isolate;border-bottom:2px solid rgba(255,219,122,.54)}',
  '.c2v3-world .c2v3-hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 75% 63%,rgba(255,221,122,.17),transparent 46%);z-index:0}',
  '.c2v3-world .c2v3-hero>.c2v2-eyebrow{position:relative;z-index:3;display:inline-block;padding:6px 10px;background:rgba(0,29,37,.78);border:1px solid rgba(249,209,104,.55);border-radius:8px;color:#ffdc7a;font-size:13px;text-shadow:0 1px #001}',
  '.c2v3-world .c2v3-title-wrap{position:relative;z-index:3;margin-top:18px;width:100%;text-shadow:0 3px 9px #012}',
  '.c2v3-world .c2v3-title-wrap h1{font-size:clamp(26px,8vw,40px);max-width:70%;margin:0;line-height:1.25;color:white}',
  '.c2v3-world .c2v3-title-wrap em{color:#ffe48f}',
  '.c2v3-world .c2v3-hero-dialogue{margin-top:18px;width:59%;padding:10px;border-radius:10px;border:1px solid rgba(255,216,120,.47);background:rgba(0,29,35,.90);font-size:15px;line-height:1.65;font-weight:800}',
  '.c2v3-world .c2v3-hero-dialogue span{display:block;color:#ffe19b;font-size:13px;line-height:1.5;font-weight:850}',
  '.c2v3-world .c2v3-hero-dialogue b{display:block;font-size:15px;line-height:1.5;font-weight:850;white-space:nowrap}',
  '.c2v3-world .c2v3-hero-mascot{position:absolute;right:0;bottom:56px;width:40%;max-width:164px;height:auto;aspect-ratio:1;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 6px 10px rgba(0,0,0,.8));z-index:2}',
  '.c2v3-world .c2v2-scroll-cue{font-size:14px;left:20px;bottom:16px;color:#fff1b3}',
  '.c2v3-world .c2v3-job-card{display:flex;gap:14px;align-items:center;margin:14px 12px 6px;padding:11px 13px;border:2px solid rgba(242,208,105,.7);border-radius:15px;background:linear-gradient(135deg,rgba(0,54,56,.96),rgba(2,28,36,.97));box-shadow:0 9px 22px rgba(0,0,0,.24),inset 0 0 0 1px rgba(255,246,198,.15);position:relative;overflow:hidden}',
  '.c2v3-world .c2v3-job-card:after{content:"";position:absolute;right:-30px;top:-35px;width:90px;height:90px;border:1px solid rgba(251,222,127,.2);transform:rotate(45deg);pointer-events:none}',
  '.c2v3-world .c2v3-job-portrait{width:118px;height:124px;flex:0 0 118px;display:grid;place-items:center;background:radial-gradient(circle at 55% 43%,rgba(255,223,124,.18),transparent 65%);border-radius:12px}',
  '.c2v3-world .c2v3-job-portrait img{width:118px;height:118px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 5px 5px rgba(0,0,0,.32))}',
  '.c2v3-world .c2v3-job-meta{min-width:0;position:relative;z-index:1}',
  '.c2v3-world .c2v3-job-meta span{display:block;color:#ffe49b;font-size:11px;font-weight:900;letter-spacing:.05em}',
  '.c2v3-world .c2v3-job-meta small{display:block;color:#dce9e6;font-size:13px;line-height:1.4;margin-top:5px}',
  '.c2v3-world .c2v3-job-meta strong{display:block;font-size:21px;line-height:1.3;margin-top:5px;color:#fff}',
  '.c2v3-world .c2v3-job-meta p{color:#dce9e6;font-size:14px;line-height:1.5;margin:5px 0 0}',
  '.c2v3-world .c2v2-card{background:linear-gradient(160deg,rgba(1,44,49,.96),rgba(2,31,39,.96));border-color:rgba(216,174,82,.53);box-shadow:0 6px 24px rgba(0,0,0,.24),inset 0 0 0 1px rgba(255,235,159,.08)}',
  '.c2v3-world .c2v2-card h2{font-size:25px}',
  '.c2v3-world .c2v2-counts>div{background:rgba(0,31,38,.82);border-color:rgba(221,192,105,.23)}',
  '.c2v3-world .c2v3-future{position:relative;overflow:hidden;margin:14px 12px;padding:22px 18px 19px;border-radius:20px;border:2px solid rgba(248,205,111,.75);background-image:radial-gradient(circle at 50% -10%,rgba(247,205,96,.16),transparent 62%),linear-gradient(160deg,rgba(1,42,47,.98),rgba(4,32,35,.99));box-shadow:0 0 28px rgba(235,176,54,.13),inset 0 0 0 2px rgba(255,228,154,.09)}',
  '.c2v3-world .c2v3-future h2{font-size:27px;line-height:1.3;color:#fff4d5;margin:8px 0 17px}',
  '.c2v3-world .c2v3-reward-mini{display:grid;grid-template-columns:1fr 1fr;gap:9px}',
  '.c2v3-world .c2v3-reward-mini>div{padding:12px 7px;background:rgba(240,252,247,.94);border:1px solid #aad0c7;border-radius:12px;text-align:center;color:#103b41}',
  '.c2v3-world .c2v3-reward-mini small{display:block;font-size:14px;font-weight:850;color:#1a5156}',
  '.c2v3-world .c2v3-reward-mini strong{display:block;font-size:clamp(18px,5.3vw,26px);font-variant-numeric:tabular-nums;letter-spacing:-.035em;margin-top:6px;overflow-wrap:anywhere}',
  '.c2v3-world .c2v3-reward-ten{position:relative;text-align:center;overflow:hidden;margin-top:12px;padding:23px 9px 19px;border:2px solid rgba(255,224,117,.85);border-radius:14px;background:radial-gradient(circle at 50% 10%,rgba(255,233,146,.98),rgba(240,189,64,.96) 69%,#c78c2f 100%);color:#3b2808;box-shadow:0 8px 0 rgba(62,43,4,.25),0 12px 25px rgba(0,0,0,.26),inset 0 0 0 2px rgba(255,253,214,.35)}',
  '.c2v3-world .c2v3-reward-ten>span{display:block;font-size:15px;font-weight:1000;letter-spacing:.015em}',
  '.c2v3-world .c2v3-reward-ten strong{display:block;margin:11px auto 5px;font-variant-numeric:tabular-nums;font-size:clamp(35px,9.5vw,48px);line-height:1.18;letter-spacing:-.055em;overflow-wrap:anywhere;text-shadow:0 1px 0 rgba(255,254,216,.5)}',
  '.c2v3-world .c2v3-reward-ten p{font-size:14px;line-height:1.5;color:#523708;margin:6px 0 0;font-weight:800}',
  '.c2v3-world .c2v3-future-footnote{font-size:14px;line-height:1.7;color:#e1f0eb;margin:19px 0 0}',
  '.c2v3-world .c2v3-future-empty{border:1px solid rgba(225,195,113,.5);border-radius:12px;padding:17px;background:rgba(1,29,37,.8)}',
  '.c2v3-world .c2v3-future-empty strong{font-size:17px;line-height:1.55;color:#fff4cb}',
  '.c2v3-world .c2v3-future-empty p{font-size:15px;line-height:1.6;margin:10px 0 0;color:#e2efee}',
  '.c2v3-world .c2v3-decision{background-image:linear-gradient(160deg,rgba(0,27,31,.91),rgba(1,34,38,.86)),url("./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp");background-size:cover;background-position:center 40%;border-color:rgba(246,214,110,.78)}',
  '.c2v3-world .c2v3-decision h2{color:#ffe7a2;text-shadow:0 2px 6px #112}',
  '.c2v3-world .c2v3-decision .c2v2-primary{background:#f2d47e}',
  ".c2v3-world .c2v2-page{background-image:linear-gradient(180deg,rgba(5,45,45,.92),rgba(2,32,38,.97) 65%,#061d27),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp');background-position:center top;background-size:100% 100%,100% auto;background-repeat:no-repeat}",
  ".c2v3-world .c2v2-card{background:linear-gradient(155deg,rgba(1,43,48,.92),rgba(2,26,37,.96));border-color:rgba(231,191,107,.63)}",
  ".c2v3-world [data-section='HOUSEHOLD_BATTLE_RESULTS']{background-image:linear-gradient(150deg,rgba(0,33,41,.94),rgba(0,27,33,.97)),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp');background-position:center;background-size:cover}",
  ".c2v3-world .c2v2-talk{font-size:16px;line-height:1.7;color:#f3f5f0;background:rgba(4,31,40,.83)}",
  ".c2v3-world .c2v2-talk strong{display:block;font-size:14px;color:#ffe19b;margin-bottom:4px}",
    ".c2v3-world .c2v2-card p{font-size:16px}",
  ".c2v3-world .c2v2-card small{font-size:14px}",
  ".c2v3-world .c2v2-totals>div.c2v3-confirmed{border:2px solid #e6c977;background:linear-gradient(115deg,#f5f9f4,#e3f1e9);box-shadow:0 3px 0 rgba(226,200,105,.25)}",
  ".c2v3-world .c2v2-totals>div.c2v3-confirmed strong{font-size:clamp(30px,8.4vw,39px);line-height:1.18;letter-spacing:-.03em}",
  ".c2v3-world .c2v2-totals>div.c2v2-unconfirmed{background:rgba(11,38,49,.78);border:1px solid rgba(138,169,181,.52);padding:13px 14px}",
  ".c2v3-world .c2v2-totals>div.c2v2-unconfirmed span{font-size:14px;color:#d0dde4;font-weight:750}",
  ".c2v3-world .c2v2-totals>div.c2v2-unconfirmed strong{font-size:clamp(20px,5.8vw,24px);font-weight:750;color:#e3ebf1;line-height:1.3;margin-top:6px}",
  ".c2v3-world .c2v2-totals>div.c2v2-unconfirmed strong small{color:#bacbd5;font-size:13px}",
    ".c2v3-world .c2v3-job-meta span{font-size:13px;color:#ffe49b}",
  ".c2v3-world .c2v3-job-meta small{font-size:14px}",
  ".c2v3-world .c2v2-card .c2v2-primary{font-size:16px;line-height:1.45;min-height:56px}",
  ".c2v3-world .c2v3-decision{background-image:linear-gradient(160deg,rgba(0,27,31,.90),rgba(1,34,38,.84)),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp')}",
  ".c2v3-world .c2v3-future-footnote{font-size:14px;line-height:1.7}",
  ".c2v3-world .c2v3-reward-ten>span{font-size:16px}",
  ".c2v3-world .c2v3-reward-ten p{font-size:14px}",
    '@media(max-width:350px){.c2v3-world .c2v3-job-portrait{width:93px;height:100px;flex-basis:93px}.c2v3-world .c2v3-job-portrait img{width:93px;height:93px}.c2v3-world .c2v3-job-meta strong{font-size:18px}.c2v3-world .c2v3-hero-mascot{width:39%;right:-2px;bottom:58px}.c2v3-world .c2v3-hero-dialogue b{font-size:14px}}',
  '@media(prefers-reduced-motion:reduce){.c2v3-world *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}',
].join('');
