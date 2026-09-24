import type { Category } from './mudagiri-diagnosis-v2';

export type Household='single'|'multi';
export type EducationStage='publicKindergarten'|'privateKindergarten'|'publicElementary'|'privateElementary'|'publicJuniorHigh'|'privateJuniorHigh'|'publicHigh'|'privateHigh';
type Row=Partial<Record<Category,number>>;

const single:{max:number;v:Row}[]=[
 {max:34,v:{mobile:4738,energy:8291,food:46840,daily:2443,fun:7517,beautyFashion:11747}},
 {max:59,v:{mobile:5596,energy:13299,food:51196,daily:2617,fun:5523,beautyFashion:9842}},
 {max:999,v:{mobile:3826,energy:15380,food:49387,daily:2242,fun:4274,beautyFashion:7858}}
];
const multi:{max:number;v:Row}[]=[
 {max:29,v:{mobile:8729,energy:17643,food:63479,daily:5169,fun:8663,beautyFashion:14345}},
 {max:39,v:{mobile:8266,energy:21182,food:86839,daily:6167,fun:9080,beautyFashion:19507}},
 {max:49,v:{mobile:10804,energy:24070,food:102572,daily:6686,fun:10522,beautyFashion:21244}},
 {max:59,v:{mobile:11856,energy:25242,food:99455,daily:6320,fun:9145,beautyFashion:20039}},
 {max:69,v:{mobile:9274,energy:25640,food:99134,daily:5596,fun:14276,beautyFashion:16523}},
 {max:999,v:{mobile:6780,energy:24909,food:89551,daily:4474,fun:7005,beautyFashion:11401}}
];


export type Region='北海道'|'東北'|'関東'|'北陸'|'東海'|'近畿'|'中国'|'四国'|'九州'|'沖縄';
export const PREFECTURE_REGION:Record<string,Region>={
 '北海道':'北海道',
 '青森県':'東北','岩手県':'東北','宮城県':'東北','秋田県':'東北','山形県':'東北','福島県':'東北',
 '茨城県':'関東','栃木県':'関東','群馬県':'関東','埼玉県':'関東','千葉県':'関東','東京都':'関東','神奈川県':'関東','山梨県':'関東','長野県':'関東',
 '新潟県':'北陸','富山県':'北陸','石川県':'北陸','福井県':'北陸',
 '岐阜県':'東海','静岡県':'東海','愛知県':'東海','三重県':'東海',
 '滋賀県':'近畿','京都府':'近畿','大阪府':'近畿','兵庫県':'近畿','奈良県':'近畿','和歌山県':'近畿',
 '鳥取県':'中国','島根県':'中国','岡山県':'中国','広島県':'中国','山口県':'中国',
 '徳島県':'四国','香川県':'四国','愛媛県':'四国','高知県':'四国',
 '福岡県':'九州','佐賀県':'九州','長崎県':'九州','熊本県':'九州','大分県':'九州','宮崎県':'九州','鹿児島県':'九州',
 '沖縄県':'沖縄'
};
const REGION_FACTOR:Record<Region,{energy:number;food:number}>={
 '北海道':{energy:1.29,food:.89},'東北':{energy:1.27,food:.94},'関東':{energy:.97,food:1.08},'北陸':{energy:1.23,food:1.00},'東海':{energy:.98,food:.98},'近畿':{energy:.95,food:1.00},'中国':{energy:1.00,food:.94},'四国':{energy:.94,food:.90},'九州':{energy:.86,food:.90},'沖縄':{energy:.92,food:.85}
};
// Food is intentionally weakly adjusted: damp raw regional deviation by 50%.
function regionFactor(prefecture:string|undefined,c:Category,household:Household){
 if(!prefecture||household==='single')return 1; // multi-household regional table must not be reused for singles.
 const r=PREFECTURE_REGION[prefecture]; if(!r)return 1;
 if(c==='energy')return REGION_FACTOR[r].energy;
 if(c==='food')return 1+(REGION_FACTOR[r].food-1)*.5;
 return 1;
}

// MUDAGIRI_COMPARABLE_REFERENCE_V1.0 — FROZEN
// Public wording guard: transformed benchmark, NOT an official/prefectural average.
export const COMPARABLE_PROVENANCE_STATUS='TRANSFORMED_BENCHMARK_VERIFIED_MODEL_LINEAGE' as const;
// Multi-person working-household income table, 2025 Household Survey va402.
// Values are monthly yen. 500万円+ is the product's main acquisition segment.
const multiIncomeCentersMan=[525,575,625,675,725,775,850,950,1125,1375,1500];
const multiIncomeOverall:Row={mobile:10520.2,energy:24183.6,food:98125.8,daily:6241,fun:10691,beautyFashion:19421};
const multiIncomeValues:Record<'mobile'|'energy'|'food'|'daily'|'fun'|'beautyFashion',number[]>={
 mobile:[9914.6,10282.3,10272,10208.2,10673.8,10617.2,10501.7,11331.3,11031.8,11058.4,12233.3],
 energy:[23128.3,24038.2,23206.6,23330.6,23677.8,24550.8,24641.5,24185.5,26286.4,24946.2,26401.3],
 food:[81725.5,86176.4,87506.3,91578.5,94650.8,95748.9,102964.9,104987.1,115499.3,120403.8,146235.2],
 daily:[5464,5660,5738,6021,6237,6363,6609,6802,7146,7097,7717],
 fun:[7081,5939,6516,9105,8892,8960,10365,10131,16092,20457,27034],
 beautyFashion:[13199,14150,14966,17560,16585,17873,20025,22814,26444,28863,39401]
};
const lambda:Record<string,number>={mobile:.15,energy:.10,food:.45,daily:.30,fun:.45,beautyFashion:.45};
const bounds:Record<string,[number,number]>={mobile:[.95,1.10],energy:[.95,1.08],food:[.90,1.20],daily:[.90,1.12],fun:[.80,1.45],beautyFashion:[.85,1.30]};

function pava(xs:number[]):number[]{
 const blocks=xs.map((v,i)=>({sum:v,n:1,start:i,end:i}));
 let i=0;
 while(i<blocks.length-1){
  const a=blocks[i].sum/blocks[i].n,b=blocks[i+1].sum/blocks[i+1].n;
  if(a<=b){i++;continue;}
  blocks[i]={sum:blocks[i].sum+blocks[i+1].sum,n:blocks[i].n+blocks[i+1].n,start:blocks[i].start,end:blocks[i+1].end};
  blocks.splice(i+1,1); if(i>0)i--;
 }
 const out=new Array(xs.length);
 blocks.forEach(b=>{for(let j=b.start;j<=b.end;j++)out[j]=b.sum/b.n});
 return out;
}

const frozenFactors=Object.fromEntries(Object.keys(multiIncomeValues).map(c=>{
 const cat=c as keyof typeof multiIncomeValues;
 const smooth=pava(multiIncomeValues[cat]);
 const overall=multiIncomeOverall[cat]!;
 const [lo,hi]=bounds[cat];
 return [cat,smooth.map(v=>Math.max(lo,Math.min(hi,1+lambda[cat]*(v/overall-1))))];
})) as Record<string,number[]>;

function interpolate(xs:number[],ys:number[],x:number){
 if(x<=xs[0])return ys[0]; if(x>=xs[xs.length-1])return ys[ys.length-1];
 let i=0; while(i<xs.length-1&&x>xs[i+1])i++;
 const t=(x-xs[i])/(xs[i+1]-xs[i]); return ys[i]+t*(ys[i+1]-ys[i]);
}

function frozenIncomeFactor(annual:number,c:Category,household:Household){
 // Single-household 500–600 / 600+ cells are too thin (n=32/n=49) for continuous extrapolation.
 // Keep factor=1 until a separately frozen single-household table is approved.
 if(household==='single'||!(c in frozenFactors))return 1;
 const man=annual/10_000;
 if(man<500)return 1; // V1 frozen income correction starts at the main 500万円+ segment.
 return interpolate(multiIncomeCentersMan,frozenFactors[c],man);
}

const EDUCATION_ANNUAL:Record<EducationStage,number>={
 publicKindergarten:184646,privateKindergarten:347338,publicElementary:366599,privateElementary:1741516,
 publicJuniorHigh:542450,privateJuniorHigh:1560359,publicHigh:596954,privateHigh:1179261
};

export function resolveComparableV1({household,age,annualIncome,prefecture,expenses,educationStage}:{household:Household;age:number;annualIncome:number;prefecture?:string;expenses?:Partial<Record<Category,number>>;educationStage?:EducationStage}){
 const base=(household==='single'?single:multi).find(r=>age<=r.max)!.v;
 const out:Partial<Record<Category,number|null>>={};
 (Object.keys(base) as Category[]).forEach(c=>out[c]=Math.round((base[c]||0)*frozenIncomeFactor(annualIncome,c,household)*regionFactor(prefecture,c,household)));
 (['rent','insurance','sub','car','childEducation','selfDevelopment'] as Category[]).forEach(c=>out[c]=null);
 // Sony Assurance 2025 nationwide car-life survey: monthly maintenance average JPY14,100.
 // Scope: insurance/fuel/parking/repairs etc.; excludes tax, loan repayment and tolls.
 // This is a private survey benchmark, not an official-statistics average.
 if((expenses?.car??0)>0) out.car=14100;
 // MEXT FY2023 Survey of Household Expenditure on Children's Education, corrected 2026-01-16.
 // Corrected totals: 184646 / 347338 / 366599 / 1741516 / 542450 / 1560359 / 596954 / 1179261.
 // Converted to monthly. Comparison only; V2 never auto-labels education as waste.
 if((expenses?.childEducation??0)>0 && educationStage) out.childEducation=Math.round(EDUCATION_ANNUAL[educationStage]/12);
 return out;
}

// Exposed only for deterministic tests/audit.
export const __frozenComparableAudit={multiIncomeCentersMan,multiIncomeOverall,multiIncomeValues,frozenFactors,REGION_FACTOR,PREFECTURE_REGION,EDUCATION_ANNUAL,CAR_MONTHLY_BENCHMARK:14100};
