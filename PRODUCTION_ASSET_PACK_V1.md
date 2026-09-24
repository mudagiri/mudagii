# MUDAGIRI Production Asset Pack V1

## Canonical rules
- High-detail Pixel-Chibi; do not regress to coarse 8-bit blocks.
- Transparent background, no baked checkerboard/background/UI.
- Mascot identity: yellow chick, red headband, orange beak/feet, ornate axe, dark pixel outline.
- Enemy states: encounter / defeated / escape.
- Insurance, childEducation, selfDevelopment `defeated` means clarified/organized, not "the category itself was bad".
- Runtime format: WebP with alpha. Keep approved PNG masters outside runtime if desired.

## 50 approved slots

### Mascot — STEP 1–5
1. `mascot/idle.webp`
2. `mascot/attack.webp`
3. `mascot/clear.webp`
4. `mascot/review.webp`
5. `mascot/cheer.webp`

### Enemies — STEP 6–41
| Steps | category | files |
|---|---|---|
| 6–8 | mobile | `mobile-encounter.webp`, `mobile-defeated.webp`, `mobile-escape.webp` |
| 9–11 | energy | `energy-encounter.webp`, `energy-defeated.webp`, `energy-escape.webp` |
| 12–14 | sub | `sub-encounter.webp`, `sub-defeated.webp`, `sub-escape.webp` |
| 15–17 | car | `car-encounter.webp`, `car-defeated.webp`, `car-escape.webp` |
| 18–20 | food | `food-encounter.webp`, `food-defeated.webp`, `food-escape.webp` |
| 21–23 | daily | `daily-encounter.webp`, `daily-defeated.webp`, `daily-escape.webp` |
| 24–26 | fun | `fun-encounter.webp`, `fun-defeated.webp`, `fun-escape.webp` |
| 27–29 | beautyFashion | `beautyFashion-encounter.webp`, `beautyFashion-defeated.webp`, `beautyFashion-escape.webp` |
| 30–32 | rent | `rent-encounter.webp`, `rent-defeated.webp`, `rent-escape.webp` |
| 33–35 | insurance | `insurance-encounter.webp`, `insurance-defeated.webp`, `insurance-escape.webp` |
| 36–38 | childEducation | `childEducation-encounter.webp`, `childEducation-defeated.webp`, `childEducation-escape.webp` |
| 39–41 | selfDevelopment | `selfDevelopment-encounter.webp`, `selfDevelopment-defeated.webp`, `selfDevelopment-escape.webp` |

### Mascot conversion/result poses — STEP 42–50
42. `mascot/result.webp`
43. `mascot/protect.webp`
44. `mascot/thinking.webp`
45. `mascot/alert.webp`
46. `mascot/run.webp`
47. `mascot/celebrate.webp`
48. `mascot/line.webp`
49. `mascot/share.webp`
50. `mascot/consult.webp`

## Explicitly rejected
- First STEP30 Yachindar scene with baked city/person/UI/text.
- STEP42 human samurai version.
- STEP42 overly coarse chick version before the final approved redraw.

## Remaining brand assets before launch
Character generation is complete. Only brand delivery assets remain:
- `brand/favicon.svg` or favicon PNG/ICO set derived from mascot (no new character design).
- `brand/ogp.webp` 1200x630.
- Existing square social/profile icon may be reused after final crop check.

## Production normalization target
- Master canvas: square, consistent optical scale and padding per class.
- Alpha: true transparency.
- Runtime: WebP alpha.
- Enemy display target: 512–768 px source is sufficient for mobile UI; preserve approved master separately.
- Do not upscale a coarse source to fake detail.
