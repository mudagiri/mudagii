# ムダギリ診断 — Mobile Visual Implementation V1

## 実装済み
- Hero: `hero-key-visual.png` をファーストビューに配置。コピー/CTAはHTML。
- Battle: `battle-background.png` を戦闘背景、`encounter-vs.png` を薄い演出レイヤーとして使用。
- Result Reveal: `result-victory-background.png` を結果開封背景に配置。
- Future Goal: `future-goal-key-visual.png` を背景化。選択肢と5年金額はHTMLで動的表示。
- Unresolved: `unresolved-background.png` を背景化。「ムダとは限らない」安全コピーと件数はHTML。
- Share: `share-card-template.png` をカード背景に配置。タイプ/スコア/金額は動的UI。

## CV順序
改善余地 → Future Goal → 守った支出 → Comparable → 討伐優先度 → 12項目 → 未判定 → LINE保存 → Share。
LINEは既に見せた結果を人質にせず、「討伐リストを保存する」価値で誘導する。

## GitHub Pages対策
今回追加したページ画像参照は `/assets/...` ではなく `./assets/...` に統一し、project-siteのサブパスでも壊れにくい形にした。

## QA
`node PAGE_ASSET_QA_V1.mjs` で 7画像の存在 + 7画像のruntime wiringを検査する。

## 未解決（公開BLOCK候補）
- 現在の作業ディレクトリには `package.json` / `src/` / Vite設定が存在しないため、production buildは未検証。
- 既存コードが参照する敵sprite / canonical mascot assetも現在の `public/assets` には見当たらない。ページ画像7枚とは別問題。
- GAS本番 `/exec` URLは未設定。
- Future Goal画像の赤マントはcanonicalとの差分が残る。機能BLOCKではないが、ブランド統一上は差替え候補。
