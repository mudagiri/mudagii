import {emptyRawExpenses,buildFinalJudgementsV3,runDiagnosisAdapterV3,type AppraisalV3,type RawExpenses} from './mudagiri-integration-v3';
import type {Category} from './mudagiri-diagnosis-v2';

type Status='battle'|'protect'|'safe'|'review'|'na';
type Case={name:string;income:number;amounts:Partial<Record<Category,number>>;comparable?:Partial<Record<Category,number|null>>;appraisal?:Partial<Record<Category,AppraisalV3>>;expect:Partial<Record<Category,Status>>;confirmedMonthly?:number};
const raw=(amounts:Case['amounts']):RawExpenses=>{const r=emptyRawExpenses();for(const [k,v] of Object.entries(amounts) as [Category,number][])r[k]={amount:v,known:true,applicability:'applicable'};return r};
const cases:Case[]=[
 {name:'平均内の単身堅実型',income:320000,amounts:{mobile:4500,energy:9000,food:45000,daily:7000,fun:15000,beautyFashion:8000,rent:85000},comparable:{mobile:6000,energy:11000,food:50000,daily:9000,fun:20000,beautyFashion:10000},appraisal:{rent:{rentPreference:'reasonable'}},expect:{mobile:'safe',energy:'safe',food:'safe',rent:'protect'},confirmedMonthly:0},
 {name:'通信だけ高い単身',income:300000,amounts:{mobile:14000},comparable:{mobile:6000},expect:{mobile:'battle'},confirmedMonthly:0},
 {name:'食費高めだが守りたい',income:350000,amounts:{food:80000},comparable:{food:50000},appraisal:{food:{satisfaction:'verySatisfied'}},expect:{food:'protect'},confirmedMonthly:0},
 {name:'食費高めで見直し意思あり',income:350000,amounts:{food:80000},comparable:{food:50000},appraisal:{food:{satisfaction:'waste'}},expect:{food:'battle'},confirmedMonthly:0},
 {name:'未使用サブスク額まで確認',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several',subUnusedAmount:3500}},expect:{sub:'battle'},confirmedMonthly:3500},
 {name:'サブスク疑いだけで金額未確認',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several'}},expect:{sub:'battle'},confirmedMonthly:0},
 {name:'保険を把握し最近見直し済み',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'clear',insuranceLastReview:'within1y',insuranceLifeChange:'reviewed',insurancePublicBenefits:'considered',insuranceDuplicate:'none'}},expect:{insurance:'protect'},confirmedMonthly:0},
 {name:'保険を長期間見直していない',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'mostly',insuranceLastReview:'over3y',insuranceLifeChange:'notReviewed',insurancePublicBenefits:'maybe',insuranceDuplicate:'possible'}},expect:{insurance:'battle'},confirmedMonthly:0},
 {name:'家賃高負担を本人も認識',income:300000,amounts:{rent:150000},appraisal:{rent:{rentPreference:'burdenHigh'}},expect:{rent:'battle'},confirmedMonthly:0},
 {name:'家賃は高いが本人が守る',income:600000,amounts:{rent:220000},appraisal:{rent:{rentPreference:'protect'}},expect:{rent:'protect'},confirmedMonthly:0},
 {name:'教育費高いが必要支出',income:500000,amounts:{childEducation:80000},comparable:{childEducation:50000},appraisal:{childEducation:{educationPreference:'necessary'}},expect:{childEducation:'protect'},confirmedMonthly:0},
 {name:'教育費を本人も見直したい',income:500000,amounts:{childEducation:80000},comparable:{childEducation:50000},appraisal:{childEducation:{educationPreference:'reviewHigh'}},expect:{childEducation:'battle'},confirmedMonthly:0},
 {name:'自己投資は成果あり',income:450000,amounts:{selfDevelopment:50000},appraisal:{selfDevelopment:{selfDevelopmentValue:'results'}},expect:{selfDevelopment:'protect'},confirmedMonthly:0},
 {name:'惰性の自己投資',income:450000,amounts:{selfDevelopment:50000},appraisal:{selfDevelopment:{selfDevelopmentValue:'inertia'}},expect:{selfDevelopment:'battle'},confirmedMonthly:0},
 {name:'車費は高くても内訳未鑑定',income:500000,amounts:{car:80000},expect:{car:'review'},confirmedMonthly:0},
 {name:'境界値:比較目安と同額',income:300000,amounts:{mobile:6000,energy:11000,daily:9000},comparable:{mobile:6000,energy:11000,daily:9000},expect:{mobile:'safe',energy:'safe',daily:'safe'},confirmedMonthly:0},
 {name:'境界値:比較目安を1円超過',income:300000,amounts:{mobile:6001,energy:11001,daily:9001},comparable:{mobile:6000,energy:11000,daily:9000},expect:{mobile:'battle',energy:'battle',daily:'battle'},confirmedMonthly:0},
 {name:'ゼロ支出',income:300000,amounts:{mobile:0,sub:0,insurance:0},expect:{mobile:'safe',sub:'safe',insurance:'safe'},confirmedMonthly:0}
];

let failed=0;
for(const tc of cases){
 const r=raw(tc.amounts);
 const comparable=tc.comparable??{};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:tc.income,raw:r,comparable,appraisal:tc.appraisal});
 const f=buildFinalJudgementsV3({raw:r,comparable,diagnosis:d.diagnosis,appraisal:tc.appraisal});
 const by=new Map(f.categories.map(x=>[x.category,x]));
 for(const [cat,expected] of Object.entries(tc.expect) as [Category,Status][]){
  const got=by.get(cat)?.status;
  if(got!==expected){console.error(`FAIL [${tc.name}] ${cat}: expected ${expected}, got ${got}`);failed++}
 }
 const monthly=f.categories.reduce((s,x)=>s+x.reducible,0);
 if(monthly!==(tc.confirmedMonthly??0)){console.error(`FAIL [${tc.name}] confirmed monthly: expected ${tc.confirmedMonthly??0}, got ${monthly}`);failed++}
}
if(failed)throw new Error(`Persona regression failed: ${failed}`);
console.log(`Persona regression passed: ${cases.length} cases`);
