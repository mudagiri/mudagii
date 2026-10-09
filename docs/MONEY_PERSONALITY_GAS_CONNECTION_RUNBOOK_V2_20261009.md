# ムダギリ診断｜専用GAS接続の公開前ランブック V2
更新日：2026-10-09　状態：**未接続・本番反映前**

## 今回までに確認した事実

- Google Drive専用DB「[ムダギリ診断_MONEY_PERSONALITY_PILOT_DB_V1](https://docs.google.com/spreadsheets/d/1FV_VU0JOu8dqV0BNvCf7TBVQPTYRxzkJKzOpKz3l2dM/edit)」は実在。①セッションと④結果はヘッダーのみ。
- 一般向け第1章URL`/pilot/money-type/`と「プレビューURL」の表記が同じなのに、旧監査はそのパスを全部除外していた。PR #34 で公開と検証を**URLでなくcollectionCohortで分離**。結果タブの既存列数や第2章は変更しない。
- GitHub Actionsの`pilot-hidden-preview`環境を指定した**読み取り専用GET疎通試験**：[Run 37870627316](https://github.com/mudagiri/mudagii/actions/runs/37870627316) → `MISSING_ENDPOINT`（環境のシークレット値を取得できない）。
- 環境／リポジトリ`secrets`に加えて`vars`でも参照できるフォールバックを追加して再試験：[Run 37870807252](https://github.com/mudagiri/mudagii/actions/runs/37870807252) → **やはり`MISSING_ENDPOINT`**。
- したがって当該GitHub Actionsのビルド環境で`VITE_MONEY_PERSONALITY_GAS_URL`を解決できていない。**GAS自体が存在しないと断定するものではない**。

## 管理者が行う操作（セキュリティ値をチャットに貼らない）

### A. GASの存在と正しいWebアプリURL

1. 上記の性格診断専用Sheetを開き、**拡張機能 → Apps Script** から紐づくGASが存在するか確認。家計診断本体のGASとは別であること。
2. 読み取りだけで現在のApps ScriptソースとGitHubの`MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs`を照合する。
3. 既存の専用GASが未作成なら、レビュー済みの専用コードを紐づくApps Scriptへ配置。`setupMoneyPersonalityPilotV1`で5タブ・設定ヘッダーを検査する（本体GASで絶対に実行しない）。
4. 専用GASを **Webアプリとしてデプロイ**して`/exec`を取得。単にコードをGitHubで更新してもApps Script本体には自動反映されない。公開アクセスの範囲と個人情報取扱いは運営者が決定する。
5. WebアプリURLのGET応答には`backend:money_personality`、`gas_version:MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0`、`household_backend_separated:true`が必要。応答が`MUDAGIRI_SHEET_V3`なら家計用の**誤接続**。

### B. GitHub Actionsの変数登録

[GitHubリポジトリの設定](https://github.com/mudagiri/mudagii/settings/secrets/actions) から `VITE_MONEY_PERSONALITY_GAS_URL` を登録する。

- 第一候補：**Settings → Environments → pilot-hidden-preview → Environment variables**。変数名を正確に`VITE_MONEY_PERSONALITY_GAS_URL`、値を専用Webアプリの`https://script.google.com/macros/s/.../exec`とする。
- 代案：**Settings → Secrets and variables → Actions → Repository variables / secrets**に同名で設定。公開URLはクライアントJSへ埋め込まれるため、秘密鍵・認証トークンとしては使用しない。
- 同名のEnvironment secretが古いURLで上書きされる、`/dev`を指定する、家計用URLを使う、末尾に空白やクエリを含む、といった誤設定を避ける。
- 第1章Hidden PreviewのビルドジョブはPR #34で`environment: pilot-hidden-preview`へ変更し、**環境限定値も読み取れる**設計にした。公開対象ブランチ制限・Environment承認ポリシーも適用される。
- `VITE_MONEY_PERSONALITY_DATA_COHORT`はHidden Previewで`PILOT`固定。将来の一般公開時のみ明示した`PUBLIC`を許可する。採取データが混ざるのを防ぐ。

### C. 変更後の検証順序

1. 読み取り専用の`scripts/check-money-personality-gas-health.mjs`が **`DEDICATED_GAS_HEALTH_OK`**を返す。
2. ビルドされたJSに性格診断専用の送信処理・URL・再送キーが**実際に存在**することを`scripts/verify-money-personality-build.mjs`で検査。GAS URLが空のままJSから送信コードが消える状況を防ぐ。
3. GAS検証は**health_only**がデフォルト。手動`debug_upsert`を選んだ場合だけ、匿名の固定QAセッションを同一IDで2回POSTする。
4. 専用Sheetの`①セッション`と`④結果`で、固定QAセッションがそれぞれ**ちょうど1行**のままであることを検査。専用GAS受信とupsertの実確認はここで初めて完了。
5. Previewの公開後`REVISION_SHA.txt`で、今回ビルドしたSHAと実公開版の一致を確認。現行公開版は以前404だった。
6. 本番としての統計公開前に、実測母集団の構成、流入、ボット/不正送信、ユニークブラウザID重複、再検査安定性、同意とプライバシーを監査。希少バッジは現時点で禁止。

## 公開前の受け入れ基準

| ゲート | 合格条件 | 現状 |
|---|---|---|
| 第1章の静的な診断・分類・表示 | QA全件PASS | PASS |
| 専用GASの接続設定 | `VITE_MONEY_PERSONALITY_GAS_URL`がビルドから見える | **FAIL** |
| GAS種別確認 | 家計GASと明確に区別できる | 未実行 |
| 実GAS送信 | GETヘルスOK + debug POST2回の応答OK | 未実行 |
| 専用Sheetへの保存 | ①セッション/④結果 各1行のQAデータで確認 | **0件** |
| Previewの公開SHA | `REVISION_SHA.txt`一致 | 未完 |
| 出現率表示 | PUBLIC実測＋必要な品質・倫理・標本監査 | 保留 |

本ランブックは運営者のGoogle/GitHub設定操作が必要な箇所を整理したもの。外部設定が完了するまでは修正候補PRをマージせず、診断コア・第2章 V1 FROZEN・希少性の判定閾値を触らない。

## Cognitive Pilot フィードバック送信

PR #34で`PUBLIC_COGNITIVE_DEBRIEF`のデータ取扱いも監査した。従来は`no-cors`で送信が失敗しても画面が「回答を保存しました」と表示し、次回にGASへ送る機会がなかった。

- フィードバックのローカル保存は明示して`回答を端末内に保存しました`と表示する。**GAS保存を確認したという意味ではない**。
- 結果Payloadの送信管理キー`mudagiri_money_type_submission_health_v1`と、Cognitive専用`mudagiri_money_type_cognitive_delivery_v1`を分ける。互いのretry情報を上書きしない。
- 参加者が結果に戻ってきた場合、専用GAS URLが有効ならCognitiveフィードバックも再送を試みる（最大4回）。URL未設定やCORS opaqueでは確認成功を主張しない。
- Cognitive本番受信の合格には`③Cognitiveフラグ`・`⑤Debrief`の保存と`parent_session_id`の一致が必要。再送で重複せず、家計診断用GASに送らないこと。
- 保存の通信結果はデータ完全性の確認ではない。検証参加者のアンケート実施前に、**管理者が実際のSheet受信で確認**する。
