import type { HouseholdV2 } from './comparable-resolver-v2';

export type DiagnosisScopeV4='personal'|'household';
export type RelationshipV4='partner'|'children'|'parents'|'other';
export type ExpenseSharingV4='self_all'|'self_more'|'split'|'other_more'|null;
export type HouseholdContributionModeV4='bundled'|'itemized'|'little_or_none'|null;
export type HousingTenureV4='rental'|'owned'|'family_home'|'company_housing'|'other';
export type HousingSubtypeV4='private_rental'|'public_rental'|'unknown_rental'|'mortgage'|'no_mortgage'|'other'|null;
export type AnnualIncomeBandV4='under500'|'500_599'|'600_699'|'700_799'|'800_999'|'1000plus'|'unknown';

export interface ProfileV4 {
 diagnosisScope:DiagnosisScopeV4;
 householdSize:number;
 adultCount:number;
 childCount:number;
 relationships:RelationshipV4[];
 expenseSharing:ExpenseSharingV4;
 householdContributionMode:HouseholdContributionModeV4;
 prefecture:string;
 age:number;
 housingTenure:HousingTenureV4;
 housingSubtype:HousingSubtypeV4;
 monthlyTakeHome:number|null;
 annualIncomeBand:AnnualIncomeBandV4;
}

export type LegacyFamilyProfileV4='single'|'couple'|'children'|'other';

export const ANNUAL_INCOME_REPRESENTATIVE_YEN_V4:Record<Exclude<AnnualIncomeBandV4,'unknown'>,number>={
 under500:4_990_000,
 '500_599':5_500_000,
 '600_699':6_500_000,
 '700_799':7_500_000,
 '800_999':9_000_000,
 '1000plus':10_000_000,
};

export function assertProfileV4(p:ProfileV4){
 if(p.diagnosisScope!=='personal'&&p.diagnosisScope!=='household')throw new Error('INVALID_DIAGNOSIS_SCOPE');
 if(!Number.isInteger(p.householdSize)||p.householdSize<1)throw new Error('INVALID_HOUSEHOLD_SIZE');
 if(!Number.isInteger(p.adultCount)||p.adultCount<1)throw new Error('INVALID_ADULT_COUNT');
 if(!Number.isInteger(p.childCount)||p.childCount<0)throw new Error('INVALID_CHILD_COUNT');
 if(p.adultCount+p.childCount!==p.householdSize)throw new Error('HOUSEHOLD_COUNT_MISMATCH');
 if(p.childCount>0&&!p.relationships.includes('children'))throw new Error('CHILD_RELATIONSHIP_REQUIRED');
 if(p.childCount===0&&p.relationships.includes('children'))throw new Error('CHILD_RELATIONSHIP_MISMATCH');
 if(p.householdSize===1&&p.relationships.length>0)throw new Error('SINGLE_MUST_NOT_HAVE_RELATIONSHIPS');
 if(p.diagnosisScope==='personal'&&p.householdSize>=2&&!p.expenseSharing)throw new Error('PERSONAL_MULTI_REQUIRES_EXPENSE_SHARING');
 if(!(p.diagnosisScope==='personal'&&p.relationships.includes('parents'))&&p.householdContributionMode!==null)throw new Error('CONTRIBUTION_MODE_NOT_APPLICABLE');
 if(p.diagnosisScope==='personal'&&p.relationships.includes('parents')&&p.householdContributionMode===null)throw new Error('PARENT_COHABIT_REQUIRES_CONTRIBUTION_MODE');
 if(!p.prefecture.trim())throw new Error('PREFECTURE_REQUIRED');
 if(!Number.isInteger(p.age)||p.age<18||p.age>120)throw new Error('INVALID_AGE');
 if(p.monthlyTakeHome!==null&&(!Number.isFinite(p.monthlyTakeHome)||p.monthlyTakeHome<0))throw new Error('INVALID_MONTHLY_TAKE_HOME');
}

export function legacyFamilyProfileV4(p:ProfileV4):LegacyFamilyProfileV4{
 if(p.householdSize===1)return 'single';
 if(p.childCount>0)return 'children';
 if(p.relationships.includes('partner'))return 'couple';
 return 'other';
}

export function resolverHouseholdV4(p:ProfileV4):HouseholdV2{
 return p.householdSize===1?'single':'multi';
}

export function shouldOfferAnnualIncomeCalibrationV4(p:ProfileV4){
 return p.diagnosisScope==='household'&&p.householdSize>=2;
}

export function resolverAnnualIncomeV4(p:ProfileV4):number|null{
 if(!shouldOfferAnnualIncomeCalibrationV4(p)||p.annualIncomeBand==='unknown')return null;
 return ANNUAL_INCOME_REPRESENTATIVE_YEN_V4[p.annualIncomeBand];
}

export function resolverHousingTypeV4(p:ProfileV4){
 if(p.housingTenure==='rental')return '賃貸';
 if(p.housingTenure==='owned'&&p.housingSubtype==='mortgage')return '持ち家（ローンあり）';
 if(p.housingTenure==='owned')return '持ち家（ローンなし）';
 if(p.housingTenure==='family_home'||p.housingTenure==='company_housing')return '実家・社宅など';
 return 'その他';
}

export const PROFILE_V4_VERSION='MUDAGIRI_PROFILE_V4_0';


export type ProfileStepV4='scope'|'householdSize'|'relationships'|'childCount'|'expenseSharing'|'contribution'|'prefecture'|'age'|'housing'|'income';

export interface ProfileDraftV4 {
 diagnosisScope:DiagnosisScopeV4|'';
 householdSize:number|null;
 childCount:number|null;
 relationships:RelationshipV4[];
 expenseSharing:ExpenseSharingV4;
 householdContributionMode:HouseholdContributionModeV4;
 prefecture:string;
 age:number|null;
 housingTenure:HousingTenureV4|null;
 housingSubtype:HousingSubtypeV4;
 monthlyTakeHome:number|null;
 monthlyTakeHomeAnswered:boolean;
 annualIncomeBand:AnnualIncomeBandV4;
}

export function emptyProfileDraftV4():ProfileDraftV4{
 return {
  diagnosisScope:'',
  householdSize:null,
  childCount:null,
  relationships:[],
  expenseSharing:null,
  householdContributionMode:null,
  prefecture:'',
  age:null,
  housingTenure:null,
  housingSubtype:null,
  monthlyTakeHome:null,
  monthlyTakeHomeAnswered:false,
  annualIncomeBand:'unknown',
 };
}

export function profileStepsV4(d:ProfileDraftV4):ProfileStepV4[]{
 const steps:ProfileStepV4[]=['scope','householdSize'];
 if((d.householdSize??0)>=2)steps.push('relationships');
 if((d.householdSize??0)>=2&&d.relationships.includes('children'))steps.push('childCount');
 if(d.diagnosisScope==='personal'&&(d.householdSize??0)>=2)steps.push('expenseSharing');
 if(d.diagnosisScope==='personal'&&d.relationships.includes('parents'))steps.push('contribution');
 steps.push('prefecture','age','housing','income');
 return steps;
}

export function profileStepValidV4(step:ProfileStepV4,d:ProfileDraftV4){
 if(step==='scope')return d.diagnosisScope==='personal'||d.diagnosisScope==='household';
 if(step==='householdSize')return Number.isInteger(d.householdSize)&&Number(d.householdSize)>=1;
 if(step==='relationships')return d.relationships.length>0;
 if(step==='childCount')return Number.isInteger(d.childCount)&&Number(d.childCount)>=1&&Number(d.childCount)<Number(d.householdSize);
 if(step==='expenseSharing')return d.expenseSharing!==null;
 if(step==='contribution')return d.householdContributionMode!==null;
 if(step==='prefecture')return d.prefecture.trim().length>0;
 if(step==='age')return Number.isInteger(d.age)&&Number(d.age)>=18&&Number(d.age)<=120;
 if(step==='housing')return d.housingTenure!==null;
 if(step==='income')return d.monthlyTakeHomeAnswered;
 return false;
}

export function finalizeProfileV4(d:ProfileDraftV4):ProfileV4{
 for(const step of profileStepsV4(d))if(!profileStepValidV4(step,d))throw new Error(`PROFILE_STEP_INCOMPLETE:${step}`);
 const householdSize=d.householdSize!;
 const childCount=d.relationships.includes('children')?(d.childCount??0):0;
 const profile:ProfileV4={
  diagnosisScope:d.diagnosisScope as DiagnosisScopeV4,
  householdSize,
  adultCount:householdSize-childCount,
  childCount,
  relationships:householdSize===1?[]:[...d.relationships],
  expenseSharing:d.diagnosisScope==='personal'&&householdSize>=2?d.expenseSharing:null,
  householdContributionMode:d.diagnosisScope==='personal'&&d.relationships.includes('parents')?d.householdContributionMode:null,
  prefecture:d.prefecture,
  age:d.age!,
  housingTenure:d.housingTenure!,
  housingSubtype:d.housingSubtype,
  monthlyTakeHome:d.monthlyTakeHome,
  annualIncomeBand:d.annualIncomeBand,
 };
 assertProfileV4(profile);
 return profile;
}
