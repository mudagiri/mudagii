# MUDAGIRI 12-category FROZEN contract implementation audit

Source of truth: `MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0.xlsx` (V1.0 / 2026-09-28).

## Global invariants
- benchmark gap is analysis-only, never waste or confirmed saving.
- confirmed saving requires a concrete verified alternative/action.
- do not synthesize attribute crosses that do not exist in the source.
- do not bridge mismatched populations with invented multipliers.
- missing data must fall back explicitly, never through fabricated coefficients.
- canonical category ownership prevents double counting.

## Current resolver blockers

| Category | Frozen contract | Current implementation | Status |
|---|---|---|---|
| Housing | rental distribution / mortgage burden | comparator null; preference only | BLOCKED |
| Communications | carrier/MVNO price distribution; lines/fixed internet/device in DETAIL | Household Survey age amount used as comparator | CONTRADICTS |
| Utilities | single=age; multi=household size; region/season only for multi | multi=age plus region; income factor | CONTRADICTS |
| Insurance | market position + individual required coverage | comparator null; summary audit | PARTIAL |
| Subscriptions | contract-level audit; no national average | unused contract flow | ALIGNED |
| Food | single=age; multi=household size; income quintile reference only | multi=age + proprietary income multiplier | CONTRADICTS |
| Daily goods | single=age; multi=household size; restricted item scope | age + proprietary income multiplier | CONTRADICTS |
| Leisure | official age/size total + item audit; no invented cross | age + proprietary income multiplier | CONTRADICTS |
| Beauty/fashion | single=sex×age; multi=official detailed items | sex is not collected; age + income multiplier | CONTRADICTS |
| Car | market spend + ownership structure + item audit | need-only appraisal; comparator null | PARTIAL |
| Child education | each child × stage × public/private, then sum | one representative stage | CONTRADICTS |
| Self-development | case-level audit; no national average | purpose/result appraisal | PARTIAL/ALIGNED |

## Inputs required before contract-compliant comparisons
1. Multi-person household size for food/utilities/daily goods and relevant leisure comparison.
2. Sex for the frozen single-person beauty/fashion comparator, or an explicit lower-fidelity fallback that does not claim sex×age matching.
3. Education composition per child (stage + public/private) rather than one representative child.
4. Communications DETAIL: mobile line count, fixed internet, device installment separation, data/call/bundle conditions.
5. Housing DETAIL: rent vs ownership, pure rent vs management/common fees/parking; location/area data when using rental distribution.
6. Vehicle DETAIL: loan, fuel, insurance, parking, maintenance, number of vehicles.
7. Insurance DETAIL: public coverage, required coverage, duplicated riders and equivalent alternatives.

## Resolver V2 rules
- Remove `frozenIncomeFactor`, `lambda`, `bounds`, and income-derived multipliers from category comparators unless a directly matching source table is explicitly frozen.
- Never reuse the current `mobile: 4738` etc. Household Survey communication amount as the frozen carrier/MVNO price-distribution comparator.
- Return `null` with explicit fallback metadata when required frozen attributes are unavailable.
- Keep `confirmedSaving` null until a concrete avoidable amount is verified.
- Persist source version, benchmark method, fallback level, and model_estimate flag with every comparator.

## Official source verification already confirmed
- Statistics Bureau Household Survey 2025 publishes single-household age tables and two-or-more-person household-size tables.
- Single-household detailed results include sex × age tables.
- 2025 household-size table is the correct direct axis for multi-person food/utilities/daily-goods baseline.
- Life Insurance Culture Center 2024 distribution is market-position context only, not an adequacy threshold.

## Release gate
Do not mark Resolver/Result FROZEN until:
1. all 12 categories map to the contract,
2. unsupported comparisons return explicit fallback/null rather than invented values,
3. deterministic boundary tests cover exact benchmark, +1 yen, zero, unknown and N/A,
4. Result comparator equals resolver comparator exactly,
5. benchmark gap never enters confirmed saving,
6. persistence records source/method/fallback metadata.
