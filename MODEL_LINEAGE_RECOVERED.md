# MODEL LINEAGE — recovered audit

## Stage A — Macro Reference V1.0 (historical, superseded for runtime categories)
`Mudagiri_Reference_Data_V1.0_FINAL_FROZEN.xlsx`
- 6 macro categories: food / utilities / household / health / transport_comm / recreation.
- Sources verified in workbook: t10, t12, va401, va402, va403, va406 (Statistics Bureau Household Survey 2025).
- 240 golden profiles × 6 categories = 1,440 outputs.
- Freeze gates PASS: 599→600, 1499→1500, income caps, region scope, formula reproduction.
- This stage explicitly noted that mobile/insurance/subscription etc. still needed fine-grained mapping.

## Stage B — Product 12-category Comparable Reference V1.0 (current runtime lineage)
Recovered from the later React-code design history. This was an intentional refinement, not an accidental divergence from Stage A.
Runtime benchmarked categories:
- mobile / energy / food / daily / fun / beautyFashion
Other product categories:
- rent / insurance / sub / car / childEducation / selfDevelopment

Final high-income parameters:
| category | income lambda | clamp |
|---|---:|---:|
| mobile | 0.15 | 0.95–1.10 |
| energy | 0.10 | 0.95–1.08 |
| food | 0.45 | 0.90–1.20 |
| daily | 0.30 | 0.90–1.12 |
| fun | 0.45 | 0.80–1.45 |
| beautyFashion | 0.45 | 0.85–1.30 |

- Two+ worker household: va402 income series, PAVA monotonic smoothing, category shrinkage, clamp, interpolation.
- Single household: no continuous high-income extrapolation because high-income cells were thin.
- Region: energy adjusted; food only weakly adjusted in the later product resolver.
- 30/30 product-level stress cases reported PASS.
- Comparable Reference != Target. A high comparable never directly means “waste”.

## Stage C — Diagnosis Engine V2 (current runtime)
12 categories:
mobile / energy / sub / car / food / daily / fun / beautyFashion / rent / insurance / childEducation / selfDevelopment.

Policies:
- optimization: mobile / energy / sub
- reference_guardrail: car / daily
- lifestyle: food / fun / beautyFashion / rent
- needs_review: insurance / childEducation / selfDevelopment

Recovered validation record:
- 2,883 cases
- 31,686 assertions
- FAIL 0
- checked reducible, Battle Score, 5-year = monthly × 60, satisfaction protection, NeedsReview, missing Reference, determinism.
This V2 supersedes the macro six-category Target Master for the production 12-category UX.

## Audit conclusion
Do NOT force current runtime back to the six-category workbook. The workbook is the verified macro predecessor; the 12-category resolver/Diagnosis V2 is the later product refinement.
The previous `NEEDS_CELL_PROVENANCE` label was too strong if interpreted as “unverified model”. Exact source-cell mapping is desirable archival provenance, not an MVP blocker, because the model lineage and stress validation were already performed.
