> STATUS: Historical handoff/reference. Where this file conflicts with START_HERE.md, SOURCE_AUDIT_2026-09-23.md, or current runtime code, the newer files/runtime win.

# ムダギリ診断 公開チェックリスト

## 自動QAで確認済み
- 12カテゴリ診断 / V2診断エンジン / Comparable Resolver
- 8問4軸・16タイプ
- 満足度保護 / NeedsReview / Unknown state
- Battle / Result / Share / LINE導線の契約QA
- Persistence / Outbox / 冪等性
- Central API contract / API security
- Data platform / Mudagiri Benchmark contract
- `npm run qa` をリリース前の必須チェックにする

## 本番公開のBLOCK条件
- [ ] `npm install` が成功し `node_modules` が揃う
- [ ] `npm run build` が成功する
- [ ] `VITE_MUDAGIRI_API_URL` に実HTTPS APIを設定
- [ ] PostgreSQL/Supabase等へ `CENTRAL_DB_SCHEMA_V1.sql` を適用
- [ ] 実診断1件 → diagnoses 1件 + categories 12件 + funnel events を確認
- [ ] Future Goal更新とLINE click leadが同一 `diagnosis_id` で保存されることを確認
- [ ] 本番OriginをAPIの `ALLOWED_ORIGIN` に固定
- [ ] ユーザー向けプライバシー/Benchmark同意UXを最終確認
- [ ] Android/iPhone幅で診断開始→結果→LINEを実ブラウザE2E
- [ ] 正式なムダギリくん/12敵の透過Production spriteへ置換

## 現在確定している外部値
- LINE公式URL: `https://lin.ee/ZeLu7i6`

## 未確定の外部値
- 公開ドメイン
- Central API URL / DATABASE_URL
- 本番 `ALLOWED_ORIGIN`
- GA4/GTM Measurement ID（採用する場合）
- 予約URL / 予約システム（採用する場合）

## リリースコマンド
- `npm run qa` — 現行コード/契約QA
- `npm run build` — Production build
- `npm run release:gate` — 外部設定・依存関係の公開ゲート
- `npm run release:check` — 上記を順番に実行。0 FAILをコード側の公開条件とする

> `release:check` のPASSだけでは実DB/LINE/スマホ実機の外部E2E完了を意味しない。公開判定には上記BLOCK条件も必要。
