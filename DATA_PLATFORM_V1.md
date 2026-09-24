> STATUS: Historical handoff/reference. Where this file conflicts with START_HERE.md, SOURCE_AUDIT_2026-09-23.md, or current runtime code, the newer files/runtime win.

# MUDAGIRI Data Platform V1

## Principle
Never overwrite official/reference statistics with user data. Store three layers separately:
1. `reference_*`: public/market reference data and provenance.
2. `diagnosis_fact`: immutable per-diagnosis observations.
3. `benchmark_*`: anonymous aggregates derived only from eligible diagnosis facts.
CRM/PII is a fourth, access-separated store linked by opaque IDs.

## Core tables
### diagnosis_session
`diagnosis_id PK`, created_at, schema_version, methodology_version, consent_analytics, consent_benchmark, source, campaign.

### diagnosis_profile
`diagnosis_id FK`, prefecture, region, age, age_band, family_profile, household, annual_income, income_band. Do not expose exact age/income in anonymous marts unless needed; aggregate using bands.

### diagnosis_finance
`diagnosis_id FK`, monthly_take_home_income, monthly_saving_investment, free_cash_flow, emergency_months, saving_rate.

### diagnosis_category_fact
Composite PK `(diagnosis_id, category)`. `amount`, `amount_state(known|zero|unknown)`, comparable_at_diagnosis, comparison_difference, satisfaction, outcome, monthly_improvement. Unknown amount is NULL, never 0.

### diagnosis_type_fact
`diagnosis_id FK`, type_code, fv, pi, au, se, global_satisfaction, battle_score, future_goal, tone_mode.

### lead_profile (restricted CRM store)
`lead_id PK`, diagnosis_id, line_user_id, stage, future_goal, type_code, income_band, family_profile, needs_review, unknown_categories, monthly_improvement. Appointment timestamps/outcome live here. PII/LINE identifiers must not be copied into benchmark tables.

### benchmark_cell
`benchmark_key PK`, category, dimensions_json, n, mean, median, p25, p75, p90, stddev, quality, updated_at.

## Benchmark publication thresholds
- n < 30: hidden. Never display as a Mudagiri peer benchmark.
- 30–99: internal/reference-only; not a primary user-facing benchmark.
- 100–499: publishable as `ムダギリ利用者・同属性中央値`, always show n.
- 500+: strong; may allow finer segmentation if privacy checks still pass.

Use median as the primary peer statistic. Mean is analytical only by default. Keep P25/P75/P90 to show distribution without calling high spending “bad”.

## Hierarchical fallback
Try the most specific eligible cell, then broaden until n/quality is sufficient:
`prefecture + age + income + family/household` -> remove prefecture -> remove region -> remove age -> remove detailed family profile.
Never silently label a broadened cell as exact. Return `matched_dimensions` and `fallback_level` to UI.

## Future Comparable Engine V2
User-facing comparison can contain two explicitly separated values:
- `公的統計ベース比較値`: current official/market Reference/Comparable engine.
- `ムダギリ利用者・同属性中央値 (n=...)`: anonymous first-party observations when publishable.
Neither value equals waste. Reducible amount continues to be determined by Diagnosis Engine policy + satisfaction, not by peer difference alone.

## Feedback loop
LINE/self-action follow-up can append outcome events, never mutate the original diagnosis:
`action_started`, `action_completed`, `verified_monthly_reduction`, `kept_as_valuable`, `specialist_reviewed`.
This enables calibration of Target assumptions from realized reductions while preserving historical auditability.

## Privacy / governance
- Benchmark participation must be disclosed and consented to separately from CRM/marketing use.
- Store LINE/phone/email/name only in the restricted CRM/identity layer.
- Anonymous marts use opaque diagnosis IDs and bands; no direct identifiers.
- Suppress sparse cells; monitor combinations that could re-identify a household.
- Preserve methodology/schema version on every diagnosis so old observations remain interpretable after engine changes.
- Define retention/deletion procedures before production collection; deleting a person's source record must be operationally possible.

## North-star funnel joins
`diagnosis_id` is the anonymous product key; `lead_id` is the CRM key. Track:
start -> complete -> LINE -> action -> appointment CTA -> booked -> attended -> qualified -> won/lost.
Primary business KPI remains valid/qualified appointments per diagnosis start; benchmark growth is a second asset KPI.
