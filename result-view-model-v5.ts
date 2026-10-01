import type {Category} from './mudagiri-diagnosis-v2';
import type {ProfileV4} from './mudagiri-profile-v4';
import type {FinalCategoryV4} from './final-judgement-v4';
import {buildResultViewModelV4} from './result-view-model-v4';

export type PositionLabelV5='かなり低め'|'やや低め'|'標準圏'|'やや高め'|'かなり高め';
export type V5Status='cut'|'optimize'|'protect'|'inspect'|'ok'|'na';

const V5_STATUS_LABEL:Record<V5Status,string>={
 cut:'斬る',optimize:'整える',protect:'守る',inspect:'見極める',ok:'今はそのままでOK',na:'対象外'
};

const STRUCTURAL=new Set<Category>(['rent','insurance','car','childEducation','selfDevelopment']);
const STANDARD_C=new Set<Category>(['food','daily','fun','beautyFashion']);

const bandLower=(s:unknown)=>{
 const m=String(s??'').replace(/,/g,'').match(/(\d+)～/);
 return m?Number(m[1]):null;
};

const ratioPosition=(actual:number,benchmark:number,wide:boolean):PositionLabelV5=>{
 const r=actual/benchmark;
 if(wide){
  if(r<.75)return 'かなり低め';
  if(r<.90)return 'やや低め';
  if(r<=1.15)return '標準圏';
  if(r<1.40)return 'やや高め';
  return 'かなり高め';
 }
 if(r<.80)return 'かなり低め';
 if(r<.95)return 'やや低め';
 if(r<=1.10)return '標準圏';
 if(r<1.30)return 'やや高め';
 return 'かなり高め';
};

function positionFor(x:FinalCategoryV4){
 const amount=x.comparison.amount??x.record.diagnosisAmount;
 if(amount===null)return {available:false as const,label:null,method:'none' as const,ratio:null};

 if(x.category==='mobile'){
  const a=x.appraisal;
  if(a?.mobileScope!=='mobileOnly'||(a.mobileCarrier!=='major'&&a.mobileCarrier!=='mvno')){
   return {available:false as const,label:null,method:'mobile_scope' as const,ratio:null};
  }
  const n=amount;
  const label:PositionLabelV5=a.mobileCarrier==='major'
   ?n<=2999?'かなり低め':n<=3999?'やや低め':n<=5999?'標準圏':n<=9999?'やや高め':'かなり高め'
   :n<=1499?'かなり低め':n<=1999?'やや低め':n<=2999?'標準圏':n<=4999?'やや高め':'かなり高め';
  return {available:true as const,label,method:'mobile_band' as const,ratio:null};
 }

 const benchmark=x.comparison.benchmark;
 if(benchmark===null||benchmark<=0)return {available:false as const,label:null,method:'none' as const,ratio:null};

 if(x.category==='rent'&&x.comparison.benchmarkMeta?.meta?.reason==='PRIVATE_RENT_DISTRIBUTION'){
  const p75=bandLower(x.comparison.benchmarkMeta.meta.p75Band);
  const p90=bandLower(x.comparison.benchmarkMeta.meta.p90Band);
  if(p75!==null&&p90!==null){
   const veryLow=benchmark*.80;
   const low=benchmark*.95;
   const high=Math.max(benchmark*1.10,p75);
   const veryHigh=Math.max(benchmark*1.30,p90);
   const label:PositionLabelV5=amount<veryLow?'かなり低め':amount<low?'やや低め':amount<high?'標準圏':amount<veryHigh?'やや高め':'かなり高め';
   return {available:true as const,label,method:'rent_hybrid' as const,ratio:amount/benchmark};
  }
 }

 const wide=x.comparison.quality==='reference'||STRUCTURAL.has(x.category);
 return {available:true as const,label:ratioPosition(amount,benchmark,wide),method:wide?'wide':'standard',ratio:amount/benchmark};
}

const isHigh=(p:ReturnType<typeof positionFor>)=>p.available&&(p.label==='やや高め'||p.label==='かなり高め');

function v5StatusFor(x:FinalCategoryV4,p:ReturnType<typeof positionFor>):V5Status{
 if(x.record.applicability==='na')return 'na';
 if(!x.record.known||x.record.diagnosisAmount===null)return 'inspect';
 if(x.record.diagnosisAmount===0)return 'ok';
 const a=x.appraisal;

 if(x.category==='sub'){
  if(x.confirmedSaving>0)return 'cut';
  if((a?.subUnusedAmount??0)>0)return 'inspect';
  return a?.subUsage==='none'?'ok':'inspect';
 }
 if(x.category==='mobile'){
  if(a?.mobileScope!=='mobileOnly'||(a?.mobileCarrier!=='major'&&a?.mobileCarrier!=='mvno'))return 'inspect';
  return isHigh(p)?'optimize':'ok';
 }
 if(x.category==='energy'){
  if(!isHigh(p))return 'ok';
  if(a?.energyPersistence==='temporary')return 'ok';
  if(a?.energyPersistence==='persistent')return 'optimize';
  return 'inspect';
 }
 if(x.category==='daily'){
  if(!isHigh(p))return 'ok';
  if(a?.dailyPersistence==='temporary')return 'ok';
  if(a?.dailyPersistence==='persistent')return 'optimize';
  return 'inspect';
 }
 if(x.category==='food'||x.category==='fun'||x.category==='beautyFashion'){
  if(a?.satisfaction==='waste')return 'cut';
  if(a?.satisfaction==='inertia')return 'optimize';
  if(a?.satisfaction==='verySatisfied')return isHigh(p)?'optimize':'protect';
  if(a?.satisfaction==='satisfied')return isHigh(p)?'optimize':'ok';
  return isHigh(p)?'inspect':'ok';
 }
 if(x.category==='car'){
  if(a?.carNeed==='notNeeded')return 'cut';
  if(a?.carNeed==='burden')return 'optimize';
  if(a?.carNeed==='essential'||a?.carNeed==='useful')return 'protect';
  return 'inspect';
 }
 if(x.category==='rent'){
  if(a?.rentPreference==='burdenHigh'||a?.rentPreference==='burdenSome')return 'optimize';
  if(a?.rentPreference==='protect')return 'protect';
  if(a?.rentPreference==='reasonable')return 'ok';
  return isHigh(p)?'inspect':'ok';
 }
 if(x.category==='insurance'){
  if(a?.insurancePurpose==='clear'&&(a?.insuranceLastReview==='within1y'||a?.insuranceLastReview==='1to3y'))return 'protect';
  if(a?.insurancePurpose==='unclear'||a?.insuranceLastReview==='over3y'||a?.insuranceLastReview==='never')return 'optimize';
  return 'inspect';
 }
 if(x.category==='childEducation'){
  if(a?.educationPreference==='necessary'||a?.educationPreference==='protect')return 'protect';
  if(a?.educationPreference==='reviewHigh'||a?.educationPreference==='reviewSome')return 'optimize';
  return 'inspect';
 }
 if(x.category==='selfDevelopment'){
  if(a?.selfDevelopmentValue==='inertia')return 'cut';
  if(a?.selfDevelopmentValue==='unclear')return 'inspect';
  if(a?.selfDevelopmentValue==='purpose'||a?.selfDevelopmentValue==='results')return 'protect';
  return 'inspect';
 }
 return x.status==='protect'?'protect':x.status==='review'?'inspect':x.status==='cut'?'cut':'ok';
}

function cUpperFor(x:FinalCategoryV4,p:ReturnType<typeof positionFor>){
 const actual=x.record.diagnosisAmount;
 if(actual===null||actual<=0)return {amount:0,eligible:false,detailReview:false,method:null as null|'standard'|'wide'|'mobile'};
 const a=x.appraisal;

 if(x.category==='mobile'){
  if(a?.mobileScope!=='mobileOnly'||(a.mobileCarrier!=='major'&&a.mobileCarrier!=='mvno'))return {amount:0,eligible:false,detailReview:false,method:null};
  const floor=a.mobileCarrier==='major'?6000:3000;
  const cap=a.mobileCarrier==='major'?20000:10000;
  return {amount:Math.max(0,Math.min(actual,cap)-floor),eligible:actual>floor,detailReview:actual>cap,method:'mobile' as const};
 }

 if(!x.comparison.engineComparableAllowed)return {amount:0,eligible:false,detailReview:false,method:null};
 const benchmark=x.comparison.benchmark;
 if(benchmark===null||benchmark<=0)return {amount:0,eligible:false,detailReview:false,method:null};

 let eligible=false;
 let wide=x.comparison.quality==='reference';
 if(x.category==='energy'){
  eligible=a?.energyPersistence==='persistent';
  wide=x.comparison.quality==='reference';
 }else if(x.category==='daily'){
  eligible=a?.dailyPersistence==='persistent';
 }else if(STANDARD_C.has(x.category)){
  eligible=true;
 }else{
  return {amount:0,eligible:false,detailReview:false,method:null};
 }
 if(!eligible)return {amount:0,eligible:false,detailReview:false,method:null};

 const neutralHigh=benchmark*(wide?1.15:1.10);
 const cap=benchmark*2;
 return {
  amount:Math.max(0,Math.min(actual,cap)-neutralHigh),
  eligible:actual>neutralHigh,
  detailReview:actual>cap,
  method:wide?'wide' as const:'standard' as const
 };
}

const nextAction=(category:Category,status:V5Status)=>{
 if(category==='sub')return status==='cut'?'未使用サブスクを停止する':'未使用契約と解約条件を確認';
 if(category==='mobile')return 'スマホ1回線の料金プランを確認';
 if(category==='energy')return '直近2〜3か月の明細と契約プランを確認';
 if(category==='food')return '満足を落とさず減らせる支出を1つ探す';
 if(category==='daily')return 'まとめ買い・定期購入の明細を確認';
 if(category==='fun')return '惰性になっている支出を1つ確認';
 if(category==='beautyFashion')return '満足を保ったまま価格を整えられる項目を確認';
 if(category==='car')return 'ローン・保険・駐車場・燃料を分けて確認';
 if(category==='rent')return '住居費の負担と契約条件を確認';
 if(category==='insurance')return '保障内容と最後の見直し時期を確認';
 if(category==='childEducation')return '教育費の中身と今後の優先順位を確認';
 return '目的・利用状況・成果を確認';
};

function nextScore(x:any){
 if(x.aAmount>0)return 500000+x.aAmount;
 const a=x.appraisal;
 if(a?.satisfaction==='waste'||a?.selfDevelopmentValue==='inertia'||a?.carNeed==='notNeeded')return 400000+(x.amount??0);
 if(x.cUpper>0)return 300000+x.cUpper;
 if(x.v5Status==='optimize'){
  const delta=Math.max(0,x.comparisonDifference??0);
  return 200000+delta;
 }
 if(x.v5Status==='inspect')return 100000+Math.max(0,x.comparisonDifference??0);
 return -1;
}

function roundHero(n:number){
 if(n<5000)return Math.round(n/100)*100;
 if(n<50000)return Math.round(n/500)*500;
 return Math.round(n/1000)*1000;
}

export function buildResultViewModelV5(a:{
 diagnosisId?:string;
 toneMode?:string;
 type?:any;
 annualIncomeBand?:string;
 profile:ProfileV4;
 finalCategories:FinalCategoryV4[];
}){
 const base=buildResultViewModelV4(a);
 const byCat=new Map(a.finalCategories.map(x=>[x.category,x]));
 const rows=(base.rows as any[]).map(row=>{
  const x=byCat.get(row.category as Category)!;
  const position=positionFor(x);
  const v5Status=v5StatusFor(x,position);
  const c=cUpperFor(x,position);
  const aAmount=x.category==='sub'?Math.max(0,x.confirmedSaving):0;
  return {
   ...row,
   positionAvailable:position.available,
   positionLabel:position.label,
   positionMethod:position.method,
   positionRatio:position.ratio,
   v5Status,
   v5StatusLabel:V5_STATUS_LABEL[v5Status],
   cUpper:c.amount,
   cEligible:c.eligible,
   detailReview:c.detailReview,
   cMethod:c.method,
   aAmount,
   nextAction:nextAction(x.category,v5Status),
  };
 });

 const totalA=rows.reduce((s,x)=>s+x.aAmount,0);
 const totalBLower=0,totalBUpper=0;
 const totalC=rows.reduce((s,x)=>s+x.cUpper,0);
 const lower=totalA+totalBLower;
 const upper=totalA+totalBUpper+totalC;
 const reviewCount=rows.filter(x=>x.v5Status==='cut'||x.v5Status==='optimize'||x.v5Status==='inspect').length;
 const potential={
  lower,upper,
  lowerDisplay:roundHero(lower),
  upperDisplay:roundHero(upper),
  confirmedA:totalA,bLower:totalBLower,bUpper:totalBUpper,cUpper:totalC,
  hasMoney:upper>0,
  mode:lower>0?(upper>lower?'range':'confirmed'):(upper>0?'maximum':'none'),
  oneYear:{lower:lower*12,upper:upper*12},
  fiveYear:{lower:lower*60,upper:upper*60},
  tenYear:{lower:lower*120,upper:upper*120},
  reviewCount,
 };
 const v5Counts={
  cut:rows.filter(x=>x.v5Status==='cut').length,
  optimize:rows.filter(x=>x.v5Status==='optimize').length,
  protect:rows.filter(x=>x.v5Status==='protect').length,
  inspect:rows.filter(x=>x.v5Status==='inspect').length,
  ok:rows.filter(x=>x.v5Status==='ok').length,
  na:rows.filter(x=>x.v5Status==='na').length,
 };
 const priorityRows=rows.map(x=>({...x,_nextScore:nextScore(x)})).filter(x=>x._nextScore>=0).sort((x,y)=>y._nextScore-x._nextScore);
 const firstQuest=priorityRows[0]??null;
 const cRows=rows.filter(x=>x.cUpper>0).sort((x,y)=>y.cUpper-x.cUpper);
 const precisionTarget=cRows.length>0&&totalC>0&&(lower===0||totalC/Math.max(1,upper)>=.60)?cRows[0]:null;
 const positionRows=rows.filter(x=>x.positionAvailable||x.comparisonDifference!==null);

 return {
  ...base,
  version:'MUDAGIRI_RESULT_VM_V5_0' as const,
  rows,
  v5Counts,
  positionRows,
  potential,
  firstQuest,
  precisionTarget,
  structuralRows:rows.filter(x=>STRUCTURAL.has(x.category)&&x.comparisonDifference!==null),
  comparisonAggregationRule:'V5_CATEGORY_LEVEL_POSITION_ONLY' as const,
  // Compatibility: this field retains V4 confirmed-only semantics.
  improvement:base.improvement,
 };
}

export const RESULT_VM_V5_VERSION='MUDAGIRI_RESULT_VM_V5_0';
