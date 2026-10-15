import {resolveComparableV2,resolveComparableV2LegacyIncome0930,type ComparableV2} from './comparable-resolver-v2';
import type {Category} from './mudagiri-diagnosis-v2';

/** Evidence-side comparison only. Never use this projection in live diagnosis,
 * savings, Battle, or claims that the data contract has been reconciled.
 *
 * MASTER_ENGINE FOOD: income quintiles are supplementary; multiplying the
 * household-size baseline by an income ratio is prohibited.
 * G03/G07: prevent unsupported cross-table factor synthesis.
 *
 * The 2026-09-30 FROZEN runtime used income ratios for energy/food/daily/fun.
 * Its original exact calculations remain accessible through the archived
 * 9/30 resolver, while this isolated candidate defaults to final-contract
 * comparators. Do not merge before superseding-copy and 100-case review.
 */
export const FINAL_CONTRACT_V1_SOURCE='MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0_20260928' as const;
export const CONTRACT_POLICY_CONFLICT_STATUS='P0_CANDIDATE_VALIDATION_DO_NOT_MERGE' as const;
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
 const frozen=resolveComparableV2LegacyIncome0930(args);
 // Published household-size/age/region/month figures remain intact.
 // V1 income-ratio multiplication lives only in the historical branch.
 const contract=resolveComparableV2(args);
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
