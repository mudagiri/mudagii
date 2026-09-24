# MUDAGIRI Production Asset Manifest V2

## Canonical mascot — LOCKED
Production mascot is the **simple silver-axe version** selected by the user.

Visual rules:
- round bright-yellow chick
- red headband with long red tails
- orange beak and feet
- bold black pixel outline
- simple silver/grey double-bladed axe with brown handle
- no armor, chest harness, medallion, or black/gold ornate axe
- readable retro pixel-art / Pixel-Chibi silhouette
- transparent background

The ornate black/gold-axe mascot generation is legacy/rejected for production mascot use.

## Canonical mascot runtime slots

| Slot | Purpose | Status |
|---|---|---|
| idle | neutral/default | **production file updated — silver axe** |
| thinking | question/review | **production file updated — silver axe** |
| cheer | positive reaction | **production file updated — silver axe** |
| battle-ready | battle idle | **production file updated — silver axe** |
| attack | slash/battle action | **production file updated — silver axe** |
| result | result/GOOD | source mapping pending |
| protect | 「好きなものは、斬らない。」 | **production file updated** |
| alert | warning / point-out | **production file updated** |
| line | LINE CTA / action list | **production file updated** |
| share | social share CTA | **production file updated** |
| consult | ムダギリ作戦会議 CTA | **production file updated** |
| relief-clear | completed / no-cut-needed | **production file updated** |

Current V2 files:
- `public/assets/mascot/alert.webp`
- `public/assets/mascot/line.webp`
- `public/assets/mascot/share.webp`
- `public/assets/mascot/consult.webp`
- `public/assets/mascot/relief-clear.webp`
- `public/assets/mascot/protect.webp`
- `public/assets/mascot/idle.webp`
- `public/assets/mascot/thinking.webp`
- `public/assets/mascot/cheer.webp`
- `public/assets/mascot/battle-ready.webp`
- `public/assets/mascot/attack.webp`

The six CTA assets plus five reconciled core-pose slots are now silver-axe production WebPs. `idle` and `battle-ready` intentionally share the same approved neutral combat-ready source for V1. No resize was applied, to avoid damaging pixel structure. Legacy ornate `result/run/celebrate` files were moved out of the production mascot directory.

## Enemy production set
Required enemy set remains 12 categories × 3 states = 36 files:
- encounter
- defeated
- escape

Categories:
`mobile, energy, sub, car, food, daily, fun, beautyFashion, rent, insurance, childEducation, selfDevelopment`

Special semantics:
- insurance / childEducation / selfDevelopment `defeated` = clarified/organized, not “this category was waste”.
- rejected first STEP30 rent/Yachindar scene must never ship.

## Brand delivery assets
Still required before public launch:
- favicon / app-icon set derived from canonical silver-axe mascot
- OGP 1200×630
- existing square social icon may be reused after crop review

## Packaging rule
Do not target an arbitrary “50 files”. Ship only approved assets with a defined runtime use.

## Enemy reconciliation progress
Enemy state files are now packaged per category under `public/assets/enemies/<category>/`.

- `mobile/encounter.webp` — reconciled from approved 通信ザウルス encounter art
- `mobile/defeated.webp` — reconciled from approved defeated/collapsed art
- `mobile/escape.webp` — reconciled from approved running/escape art
- `mobile.webp` — compatibility alias to `mobile/encounter.webp` for the current runtime

- `insurance/encounter.webp` — reconciled from approved ホケンミエナイダー encounter art (dense policy papers / shield motif)
- `insurance/defeated.webp` — reconciled from approved organized/clarified state (sorted policy stack / checklist)
- `insurance/escape.webp` — reconciled from approved retreating state (papers scattering while moving away)
- `insurance.webp` — compatibility alias to `insurance/encounter.webp`

Enemy V2 QA currently reports **6/36 packaged**. Remaining categories stay pending until their three approved source images are positively reconciled; no filename/order guessing is allowed.

## Reconciliation update — 2026-09-23
Production enemy state packs positively reconciled from actual source artwork:
- `mobile` — 3/3
- `insurance` — 3/3
- `car` — 3/3 (encounter = active cost monster, defeated = broken-down/halo state, escape = fleeing car)
- `rent` — 3/3 (corrected Yachindar production set; rejected scene version excluded)
- `food` — 3/3 (Kuidaore active / defeated / fleeing)
- `selfDevelopment` — 3/3 (brain+dumbbells active / calm organized study / fleeing overload)
- `childEducation` — 3/3 (education/books character active / organized study / fleeing overload)

Enemy V2 QA: **21/36 packaged**. Pending categories are intentionally not guessed: `energy`, `sub`, `daily`, `fun`, `beautyFashion`.

## Brand assets — generated from canonical silver-axe mascot
- `public/assets/brand/app-icon-192.png`
- `public/assets/brand/app-icon-512.png`
- `public/assets/brand/favicon-32.png`
- `public/assets/brand/favicon-64.png`
- `public/assets/brand/favicon.ico`
- `public/assets/brand/ogp-1200x630.jpg`

These are derived from the approved canonical silver-axe mascot; no ornate-axe mascot is used.

## Reconciliation update — 2026-09-23 / pass 2
Additional state packs positively reconciled from the actual candidate artwork:
- `energy` — 3/3 (active phone/receipt monster / knocked-out state / fleeing state)
- `fun` — 3/3 (party king active / collapsed aftermath / fleeing-with-food state)
- `beautyFashion` — 3/3 (shopping/beauty queen active / collapsed cosmetics state / fleeing shopping state)
- `sub` — 2/3 (pink subscription succubus encounter + defeated positively matched; escape source still unresolved)

Enemy V2 QA: **32/36 packaged**.
Intentionally pending rather than guessed:
- `sub/escape.webp`
- `daily/encounter.webp`
- `daily/defeated.webp`
- `daily/escape.webp`

The three white paper/receipt ghost candidates were **not** assigned to `daily` because their visual identity does not positively match the canonical チリツモコビト name/design. They remain quarantined candidates until the approved source is identified or regenerated.

## Reconciliation update — 2026-09-23 / final enemy pass
The user re-supplied the four previously approved source images, allowing positive reconciliation without guessing:
- `sub/escape.webp` — subscription succubus fleeing with subscription/service icons and renewal papers
- `daily/encounter.webp` — チリツモコビト swarm around accumulating small everyday purchases/receipts
- `daily/defeated.webp` — チリツモコビト collapsed in the accumulated small-expense pile
- `daily/escape.webp` — チリツモコビト fleeing while carrying everyday purchases/receipts

Compatibility aliases `sub.webp` and `daily.webp` point to their encounter states.

Enemy V2 QA: **36/36 packaged**.
Full production asset QA: **53/53 PASS** (11 mascot + 36 enemy states + 6 brand assets).
