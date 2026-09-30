# RESULT V4 — Evidence-safe UX / Visual Specification

Status: DESIGN SOT / implementation pending
Date: 2026-09-30

## 1. Non-negotiable diagnosis contract
Result V4 changes presentation, not diagnosis truth.
- benchmark gap != waste
- benchmark gap != reducible amount
- only confirmed reducible yen may be displayed as confirmed improvement
- STRONG encounter = priority check, not defeated waste
- MEDIUM = secondary review
- PROTECT = value/necessity confirmed; high amount alone never overrides it
- AUDIT categories must never receive fabricated averages
- MONEY TYPE V3.1 remains 8 questions / 3 axes / 8 types

## 2. Category evidence contract
| category | comparator / evidence | Result rule |
|---|---|---|
| mobile | carrier-specific price bands after appraisal | show band, never fake monthly average; combined mobile+home internet caveat |
| energy | single DIRECT or multi MODEL benchmark + persistence | comparison may be shown; persistent excess is review, not saving |
| sub | AUDIT / actual unused amount + cancellability | only unused amount with cancellation confirmed becomes saving |
| car | AUDIT / necessity & burden appraisal | no benchmark yen; show user's necessity answer |
| food | household benchmark + satisfaction/value appraisal | comparison may be shown; value can PROTECT |
| daily | household benchmark + persistence | comparison may be shown; persistent excess is review |
| fun | household benchmark + satisfaction/value appraisal | comparison may be shown; value can PROTECT |
| beautyFashion | single DIRECT by sex/age where supported; multi AUDIT | never fabricate multi-household comparator |
| rent | private-rent prefecture distribution only; non-rent AUDIT | show private-rent reference/band only when applicable |
| insurance | AUDIT / purpose + review recency + contract context | no fake average; show review reason |
| childEducation | DIRECT stage-based sum when stages known; otherwise AUDIT | benchmark gap is reference only, never saving |
| selfDevelopment | AUDIT / purpose, use, results | no fake average; show value appraisal |

## 3. Result V4 information hierarchy
1. QUEST CLEAR — completion reward, short.
2. MONEY TYPE HERO — identity reward with type character image.
3. YOUR HOUSEHOLD VERDICT — one-screen summary: confirmed / priority / protected.
4. PRIORITY QUESTS — max 1–3 evidence-backed items. Explain why each was selected.
5. CONFIRMED IMPROVEMENT — only if >0. Monthly + annual. Five-year may be secondary, never mixed with benchmark gaps.
6. NEXT QUEST — exactly one next action.
7. 12-CATEGORY CODEX — expandable evidence details.
8. SHARE TYPE — after diagnostic credibility has been established; financial/profile data excluded.
9. SAVE / LINE — result preservation + unresolved-item instructions; consultation optional.

Do not show a single summed "comparison gap" headline. Category-level comparison gaps may appear only inside the relevant evidence card with explicit non-saving semantics.

## 4. Three-lens UX audit
### Behavioral economics
- Progressive disclosure: summary -> priority -> evidence details.
- Goal-gradient: QUEST CLEAR then unlocked identity/result.
- Endowment effect: frame completed result as something the user owns and can save/return to.
- Loss aversion must not be triggered with unconfirmed benchmark-gap yen.
- One-action rule: NEXT QUEST selects one concrete action, reducing choice overload.

### Psychology
- Preserve autonomy: PROTECT is a legitimate outcome.
- Avoid shame: high spending is not moral failure.
- Self-recognition: Type hero explains strength + blind spot + 3 axes.
- Evidence visibility: "why this result" should be one tap away.
- Zero-encounter state means no strong priority under current answers, not "perfect household."

### Marketing
- Identity precedes sharing, but sharing CTA comes after enough evidence to create trust.
- Type image is the viral object; never expose income, spending, prefecture.
- Result -> NEXT QUEST -> LINE is utility-led, not consultation-led.
- LINE promise: preserve result + give unresolved-item checking steps. Consultation remains optional.
- Instrument result section views, share, save/LINE and return-to-result.

## 5. Visual direction
390x844 / 100dvh baseline. Result may scroll.
- RPG reward layer + trustworthy financial evidence layer.
- Dark cinematic game world; gold used for unlocked/reward emphasis, not to imply financial gain.
- Type character is the hero visual. Enemy art supports priority cards.
- Strong visual separation:
  - CONFIRMED: verified action/reward treatment.
  - PRIORITY CHECK: investigation/quest treatment; never defeated art.
  - PROTECT: shield/value treatment.
  - SAFE: quiet/low-salience treatment.
- 12-category Codex is compact accordion; do not dump all explanations above the fold.
- Type character assets: transparent PNG, square master, text-free, readable silhouette at mobile size.

## 6. Eight Type image system
Codes/names remain:
- FPA 鉄壁マネー要塞
- FPU 穴あき家計の番人
- FIA 未来キープストッカー
- FIU 未来直感ゾンビ
- VPA メリハリ消費の賢者
- VPU ご褒美予算ブレイカー
- VIA 直感消費エンターテイナー
- VIU 感情課金バーサーカー

Create one MASTER STYLE prompt plus one semantic prompt per type. Characters must differ by silhouette, posture, props, facial energy and motif—not only color. No type is visually "better" or wealthier than another.

## 7. Return / resume requirement
External share and LINE are round trips, not diagnosis resets.
Required behavior:
- completed Result persists locally
- reload / browser return restores the same Result and diagnosisId
- external share / LINE return restores Result
- explicit "診断をやり直す" creates a new diagnosisId
- in-progress journey should support resumable checkpoint state
- schema/version guard must reject incompatible stale state safely
- no duplicate diagnosis_started/result_viewed semantics caused solely by restoration; add explicit result_restored / journey_resumed events if needed

## 8. Release / handoff goal
Final deliverable is a self-contained handoff ZIP built from latest GitHub main containing:
- runtime source
- benchmark/resolver SOT
- Result V4 implementation + spec
- 8 Type final images
- MASTER + 8 image-generation prompts
- resume/restore implementation
- analytics/GAS specification
- QA scripts/results
- START_HERE and final handoff manifest
- asset inventory
- SHA-256 and ZIP integrity verification

A new chat must be able to extract the ZIP, read START_HERE / handoff manifest, and continue without relying on unstated conversation context.
