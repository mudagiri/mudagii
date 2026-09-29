import type { Category } from './mudagiri-diagnosis-v2';

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
 '神奈川県':{meanPaid:79739,p50:'70,000～80,000円未満',p75:'90,000～100,000円未満',p90:'110,000～120,000円未満'}
};
const HOUSING_FALLBACK:HousingRow={meanPaid:0,p50:'',p75:'',p90:''};

export function educationBenchmarkV2(children:EducationChildV2[]|undefined){
 if(!children?.length)return null;
 return children.reduce((s,c)=>s+(EDU[c.stage]??0),0);
}

export function resolveComparableV2(a:{household:HouseholdV2;householdSize?:number;age:number;prefecture:string;month:number;housingType?:string;educationChildren?:EducationChildV2[]}):Partial<Record<Category,ComparableV2>>{
 const out:Partial<Record<Category,ComparableV2>>={};
 const ai=ageBand(a.age);
 if(a.household==='single'){
  out.energy={value:SINGLE.energy[ai],confidence:'DIRECT',sourceVersion:'UTILITY_V2.1_SINGLE_2025'};
  out.food={value:SINGLE.food[ai],confidence:'DIRECT',sourceVersion:'FOOD_V1.1_SINGLE_2025'};
  out.daily={value:SINGLE.daily[ai],confidence:'DIRECT',sourceVersion:'DAILY_V1.0_SINGLE_2025'};
  out.fun={value:SINGLE.fun[ai],confidence:'DIRECT',sourceVersion:'ENTERTAINMENT_V1.0_SINGLE_2025'};
  out.beautyFashion={value:SINGLE.beautyFashion[ai],confidence:'DIRECT',sourceVersion:'BEAUTY_FASHION_V1.0_SINGLE_2025',meta:{sexFallback:'all'}};
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
 out.rent={value:housing.meanPaid||null,confidence:housing.meanPaid?'DIRECT':'AUDIT',sourceVersion:'HOUSING_V2.0_PRIVATE_RENT_2023',meta:{p50Band:housing.p50,p75Band:housing.p75,p90Band:housing.p90,housingType:a.housingType}};
 out.mobile={value:null,confidence:'AUDIT',sourceVersion:'COMMUNICATION_V1.0_DIRECT_BANDS',meta:{majorP50:'4,000-4,999',majorP75:'6,000-7,999',majorP90:'10,000+',mvnoP50:'2,000-2,999',mvnoP75:'3,000-3,999',mvnoP90:'5,000-5,999'}};
 for(const c of ['insurance','sub','car','selfDevelopment'] as Category[]) out[c]={value:null,confidence:'AUDIT',sourceVersion:'AUDIT_ONLY_V2.1'};
 return out;
}

export const RESOLVER_V2_VERSION='MUDAGIRI_COMPARABLE_RESOLVER_V2_0';
export const __resolverV2Audit={SINGLE,MULTI,REGION,MONTH,EDU,H};
