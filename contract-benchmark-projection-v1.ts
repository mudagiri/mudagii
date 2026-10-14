import {resolveComparableV2,type ComparableV2} from './comparable-resolver-v2';
import type {Category} from './mudagiri-diagnosis-v2';

/** Evidence-side comparison only. Never use this projection in live diagnosis,
 * savings, Battle, or claims that the data contract has been reconciled.
 *
 * MASTER_ENGINE FOOD: income quintiles are supplementary; multiplying the
 * household-size baseline by an income ratio is prohibited.
 * G03/G07: prevent unsupported cross-table factor synthesis.
 *
 * The 2026-09-30 FROZEN runtime intentionally uses income ratios for
 * energy/food/daily/fun; this projection quantifies differences WITHOUT
 * changing the frozen baseline while the conflicting policies are reconciled.
 */
export const FINAL_CONTRACT_V1_SOURCE='MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0_20260928' as const;
export const CONTRACT_POLICY_CONFLICT_STATUS='P0_UNRESOLVED_DO_NOT_MERGE' as const;
export const CONTRACT_INCOME_REVIEW_CATEGORIES=['energy','food','daily','fun'] as const satisfies readonly Category[];

type ResolverArgs=Parameters<typeof resolveComparableV2>[0];
export type PolicyComparison={
 category:typeof CONTRACT_INCOME_REVIEW_CATEGORIES[number];
 frozenValue:number|null;
 contractProjection:number|null;
 discrepancyYen:number|null;
 frozenConfidence:ComparableV2['confidence']|null;
 contractConfidence:ComparableV2['confidence']|null;
};
export function compareIncomeModelsAgainstFinalContractV1(args:ResolverArgs):PolicyComparison[]{
 const frozen=resolveComparableV2(args);
 // The published household-size/age/region/month figures remain intact.
 // This deliberately removes ONLY the V1 income-ratio multiplication.
 const contract=resolveComparableV2({...args,annualIncome:null});
 return CONTRACT_INCOME_REVIEW_CATEGORIES.map(category=>{
  const a=frozen[category],b=contract[category];
  const frozenValue=a?.value??null,contractProjection=b?.value??null;
  return {
   category,frozenValue,contractProjection,
   discrepancyYen:frozenValue===null||contractProjection===null?null:frozenValue-contractProjection,
   frozenConfidence:a?.confidence??null,contractConfidence:b?.confidence??null
  };
 });
}
