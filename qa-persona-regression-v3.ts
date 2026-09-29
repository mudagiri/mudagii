import {emptyRawExpenses,buildFinalJudgementsV3,runDiagnosisAdapterV3,housingScreenV3,communicationScreenV3,type AppraisalV3,type RawExpenses} from './mudagiri-integration-v3';
import {resolveComparableV2} from './comparable-resolver-v2';
import type {Category} from './mudagiri-diagnosis-v2';

type Status='battle'|'protect'|'safe'|'review'|'na';
type Case={name:string;income:number;amounts:Partial<Record<Category,number>>;comparable?:Partial<Record<Category,number|null>>;appraisal?:Partial<Record<Category,AppraisalV3>>;expect:Partial<Record<Category,Status>>;confirmedMonthly?:number};
const raw=(amounts:Case['amounts']):RawExpenses=>{const r=emptyRawExpenses();for(const [k,v] of Object.entries(amounts) as [Category,number][])r[k]={amount:v,known:true,applicability:'applicable'};return r};
const cases:Case[]=[
 {name:'平均内の単身堅実型',income:320000,amounts:{mobile:4500,energy:9000,food:45000,daily:7000,fun:15000,beautyFashion:8000,rent:85000},comparable:{mobile:6000,energy:11000,food:50000,daily:9000,fun:20000,beautyFashion:10000},appraisal:{rent:{rentPreference:'reasonable'}},expect:{mobile:'review',energy:'safe',food:'safe',rent:'safe'},confirmedMonthly:0},
 {name:'通信だけ高い単身',income:300000,amounts:{mobile:14000},comparable:{mobile:6000},expect:{mobile:'review'},confirmedMonthly:0},
 {name:'光熱費だけ高い単身',income:300000,amounts:{energy:22000},comparable:{energy:11000},expect:{energy:'review'},confirmedMonthly:0},
 {name:'日用品だけ高い単身',income:300000,amounts:{daily:18000},comparable:{daily:9000},expect:{daily:'review'},confirmedMonthly:0},
 {name:'食費高めだが守りたい',income:350000,amounts:{food:80000},comparable:{food:50000},appraisal:{food:{satisfaction:'verySatisfied'}},expect:{food:'protect'},confirmedMonthly:0},
 {name:'食費高めで見直し意思あり',income:350000,amounts:{food:80000},comparable:{food:50000},appraisal:{food:{satisfaction:'waste'}},expect:{food:'review'},confirmedMonthly:0},
 {name:'娯楽高めだが満足',income:350000,amounts:{fun:50000},comparable:{fun:20000},appraisal:{fun:{satisfaction:'satisfied'}},expect:{fun:'protect'},confirmedMonthly:0},
 {name:'娯楽高めで惰性',income:350000,amounts:{fun:50000},comparable:{fun:20000},appraisal:{fun:{satisfaction:'inertia'}},expect:{fun:'review'},confirmedMonthly:0},
 {name:'美容服飾高めだが満足',income:350000,amounts:{beautyFashion:40000},comparable:{beautyFashion:10000},appraisal:{beautyFashion:{satisfaction:'verySatisfied'}},expect:{beautyFashion:'protect'},confirmedMonthly:0},
 {name:'美容服飾高めで見直し意思',income:350000,amounts:{beautyFashion:40000},comparable:{beautyFashion:10000},appraisal:{beautyFashion:{satisfaction:'waste'}},expect:{beautyFashion:'review'},confirmedMonthly:0},
 {name:'未使用サブスク額のみでは未確定',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several',subUnusedAmount:3500}},expect:{sub:'review'},confirmedMonthly:0},
 {name:'未使用サブスクを停止可能まで確認',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several',subUnusedAmount:3500,subCancellationConfirmed:true}},expect:{sub:'battle'},confirmedMonthly:3500},
 {name:'未使用サブスク額ありだが停止未確認',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several',subUnusedAmount:3500,subCancellationConfirmed:false}},expect:{sub:'review'},confirmedMonthly:0},
 {name:'サブスク疑いだけで金額未確認',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several'}},expect:{sub:'review'},confirmedMonthly:0},
 {name:'サブスク全部利用中',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'none'}},expect:{sub:'safe'},confirmedMonthly:0},
 {name:'サブスク未使用額が総額超過',income:300000,amounts:{sub:9000},appraisal:{sub:{subUsage:'several',subUnusedAmount:12000,subCancellationConfirmed:true}},expect:{sub:'battle'},confirmedMonthly:9000},
 {name:'保険を把握し最近見直し済み',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'clear',insuranceLastReview:'within1y',insuranceLifeChange:'reviewed',insurancePublicBenefits:'considered',insuranceDuplicate:'none'}},expect:{insurance:'protect'},confirmedMonthly:0},
 {name:'保険を長期間見直していない',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'mostly',insuranceLastReview:'over3y',insuranceLifeChange:'notReviewed',insurancePublicBenefits:'maybe',insuranceDuplicate:'possible'}},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'保険目的が不明',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'unclear'}},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'保険だいたい把握・1年以内見直し',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'mostly',insuranceLastReview:'within1y'}},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'保険だいたい把握・1〜3年前見直し',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'mostly',insuranceLastReview:'1to3y'}},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'保険だいたい把握・一度も見直しなし',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'mostly',insuranceLastReview:'never'}},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'保険だいたい把握・見直し時期不明',income:400000,amounts:{insurance:25000},appraisal:{insurance:{insurancePurpose:'mostly',insuranceLastReview:'unknown'}},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'保険金額だけでは未確定',income:400000,amounts:{insurance:60000},expect:{insurance:'review'},confirmedMonthly:0},
 {name:'家賃高負担を本人も認識',income:300000,amounts:{rent:150000},appraisal:{rent:{rentPreference:'burdenHigh'}},expect:{rent:'review'},confirmedMonthly:0},
 {name:'家賃は高いが本人が守る',income:600000,amounts:{rent:220000},appraisal:{rent:{rentPreference:'protect'}},expect:{rent:'protect'},confirmedMonthly:0},
 {name:'住居費は金額だけでは未確定',income:300000,amounts:{rent:180000},expect:{rent:'review'},confirmedMonthly:0},
 {name:'教育費高いが必要支出',income:500000,amounts:{childEducation:80000},comparable:{childEducation:50000},appraisal:{childEducation:{educationPreference:'necessary'}},expect:{childEducation:'protect'},confirmedMonthly:0},
 {name:'教育費を本人も見直したい',income:500000,amounts:{childEducation:80000},comparable:{childEducation:50000},appraisal:{childEducation:{educationPreference:'reviewHigh'}},expect:{childEducation:'review'},confirmedMonthly:0},
 {name:'教育費は比較超過だけでは未確定',income:500000,amounts:{childEducation:80000},comparable:{childEducation:50000},expect:{childEducation:'review'},confirmedMonthly:0},
 {name:'自己投資は成果あり',income:450000,amounts:{selfDevelopment:50000},appraisal:{selfDevelopment:{selfDevelopmentValue:'results'}},expect:{selfDevelopment:'protect'},confirmedMonthly:0},
 {name:'惰性の自己投資',income:450000,amounts:{selfDevelopment:50000},appraisal:{selfDevelopment:{selfDevelopmentValue:'inertia'}},expect:{selfDevelopment:'review'},confirmedMonthly:0},
 {name:'自己投資は金額だけでは未確定',income:450000,amounts:{selfDevelopment:100000},expect:{selfDevelopment:'review'},confirmedMonthly:0},
 {name:'車費は高くても必要性未鑑定',income:500000,amounts:{car:80000},expect:{car:'review'},confirmedMonthly:0},
 {name:'車は生活仕事に必須',income:500000,amounts:{car:80000},appraisal:{car:{carNeed:'essential'}},expect:{car:'protect'},confirmedMonthly:0},
 {name:'車はあるとかなり便利',income:500000,amounts:{car:80000},appraisal:{car:{carNeed:'useful'}},expect:{car:'protect'},confirmedMonthly:0},
 {name:'車はなくても困らないかも',income:500000,amounts:{car:80000},appraisal:{car:{carNeed:'notNeeded'}},expect:{car:'review'},confirmedMonthly:0},
 {name:'車の負担を本人も見直したい',income:500000,amounts:{car:80000},appraisal:{car:{carNeed:'burden'}},expect:{car:'review'},confirmedMonthly:0},
 {name:'境界値:比較目安と同額',income:300000,amounts:{mobile:6000,energy:11000,daily:9000},comparable:{mobile:6000,energy:11000,daily:9000},expect:{mobile:'review',energy:'safe',daily:'safe'},confirmedMonthly:0},
 {name:'境界値:比較目安を1円超過',income:300000,amounts:{mobile:6001,energy:11001,daily:9001},comparable:{mobile:6000,energy:11000,daily:9000},expect:{mobile:'review',energy:'review',daily:'review'},confirmedMonthly:0},
 {name:'ゼロ支出',income:300000,amounts:{mobile:0,sub:0,insurance:0},expect:{mobile:'safe',sub:'safe',insurance:'safe'},confirmedMonthly:0},
 {name:'比較目安がなくても金額だけでムダにしない',income:300000,amounts:{mobile:12000,energy:20000,daily:18000},expect:{mobile:'review',energy:'safe',daily:'safe'},confirmedMonthly:0},
 {name:'通信回線種別を回答しても削減額は未確定',income:300000,amounts:{mobile:12000},appraisal:{mobile:{mobileCarrier:'major'}},expect:{mobile:'review'},confirmedMonthly:0}
];

let failed=0;
for(const tc of cases){
 const r=raw(tc.amounts);
 const comparable=tc.comparable??{};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:tc.income,raw:r,comparable,appraisal:tc.appraisal});
 const benchmarkMeta=typeof tc.amounts.rent==='number'?{rent:resolveComparableV2({household:'single',age:30,prefecture:'東京都',month:9,housingType:'賃貸'}).rent!}:undefined;
 const f=buildFinalJudgementsV3({raw:r,comparable,benchmarkMeta,diagnosis:d.diagnosis,appraisal:tc.appraisal});
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

const tokyoHousing=resolveComparableV2({household:'single',age:30,prefecture:'東京都',month:9,housingType:'賃貸'}).rent;
const saitamaHousing=resolveComparableV2({household:'single',age:30,prefecture:'埼玉県',month:9,housingType:'賃貸'}).rent;
const housingCases:[string,ReturnType<typeof housingScreenV3>['band'],ReturnType<typeof housingScreenV3>['band']][]=[
 ['東京80k',housingScreenV3(80000,tokyoHousing).band,'standard'],['東京100k',housingScreenV3(100000,tokyoHousing).band,'higher'],['東京110k',housingScreenV3(110000,tokyoHousing).band,'check'],['東京150k',housingScreenV3(150000,tokyoHousing).band,'detail'],
 ['埼玉60k',housingScreenV3(60000,saitamaHousing).band,'standard'],['埼玉70k',housingScreenV3(70000,saitamaHousing).band,'check'],['埼玉90k',housingScreenV3(90000,saitamaHousing).band,'detail']
];
for(const [name,got,want] of housingCases){if(got!==want)throw new Error(`HOUSING_BAND_FAIL:${name}:${got}!=${want}`)}
console.log('HOUSING_PERCENTILE_QA_PASS',housingCases.length);
const housingFinalCases:[string,number,AppraisalV3['rent']|undefined,Status][]=[
 ['東京80k-final',80000,undefined,'safe'],
 ['東京100k-final',100000,undefined,'safe'],
 ['東京110k-final',110000,undefined,'review'],
 ['東京150k-final',150000,undefined,'review'],
 ['東京150k-protect',150000,{rentPreference:'protect'},'protect'],
 ['東京150k-burden',150000,{rentPreference:'burdenHigh'},'review']
];
for(const [name,amount,appraisal,expected] of housingFinalCases){
 const r=raw({rent:amount});
 const comparable={rent:tokyoHousing?.value??null};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:400000,raw:r,comparable,appraisal:appraisal?{rent:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,benchmarkMeta:{rent:tokyoHousing!},diagnosis:d.diagnosis,appraisal:appraisal?{rent:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='rent');
 if(row?.status!==expected)throw new Error(`HOUSING_FINAL_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`HOUSING_SAVING_MUST_BE_ZERO:${name}:${row?.reducible}`);
}
console.log('HOUSING_FINAL_QA_PASS',housingFinalCases.length);

const utilityCases:[string,number,number,AppraisalV3['energy']|undefined,Status][]=[
 ['光熱費-基準以下',12000,13333,undefined,'safe'],
 ['光熱費-超過継続',18000,13333,{energyPersistence:'persistent'},'review'],
 ['光熱費-超過単月',18000,13333,{energyPersistence:'temporary'},'safe'],
 ['光熱費-超過不明',18000,13333,{energyPersistence:'unknown'},'review']
];
for(const [name,amount,benchmark,appraisal,expected] of utilityCases){
 const r=raw({energy:amount});
 const comparable={energy:benchmark};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:400000,raw:r,comparable,appraisal:appraisal?{energy:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,diagnosis:d.diagnosis,appraisal:appraisal?{energy:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='energy');
 if(row?.status!==expected)throw new Error(`UTILITY_FINAL_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`UTILITY_SAVING_MUST_BE_ZERO:${name}:${row?.reducible}`);
}
console.log('UTILITY_PERSISTENCE_QA_PASS',utilityCases.length);

const dailyCases:[string,number,number,AppraisalV3['daily']|undefined,Status][]=[
 ['日用品-基準以下',3000,3409,undefined,'safe'],
 ['日用品-超過継続',6000,3409,{dailyPersistence:'persistent'},'review'],
 ['日用品-超過単月',6000,3409,{dailyPersistence:'temporary'},'safe'],
 ['日用品-超過不明',6000,3409,{dailyPersistence:'unknown'},'review']
];
for(const [name,amount,benchmark,appraisal,expected] of dailyCases){
 const r=raw({daily:amount});
 const comparable={daily:benchmark};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:400000,raw:r,comparable,appraisal:appraisal?{daily:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,diagnosis:d.diagnosis,appraisal:appraisal?{daily:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='daily');
 if(row?.status!==expected)throw new Error(`DAILY_FINAL_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`DAILY_SAVING_MUST_BE_ZERO:${name}:${row?.reducible}`);
}
console.log('DAILY_PERSISTENCE_QA_PASS',dailyCases.length);

const foodCases:[string,number,number,AppraisalV3['food']|undefined,Status][]=[
 ['食費-基準以下',45000,50000,undefined,'safe'],
 ['食費-超過守る',80000,50000,{satisfaction:'verySatisfied'},'protect'],
 ['食費-超過見直す',80000,50000,{satisfaction:'waste'},'review'],
 ['食費-超過未回答',80000,50000,undefined,'review']
];
for(const [name,amount,benchmark,appraisal,expected] of foodCases){
 const r=raw({food:amount});
 const comparable={food:benchmark};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:400000,raw:r,comparable,appraisal:appraisal?{food:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,diagnosis:d.diagnosis,appraisal:appraisal?{food:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='food');
 if(row?.status!==expected)throw new Error(`FOOD_FINAL_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`FOOD_SAVING_MUST_BE_ZERO:${name}:${row?.reducible}`);
}
console.log('FOOD_VALUE_QA_PASS',foodCases.length);

const funCases:[string,number,number,AppraisalV3['fun']|undefined,Status][]=[
 ['娯楽-基準以下',15000,20000,undefined,'safe'],
 ['娯楽-超過守る',50000,20000,{satisfaction:'verySatisfied'},'protect'],
 ['娯楽-超過見直す',50000,20000,{satisfaction:'inertia'},'review'],
 ['娯楽-超過未回答',50000,20000,undefined,'review']
];
for(const [name,amount,benchmark,appraisal,expected] of funCases){
 const r=raw({fun:amount});
 const comparable={fun:benchmark};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:400000,raw:r,comparable,appraisal:appraisal?{fun:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,diagnosis:d.diagnosis,appraisal:appraisal?{fun:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='fun');
 if(row?.status!==expected)throw new Error(`FUN_FINAL_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`FUN_SAVING_MUST_BE_ZERO:${name}:${row?.reducible}`);
}
console.log('FUN_VALUE_QA_PASS',funCases.length);

const beautyDirectCases:[string,number,number,AppraisalV3['beautyFashion']|undefined,Status][]=[
 ['美容単身-基準以下',8000,9842,undefined,'safe'],
 ['美容単身-超過守る',20000,9842,{satisfaction:'verySatisfied'},'protect'],
 ['美容単身-超過見直す',20000,9842,{satisfaction:'waste'},'review'],
 ['美容単身-超過未回答',20000,9842,undefined,'review']
];
for(const [name,amount,benchmark,appraisal,expected] of beautyDirectCases){
 const r=raw({beautyFashion:amount}); const comparable={beautyFashion:benchmark};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:400000,raw:r,comparable,appraisal:appraisal?{beautyFashion:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,benchmarkMeta:{beautyFashion:{value:benchmark,confidence:'DIRECT',sourceVersion:'BEAUTY_FASHION_V1.0_SINGLE_2025'}},diagnosis:d.diagnosis,appraisal:appraisal?{beautyFashion:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='beautyFashion');
 if(row?.status!==expected)throw new Error(`BEAUTY_DIRECT_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`BEAUTY_DIRECT_SAVING_MUST_BE_ZERO:${name}`);
}
const beautyAuditCases:[string,AppraisalV3['beautyFashion']|undefined,Status][]=[
 ['美容複数AUDIT-未回答',undefined,'review'],
 ['美容複数AUDIT-守る',{satisfaction:'satisfied'},'protect'],
 ['美容複数AUDIT-見直す',{satisfaction:'inertia'},'review']
];
for(const [name,appraisal,expected] of beautyAuditCases){
 const r=raw({beautyFashion:20000}); const comparable={beautyFashion:null};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:500000,raw:r,comparable,appraisal:appraisal?{beautyFashion:appraisal}:undefined});
 const fin=buildFinalJudgementsV3({raw:r,comparable,benchmarkMeta:{beautyFashion:{value:null,confidence:'AUDIT',sourceVersion:'BEAUTY_FASHION_V1.0_NO_FABRICATED_MULTI_CROSS'}},diagnosis:d.diagnosis,appraisal:appraisal?{beautyFashion:appraisal}:undefined});
 const row=fin.categories.find(x=>x.category==='beautyFashion');
 if(row?.status!==expected)throw new Error(`BEAUTY_AUDIT_FAIL:${name}:${row?.status}!=${expected}`);
 if((row?.reducible??0)!==0)throw new Error(`BEAUTY_AUDIT_SAVING_MUST_BE_ZERO:${name}`);
}
console.log('BEAUTY_DIRECT_AUDIT_QA_PASS',beautyDirectCases.length+beautyAuditCases.length);

const beautySexBenchCases:[string,number,'male'|'female'|'preferNot'|undefined,number,string][]=[
 ['美容性別-34以下男性',30,'male',5971,'BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025'],
 ['美容性別-34以下女性',30,'female',19313,'BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025'],
 ['美容性別-35to59男性',45,'male',6925,'BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025'],
 ['美容性別-35to59女性',45,'female',14216,'BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025'],
 ['美容性別-60以上男性',65,'male',2953,'BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025'],
 ['美容性別-60以上女性fallback',65,'female',7858,'BEAUTY_FASHION_V1.0_SINGLE_2025'],
 ['美容性別-回答しないfallback',30,'preferNot',11747,'BEAUTY_FASHION_V1.0_SINGLE_2025']
];
for(const [name,age,beautySex,expected,source] of beautySexBenchCases){
 const x=resolveComparableV2({household:'single',householdSize:1,age,prefecture:'東京都',month:9,beautySex}).beautyFashion;
 if(x?.value!==expected)throw new Error(`BEAUTY_SEX_BENCH_FAIL:${name}:${x?.value}!=${expected}`);
 if(x?.sourceVersion!==source)throw new Error(`BEAUTY_SEX_SOURCE_FAIL:${name}:${x?.sourceVersion}!=${source}`);
 if(name.includes('60以上女性')&&x?.meta?.fallbackReason!=='FEMALE_60PLUS_CROSS_UNAVAILABLE')throw new Error('BEAUTY_FEMALE_60_FALLBACK_REASON_FAIL');
}
console.log('BEAUTY_SEX_BENCH_QA_PASS',beautySexBenchCases.length);

const communicationBandCases:[string,number,'major'|'mvno',ReturnType<typeof communicationScreenV3>['band']][]=[
 ['通信-major-P50上限',4999,'major','standard'],
 ['通信-major-P75開始',6000,'major','check'],
 ['通信-major-P90開始',10000,'major','detail'],
 ['通信-mvno-P50上限',2999,'mvno','standard'],
 ['通信-mvno-P75開始',3000,'mvno','check'],
 ['通信-mvno-P90開始',5000,'mvno','detail']
];
for(const [name,amount,carrier,expectedBand] of communicationBandCases){
 const s=communicationScreenV3(amount,carrier);
 if(s.band!==expectedBand)throw new Error(`COMM_BAND_FAIL:${name}:${s.band}!=${expectedBand}`);
 const r=raw({mobile:amount});
 const d=runDiagnosisAdapterV3({monthlyTakeHome:300000,raw:r,comparable:{mobile:null},appraisal:{mobile:{mobileCarrier:carrier}}});
 const fin=buildFinalJudgementsV3({raw:r,comparable:{mobile:null},diagnosis:d.diagnosis,appraisal:{mobile:{mobileCarrier:carrier}}});
 const row=fin.categories.find(x=>x.category==='mobile');
 if(row?.status!=='review')throw new Error(`COMM_STATUS_FAIL:${name}:${row?.status}`);
 if((row?.reducible??0)!==0)throw new Error(`COMM_SAVING_MUST_BE_ZERO:${name}:${row?.reducible}`);
}
const unknownComm=communicationScreenV3(12000,'unknown');
if(unknownComm.band!=='unknown')throw new Error('COMM_UNKNOWN_MUST_STAY_UNKNOWN');
console.log('COMMUNICATION_BAND_QA_PASS',communicationBandCases.length+1);

{
 const r=raw({});
 r.car={amount:null,known:false,applicability:'na'};
 const d=runDiagnosisAdapterV3({monthlyTakeHome:500000,raw:r,comparable:{},appraisal:{}});
 const fin=buildFinalJudgementsV3({raw:r,comparable:{},diagnosis:d.diagnosis,appraisal:{}});
 const row=fin.categories.find(x=>x.category==='car');
 if(row?.status!=='na')throw new Error(`CAR_NA_FAIL:${row?.status}`);
 if((row?.reducible??0)!==0)throw new Error(`CAR_NA_SAVING_MUST_BE_ZERO:${row?.reducible}`);
 console.log('CAR_NA_QA_PASS');
}

