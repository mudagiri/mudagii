# ムダギリ診断 — 公開手順
## 1 GAS
Googleスプレッドシート → 拡張機能 → Apps Script → `MUDAGIRI_GAS_CODE_V2.gs` 全文を貼付 → `setupMudagiriV2()` を1回実行。
`Diagnoses_V2` / `Events_V2` / `Meta` が作成されたら、ウェブアプリとしてデプロイし `/exec` URLをコピー。
旧シートは削除しません。

## 2 GitHub Pages
新規repositoryを作成し、このフォルダの中身をrepository直下へアップロード。
Settings → Secrets and variables → Actions で `VITE_MUDAGIRI_GAS_URL` にGASの `/exec` URLを登録。
Settings → Pages → Sourceを GitHub Actions に設定。
Actions → `Deploy Mudagiri to GitHub Pages` が緑になれば公開URLを開く。

## 3 実機確認
スマホで 診断開始 → 12支出 → 8問 → 満足度 → バトル → 結果 → LINE まで1件実行。
`Diagnoses_V2` に診断1行、`Events_V2` に diagnosis_started / diagnosis_completed / result_viewed / line_clicked が入ることを確認。
公式LINEは `https://lin.ee/ZeLu7i6` 実装済み。

## 4 面談
現行V1では結果画面から直接予約させません。LINE追加後に「未討伐項目の仕分け → ムダギリ作戦会議」へ進める設計です。
予約サービスが決まった段階で、そのURLと予約完了Webhook/完了シグナルを接続します。未接続の予約URLを環境変数へ置く必要はありません。

TYPE_MODEL_V3_1_8 / 8問 / 3軸 / 8タイプ。

## 運営者情報・問い合わせ先
現行V1では公開ブロッカーにしません。未設定でも診断フローは動作します。
後から表示したい場合にのみ運営者名・問い合わせ先を追加します。

## Mode analytics
V2 diagnosis facts persist `toneMode` / sheet `tone_mode` so gentle/serious/hell can be compared on completion→LINE→valid appointment without changing diagnosis math.
