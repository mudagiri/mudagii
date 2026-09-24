# コピペ公開までの残作業

## ChatGPT側でまだ検証する
- Target/Diagnosis V2 → Result の代表ペルソナ回帰
- 3モード同一入力で数値不変の確認
- 単身 / 子あり / 高所得 / unknown / 低改善額 / needs-review のCV監査
- 画像重複マッピングとOGP最終確認
- 依存導入可能な環境で production build

## ユーザー側の実値/外部接続が必要
1. GASを実スプレッドシートへデプロイし `/exec` URLを取得
2. 公開URLでAndroid/iPhone実機診断
3. LINE追加後の面談予約サービス/URLを決定（有効面談計測をするならWebhook/完了シグナルも）

## 現在の方針
予約URLが未決定のため、結果画面に架空/未接続の面談CTAは置かない。
LINE追加後に「未討伐項目の仕分け → ムダギリ作戦会議」へ接続する。

## 2026-09-23 regression update
- Pure model TypeScript compile: PASS
- Representative personas (single low-improvement / single actionable / family needs-review / high-income / unknown expense): PASS
- 5-year = monthly x60: PASS
- needs-review automatic reducible = 0: PASS
- unknown stale amount excluded from FCF: PASS
- Battle now uses state-specific enemy art paths.
- OGP metadata added using existing 1200x630 asset.
- Remaining external gates: full React/Vite production build, real GAS POST, public-URL mobile E2E, real LINE transition.
- Visual-content note: mascot idle/battle-ready and fun escape/beautyFashion defeated are exact duplicate source files; replace only if distinct approved art exists.
