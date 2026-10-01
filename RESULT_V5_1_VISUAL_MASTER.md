# MUDAGIRI RESULT V5.1 — VISUAL MASTER

Status: VISUAL DESIGN SOT / implementation pending
Updated: 2026-10-02
Scope: presentation only. Result V5 diagnosis logic, Position, Potential, Goal semantics, Next Quest priority, reference data and privacy contracts are frozen and MUST NOT change.

## 0. Visual thesis

Result V5.1 must feel like 「家計診断のダッシュボード」ではなく「RPGをクリアした後の戦果画面」.

Keep the stronger V5 meaning:
- benchmark difference != waste
- Position != Potential
- 斬る / 整える / 守る / 見極める
- Goal
- NEXT QUEST
- Life Plan continuation

Restore the Mudagiri identity:
- mascot-led narration
- enemy portraits
- RPG reward cadence
- varied screen silhouettes
- type collection / shareability
- pixel-art atmosphere

One-line design rule:

> 中身はV5、見た瞬間はムダギリ。

---

## 1. Non-negotiable visual principles

### 1.1 No dashboard monotony
Do not render every section as the same rounded rectangle with:
small English kicker → heading → paragraph → list.

Each major section needs a distinct silhouette.

### 1.2 Japanese is primary
English is decorative only.

Preferred visible labels:
- 戦果レポート
- 敵図鑑
- ムダギリ判定
- 未来の戦利品
- 次のターゲット
- セーブポイント
- 次の章
- 8タイプ図鑑

### 1.3 Reward beat every 1–2 screens
The long Result needs repeated visual payoffs:
- clear animation
- type unlock
- enemy reveal
- result stamp
- future-money reveal
- 10-year hero
- target lock
- type collection

### 1.4 Character presence
Mudagiri is not decoration. He narrates transitions.

Use large mascot appearances at:
1. clear hero
2. verdict
3. future money
4. next target
5. save/next chapter transition
6. friend/type collection

Do not place a tiny mascot in every card.

### 1.5 Enemy presence
The 12 canonical enemy assets are part of the Result identity.

Use normal.png for Result classification cards by default so the UI does not falsely imply an enemy was defeated.
Use status frames/badges to communicate:
- 斬る
- 整える
- 守る
- 見極める

Existing defeated / escape art remains battle-state art and must not be reused merely as a Result status shortcut unless runtime can prove that exact battle outcome.

---

## 2. Existing canonical visual assets

Mudagiri:
- MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png
- MUDAGIRI_BATTLE_READY.png
- MUDAGIRI_BATTLE_SWING.png
- MUDAGIRI_BATTLE_FOLLOW.png
- profile variants Q1–Q5

Background / FX:
- BG-003_SCAN_BATTLE.png
- BG-001_OP_FIXED.png
- BG-002_PROFILE_FIXED.png
- FX-01_REVEAL.png
- FX-02_SLASH.png
- FX-03_HIT.png

12 enemies from enemy-assets-v1.ts:
- mobile — 通信ザウルス
- energy — 電気ウナギ魔人
- sub — サブスクサキュバス
- food — クイダオーレ
- daily — チリツモコビト
- fun — アソビスギー
- beautyFashion — ミエハリーヌ
- car — ムダカー
- rent — ヤチンダー
- insurance — ホケンミエナイダー
- childEducation — マナビンボー
- selfDevelopment — ジコトウシン

8 type characters:
Use all 8 V3.1 canonical type PNGs.

No new generated art is required for the first V5.1 implementation.

---

## 3. Result V5.1 sequence

The semantic order is preserved, but presentation becomes RPG chapters.

1. QUEST COMPLETE
2. TYPE UNLOCK + 8 TYPE COLLECTION PREVIEW
3. ENEMY ATLAS / household position
4. BATTLE RESULT / verdict
5. FUTURE LOOT / Potential + 1/5/10 years
6. DESTINATION / Goal
7. NEXT TARGET
8. OPTIONAL PRECISION
9. SAVE POINT
10. NEXT CHAPTER / Life Plan
11. 12 ENEMY CODEX
12. 8 TYPE COLLECTION + FRIEND QUEST

---

## 4. ACT 1 — QUEST COMPLETE

Goal: true completion reward before analysis.

Layout:
- full-width scene, not a small top strip
- battle/forest background with dark bottom gradient
- Mudagiri at 34–42vw width
- FX reveal glow
- large completion seal

Copy:

> 家計クエスト COMPLETE!
>
> 12体の鑑定が終わった。
> ここから戦果を確認するぞ。

Natural scroll cue:
> 戦果を見る ↓

One-time motion:
1. reveal flash
2. Mudagiri pop/slide
3. completion stamp

Respect reduced motion.

---

## 5. ACT 2 — MONEY TYPE as SSR-style reward

Goal: most screenshotable identity moment.

Not a standard card.

Use an SSR/relic frame:
- layered gold/purple border
- radial glow
- type art 180–210px
- pixel sparkles using CSS + existing FX
- title centered
- three axes as compact badges
- strength/blind spot beneath

Copy hierarchy:

> 称号を獲得！
>
> 直感消費エンターテイナー
>
> ノリで使う。でも残高はだいたい分かってる。
>
> 今寄り ｜ 直感寄り ｜ 普段から把握

Do not invent rarity statistics or population percentages.

Small decorative TYPE UNLOCKED is allowed.

Share:
> この称号だけシェア

---

## 6. 8 TYPE COLLECTION PREVIEW — restore discoverability

The other type characters are NOT removed.

Current V5 hides them at the bottom inside a collapsed FRIEND QUEST, making them functionally invisible.

V5.1 must restore early discoverability.

Immediately below the user's main type:
- compact 4×2 portrait grid of all 8 characters
- current type gets glowing YOU frame
- other seven visible, not blurred
- short names
- tap opens lightweight type detail sheet/modal

Heading:
> 8タイプ図鑑
> ほかのタイプものぞいてみる

This must be compact enough not to interrupt the Result flow.

The full friend/share CTA remains near the bottom.

---

## 7. ACT 3 — ENEMY ATLAS instead of Household Position table

Goal: answer 「近い条件と比べてどこ？」 using the enemy world.

Show top 3 most relevant position signals as large enemy cards.

Visual ranking only:
1. large positive comparison difference / high position
2. actionable status
3. available comparable
4. stable original order for ties

This ranking must NOT alter diagnosis or Next Quest priority.

Each enemy card:
- canonical normal enemy image
- enemy name
- category
- position badge
- status badge
- user's amount
- comparison reference
- comparison gap
- short criteria

Example:

> 通信ザウルス
> 通信費
>
> かなり高め
>
> あなた　¥18,000
> 比較目安　料金帯
>
> 整える

For money references:

> あなた　¥35,000
> 比較目安　¥22,221
> +¥12,779 / 月

Fixed note:
> ※この差額はムダ額ではありません。

Remaining categories:
> 残りの敵も見る（7体）

Expandable atlas list with smaller portraits.

Do not show zero-spend categories in the main top-3 atlas.

---

## 8. ACT 4 — BATTLE RESULT / verdict

Goal: create satisfaction from classifying the household.

Heading:
> 今回の戦果

Preferred language:
- 討伐候補 1体
- 整えられる敵 8体
- 守る支出 2体
- 見極める敵 0体

Under counts, show miniature enemy portraits grouped by status.

Status frames:
- cut: red/slash
- optimize: gold
- protect: teal/blue
- inspect: violet

Mudagiri:
> 大事なものまで斬るな。狙うのは、惰性と整えられる価格だけだ。

Detailed reasons stay in CODEX.

---

## 9. ACT 5 — FUTURE LOOT

Keep the successful gold block and numeric hierarchy.

Visible title:
> 未来に回せる可能性

Decorative theme:
> 未来の戦利品

Hero number stays largest.

Example:
> 月 約3,000〜75,000円

Add Mudagiri narrator, about 90–120px:

> 全部削る金額じゃないぞ。
> ここから本当に整えられる分を見つけるんだ。

Keep evidence disclosure:
- confirmed amount
- comparison-based upper opportunity
- explicit note that comparison gaps are not directly summed

Visual:
- gold/parchment surface
- FX-01_REVEAL at very low opacity
- CSS pixel sparkle accents
- no generic fintech chart imagery

---

## 10. FUTURE IMPACT

Keep the new hierarchy:
- 1 year + 5 years in two columns
- 10 years full-width hero
- no investment return

10-year card:
- gold border
- subtle pixel trail / existing FX
- largest number
- no emoji

Mandatory cumulative/no-return note remains.

---

## 11. ACT 6 — GOAL / destination map

Remove generic emoji buttons.

Current emoji icons make the experience look like a generic household app.

V5.1 uses CSS pixel-emblem tiles.

Eight emblem concepts:
- 住まい — roof rune
- 家族・教育 — three-person blocks / book
- 旅行・趣味 — compass / wing
- 資産形成 — rising pixel bars
- 独立・挑戦 — flag / sword
- もしもの備え — shield
- 老後 — sprout / sun
- 未定 — mystery rune

No generated art required.

Positive-Potential heading:
> この戦利品、どの未来へ回す？

Zero-Potential heading:
> これからのお金、どの未来に使いたい？

After selection, chosen goal expands into a destination panel.

---

## 12. ACT 7 — NEXT TARGET

Second strongest RPG moment after the type card.

Boss/target-lock style panel, not a normal card.

Elements:
- large canonical enemy portrait
- small NEXT TARGET decorative label
- enemy name
- mission
- reward/effect
- Mudagiri attack pose

Example:

> 次のターゲット
>
> サブスクサキュバス
>
> ミッション
> 未使用サブスクを停止せよ
>
> 報酬
> 月 ¥3,000
> 年 ¥36,000

If amount is not confirmed:

> 報酬
> まずは明細確認で正体を暴く

Never fabricate savings.

---

## 13. PRECISION UP

Keep optional and visually secondary.

Theme:
> 鑑定レベルUP

This is a side quest, not a second primary CTA.

One question maximum on first screen.
Easy 「あとで」 exit.

---

## 14. SAVE POINT — LINE

Current LINE block is too large and too green, creating “sales starts here” perception.

V5.1:
- compact save-point panel
- normal Mudagiri world palette
- green only on the button, not the whole section
- smaller vertical footprint

Heading:
> セーブポイント
> この戦果をLINEに保存しておく？

CTA:
> 結果をLINEに保存

Subcopy:
> 無料 / あとで見返せる / 登録だけで相談予約にはなりません

SAVE must not compete visually with NEXT TARGET.

---

## 15. ACT 10 — NEXT CHAPTER / Life Plan

Life Plan is the main continuation CTA, but it should feel like story continuation.

Visual metaphor:
- quest map / scroll / next chapter
- subtle path
- Mudagiri guide pose
- no insurance/investment tab menu

Heading:
> 次の章へ
>
> 今の家計で、やりたい未来に届く？

Body remains semantically equivalent:
> 今回分かったのは「今のお金の使い方」。
> 貯蓄・保険・住宅・教育・投資・将来収入までつなげると、
> 何を削るかではなく、何にいくら使えるかが見えてくる。

CTA:
> 未来のお金を整理してみる

Contextual insurance/housing signals remain small side notes.

---

## 16. 12 ENEMY CODEX

Rename from 12 CATEGORY CODEX.

Heading:
> 敵図鑑 / 12体の鑑定記録

Collapsed by default.

Each expanded entry:
- enemy portrait
- category
- current amount
- reference
- comparison gap
- position
- user's appraisal
- status
- reason
- next action
- Potential contribution if any

This is the evidence-heavy layer.

---

## 17. ACT 12 — 8 TYPE COLLECTION + FRIEND QUEST

Do not hide the 8 characters.

At the bottom:
- full 4×2 type collection openly visible
- current type highlighted
- each portrait shows name
- tap can reveal short catchphrase

Heading:
> 8タイプ図鑑
>
> 友達は何タイプ？

Mudagiri:
> お前の金額は出さない。称号だけ見せてやれ。

Then:
- X
- Instagram
- Threads
- LINE

Share privacy contract unchanged.

The Result should end on colorful character content, not a plain utility footer.

---

## 18. Section silhouette map

Clear: full-bleed scene
Type: ornate SSR/relic frame
Type preview: compact collection strip
Enemy atlas: portrait cards/deck
Battle result: scoreboard + portrait clusters
Future money: gold treasure panel
Future impact: reward tiles
Goal: map/emblem grid
Next target: boss target-lock panel
Precision: side-quest panel
Save: compact save point
Life Plan: quest-map scroll
Codex: book/accordion
Friend/type: open character gallery

No two adjacent acts should have the same silhouette.

---

## 19. Color system

Keep one dark world shell, but not a stack of dark cards.

- world: deep navy/forest
- clear/battle: forest + gold
- type: violet + gold
- enemy atlas: cyan/steel
- verdict: dark teal + status rings
- future: parchment/gold
- goal: midnight blue + jewel emblems
- next target: black/gold/red
- save: dark neutral, green only CTA
- next chapter: teal/cyan
- collection/share: violet/indigo

---

## 20. Typography

Japanese titles carry hierarchy.

At about 390px:
- hero completion: 34–40px
- type title: 34–38px
- Potential hero: 42–50px
- 10-year hero: 32–38px
- section title: 26–30px
- enemy name: 18–22px
- body: 14–16px
- source/context: 11–12px

Avoid awkward one-character Japanese line wraps.

---

## 21. Mobile interaction rules

- all tap targets >=48px
- top-three enemy cards tappable
- full enemy list expandable
- type portraits >=64px
- goal emblems >=72px high
- no nested tiny disclosure controls
- preserve scroll position on external share/LINE return
- reduced-motion support
- 375 / 390 / 430 widths remain mandatory QA

---

## 22. Three-view audit

Behavioral economics:
- type unlock = immediate reward
- enemy atlas = concrete mental objects
- one Next Target = low choice overload
- goal = purpose framing
- visible type collection = social curiosity without exposing money

Psychology:
- 守る / 整える avoids shame
- character narration reduces defensiveness
- grouping creates completion
- evidence remains available behind the fun layer

Marketing:
- SSR type = share hook
- 8-type collection restores curiosity loop
- Next Target creates action
- Save Point preserves result
- Next Chapter makes consultation feel like continuation
- Friend Quest closes on viral content, not sales

---

## 23. Implementation order

Phase A — visual shell only
- import ENEMY_ASSETS
- Japanese section labels
- mascot sizing
- varied silhouettes
- no logic changes

Phase B — top reward
- clear hero
- SSR type card
- early 8-type collection preview

Phase C — enemy result world
- top-3 enemy atlas
- remaining enemy expansion
- battle-result portrait clusters
- CODEX portraits

Phase D — future/action world
- Future Money narrator
- Future Impact reward visuals
- CSS Goal emblems
- Next Target boss panel

Phase E — conversion/share polish
- compact Save Point
- Next Chapter Life Plan
- open 8-type collection + Friend Quest

Phase F — QA
- existing Result V5 contract QA
- Calibration 10k
- Fuzz 10k
- 375 / 390 / 430 visual smoke
- positive-Potential scenario
- zero-Potential scenario
- real-device manual pass

---

## 24. Frozen semantic boundary

V5.1 Visual work MUST NOT change:
- reference data
- Position thresholds
- comparison-difference meaning
- A/B/C evidence meaning
- Potential formula
- structural no-auto-Potential rule
- verdict semantics
- Goal non-diagnostic behavior
- Next Quest priority
- share privacy
- Life Plan meaning

Any such change is a methodology revision, not a Visual V5.1 change.

Version: MUDAGIRI_RESULT_V5_1_VISUAL_MASTER_1_0
