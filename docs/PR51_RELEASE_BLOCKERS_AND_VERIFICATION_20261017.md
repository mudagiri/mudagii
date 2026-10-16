# ムダギリ診断 PR #51｜本番公開前の厳格ゲート（2026-10-17）

## 実装状態
- UI統合: 第1章→第2章 V3.2（ギルド・ムダギリくん・JOB/STYLE・12体の敵・比較一覧・戦果・LINE・シェア）実装済み。
- 比較定義: 12カテゴリ契約 `MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0.xlsx` / G01〜G13 照合済み。実在しない人数×所得の倍率合成は撤廃。
- 所得別の**独立参考**: 2025家計調査の原表に基づく食費（1）、光熱・水道（3）、日用品（4.4+4.5）だけ。主診断のベンチマーク/改善額は一切変更しない。
- 全12カテゴリの原表と対象範囲の適合状況: `docs/INCOME_CLASS_ALL12_OFFICIAL_MATCHING_AUDIT_V1.md`。
- ビルド/ロジック/ブラウザQA: 各PRの最新SHAで結果を確認すること。過去の成功と現HEADの状態は混同しない。

## 公開ブロッカー
### 1. production 専用GAS設定（P0）
- 第1章のGASの実体は過去の環境 `pilot-hidden-preview` にある。GET-only healthで `DEDICATED_GAS_HEALTH_OK` を観測し、第2章との分離も確認。
- **公開用workflowから** `VITE_MONEY_PERSONALITY_GAS_URL` を読めない。PR CI `Production GAS Configuration (no outbound traffic)` は意図的にFAIL。
- 現在の公開用デプロイ `.github/workflows/deploy-pages.yml` の `build` ジョブは Environment `pilot-hidden-preview` を使わない。**同じ専用GASの /exec URL を repo Settings → Secrets and variables → Actions → Repository secrets に `VITE_MONEY_PERSONALITY_GAS_URL` として追加**する（既存 pilot-hidden-preview のEnvironment variableは維持）。同名のGitHub environmentを新規作成しない。ログにURLを貼らない。
- 設定後はCI再実行、PUBLIC cohortで保存・分析が動くか、匿名テストPOSTは別途承認と検証方法を決める（GETは保存の証拠にならない）。

### 2. 本番URLでの公開プレビュー（P0）
- 2026-10-17時点で `https://mudagiri.github.io/mudagii/` はHTTP 200。
- 既存の `/pilot/chapter2-v32/` と `/pilot/chapter2-v32/pilot/money-type/` はHTTP 404を確認。現在のPR #51は本番に未マージ。**存在しないプレビューURLを「見られる」と案内しない。**
- PR CIのChrome/WebKitブラウザQAはローカル合成プレビューであり、GitHub Pages実配信のQAではない。
- 提出前のユーザー実機レビュー用には、**公開rootを完全に保護したプレビュー配信先**を新たに確立してそのデプロイSHAと実URLを照合する。Pagesの既存rootを無断で上書きしない。

### 3. Live連携・利用者QA（P0）
- GAS live GET PASS ≠ GAS live POST/Sheet保存確認。テスト送信時は匿名・テスト隔離・再送冪等性・個人情報が性格DBに載らないことを確認。
- LINE 特典、主目的のライフプラン相談、保険専用相談、コード引き継ぎ、離脱/途中復帰、ネイティブシェアでiPhone/Androidを検証。
- 320/375/390/430px・実機フォント・敵キャラ12体・読みやすさ・CTAの順・タップ操作の完全監査。成功したブラウザ自動QAと本人の最終UI承認を分離。
- 正式な本番リリース判断まで PR #51 は Draft、mainは旧本番のままとする。

## チェックリスト
- [x] 正本12カテゴリと所属の照合
- [x] 旧所得倍率の撤廃
- [x] 2025家計調査の所得帯参考（食費/光熱・水道/日用品）実装
- [x] live pilot GAS GET-onlyで専用バックエンド確認
- [ ] GitHub本番から専用GAS値を参照（repo secret/variable）
- [ ] production GAS接続と実保存確認
- [ ] 実URLに最新PR版のレビュー用UIを配信（rootは非変更）
- [ ] iOS/Android実機UI/LINE/シェア/CTAを承認
- [ ] mainへのマージと本番GitHub Pages Deployの成功確認
- [ ] 配信後のリビジョン、旧データ復元、ロールバック検証

## 2026-10-17 最新HEADでの追跡確認（追加監査）
- 検証対象HEAD: `2cc0371c5647ab5a6481998f275826eb846f51e7`（追跡時点）。
- `Validate Diagnosis V2.1`: PASS（run 38942083967）。
- `V5 Visual Smoke`: PASS（run 38942083936）。
- `Latest Chapter 1 × Chapter 2 V3.2 UI First Gate`: 全体FAIL（run 38942083966）。内訳: `latest-ui` PASS、`Existing Pilot Chapter 1 GAS Health (GET-only)` PASS、`Production GAS Configuration` FAIL。
- 旧run 38941623051のPilot GETは `HEALTH_UNREACHABLE_OR_INVALID_JSON` だったが、最新runでGET成功。旧失敗を現在も恒常的なGAS障害だと断定しない。一方、GET成功はPOST保存成功の証拠ではない。
- production設定失敗の直接原因: `CHAPTER1_GAS_URL` が空。第2章用は存在。公開用buildジョブはpilot環境を参照しないため、repository scopeの `VITE_MONEY_PERSONALITY_GAS_URL` 登録が必要。
- GAS /exec URLは利用者向けの報告、issue、CIログへ転記しない。既存ログの環境変数表示を含め公開範囲・取り扱いを確認する。
- 本番デプロイ前の残件: ①repo secret登録後の同一HEAD全ゲート再PASS、②匿名隔離テストでGAS POSTとSheet行確認（重複・PII含む）、③rootを変更しない実URLプレビュー、④iOS/AndroidのLINE・保険/ライフプランCTA・復元・シェア実機確認。
- この追跡監査はGAS値・本番サイト・データを変更していない。PRはDraftのまま保護する。
