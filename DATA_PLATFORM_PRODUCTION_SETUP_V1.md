# ムダギリ診断 本番データ基盤 V1

Status: RELEASE CANDIDATE
Date: 2026-10-02

## 正本
- Workbook: `MUDAGIRI_PRODUCTION_DATA_MANAGEMENT_V1.xlsx`
- GAS: `MUDAGIRI_GAS_CODE_V3.gs`
- Data contract: `MUDAGIRI_ANALYTICS_V1`

## 保存単位
- `02_Diagnoses`: 1診断 = 1行。diagnosis_id UPSERT。
- `03_Categories`: 1診断 × 12カテゴリ = 12行。diagnosis_id + category_code UPSERT。
- `04_Events`: 1イベント = 1行。event_id dedupe。
- `05_Leads`: 1診断 = 1行。diagnosis_id UPSERT。
- `09_Meta`: schema/GAS version。

## Result V5 semantics
- comparison_difference は比較差額であり、ムダ額でも改善額でもない。
- confirmed_saving のみ確定改善額。
- potential_c_upper は比較ベースの見直し余地上限で、確定改善額ではない。
- Result V5 の position / v5_status / C upper / first quest は診断snapshotの analyticsV5 に保存する。

## Google Sheets / GAS setup
1. `MUDAGIRI_PRODUCTION_DATA_MANAGEMENT_V1.xlsx` をGoogle Driveへアップロードし、Googleスプレッドシートへ変換。
2. そのスプレッドシートで「拡張機能 > Apps Script」。
3. Code.gsを `MUDAGIRI_GAS_CODE_V3.gs` 全文で置換。
4. `setupMudagiriAnalyticsV1` を1回実行。権限を許可。
5. 「デプロイ > 新しいデプロイ > ウェブアプリ」。
   - 実行ユーザー: 自分
   - アクセス: 全員
6. /exec URLを取得。
7. GitHub Actions Secret `VITE_MUDAGIRI_GAS_URL` をそのURLへ更新。
8. Pagesを再デプロイ。
9. Workbookの `08_QA` を上から13項目確認。

## 重要な修正
旧GAS V2ではResult側のイベント名 `goal_selected` とGASの `future_goal_selected` が一致していなかった。
V3は両方を受けるが、現行正本は `goal_selected`。

## 公開前ゲート
- Build SUCCESS
- qa:data-pipeline SUCCESS
- 既存全QA SUCCESS
- 実診断1件で Diagnoses=1 / Categories=12 / Lead=1
- LINEから戻って同じ diagnosis_id / Result が復元
