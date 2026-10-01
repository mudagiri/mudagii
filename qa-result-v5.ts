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

// Horizons are Potential-only simple accumulation.
vm=build({food:cat('food',{amount:70000,benchmark:50000,appraisal:{satisfaction:'inertia'}})});
eq(Math.round(vm.potential.oneYear.upper),180000,'1y potential');
eq(Math.round(vm.potential.fiveYear.upper),900000,'5y potential');
eq(Math.round(vm.potential.tenYear.upper),1800000,'10y potential');

// Screen privacy/order static guards.
const screen=fs.readFileSync('./ResultScreenV5.tsx','utf8');
const order=['MONEY TYPE UNLOCKED','HOUSEHOLD POSITION','MUDAGIRI VERDICT','FUTURE MONEY','GOAL QUEST','NEXT QUEST','SAVE QUEST','LIFE PLAN QUEST','12 CATEGORY CODEX','FRIEND QUEST'];
let last=-1;for(const token of order){const i=screen.indexOf(token);ok(i>last,'screen order: '+token);last=i}
const shareBlock=screen.slice(screen.indexOf('async function makeTypeShareFile'),screen.indexOf('export default function ResultScreenV5'));
ok(!/(monthlyTakeHome|annualIncomeBand|prefecture|potential\.upper|comparisonDifference)/.test(shareBlock),'share image must exclude sensitive financial/profile fields');
ok(screen.includes('この差額＝ムダ額ではありません。'),'comparison semantics copy');
ok(screen.includes('運用益は含みません'),'future horizon note');

console.log('RESULT_V5_QA_PASS');
