# P0公開判定｜復旧経路・証拠ゲート（2026-10-15）

## 現在地
- 12カテゴリ最終契約の「人数基準×根拠のない年収係数」禁止方針は9/28版の索引本文と9/29 GitHub監査コミット `f35179d0` で確認。9/29版Excel (1)/(2) のバイナリ同一性・改訂の有無は未確認。
- 元100ケースの `1200_RESULTS` は索引から0〜999の1,000行（83人全件・84人目4項目）を損失なく復元、`audit/FROZEN100_V2_0_SOURCE_1200_RESULTS_FIRST1000.csv` とQA固定。1000〜1199の後半200行は現在の索引には存在せず再現不可。元の入力プロフィールも別資料が必要。
- Google Driveの `MUDAGIRI_GITHUB_2026-09-26` フォルダの `README_SPLIT.txt` を読み、`PART1_IMPLEMENTATION_AND_APPROVED.zip` 81,015,604 byte を原本取得。中身119エントリは9/26時点の実装・仕様・画像等であり、9/29完成の契約Excelは含まない。従ってこのバックアップを9/29契約の代替正本と呼ばない。
- Google Drive検索で契約Excel・元100ケースExcelそのものは見つからない。現在の家計データ資産Sheetのホーム/品質タブは件数0件、元の100ケースの入力が格納されている根拠はない。実ユーザー情報は監査リポジトリへ転記しない。

## 正式な監査基準
- 自動CIのSUCCESSとリリースの可否は**別ゲート**。`audit/P0_RELEASE_EVIDENCE_MANIFEST_V1.json` に事実確認の状態を明記し、`qa-final-contract-release-readiness-v1.mjs` が`P0_EVIDENCE_STATUS`（未取得200件・契約コピー・実運用・認知テスト等）を毎回出力する。
- CI `P0 Final Contract Candidate Gate` のPASSは候補計算・リグレッション・架空データ画面テストの成功に限定。後半200件やExcel版同一性を推定PASSしない。
- 合法的な公開には、9/29 Excel2本の原本を入手してハッシュ・セル差分照合、元100ケースの残り200行とプロフィールによる全体照合（またはその欠損を明示承認）、GAS/LINEの実運用、5〜8人Cognitive Pilotと担当者の明示的な公開承認が必要。

## 原本復旧の手順
1. 端末・クラウド・メールの `MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0(1).xlsx` / `(2).xlsx` の生ファイルを取得。閲覧画面のスクショだけではファイルのSHA-256・全セル比較は不可能。
2. `MUDAGIRI_FINAL_100CASE_VALIDATION_V2_0_FROZEN.xlsx` のバイナリと、元のテスト入力100プロフィールが存在するなら同時取得。
3. 元ファイルは改変せず、SHA-256とシート名・数式/値の違いを確認。契約優先ルール `MASTER_ENGINE → GLOBAL_RULES → CANONICAL_OWNER` と改訂日時を基に解決する。
4. 発見した証拠を隔離PR #47の監査結果に記録して回帰し、承認が出るまでPR #46・本番・GASには反映しない。

**現時点：ReleaseReady=false / PR #47 Draft・NO MERGE。**
