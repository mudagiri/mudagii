import type {ProfileV4} from './mudagiri-profile-v4';

export type ReferenceLensV5={
 label:string;
 monthly:number;
 criteria:string[];
 sourceVersion:string;
 note:string;
};

export type InsuranceReferenceV5={
 primary:ReferenceLensV5|null;
 secondary:ReferenceLensV5[];
};

// JILI 2025 individual survey, Figure VI-11. The published table reports sex x decade.
// When sex is unavailable in the core profile, these decade values are transparent
// sample-N weighted aggregates of the published male/female decade means.
// They are display references only and never automatic Potential.
const PERSONAL_AGE_ANNUAL_MAN:Record<string,number>={
 '20s':11.9,'30s':16.0,'40s':22.4,'50s':24.4,'60s':20.2,'70s':16.1
};
const PERSONAL_AGE_N_MAN:Record<string,number>={
 '20s':82,'30s':157,'40s':238,'50s':300,'60s':255,'70s':249
};
const PERSONAL_AGE_ANNUAL_WOMAN:Record<string,number>={
 '20s':11.7,'30s':15.7,'40s':16.6,'50s':17.0,'60s':15.1,'70s':13.5
};
const PERSONAL_AGE_N_WOMAN:Record<string,number>={
 '20s':67,'30s':198,'40s':338,'50s':434,'60s':403,'70s':374
};

const householdAnnualByAge=(age:number)=>{
 if(age<=29)return 32.2;
 if(age<=34)return 29.8;
 if(age<=39)return 31.2;
 if(age<=44)return 37.4;
 if(age<=49)return 36.8;
 if(age<=54)return 38.2;
 if(age<=59)return 40.7;
 if(age<=64)return 34.3;
 if(age<=69)return 35.4;
 if(age<=74)return 34.5;
 if(age<=79)return 30.8;
 if(age<=84)return 28.2;
 if(age<=89)return 25.3;
 return age>=90?32.6:null;
};

const householdIncomeAnnual=(band:ProfileV4['annualIncomeBand'])=>{
 if(band==='500_599')return 32.2;
 if(band==='600_699')return 33.5;
 if(band==='700_799'||band==='800_999')return 39.9;
 if(band==='1000plus')return 55.4;
 return null;
};

const decadeKey=(age:number)=>{
 if(age>=20&&age<=29)return '20s';
 if(age<=39)return age>=30?'30s':null;
 if(age<=49)return '40s';
 if(age<=59)return '50s';
 if(age<=69)return '60s';
 if(age<=79)return '70s';
 return null;
};

const monthlyFromManYen=(annualMan:number)=>Math.round((annualMan*10_000)/12);

function personalAgeMonthly(age:number){
 const k=decadeKey(age);if(!k)return null;
 const nm=PERSONAL_AGE_N_MAN[k],nw=PERSONAL_AGE_N_WOMAN[k];
 const weighted=(PERSONAL_AGE_ANNUAL_MAN[k]*nm+PERSONAL_AGE_ANNUAL_WOMAN[k]*nw)/(nm+nw);
 return monthlyFromManYen(weighted);
}

export function insuranceReferenceV5(profile:ProfileV4):InsuranceReferenceV5{
 // Household scope with 2+ people: use the household survey directly.
 if(profile.diagnosisScope==='household'&&profile.householdSize>=2){
  const ageAnnual=householdAnnualByAge(profile.age);
  const primary=ageAnnual===null?null:{
   label:'同年代の2人以上世帯',
   monthly:monthlyFromManYen(ageAnnual),
   criteria:[`${profile.age}歳`,'2人以上世帯'],
   sourceVersion:'JILI_2024_HOUSEHOLD_PREMIUM_BY_HOH_AGE',
   note:'生命保険文化センター2024年度「生命保険に関する全国実態調査」の世帯年間払込保険料。個人年金保険を含む支払世帯の平均。',
  };
  const incomeAnnual=householdIncomeAnnual(profile.annualIncomeBand);
  const secondary:ReferenceLensV5[]=[];
  if(incomeAnnual!==null)secondary.push({
   label:'同じ世帯年収帯',
   monthly:monthlyFromManYen(incomeAnnual),
   criteria:[profile.annualIncomeBand],
   sourceVersion:'JILI_2024_HOUSEHOLD_PREMIUM_BY_HOUSEHOLD_INCOME',
   note:'年収区分が公式表と直接対応する場合のみ表示。年齢基準との合成平均は作りません。',
  });
  return {primary,secondary};
 }

 // Personal payment: use the individual 2025 survey rather than a household total.
 const monthly=personalAgeMonthly(profile.age);
 if(monthly===null)return {primary:null,secondary:[]};
 return {
  primary:{
   label:'同年代の個人加入者',
   monthly,
   criteria:[`${Math.floor(profile.age/10)*10}代`,'個人'],
   sourceVersion:'JILI_2025_INDIVIDUAL_PREMIUM_BY_AGE_WEIGHTED',
   note:'生命保険文化センター2025年度個人調査の性別×年代別平均を、公開サンプル数で年代内加重した比較目安。性別は診断コアで常時取得しないため合成クロスは作りません。',
  },
  secondary:[],
 };
}

const MORTGAGE_MONTHLY_BY_HOH_AGE_2025=[
 {max:34,value:99357,label:'34歳以下'},
 {max:39,value:96307,label:'35〜39歳'},
 {max:44,value:93705,label:'40〜44歳'},
 {max:49,value:88378,label:'45〜49歳'},
 {max:54,value:88269,label:'50〜54歳'},
 {max:59,value:97046,label:'55〜59歳'},
 {max:64,value:96646,label:'60〜64歳'},
 {max:69,value:93869,label:'65〜69歳'},
 {max:Infinity,value:88125,label:'70歳以上'},
] as const;

export function mortgageReferenceV5(profile:ProfileV4):ReferenceLensV5|null{
 if(profile.housingTenure!=='owned'||profile.housingSubtype!=='mortgage'||profile.householdSize<2)return null;
 const row=MORTGAGE_MONTHLY_BY_HOH_AGE_2025.find(x=>profile.age<=x.max)!;
 return {
  label:'同年代の住宅ローン返済世帯',
  monthly:row.value,
  criteria:[row.label,'2人以上世帯','世帯主年齢ベース'],
  sourceVersion:'STAT_GO_JP_FIES_2025_TABLE_3_10_MORTGAGE_HOH_AGE',
  note:'総務省2025年家計調査 第3-10表「住宅ローン返済世帯－世帯主の年齢階級別」の土地家屋借金返済。二人以上の勤労者世帯が対象。プロフィール年齢を世帯主年齢の近似として使うため構造REFERENCE扱い。Potentialには自動算入しません。',
 };
}

export function carMaintenanceReferenceV5(profile:ProfileV4,scope:unknown):ReferenceLensV5|null{
 if(scope!=='maintenanceOnly'||profile.age>59)return null;
 return {
  label:'車の維持費参考',
  monthly:14100,
  criteria:['維持費中心','18〜59歳の自家用車ユーザー'],
  sourceVersion:'SONY_SONPO_2025_CAR_LIFE_MAINTENANCE',
  note:'ソニー損保2025年全国カーライフ実態調査。保険料・燃料代・駐車場代・修理代等を含み、税金・ローン返済・有料道路通行料は除外。Potentialには自動算入しません。',
 };
}

export const RESULT_REFERENCE_V5_VERSION='MUDAGIRI_RESULT_REFERENCE_V5_2';
