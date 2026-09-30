# MUDAGIRI — NEXT CHAT EXECUTION MASTER
Date: 2026-09-30
Repository: mudagiri/mudagii
Prepared HEAD: 99ae75e2846e155dba88defe2434e31fcd182a4d

## Mission
Use the included repository snapshot and specifications to continue implementation. Do not redesign frozen diagnosis logic. The end product is a production-ready Mudagiri diagnosis with Result V4, resumable external round trips, eight Money Type pixel-RPG character assets, analytics-ready persistence, and green regression/deploy gates.

## Read order
1. START_HERE.md
2. MOBILE_UX_REBUILD_V1_SPEC.md
3. RESULT_V4_SPEC.md
4. RETURN_RESUME_V1_SPEC.md
5. TYPE_ART_V31_PROMPTS.md
6. current runtime files named in START_HERE.md
7. QA files

## Absolute source-of-truth rule
Before writing to GitHub, re-fetch current main. This ZIP is a handoff snapshot, not permission to overwrite a newer main. If GitHub main is ahead, reconcile first.

## Frozen product contracts
Do not alter without explicit user approval:
- 12 canonical categories and benchmark/AUDIT sources
- benchmark gap != waste / saving
- confirmed reducible only -> improvement yen
- PROFILE V4 structure/purpose
- Scan amount-only then conditional Appraisal
- MONEY TYPE V3.1 = 8Q / 3 axes / 8 types and current scoring/tie-break
- 48 canonical enemy PNG states
- unconfirmed STRONG is priority check, never defeated
- share privacy: no income/spend/prefecture

## Execution order
### Phase 0 — Full mobile UX/UI rebuild
Implement MOBILE_UX_REBUILD_V1_SPEC.md before Result V4.
- audit Opening -> Mode -> PROFILE -> Scan -> Type -> Appraisal -> Battle -> Result
- remove character/copy/control collisions
- decorative layers pointer-events:none
- immediate tap feedback; remove unnecessary timeout gates
- conditional vertical scrolling when content cannot fit
- preserve RPG one-scene feeling without fixed-height collisions
- pass 375x667 / 390x844 / 412x915 / 430x932 and Android Chrome/iOS safe-area checks

### Phase 1 — Result V4
Implement RESULT_V4_SPEC.md.
Mandatory fixes:
- remove aggregate monetary comparison-gap headline
- display confirmed / priority / protect semantics distinctly
- use disjoint displayed priority count (do not double-count confirmed battle inside priority check)
- Type hero early, but share CTA after diagnostic evidence
- 12-category Codex progressive disclosure
- LINE as result-save/checking utility; consultation optional
- preserve category-specific evidence labels and AUDIT nulls

### Phase 2 — Return/resume
Implement RETURN_RESUME_V1_SPEC.md.
- completed result restore
- LINE/share/reload round trip
- unfinished journey checkpoints
- explicit restart only
- compatibility/version guard
- privacy-safe resume analytics

### Phase 3 — Result QA
Add dedicated Result QA and resume QA.
At minimum assert:
- canonical comparable reaches Result unchanged
- AUDIT never becomes numeric comparator
- positive gap never becomes saving
- confirmed improvement equals confirmed reducible sum only
- priority counts are disjoint from confirmed
- no unconfirmed defeated rendering
- Result restoration preserves diagnosisId
- restart changes diagnosisId
- no duplicate diagnosis_started from restoration

### Phase 4 — Type art generation
Do NOT improvise from names alone. Follow TYPE_ART_V31_PROMPTS.md.
- Generate FPA calibration first
- user approves/freeze pixel style
- then generate remaining seven
- transparent PNG
- filenames TYPE_FPA.png ... TYPE_VIU.png
- audit all 8 together at full and ~140px
- integrate into Result hero and code-rendered share card
The discarded smooth anime/gacha calibration image from the previous chat is NOT an approved asset and is intentionally excluded from this handoff.

### Phase 5 — Analytics V2
After Result V4 semantics are frozen, implement analysis-friendly data model:
- EVENTS_RAW immutable append log
- DIAGNOSES one row/diagnosis
- CATEGORY_RESULTS one row/diagnosis/category
- TYPE_RESULTS one row/diagnosis
- FUNNEL one row/diagnosis
- LEADS
- KPI_DASHBOARD
Stable join: anonymousUserId -> diagnosisId -> category/type/event/lead.
Include version/experiment fields. Keep raw financial/profile values out of behavioral event rows.
Do not treat synthetic 10k QA as real CV data.

### Phase 6 — Final regression
Same HEAD must pass:
- npm run build
- npm run qa:persona
- npm run qa:type
- dedicated Result QA
- dedicated resume QA
- npm run qa:10k
- GitHub Pages deploy
Then run mobile 390x844 manual audit and external LINE/share return audit.

## Three-lens review on every Result change
Behavioral economics:
- cognitive load
- progressive disclosure
- loss aversion without false anchors
- goal gradient
- one-next-action
Psychology:
- autonomy / no shame
- self-recognition
- trust / evidence visibility
- positive reinforcement for protected spend
Marketing:
- completion
- trust before share
- Type identity virality
- share -> new diagnosis
- utility-led LINE transition

## Final release/handoff definition
Only call complete when:
1. Result V4 is implemented and audited.
2. Return/resume passes matrix.
3. Eight approved pixel-RPG Type PNGs are integrated.
4. Analytics production schema is ready.
5. CI/deploy are green on same HEAD.
6. START_HERE is updated to final runtime SOT.
7. A new final ZIP is created with current main, specs, assets, QA, analytics/GAS, asset inventory and integrity hash.

## Known current-state note
At preparation time Result runtime is still V3; Result V4 and return/resume are specifications, not yet implemented. Do not claim otherwise.
