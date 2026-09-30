import type { Category } from './mudagiri-diagnosis-v2';
import { resolveComparableV1 } from './comparable-resolver-v1';

export type HouseholdV2='single'|'multi';
export type EducationStageV2='publicKindergarten'|'privateKindergarten'|'publicElementary'|'privateElementary'|'publicJuniorHigh'|'privateJuniorHigh'|'publicHigh'|'privateHigh';
export type EducationChildV2={stage:EducationStageV2};
export type BenchmarkConfidence='DIRECT'|'MODEL'|'AUDIT';
export type ComparableV2={value:number|null;confidence:BenchmarkConfidence;sourceVersion:string;meta?:Record<string,unknown>};

const ageBand=(age:number)=>age<=34?0:age<=59?1:2;
const sizeBand=(n:number)=>Math.max(2,Math.min(6,Math.floor(n||2)))-2;

const SINGLE={
 energy:[8291,13299,15380],
 food:[41992,47405,44364],
 daily:[3409,3174,2593],
 fun:[24242,23453,17041],
 beautyFashion:[11747,9842,7858]
} as const;
const MULTI={
 energy:[22691,25626,25942,28271,33534],
 food:[79340,92240,103384,112019,123241],
 daily:[5139,6621,7469,8014,8320],
 fun:[9324,9604,11067,9956,9043]
} as const;

const REGION:Record<string,number>={
 '北海道':1.285772490221643,'青森県':1.274405149934811,'岩手県':1.274405149934811,'宮城県':1.274405149934811,'秋田県':1.274405149934811,'山形県':1.274405149934811,'福島県':1.274405149934811,
 '茨城県':.9689537157757496,'栃木県':.9689537157757496,'群馬県':.9689537157757496,'埼玉県':.9689537157757496,'千葉県':.9689537157757496,'東京都':.9689537157757496,'神奈川県':.9689537157757496,'山梨県':.9689537157757496,'長野県':.9689537157757496,
 '新潟県':1.229139504563233,'富山県':1.229139504563233,'石川県':1.229139504563233,'福井県':1.229139504563233,
 '岐阜県':.9842731421121251,'静岡県':.9842731421121251,'愛知県':.9842731421121251,'三重県':.9842731421121251,
 '滋賀県':.9474413298565841,'京都府':.9474413298565841,'大阪府':.9474413298565841,'兵庫県':.9474413298565841,'奈良県':.9474413298565841,'和歌山県':.9474413298565841,
 '鳥取県':.9989406779661016,'島根県':.9989406779661016,'岡山県':.9989406779661016,'広島県':.9989406779661016,'山口県':.9989406779661016,
 '徳島県':.9443448500651891,'香川県':.9443448500651891,'愛媛県':.9443448500651891,'高知県':.9443448500651891,
 '福岡県':.8626548239895697,'佐賀県':.8626548239895697,'長崎県':.8626548239895697,'熊本県':.8626548239895697,'大分県':.8626548239895697,'宮崎県':.8626548239895697,'鹿児島県':.8626548239895697,
 '沖縄県':.9187174054758801
};
const MONTH=[1.2047872069533332,1.2985757210518276,1.2751489636206224,1.1181285755512929,.9500670548491691,.8702123686488873,.8219328772471863,.8551377595192422,.903172797799922,.8830054153156671,.8417743222367461,.9780569372061045];

const EDU:Record<EducationStageV2,number>={
 publicKindergarten:15387,privateKindergarten:28945,publicElementary:30550,privateElementary:145126,
 publicJuniorHigh:45204,privateJuniorHigh:130030,publicHigh:49746,privateHigh:98272
};

type HousingRow={meanPaid:number;p50:string;p75:string;p90:string};
const H:Record<string,HousingRow>={
 '北海道':{meanPaid:53649,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '青森県':{meanPaid:47837,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '岩手県':{meanPaid:51186,p50:'40,000～50,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '宮城県':{meanPaid:59455,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'80,000～90,000円未満'},
 '秋田県':{meanPaid:49110,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '山形県':{meanPaid:51920,p50:'40,000～50,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '福島県':{meanPaid:52904,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '茨城県':{meanPaid:54649,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '栃木県':{meanPaid:53102,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '群馬県':{meanPaid:51419,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '埼玉県':{meanPaid:68955,p50:'60,000～70,000円未満',p75:'70,000～80,000円未満',p90:'90,000～100,000円未満'},
 '千葉県':{meanPaid:69222,p50:'60,000～70,000円未満',p75:'70,000～80,000円未満',p90:'90,000～100,000円未満'},
 '東京都':{meanPaid:99065,p50:'80,000～90,000円未満',p75:'110,000～120,000円未満',p90:'150,000～200,000円未満'},
 '神奈川県':{meanPaid:79739,p50:'70,000～80,000円未満',p75:'90,000～100,000円未満',p90:'110,000～120,000円未満'},
 '新潟県':{meanPaid:53183,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '富山県':{meanPaid:54082,p50:'40,000～50,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '石川県':{meanPaid:53155,p50:'40,000～50,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '福井県':{meanPaid:54893,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '山梨県':{meanPaid:53675,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '長野県':{meanPaid:54560,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '岐阜県':{meanPaid:53150,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '静岡県':{meanPaid:58533,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '愛知県':{meanPaid:64340,p50:'50,000～60,000円未満',p75:'70,000～80,000円未満',p90:'80,000～90,000円未満'},
 '三重県':{meanPaid:55188,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '滋賀県':{meanPaid:59752,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '京都府':{meanPaid:66401,p50:'50,000～60,000円未満',p75:'70,000～80,000円未満',p90:'90,000～100,000円未満'},
 '大阪府':{meanPaid:68540,p50:'60,000～70,000円未満',p75:'70,000～80,000円未満',p90:'90,000～100,000円未満'},
 '兵庫県':{meanPaid:68620,p50:'60,000～70,000円未満',p75:'70,000～80,000円未満',p90:'90,000～100,000円未満'},
 '奈良県':{meanPaid:61171,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'80,000～90,000円未満'},
 '和歌山県':{meanPaid:50840,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'70,000～80,000円未満'},
 '鳥取県':{meanPaid:50688,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '島根県':{meanPaid:51747,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'60,000～70,000円未満'},
 '岡山県':{meanPaid:55207,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '広島県':{meanPaid:58086,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'80,000～90,000円未満'},
 '山口県':{meanPaid:50861,p50:'40,000～50,000円未満',p75:'60,000～70,000円未満',p90:'60,000～70,000円未満'},
 '徳島県':{meanPaid:52360,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '香川県':{meanPaid:52641,p50:'40,000～50,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '愛媛県':{meanPaid:50546,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '高知県':{meanPaid:49356,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'70,000～80,000円未満'},
 '福岡県':{meanPaid:58993,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'80,000～90,000円未満'},
 '佐賀県':{meanPaid:53627,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '長崎県':{meanPaid:52452,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '熊本県':{meanPaid:53092,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'},
 '大分県':{meanPaid:49580,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '宮崎県':{meanPaid:47337,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '鹿児島県':{meanPaid:48313,p50:'40,000～50,000円未満',p75:'50,000～60,000円未満',p90:'60,000～70,000円未満'},
 '沖縄県':{meanPaid:56209,p50:'50,000～60,000円未満',p75:'60,000～70,000円未満',p90:'70,000～80,000円未満'}
};
const HOUSING_FALLBACK:HousingRow={meanPaid:0,p50:'',p75:'',p90:''};

export function educationBenchmarkV2(children:EducationChildV2[]|undefined){
 if(!children?.length)return null;
 return children.reduce((s,c)=>s+(EDU[c.stage]??0),0);
}

export function resolveComparableV2(a:{household:HouseholdV2;householdSize?:number;age:number;annualIncome?:number|null;prefecture:string;month:number;housingType?:string;educationChildren?:EducationChildV2[];beautySex?:'male'|'female'|'preferNot'}):Partial<Record<Category,ComparableV2>>{
 const out:Partial<Record<Category,ComparableV2>>={};
 const ai=ageBand(a.age);
 // Restore the frozen V1 income correction only for multi-person households >= ¥5m.
 // V2 keeps its newer household-size / seasonality / direct-source bases, then applies
 // the V1 correction as a ratio so we do not regress those improvements.
 const incomeRef=a.annualIncome&&a.household==='multi'&&a.annualIncome>=5_000_000
  ?resolveComparableV1({household:'multi',age:a.age,annualIncome:a.annualIncome,prefecture:undefined})
  :null;
 const neutralRef=incomeRef?resolveComparableV1({household:'multi',age:a.age,annualIncome:0,prefecture:undefined}):null;
 const incomeFactor=(c:Category)=>{const x=incomeRef?.[c],n=neutralRef?.[c];return typeof x==='number'&&typeof n==='number'&&n>0?x/n:1};
 if(a.household==='single'){
  out.energy={value:Math.round((SINGLE.energy[ai])*incomeFactor('energy')),confidence:'DIRECT',sourceVersion:'UTILITY_V2.1_SINGLE_2025'};
  out.food={value:Math.round((SINGLE.food[ai])*incomeFactor('food')),confidence:'DIRECT',sourceVersion:'FOOD_V1.1_SINGLE_2025'};
  out.daily={value:Math.round((SINGLE.daily[ai])*incomeFactor('daily')),confidence:'DIRECT',sourceVersion:'DAILY_V1.0_SINGLE_2025'};
  out.fun={value:Math.round((SINGLE.fun[ai])*incomeFactor('fun')),confidence:'DIRECT',sourceVersion:'ENTERTAINMENT_V1.0_SINGLE_2025'};
  const maleBeauty=[5971,6925,2953] as const;
  const femaleBeauty:[number,number,null]=[19313,14216,null];
  const sexValue=a.beautySex==='male'?maleBeauty[ai]:a.beautySex==='female'?femaleBeauty[ai]:null;
  out.beautyFashion=sexValue!==null&&sexValue!==undefined
   ?{value:sexValue,confidence:'DIRECT',sourceVersion:'BEAUTY_FASHION_V1.0_SINGLE_SEX_AGE_2025',meta:{sex:a.beautySex,sexFallback:false}}
   :{value:SINGLE.beautyFashion[ai],confidence:'DIRECT',sourceVersion:'BEAUTY_FASHION_V1.0_SINGLE_2025',meta:{sexFallback:'all',requestedSex:a.beautySex??'unanswered',fallbackReason:a.beautySex==='female'&&ai===2?'FEMALE_60PLUS_CROSS_UNAVAILABLE':a.beautySex==='preferNot'?'PREFER_NOT_TO_ANSWER':'SEX_NOT_ASKED'}};
 }else{
  const si=sizeBand(a.householdSize??2);
  out.energy={value:Math.round(MULTI.energy[si]*(REGION[a.prefecture]??1)*(MONTH[Math.max(1,Math.min(12,a.month))-1]??1)),confidence:'MODEL',sourceVersion:'UTILITY_V2.1_MULTI_2025',meta:{householdSize:a.householdSize??2,regionFactor:REGION[a.prefecture]??1,month:a.month}};
  out.food={value:MULTI.food[si],confidence:'DIRECT',sourceVersion:'FOOD_V1.1_MULTI_2025'};
  out.daily={value:MULTI.daily[si],confidence:'DIRECT',sourceVersion:'DAILY_V1.0_MULTI_2025'};
  out.fun={value:MULTI.fun[si],confidence:'DIRECT',sourceVersion:'ENTERTAINMENT_V1.0_MULTI_CORE_2025'};
  out.beautyFashion={value:null,confidence:'AUDIT',sourceVersion:'BEAUTY_FASHION_V1.0_NO_FABRICATED_MULTI_CROSS'};
 }
 const edu=educationBenchmarkV2(a.educationChildren);
 out.childEducation={value:edu,confidence:edu===null?'AUDIT':'DIRECT',sourceVersion:'CHILD_EDUCATION_V1.1_CORRECTED'};
 const housing=H[a.prefecture]??HOUSING_FALLBACK;
 const isPrivateRent=a.housingType==='賃貸';
 out.rent={value:isPrivateRent&&housing.meanPaid?housing.meanPaid:null,confidence:isPrivateRent&&housing.meanPaid?'DIRECT':'AUDIT',sourceVersion:'HOUSING_V2.0_PRIVATE_RENT_2023',meta:{p50Band:isPrivateRent?housing.p50:'',p75Band:isPrivateRent?housing.p75:'',p90Band:isPrivateRent?housing.p90:'',housingType:a.housingType,reason:isPrivateRent?'PRIVATE_RENT_DISTRIBUTION':'NON_RENT_AUDIT_ONLY'}};
 out.mobile={value:null,confidence:'AUDIT',sourceVersion:'COMMUNICATION_V1.0_DIRECT_BANDS',meta:{majorP50:'4,000-4,999',majorP75:'6,000-7,999',majorP90:'10,000+',mvnoP50:'2,000-2,999',mvnoP75:'3,000-3,999',mvnoP90:'5,000-5,999'}};
 for(const c of ['insurance','sub','car','selfDevelopment'] as Category[]) out[c]={value:null,confidence:'AUDIT',sourceVersion:'AUDIT_ONLY_V2.1'};
 return out;
}

export const RESOLVER_V2_VERSION='MUDAGIRI_COMPARABLE_RESOLVER_V2_0';
export const __resolverV2Audit={SINGLE,MULTI,REGION,MONTH,EDU,H};
