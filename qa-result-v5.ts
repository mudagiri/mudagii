import fs from 'node:fs';
import type {Category} from './mudagiri-diagnosis-v2';
import {buildResultViewModelV5} from './result-view-model-v5';

const ALL:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
const profile:any={
 diagnosisScope:'personal',householdSize:1,adultCount:1,childCount:0,relationships:[],expenseSharing:null,
 householdContributionMode:null,bundledContributionAmount:null,prefecture:'東京都',age:35,
 housingTenure:'rental',housingSubtype:'private_rental',monthlyTakeHome:400000,annualIncomeBand:'600_699'
};
const type:any={code:'VIA',name:'直感消費エンターテイナー',description:'QA',catchphrase:'QA',strengthLabel:'QA',blindSpot:'QA',shareHook:'QA',axes:{fv:0,pi:0,au:0},axisStrength:{fv:0,pi:0,au:0},nearMiddle:{fv:true,pi:true,au:true}};

function cat(category:Category,o:any={}){
 const amount=o.amount??1000;
 const benchmark=o.benchmark===undefined?null:o.benchmark;
 const quality=o.quality??(benchmark===null?'none':'exact');
 const diff=benchmark===null?null:amount-benchmark;
 return {
  category,
  record:{category,diagnosisAmount:amount,personalBurden:amount,householdTotal:null,comparisonAmount:amount,comparisonBenchmark:benchmark,comparisonQuality:quality,known:true,applicability:'applicable',metadata:o.metadata??{}},
  comparison:{category,amount,benchmark,quality,amountScope:o.amountScope??'personal',sourceVersion:'QA',difference:diff,engineComparableAllowed:o.engineComparableAllowed??(benchmark!==null&&category!=='mobile'),autoSavingAllowed:false,benchmarkMeta:o.benchmarkMeta??(benchmark===null?null:{value:benchmark,confidence:quality==='reference'?'MODEL':'DIRECT',sourceVersion:'QA',meta:o.meta??{}}),reason:'QA'},
  engine:null,status:o.status??'review',confirmedSaving:o.confirmedSaving??0,screeningDelta:diff,attentionFlag:true,reasonCode:o.reasonCode??'QA',appraisal:o.appraisal??null
 } as any;
}
function build(overrides:Partial<Record<Category,any>>={}){
 const categories=ALL.map(c=>overrides[c]??cat(c,{amount:0,benchmark:null,status:'safe'}));
 return buildResultViewModelV5({diagnosisId:'QA',toneMode:'serious',type,profile,annualIncomeBand:'600_699',finalCategories:categories as any});
}
function row(vm:any,c:Category){return vm.rows.find((x:any)=>x.category===c)}
function eq(a:any,b:any,m:string){if(a!==b)throw new Error(`${m}: ${String(a)} !== ${String(b)}`)}
function ok(v:any,m:string){if(!v)throw new Error(m)}

// High satisfaction protects value, not the current price.
let vm=build({food:cat('food',{amount:70000,benchmark:50000,appraisal:{satisfaction:'verySatisfied'}})});
eq(row(vm,'food').positionLabel,'かなり高め','food position');
eq(row(vm,'food').v5Status,'optimize','high valued food should optimize, not protect');
eq(Math.round(row(vm,'food').cUpper),15000,'food standard C');
eq(vm.potential.lower,0,'C must never enter lower');
eq(Math.round(vm.potential.upper),15000,'C enters upper');
eq(vm.potential.mode,'maximum','C-only mode');

// User-declared low value can be cut even without fake saving yen.
vm=build({food:cat('food',{amount:70000,benchmark:50000,appraisal:{satisfaction:'waste'}})});
eq(row(vm,'food').v5Status,'cut','waste food status');
eq(vm.potential.lower,0,'cut without concrete evidence must not fabricate lower');

// A is confirmed subscription only in the lightweight flow.
vm=build({sub:cat('sub',{amount:5000,benchmark:null,confirmedSaving:1800,appraisal:{subUnusedAmount:1800,subCancellationConfirmed:true,subUsage:'one'},status:'cut'})});
eq(row(vm,'sub').aAmount,1800,'sub A');
eq(vm.potential.lower,1800,'A lower');
eq(vm.potential.upper,1800,'A upper');

// Structural comparison difference is visible but never auto-added to Potential.
vm=build({rent:cat('rent',{amount:150000,benchmark:100000,appraisal:{rentPreference:'burdenSome'},amountScope:'property'})});
eq(row(vm,'rent').comparisonDifference,50000,'rent difference');
eq(row(vm,'rent').cUpper,0,'rent must not create C');
eq(vm.potential.upper,0,'rent gap must not inflate Potential');

// MODEL energy uses WIDE neutral high and requires persistence.
vm=build({energy:cat('energy',{amount:30000,benchmark:20000,quality:'reference',appraisal:{energyPersistence:'persistent'}})});
eq(Math.round(row(vm,'energy').cUpper),7000,'energy wide C');
eq(row(vm,'energy').v5Status,'optimize','persistent high energy');
vm=build({energy:cat('energy',{amount:30000,benchmark:20000,quality:'reference',appraisal:{energyPersistence:'temporary'}})});
eq(row(vm,'energy').cUpper,0,'temporary energy no C');
eq(row(vm,'energy').v5Status,'ok','temporary energy ok');

// Scope mismatch blocks automatic C.
vm=build({food:cat('food',{amount:70000,benchmark:50000,engineComparableAllowed:false,appraisal:{satisfaction:'inertia'}})});
eq(row(vm,'food').cUpper,0,'scope mismatch blocks C');

// Extreme values are capped at 2x and flagged, never reset to zero.
vm=build({food:cat('food',{amount:200000,benchmark:50000,appraisal:{satisfaction:'inertia'}})});
eq(Math.round(row(vm,'food').cUpper),45000,'2x cap');
ok(row(vm,'food').detailReview,'extreme value detail flag');

// Mobile uses direct bands only for one known line.
vm=build({mobile:cat('mobile',{amount:12000,benchmark:null,engineComparableAllowed:false,appraisal:{mobileScope:'mobileOnly',mobileCarrier:'major'}})});
eq(row(vm,'mobile').positionLabel,'かなり高め','mobile major position');
eq(row(vm,'mobile').cUpper,6000,'mobile C');
vm=build({mobile:cat('mobile',{amount:12000,benchmark:null,engineComparableAllowed:false,appraisal:{mobileScope:'mobileInternet',mobileCarrier:'major'}})});
eq(row(vm,'mobile').positionAvailable,false,'combined telecom no one-line position');
eq(row(vm,'mobile').cUpper,0,'combined telecom no C');


// Insurance V5 reference overlay: personal uses age-based individual survey, structural gap never enters Potential.
vm=build({insurance:cat('insurance',{amount:25000,benchmark:null,engineComparableAllowed:false,appraisal:{insurancePurpose:'unclear',insuranceLastReview:'over3y'}})});
ok(row(vm,'insurance').positionAvailable,'insurance personal reference available');
ok(row(vm,'insurance').comparable>0,'insurance personal comparator populated');
eq(row(vm,'insurance').cUpper,0,'insurance reference must not create automatic C');
eq(vm.potential.upper,0,'insurance gap must not inflate Potential');
eq(row(vm,'insurance').v5Status,'optimize','unclear stale insurance should optimize');

// Household insurance: age is primary and directly matching income bands appear only as a separate lens.
const householdProfile:any={...profile,diagnosisScope:'household',householdSize:2,adultCount:2,relationships:['partner'],annualIncomeBand:'600_699'};
const householdCats=ALL.map(c=>c==='insurance'?cat('insurance',{amount:40000,benchmark:null,engineComparableAllowed:false,amountScope:'household',appraisal:{insurancePurpose:'clear',insuranceLastReview:'within1y'}}):cat(c,{amount:0,benchmark:null,status:'safe'}));
const hvm=buildResultViewModelV5({diagnosisId:'QA-H',toneMode:'serious',type,profile:householdProfile,annualIncomeBand:'600_699',finalCategories:householdCats as any});
ok(row(hvm,'insurance').v5ReferenceSecondary.length===1,'household income lens available');
eq(row(hvm,'insurance').cUpper,0,'household insurance remains structural');

// Owned housing structural reference: 2+ household with mortgage gets age-bucket reference, never Potential.
const mortgageProfile:any={...profile,diagnosisScope:'household',householdSize:2,adultCount:2,relationships:['partner'],housingTenure:'owned',housingSubtype:'mortgage',age:42};
const mortgageCats=ALL.map(c=>c==='rent'?cat('rent',{amount:150000,benchmark:null,engineComparableAllowed:false,amountScope:'property',appraisal:{rentPreference:'burdenSome'}}):cat(c,{amount:0,benchmark:null,status:'safe'}));
const mvm=buildResultViewModelV5({diagnosisId:'QA-M',toneMode:'serious',type,profile:mortgageProfile,annualIncomeBand:'600_699',finalCategories:mortgageCats as any});
eq(row(mvm,'rent').comparable,93705,'mortgage 40-44 reference');
eq(row(mvm,'rent').cUpper,0,'mortgage reference must never create C');
eq(mvm.potential.upper,0,'mortgage gap must not inflate Potential');

// Single mortgage household is outside the official 3-10 population and must not get a fake comparator.
const singleMortgageProfile:any={...profile,housingTenure:'owned',housingSubtype:'mortgage',householdSize:1,adultCount:1,relationships:[]};
const smvm=buildResultViewModelV5({diagnosisId:'QA-SM',toneMode:'serious',type,profile:singleMortgageProfile,annualIncomeBand:'600_699',finalCategories:mortgageCats as any});
eq(row(smvm,'rent').comparable,null,'single mortgage no 3-10 comparator');

// Car comparison is available only when user confirms maintenance-only scope.
vm=build({car:cat('car',{amount:30000,benchmark:null,engineComparableAllowed:false,metadata:{carScope:'maintenanceOnly'},appraisal:{carNeed:'burden'}})});
eq(row(vm,'car').comparable,14100,'car maintenance reference');
eq(row(vm,'car').cUpper,0,'car structural reference no C');
eq(vm.potential.upper,0,'car gap must not inflate Potential');
vm=build({car:cat('car',{amount:30000,benchmark:null,engineComparableAllowed:false,metadata:{carScope:'includesLoanOrTax'},appraisal:{carNeed:'burden'}})});
eq(row(vm,'car').comparable,null,'car loan/tax scope must not compare to maintenance reference');

// Horizons are Potential-only simple accumulation.
vm=build({food:cat('food',{amount:70000,benchmark:50000,appraisal:{satisfaction:'inertia'}})});
eq(Math.round(vm.potential.oneYear.upper),180000,'1y potential');
eq(Math.round(vm.potential.fiveYear.upper),900000,'5y potential');
eq(Math.round(vm.potential.tenYear.upper),1800000,'10y potential');

// Screen privacy/order static guards.
const screen=fs.readFileSync('./ResultScreenV5.tsx','utf8');
const order=['MONEY TYPE UNLOCKED','HOUSEHOLD POSITION','MUDAGIRI VERDICT','FUTURE MONEY','GOAL QUEST','NEXT QUEST','SAVE QUEST','LIFE PLAN QUEST','FRIEND QUEST'];
let last=-1;for(const token of order){const i=screen.indexOf(token);ok(i>last,'screen order: '+token);last=i}
const shareBlock=screen.slice(screen.indexOf('async function makeTypeShareFile'),screen.indexOf('export default function ResultScreenV5'));
ok(!/(monthlyTakeHome|annualIncomeBand|prefecture|potential\.upper|comparisonDifference)/.test(shareBlock),'share image must exclude sensitive financial/profile fields');
ok(screen.includes('この差額＝ムダ額ではありません。'),'comparison semantics copy');
ok(screen.includes('enemyDetail(x)'),'enemy atlas owns detailed category disclosure');
ok(!screen.includes('12 CATEGORY CODEX'),'standalone codex removed after atlas integration');
ok(screen.includes('運用益は含みません'),'future horizon note');
ok(!screen.includes('<details className="v51-type-detail"'),'type detail is visible without extra tap');
ok(screen.includes('この称号をシェア'),'type share is visible at reward moment');
ok(screen.includes("share('x')")&&screen.includes("share('instagram')")&&screen.includes("share('threads')")&&screen.includes("share('line')"),'type share exposes four destinations');
ok(screen.includes("help:'今すぐ止めやすい'")&&screen.includes("help:'価値は残して見直せそう'")&&screen.includes("help:'大事なので今は維持'")&&screen.includes("help:'まず中身の確認が必要'"),'verdict meanings are explained');
ok(screen.includes('この支出の見直し余地'),'internal Potential wording is hidden from users');

console.log('RESULT_V5_QA_PASS');
