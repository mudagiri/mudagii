# ムダギリ診断 — Mobile Visual / Conversion Wiring V1

## Final journey
SNS → Hero → 診断開始 → Profile → Money → 12 expenses → 16-type → Satisfaction → Battle → Result reveal → Improvement → Future Goal → Protected spend → Comparable → Quest log → 12 buckets → Unresolved → LINE save → Share → LINE follow-up → 作戦会議

## Page visual mapping
| Phase | Asset | Runtime role | Dynamic UI must remain HTML |
|---|---|---|---|
| Hero | `page/hero-key-visual.png` | curiosity / self relevance | headline, 2-min proof, mode selector, start CTA |
| Battle | `page/battle-background.png` | common arena | enemy name, actual/comparable, judgement |
| Encounter | `page/encounter-vs.png` | transition/effect only | category/enemy name |
| Result | `page/result-victory-background.png` | victory/reward moment | type, Battle Score, monthly/annual/5Y |
| Future Goal | `page/future-goal-key-visual.png` | future-self visualization | goal chips, selected goal, monetary bridge |
| Unresolved | `page/unresolved-background.png` | incomplete-loop / unknown enemies | actual unresolved count/categories, safety copy, LINE CTA |
| Share | `page/share-card-template.png` | social card shell | type, score, amount/privacy state |

## Mobile hierarchy
1. One dominant message per viewport.
2. Money amount is more salient than decorative BATTLE CLEAR art.
3. Never bake user-specific values, unresolved count, goal, or CTA into image.
4. Image crop uses `object-fit: cover`; preserve subject focal point with per-asset object-position.
5. All primary CTA text is live HTML for accessibility/A-B testing.
6. Keep minimum CTA touch target 48px and sticky CTA only where it does not cover diagnosis content.

## Conversion safeguards
- Future Goal comes immediately after improvement amount.
- Protected spending appears before aggressive conversion copy to prove “高い=ムダ”ではない.
- Unresolved section must say these items are **not automatically waste**; they require context.
- LINE CTA promise: save the diagnosis + action list. Do not imply LINE is required to know the already-displayed result.
- Share is secondary to LINE in the result flow.
- Appointment CTA belongs after the LINE action plan / specialist-review explanation, not before.

## Unresolved copy contract
Headline: `まだ終わりじゃない…`
Sub: `自動では判定できない項目が{N}つ残っています`
Safety: `これは「ムダ」という意味ではありません。保障内容や目的など、金額だけでは判断できない項目です。`
CTA: `討伐リストをLINEに保存`

## Asset audit
- 7 page-level assets are packaged under `public/assets/page/`.
- The old text-heavy unresolved image is rejected; production uses `unresolved-background.png` with no dynamic copy/CTA baked in.
- Future Goal visual currently contains a red cape on the mascot. Runtime use is acceptable only if the crop hides it or the asset is regenerated to canonical no-cape mascot. Canonical mascot remains yellow chick + red headband + silver axe, no armor/cape.
