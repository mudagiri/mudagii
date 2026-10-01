# MUDAGIRI RESULT V5 — MASTER SPEC V1.0 FROZEN

Status: **DESIGN / MEANING FROZEN — implementation pending**  
Frozen: 2026-10-01  
Runtime note: this document does **not** change the current diagnosis runtime. Diagnosis Core V1 / Profile / Type / benchmark contracts remain frozen unless explicitly versioned.

## 0. Purpose

Result V5 answers two different questions without mixing them:

1. **POSITION** — 「自分は近い条件の人と比べてどこにいる？」
2. **POTENTIAL** — 「その中で、未来へ回せる可能性がある金額はどのくらい？」

**Comparison difference is never waste and never automatically a saving amount.**

Brand principle:

> 大事なものまで斬らない。今のお金の使い方を知って、整えられるところだけ整えて、本当に使いたい未来へお金を回す。

Short line:

> **大事なものまで斬るな。**

---

## 1. Non-negotiable contracts

- 12 categories remain frozen.
- benchmark gap != waste.
- benchmark gap != reducible amount.
- Value and price efficiency are separate.
- High satisfaction protects **value**, not the current price.
- Tone mode changes copy only; calculation and verdict meaning never change.
- AUDIT categories never receive fabricated averages.
- Personal amount and household/property/contract/child amount scopes must not be silently mixed.
- Share images/text never include income, spending amounts, prefecture, Potential, or other private financial fields.
- Goal selection never changes diagnosis truth or Potential calculation.
- Structural categories may show a comparison difference without entering Potential.

---

## 2. Five user-facing states

### ⚔️ 斬る
Low/declining user value and a clear action signal. Monetary saving is shown only when evidence supports it.

### ✨ 整える
The user may value the category, but there is a credible efficiency signal: same/similar value may be achievable more efficiently.

### 🛡 守る
The user explicitly values/needs the spending and there is no strong efficiency signal requiring action.

### 🔍 見極める
The amount, scope, contract content, detail, or context is insufficient for a responsible decision.

### ○ 今はそのままでOK
Quiet state for no strong review signal. Do not overuse 🛡 守る for ordinary in-range spending.

---

## 3. POSITION ENGINE

### 3.1 Position labels

- かなり低め
- やや低め
- 標準圏
- やや高め
- かなり高め

These labels describe relative position only. They are not moral or optimization judgments.

### 3.2 STANDARD ratio zones

For reliable point comparators:

- < 80%: かなり低め
- 80% to <95%: やや低め
- 95% to 110%: 標準圏
- >110% to <130%: やや高め
- >=130%: かなり高め

Primary use: food, daily, fun, beauty/fashion where a scope-matched DIRECT comparator exists. Single-person DIRECT energy may also use STANDARD with persistence gating for action.

### 3.3 WIDE ratio zones

For more heterogeneous/modelled comparators:

- <75%: かなり低め
- 75% to <90%: やや低め
- 90% to 115%: 標準圏
- >115% to <140%: やや高め
- >=140%: かなり高め

Primary use: multi-household MODEL energy, insurance references, education references, owned-housing peer references.

### 3.4 Private-rent hybrid distribution

Private rent uses real prefecture P50/P75/P90 bands on the high side and ratio assistance on the low side.

For a valid private-rent reference:

- veryLowBoundary = meanPaid * 0.80
- lowBoundary = meanPaid * 0.95
- highBoundary = max(meanPaid * 1.10, P75 lower bound)
- veryHighBoundary = max(meanPaid * 1.30, P90 lower bound)

Then:

- actual < veryLowBoundary: かなり低め
- < lowBoundary: やや低め
- < highBoundary: 標準圏
- < veryHighBoundary: やや高め
- otherwise: かなり高め

Do not describe low-side labels as empirical percentiles because P25 is not available.

### 3.5 Mobile price-band display zones

Only when the input is confirmed as **one mobile line** and carrier type is known.

Major carrier display zones:
- <=2,999: かなり低め
- 3,000–3,999: やや低め
- 4,000–5,999: 標準圏
- 6,000–9,999: やや高め
- >=10,000: かなり高め

MVNO display zones:
- <=1,499: かなり低め
- 1,500–1,999: やや低め
- 2,000–2,999: 標準圏
- 3,000–4,999: やや高め
- >=5,000: かなり高め

These are Mudagiri display zones based on survey price bands, not statements such as “top 10%”.

### 3.6 Comparison difference

When a valid comparator exists:

`comparisonDifference = comparisonAmount - benchmark`

Show this at category level even for structural categories.

Mandatory semantics:

> この差額はムダ額・削減可能額ではありません。あなたに近い条件の比較目安との差です。

Do **not** show 1/5/10-year accumulation of raw comparison gaps.

---

## 4. POTENTIAL ENGINE

Hero label:

> **未来に回せる可能性**

### 4.1 Evidence classes

#### A — confirmed concrete amount
Currently strongest example:
- unused subscription amount is known, and
- cancellation/stop ability is confirmed.

A enters both lower and upper.

#### B — user-specific concrete alternative
Examples:
- a specific cheaper plan/quote,
- explicit user-selected reducible range,
- verified alternative price.

B enters lower and upper according to the supported range.

The lightweight initial flow does not fabricate B.

#### C — comparator-based opportunity
C is a screening upper-bound signal only.

**C never enters the lower bound.**

### 4.2 Formula

`lower = sum(A) + sum(B_lower)`

`upper = sum(A) + sum(B_upper) + sum(eligible_C_upper)`

Display logic:
- lower > 0 and upper > lower: 「月 約X〜Y円」
- lower > 0 and upper == lower: 「月 約X円」
- lower == 0 and upper > 0: 「最大 月約Y円」
- no monetary evidence but review items exist: show review-point count, not ¥0.

### 4.3 STANDARD C

For eligible STANDARD categories:

`neutralHigh = benchmark * 1.10`

`cap = benchmark * 2.00`

`C_upper = max(0, min(actual, cap) - neutralHigh)`

### 4.4 WIDE C

For eligible WIDE categories:

`neutralHigh = benchmark * 1.15`

`cap = benchmark * 2.00`

`C_upper = max(0, min(actual, cap) - neutralHigh)`

When actual > benchmark*2, keep the capped C and add a **detail-review flag**. Do not reset C to zero and do not let extreme input grow Potential without limit.

### 4.5 Mobile C

Only for one confirmed mobile line.

Major:
`C_upper = max(0, min(actual, 20,000) - 6,000)`

MVNO:
`C_upper = max(0, min(actual, 10,000) - 3,000)`

Combined mobile + home internet, multiple/family lines, or unknown scope:
- C = 0
- verdict can be 🔍 見極める
- show contract-scope guidance.

### 4.6 Automatic C eligibility by category

- mobile: one line + carrier known
- energy single DIRECT: scope match + above STANDARD neutralHigh + persistent
- energy multi MODEL: scope match + above WIDE neutralHigh + persistent
- food: scope match + DIRECT comparator + above STANDARD neutralHigh
- daily: scope match + comparator + above neutralHigh + persistent
- fun: scope match + comparator + above STANDARD neutralHigh
- beautyFashion: scope match + comparator + above STANDARD neutralHigh
- sub: no C; use A only in the lightweight flow

Default **no automatic Potential C**:
- rent / owned housing
- insurance
- car
- childEducation
- selfDevelopment

Those categories may still show comparison differences and strong review signals.

### 4.7 Scope safety

Automatic C requires the amount used for comparison to represent the same spending scope as the diagnosis amount used in the Potential headline.

Do not turn:
- personal contribution vs household benchmark,
- whole household vs one-person benchmark,
- combined telecom bill vs one mobile line,
- car total incl. loan vs maintenance-only reference

into automatic C.

---

## 5. Category MASTER

| Category | Position | Value / context | V5 verdict logic | Money evidence | Comparison difference |
|---|---|---|---|---|---|
| mobile | carrier bands when one line | contract scope/carrier | high -> ✨; scope unclear -> 🔍 | B/C | yes when compatible |
| energy | single DIRECT / multi MODEL | 2–3 month persistence | persistent high -> ✨; temporary -> ○; unknown -> 🔍 | C | yes |
| sub | no generic average headline | unused amount + stoppability | unused+stoppable -> ⚔️; unresolved -> 🔍 | A | normally no |
| car | maintenance reference only when scope matches | essential/useful/burden/notNeeded + components | essential -> 🛡; burden -> ✨; notNeeded -> ⚔️ candidate; mismatch -> 🔍 | no auto C | yes only if scope matches |
| food | DIRECT comparator | satisfaction/value | low value -> ⚔️ candidate; valued+high -> ✨; valued+normal -> 🛡/○ | C | yes |
| daily | DIRECT comparator | persistence | persistent high -> ✨; temporary -> ○ | C | yes |
| fun | DIRECT comparator | satisfaction/value | low value -> ⚔️ candidate; valued+high -> ✨; valued+normal -> 🛡/○ | C | yes |
| beautyFashion | comparator where supported | satisfaction/value | same 4-quadrant rule as food/fun | C | yes |
| rent | private-rent distribution / owned peer reference | burden + housing value | burden/high -> ✨; valued -> 🛡; insufficient detail -> 🔍 | no auto C | yes |
| insurance | personal/household reference matched to input scope | purpose + review recency | unclear/stale -> ✨/🔍; understood/recent -> 🛡 | no auto C; B after contract review | yes |
| childEducation | stage-based reference | family policy | review wanted -> ✨; necessary/protect -> 🛡 | no auto C | yes |
| selfDevelopment | no fake total average | purpose/use/results | inertia -> ⚔️ candidate; unclear -> 🔍/✨; purpose/results -> 🛡 | no auto C | only when valid subtype comparator exists |

### 5.1 Value-spend rule

For food/fun/beauty:

- 「かなり見直したい」: ⚔️ candidate
- 「少し見直したい」: ✨
- 「今くらいでいい」 + normal position: ○
- 「今くらいでいい」 + high position: ✨
- 「大切なので守りたい」 + normal position: 🛡
- 「大切なので守りたい」 + high position: ✨ **価値を守りながら整える**

High satisfaction never forces C to zero.

---

## 6. Structural comparison rule

Rent/housing, insurance, car, education may show:

- user amount
- matched reference
- comparison difference
- position
- context/value verdict

but the comparison difference does **not** automatically enter the Potential headline.

Example:

> 保険 +¥13,000 / 月 — かなり高め  
> ※この差額は削減可能額ではありません。

This is deliberate: V5 preserves the “is this normal?” insight without pretending the difference is reducible.

---

## 7. Future horizon display

Use raw Potential values internally.

- 1 year = monthly * 12
- 5 years = monthly * 60
- 10 years = monthly * 120

No investment return, inflation, or compounding.

Hero rounding:
- <¥5,000/month: round to nearest ¥100
- ¥5,000–49,999/month: round to nearest ¥500
- >=¥50,000/month: round to nearest ¥1,000

Detailed evidence cards may show more exact confirmed A amounts.

Mandatory note:

> ※今と同じ状態が続いた場合の単純累計です。運用益は含みません。

---

## 8. Result V5 information architecture

1. QUEST CLEAR
2. MONEY TYPE
3. HOUSEHOLD POSITION
4. MUDAGIRI VERDICT
5. FUTURE MONEY
6. 1Y / 5Y / 10Y FUTURE IMPACT
7. GOAL QUEST
8. NEXT QUEST
9. PRECISION UP QUEST — conditional only
10. SAVE QUEST — LINE result save
11. LIFE PLAN QUEST
12. 12 CATEGORY CODEX
13. FRIEND QUEST
14. Restart diagnosis

### 8.1 QUEST CLEAR
Short completion reward only.

### 8.2 MONEY TYPE
Identity reward first. Keep type character, type name, catchphrase, three axes, strength, blind spot. Only a small “タイプだけシェア” action here; no large share block.

### 8.3 HOUSEHOLD POSITION
Show category-level relative positions and comparison differences. Never sum mixed scopes into one dramatic headline and never project raw benchmark gaps to 10 years.

### 8.4 MUDAGIRI VERDICT
Headline:

> **高いから斬るんじゃない。**

Mascot:

> 「大事なものまで斬るな。整えられるところだけ見つけるぞ。」

### 8.5 FUTURE MONEY
Largest monetary hero in the Result. It uses Potential only, never raw benchmark gaps.

### 8.6 GOAL QUEST
Question:

> **このお金、何に回せたらうれしい？**

Options:
- 住まい
- 家族・教育
- 旅行・趣味
- 資産形成
- 独立・挑戦
- もしもの備え
- 老後
- まだ決めていない

Goal affects framing/CTA only. It never changes diagnosis or Potential.

### 8.7 NEXT QUEST
Exactly one primary action.

Priority:
1. A confirmed action
2. B concrete alternative
3. user-declared low-value spending
4. strong eligible C + persistent/strong context
5. large structural/review signal
6. no strong signal -> maintenance guidance

Tie-break:
1. evidence strength
2. ease/reversibility
3. monthly impact

### 8.8 PRECISION UP QUEST
Conditional only when C dominates or uncertainty is large. Ask 1–2 optional questions at most. Purpose: improve specificity / potentially upgrade evidence toward B without making the core diagnosis heavy.

### 8.9 SAVE QUEST
Primary copy:

> **診断結果をLINEに保存する**

LINE is first framed as result preservation, not consultation. Registration never changes diagnosis truth.

### 8.10 LIFE PLAN QUEST
Single continuation instead of exposing insurance/lifeplan/investment as three competing top-level sales choices.

Headline:

> **今の家計で、やりたい未来に届く？**

Body concept:

> 今回分かったのは「今のお金の使い方」。貯蓄・保険・住宅・教育・投資・将来収入までつなげると、「何を削るか」ではなく「何にいくら使えるか」が見えてきます。

CTA:

> **未来のお金を整理してみる**

Category-specific context may be added only when the diagnosis supports it.

### 8.11 CODEX
Expandable details for all 12 categories:
- current amount
- comparator/reference
- comparison difference
- position
- user appraisal
- verdict
- reason
- next check
- Potential contribution where applicable

### 8.12 FRIEND QUEST
Large sharing block belongs near the end. Type/share artifact excludes financial/profile-sensitive values.

---

## 9. Tone-mode invariants

Tone changes only mascot/copy style.

Gentle:
> 好きなものまで削らなくて大丈夫。整えられるところだけ見よう。

Serious:
> 高いから斬るんじゃない。大事なものを守って、整えられるところだけだ。

Hell:
> 大事な支出まで斬るほど雑じゃない。狙うのは惰性とムダだけだ。

All numeric results, evidence classes, verdict meaning, Position, Potential, Goal behavior and priority logic are identical across modes.

---

## 10. Implementation requirements not yet present in the current resolver

V5 implementation must version and integrate these before claiming runtime parity with this spec:

1. insurance REFERENCE matched to input scope (personal vs household) with clear provenance;
2. multi-household beauty/fashion comparator using the approved category scope without double-counting daily consumables;
3. owned-housing / mortgage-repayment peer position reference, kept structural and excluded from automatic Potential;
4. car comparison-scope question or equivalent metadata so total car cost is never compared to maintenance-only reference;
5. V5 Position / Potential view-model layer without modifying Diagnosis Core V1 truth.

Until these are implemented and QA-passed, current runtime AUDIT behavior remains authoritative.

---

## 11. Release / QA gates for Result V5

V5 is not runtime-FROZEN merely because this design document is FROZEN.

Before production:
- current diagnosis/core QA remains green;
- Position boundary tests pass;
- Potential lower <= upper in every case;
- C never enters lower;
- no structural comparison gap is auto-added to Potential;
- no scope mismatch creates C;
- high satisfaction does not erase eligible price-efficiency C;
- extreme values are capped and flagged, not allowed to inflate indefinitely;
- comparison gaps are never projected as “savings” in 1/5/10-year UI;
- Goal does not mutate diagnosis/Potential;
- share privacy QA remains green;
- result restore / external return remains green;
- mobile touch/tap/scroll/render/device QA passes;
- build and deploy succeed on the same implementation HEAD.

---

## 12. Frozen boundary

From this document forward, implementation should not casually change:

- Position vs Potential separation
- 5-state verdict semantics
- STANDARD/WIDE thresholds
- private-rent hybrid rule
- mobile display bands
- A/B/C meaning
- C lower-bound prohibition
- 2x C cap behavior
- structural-category no-auto-Potential rule
- scope-match requirement
- 1/5/10-year Potential-only rule
- Result section order
- Goal non-diagnostic rule
- one-action NEXT QUEST rule
- LINE save-first framing
- share privacy rule
- tone calculation invariance

Any change to these requires an explicit V5.x methodology/spec revision.

Version: **MUDAGIRI_RESULT_V5_MASTER_SPEC_V1_0_FROZEN**
