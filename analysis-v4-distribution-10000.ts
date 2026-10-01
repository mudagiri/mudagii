import {
  type ProfileV4,
  type AnnualIncomeBandV4,
} from './mudagiri-profile-v4';
import {
  emptyExpenseRecordsV4,
  type ExpenseRecordsV4,
  type ExpenseMetadataV4,
} from './expense-record-v4';
import {applyDiagnosisAmountV4,applyHouseholdTotalV4} from './scope-flow-v4';
import {buildComparisonFactsV4} from './benchmark-router-v4';
import {runDiagnosisAdapterV4} from './diagnosis-adapter-v4';
import {buildFinalJudgementsV4,type FinalAppraisalsV4} from './final-judgement-v4';
import type {Category,Satisfaction} from './mudagiri-diagnosis-v2';
import type {EducationStageV2} from './comparable-resolver-v2';

const CATS:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
let seed=20261001;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const pick=<T>(a:T[])=>a[Math.floor(rnd()*a.length)];
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const money=(base:number,spread=.8)=>Math.round(clamp(base*(1+(rnd()*2-1)*spread),0,base*3)/100)*100;
const satisfaction=():Satisfaction=>pick(['verySatisfied','satisfied','inertia','waste'] as Satisfaction[]);
const incomeBands:AnnualIncomeBandV4[]=['under500','500_599','600_699','700_799','800_999','1000plus','unknown'];
const stages:EducationStageV2[]=['publicKindergarten','privateKindergarten','publicElementary','privateElementary','publicJuniorHigh','privateJuniorHigh','publicHigh','privateHigh'];

type CatMetric={cut:number;review:number;protect:number;safe:number;na:number;attentionReview:number;confirmed:number;applicable:number};
const byCategory=Object.fromEntries(CATS.map(c=>[c,{cut:0,review:0,protect:0,safe:0,na:0,attentionReview:0,confirmed:0,applicable:0}])) as Record<Category,CatMetric>;
const reasonCodes:Record<string,number>={};
const reviewHist=Array(13).fill(0);
const priorityReviewHist=Array(13).fill(0);
const cutHist=Array(13).fill(0);
const firstQuestCategory=Object.fromEntries(CATS.map(c=>[c,0])) as Record<Category,number>;

let anyCut=0,anyReview=0,anyPriorityReview=0,noAction=0,confirmedYen=0,positiveConfirmedUsers=0;
let totalCut=0,totalReview=0,totalPriorityReview=0,totalProtect=0,totalSafe=0,totalNa=0;
let personalCases=0,householdCases=0,singleCases=0,multiCases=0,parentBundledCases=0;

function makeProfile():ProfileV4{
 const single=rnd()<.48;
 const householdSize=single?1:pick([2,2,2,3,3,4,4,5,6]);
 const diagnosisScope=single?'personal':(rnd()<.55?'personal':'household');
 if(diagnosisScope==='personal')personalCases++; else householdCases++;
 if(single)singleCases++; else multiCases++;

 const relationships:('children'|'parents')[]=[];
 let childCount=0;
 if(!single&&rnd()<.38){
   relationships.push('children');
   childCount=Math.min(householdSize-1,pick([1,1,1,2,2,3]));
 }
 const parents=!single&&rnd()<.10;
 if(parents)relationships.push('parents');
 const adultCount=householdSize-childCount;

 let contributionMode:null|'bundled'|'itemized'|'little_or_none'=null;
 let bundledContributionAmount:number|null=null;
 if(diagnosisScope==='personal'&&parents){
   contributionMode=pick(['bundled','itemized','little_or_none'] as const);
   if(contributionMode==='bundled'){
     bundledContributionAmount=money(50000,.45);
     parentBundledCases++;
   }
 }

 const parentHome=parents&&rnd()<.65;
 const housingRoll=rnd();
 let housingTenure:ProfileV4['housingTenure'];
 let housingSubtype:ProfileV4['housingSubtype'];
 if(parentHome){housingTenure='family_home';housingSubtype=null}
 else if(housingRoll<.58){housingTenure='rental';housingSubtype=rnd()<.93?'private_rental':'public_rental'}
 else {housingTenure='owned';housingSubtype=housingRoll<.82?'mortgage':'no_mortgage'}

 const baseIncome=single?340000:520000;
 const monthlyTakeHome=rnd()<.04?null:(money(baseIncome,.65)||180000);
 return {
   diagnosisScope,householdSize,adultCount,childCount,relationships,
   expenseSharing:null,
   householdContributionMode:contributionMode,
   bundledContributionAmount,
   prefecture:pick(['北海道','宮城県','東京都','神奈川県','新潟県','愛知県','大阪府','広島県','福岡県','沖縄県']),
   age:pick([25,32,41,55,67]),
   housingTenure,housingSubtype,
   monthlyTakeHome,
   annualIncomeBand:diagnosisScope==='household'&&householdSize>=2?pick(incomeBands):'unknown',
 };
}

function setAmount(profile:ProfileV4,records:ExpenseRecordsV4,cat:Category,totalAmount:number,metadata?:ExpenseMetadataV4){
 const shared=new Set<Category>(['rent','energy','food','daily','childEducation']);
 let diagnosisAmount=totalAmount;
 let householdTotal:number|undefined;
 if(profile.diagnosisScope==='personal'&&profile.householdSize>=2&&shared.has(cat)&&profile.householdContributionMode!=='bundled'){
   const share=.30+rnd()*.42;
   diagnosisAmount=Math.round(totalAmount*share/100)*100;
   householdTotal=totalAmount;
 }
 records[cat]=applyDiagnosisAmountV4(profile,records[cat],diagnosisAmount);
 if(householdTotal!==undefined)records[cat]=applyHouseholdTotalV4(records[cat],householdTotal);
 if(metadata)records[cat]={...records[cat],metadata:{...records[cat].metadata,...metadata}};
}

for(let id=1;id<=10000;id++){
 const profile=makeProfile();
 const records=emptyExpenseRecordsV4();
 const appraisal:FinalAppraisalsV4={};
 const single=profile.householdSize===1;
 const bases:Record<Category,number>={
   mobile:single?6000:9500,
   energy:single?12000:23000,
   sub:5000,
   car:35000,
   food:single?52000:90000,
   daily:single?8000:13000,
   fun:single?18000:26000,
   beautyFashion:single?12000:18000,
   rent:single?95000:145000,
   insurance:single?12000:28000,
   childEducation:45000,
   selfDevelopment:18000
 };

 for(const cat of CATS){
   const applicable=cat!=='childEducation'||profile.childCount>0;
   if(!applicable){
     records[cat]={...records[cat],applicability:'na',known:false,diagnosisAmount:null,personalBurden:null,householdTotal:null};
     continue;
   }
   if(rnd()<.035)continue;
   let amount=rnd()<.08?0:money(bases[cat],.8);
   if(cat==='rent'&&profile.housingTenure==='family_home'&&profile.householdContributionMode==='bundled')amount=0;

   let metadata:ExpenseMetadataV4|undefined;
   if(cat==='childEducation'){
     metadata={educationChildren:Array.from({length:profile.childCount},()=>({stage:pick(stages)}))};
   }
   if(cat==='beautyFashion'){
     metadata={beautySex:pick(['male','female','preferNot'] as const)};
   }
   setAmount(profile,records,cat,amount,metadata);
   if(amount===0)continue;

   if(cat==='mobile'){
     const mobileScope=pick(['mobileOnly','mobileOnly','mobileInternet','mobileInternet','familyOrMultiple','unknown'] as const);
     appraisal[cat]={mobileScope,mobileCarrier:mobileScope==='mobileOnly'?pick(['major','mvno','unknown'] as const):undefined};
   }
   if(cat==='energy')appraisal[cat]={energyPersistence:pick(['persistent','temporary','unknown'] as const)};
   if(cat==='daily')appraisal[cat]={dailyPersistence:pick(['persistent','temporary','unknown'] as const)};
   if(cat==='food'||cat==='fun'||cat==='beautyFashion')appraisal[cat]={satisfaction:satisfaction()};
   if(cat==='sub'){
     const usage=pick(['none','one','several','unknown'] as const);
     const unused=(usage==='one'||usage==='several')&&rnd()<.62?Math.round(amount*(.15+rnd()*.55)):undefined;
     appraisal[cat]={subUsage:usage,subUnusedAmount:unused,subCancellationConfirmed:unused!==undefined?rnd()<.55:undefined};
   }
   if(cat==='car')appraisal[cat]={carNeed:pick(['essential','useful','burden','notNeeded'] as const)};
   if(cat==='rent')appraisal[cat]={rentPreference:pick(['burdenHigh','burdenSome','reasonable','protect'] as const)};
   if(cat==='insurance'){
     const strong=rnd()<.35;
     appraisal[cat]=strong?{insurancePurpose:'clear',insuranceLastReview:pick(['within1y','1to3y'] as const)}
       :{insurancePurpose:pick(['mostly','unclear'] as const),insuranceLastReview:pick(['1to3y','over3y','never','unknown'] as const)};
   }
   if(cat==='childEducation')appraisal[cat]={educationPreference:pick(['reviewHigh','reviewSome','necessary','protect'] as const)};
   if(cat==='selfDevelopment')appraisal[cat]={selfDevelopmentValue:pick(['inertia','unclear','purpose','results'] as const)};
 }

 const comparisons=buildComparisonFactsV4({profile,records,month:pick([1,2,4,7,10,12])});
 const dx=runDiagnosisAdapterV4({profile,records,comparisons,appraisal});
 const final=buildFinalJudgementsV4({records,comparisons,diagnosis:dx.diagnosis,categoryResults:dx.categoryResults,appraisal});

 let cuts=0,reviews=0,priorityReviews=0;
 for(const row of final.categories){
   const cm=byCategory[row.category];
   cm[row.status]++;
   if(row.status!=='na')cm.applicable++;
   if(row.status==='review'&&row.attentionFlag){cm.attentionReview++;priorityReviews++}
   if(row.status==='cut'){cuts++;totalCut++;if(row.confirmedSaving>0){cm.confirmed++;confirmedYen+=row.confirmedSaving}}
   if(row.status==='review'){reviews++;totalReview++}
   if(row.status==='protect')totalProtect++;
   if(row.status==='safe')totalSafe++;
   if(row.status==='na')totalNa++;
   reasonCodes[row.reasonCode]=(reasonCodes[row.reasonCode]??0)+1;
 }
 cutHist[cuts]++;reviewHist[reviews]++;priorityReviewHist[priorityReviews]++;
 if(cuts>0){anyCut++;positiveConfirmedUsers++}
 if(reviews>0)anyReview++;
 if(priorityReviews>0)anyPriorityReview++;
 if(cuts===0&&priorityReviews===0)noAction++;

 const candidates=final.categories.filter(x=>x.status==='cut'||(x.status==='review'&&x.attentionFlag))
   .sort((a,b)=>a.status===b.status?((b.screeningDelta??0)-(a.screeningDelta??0)):(a.status==='cut'?-1:1));
 if(candidates[0])firstQuestCategory[candidates[0].category]++;
}

const pct=(n:number,d=10000)=>Math.round(n/d*10000)/100;
const categoryRates=Object.fromEntries(CATS.map(cat=>{
 const x=byCategory[cat];const d=x.applicable||1;
 return [cat,{
   applicable:x.applicable,
   cutPct:pct(x.cut,d),
   reviewPct:pct(x.review,d),
   attentionReviewPct:pct(x.attentionReview,d),
   protectPct:pct(x.protect,d),
   safePct:pct(x.safe,d),
   na:x.na,
   confirmed:x.confirmed,
 }];
}));
const sortedReasons=Object.entries(reasonCodes).sort((a,b)=>b[1]-a[1]).slice(0,20);
console.log(JSON.stringify({
 model:'CURRENT_V4_SYNTHETIC_DISTRIBUTION',
 cases:10000,
 assumptions:{
   sameSpendBasesAsLegacy10k:true,
   amountSpread:'±80% around category bases, clamped 0..3x',
   unknownAmountRate:0.035,
   zeroSpendRate:0.08,
   singleShare:0.48,
   multiShare:0.52,
   multiPersonalScopeShare:0.55,
   childHouseholdConditionalShare:0.38,
   parentCohabitConditionalShare:0.10,
   appraisalChoices:'synthetic/equal-weight unless noted; not observed user population'
 },
 userRates:{
   anyCutUsers:anyCut,anyCutPct:pct(anyCut),
   zeroCutUsers:10000-anyCut,zeroCutPct:pct(10000-anyCut),
   anyReviewUsers:anyReview,anyReviewPct:pct(anyReview),
   zeroReviewUsers:10000-anyReview,zeroReviewPct:pct(10000-anyReview),
   anyPriorityReviewUsers:anyPriorityReview,anyPriorityReviewPct:pct(anyPriorityReview),
   zeroPriorityReviewUsers:10000-anyPriorityReview,zeroPriorityReviewPct:pct(10000-anyPriorityReview),
   noCutOrPriorityUsers:noAction,noCutOrPriorityPct:pct(noAction),
   avgCuts:totalCut/10000,
   avgReviews:totalReview/10000,
   avgPriorityReviews:priorityReviewHist.reduce((s,n,i)=>s+n*i,0)/10000,
   avgProtect:totalProtect/10000,
   avgSafe:totalSafe/10000,
   avgNa:totalNa/10000,
   avgConfirmedYenWhenPositive:positiveConfirmedUsers?Math.round(confirmedYen/positiveConfirmedUsers):0
 },
 cohorts:{personalCases,householdCases,singleCases,multiCases,parentBundledCases},
 cutHistogram:cutHist,
 reviewHistogram:reviewHist,
 priorityReviewHistogram:priorityReviewHist,
 byCategory:categoryRates,
 firstQuestCategory,
 topReasonCodes:sortedReasons
},null,2));
