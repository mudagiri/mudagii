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
