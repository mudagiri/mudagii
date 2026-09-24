> STATUS: Historical handoff/reference. Where this file conflicts with START_HERE.md, SOURCE_AUDIT_2026-09-23.md, or current runtime code, the newer files/runtime win.

# ムダギリ診断 V1 — あとはコピペだけチェックリスト

## A. Google側（約5〜10分）
1. Googleスプレッドシートを新規作成。名前は自由（例: `ムダギリ診断_DB_V1`）。
2. `拡張機能 > Apps Script` を開く。
3. `Code.gs` を全削除。
4. このフォルダの `MUDAGIRI_GAS_CODE_V1.gs` を全文コピーして貼り付け。
5. 保存 → 関数 `setupMudagiriSheets` を選択 → 実行 → 権限を許可。
6. スプレッドシートへ戻り、次の4タブを確認。
   - Diagnoses
   - DiagnosisCategories
   - FunnelEvents
   - Leads
7. Apps Scriptで `デプロイ > 新しいデプロイ > ウェブアプリ`。
   - 実行ユーザー: 自分
   - アクセスできるユーザー: 全員
8. デプロイ後の `https://script.google.com/macros/s/.../exec` をコピー。

**スプレッドシート自体は非公開のままでOK。共有設定を「全員」にしない。**

## B. GitHub側（約5〜10分）
1. 新しいRepositoryを作る（例: `mudagiri`）。
2. ムダギリ本体一式をmain branchへpush。
3. `.github/workflows/deploy-pages.yml` がそのまま入っていることを確認（移動・改名不要）。
4. Repository → `Settings > Secrets and variables > Actions > New repository secret`。
5. 名前を `VITE_MUDAGIRI_GAS_URL`、値をA-8の `/exec` URLにする。
6. Repository → `Settings > Pages > Source` を **GitHub Actions** にする。
7. Actionsの `Deploy Mudagiri to GitHub Pages` が緑になるまで確認。
8. 発行された `https://<username>.github.io/<repo>/` をスマホで開く。

## C. 実データ1件テスト（公開前必須）
1. スマホから診断開始。
2. 12項目入力 → 16タイプ → 満足度 → Battle → Resultまで完走。
3. Future Goalを1つ選択。
4. LINEボタンを押す。
5. Google Sheetsで確認。
   - Diagnoses: 1 diagnosis_id = 1行
   - DiagnosisCategories: 同じ diagnosis_id = 12行
   - FunnelEvents: diagnosis_started / diagnosis_completed / result_viewed / future_goal_selected / line_clicked
   - Leads: 同じ diagnosis_id = 1行
6. Future GoalがDiagnosesの `future_goal` に入っている。
7. Leadsのtype_code / monthly_improvement / future_goal等が入っている。
8. LINE公式 `https://lin.ee/ZeLu7i6` が開く。

## D. PASS条件
- GitHub Actions build: PASS
- QA: 現行スイート全件PASS（現在 38/38）
- Production sprites: 17/17
- GAS実保存: PASS
- LINE実遷移: PASS
- Androidスマホ完走: PASS
- 可能ならiPhone/Safariでも1回完走

ここまで通ったらSoft Launch可能。
