> STATUS: Historical handoff/reference. Where this file conflicts with START_HERE.md, SOURCE_AUDIT_2026-09-23.md, or current runtime code, the newer files/runtime win.

# ムダギリ診断 V1 — 月額0円セットアップ

## 用意するもの
- Googleアカウント
- GitHubアカウント
- LINE公式アカウント（既存URL: https://lin.ee/ZeLu7i6）

## 1. Google Sheets + GAS（コピペ）
1. 新しいGoogleスプレッドシートを1つ作成（例: `ムダギリ診断_DB_V1`）。
2. `拡張機能 > Apps Script` を開く。
3. `Code.gs` の中身を全部消し、`MUDAGIRI_GAS_CODE_V1.gs` の全文を貼る。
4. 上部の関数選択で `setupMudagiriSheets` を選び、実行。Googleの権限確認を許可。
5. シートに `Diagnoses / DiagnosisCategories / FunnelEvents / Leads` の4タブが自動生成されたことを確認。
6. `デプロイ > 新しいデプロイ > 種類: ウェブアプリ`。
   - 実行ユーザー: 自分
   - アクセスできるユーザー: 全員
7. デプロイし、末尾が `/exec` のURLをコピー。
8. そのURLをムダギリの環境変数 `VITE_MUDAGIRI_GAS_URL` に設定。

> スプレッドシート自体は「リンクを知っている全員」に共有しない。非公開のままでOK。公開するのはGAS Web Appだけ。

## 2. GitHub Pages
GitHubへムダギリ本体をpushし、GitHub ActionsでVite buildを実行してPagesへ公開する。
Build時の環境変数:

```env
VITE_LINE_URL=https://lin.ee/ZeLu7i6
VITE_MUDAGIRI_GAS_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

`VITE_MUDAGIRI_API_URL` はV1では空欄でよい。

## 3. 本番確認（必須）
1回だけ実際に診断を完走し、次を確認する。
- Diagnoses: 同じ diagnosis_id が1行
- DiagnosisCategories: 同じ diagnosis_id が12行
- FunnelEvents: started/completed/result_viewed 等が保存
- Future Goal選択後、Diagnosesの future_goal が更新
- LINEボタン押下後、Leadsが1行作成
- FunnelEventsに line_clicked
- 同じ操作を再送しても診断/Lead/Eventが重複増殖しない

## 将来Supabase/PostgreSQLへ移す時
列名・ID・enumを既存Central DB設計と揃えてあるため、各タブをCSV exportして移管する。フロントはPersistence AdapterをGASからCentral APIへ差し替えるだけで、診断エンジン/UIは変更しない。
