# ムダギリ診断 公開直前セットアップ
1. Googleスプレッドシートを新規作成（旧集計シートは削除不要）。
2. 拡張機能 → Apps Script → `MUDAGIRI_GAS_CODE_V2.gs` 全文を貼り付け。
3. `setupMudagiriV2()` を1回実行。`Diagnoses_V2` / `Events_V2` / `Meta` が追加される。
4. Apps ScriptをウェブアプリとしてデプロイしURLを取得。
5. `.env.example` の `VITE_MUDAGIRI_GAS_URL=` にURLを設定。
6. LINEは公式URL `https://lin.ee/ZeLu7i6` を実装済み。
7. 面談予約URLが決まったら `VITE_MUDAGIRI_APPOINTMENT_URL=` に設定（現状は未設定のため予約CVは未稼働）。
8. GitHub Pages公開後、スマホ実機で診断→結果→LINE→Sheets保存を1件テスト。
