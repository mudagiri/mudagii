# ムダギリ第1章｜実ユーザー出現率・収集経路監査 V1
更新: 2026-10-09
状態: **コード実装済み／本番GAS未反映・実データ未受信**

## 実際に見た保存先

Google Drive連携から実在する専用Sheetを発見。
- [ムダギリ診断_MONEY_PERSONALITY_PILOT_DB_V1](https://docs.google.com/spreadsheets/d/1FV_VU0JOu8dqV0BNvCf7TBVQPTYRxzkJKzOpKz3l2dM/edit)
- tab: `①セッション`、`②回答`、`③Cognitiveフラグ`、`④結果`、`⑤Debrief`、`_設定`
- `①セッション` の `A1:A1000`、`④結果` の `A1:A1000`、`⑤Debrief` の `A1:A1000` は、それぞれ**ヘッダー1行のみ**。
- 現在の `④結果` は **実測JOB/TYPE分布を計算できる有効データ0件**。
- 列定義に `session_id / anonymous_user_id / job_code / primary_style` 等がある。今回は**Sheetを改変していない**。

この観測は「利用者ゼロ」の証明ではない。未公開・URL未設定・GAS未デプロイ・受信エラー・別DBへの接続などを区別できない。GitHub Actionsのビルド成功はGASへの到達成功を証明しない。

## 今回コードで見つけた実問題

公開フロー `MoneyPersonalityTelemetry.tsx` の送信仕様は以下だった。
1. `VITE_MONEY_PERSONALITY_GAS_URL` が未設定なら `postPayload` は何もせず終了。
2. 呼び出し側が通信処理より前に `localStorage` に「送信済み」キーを保存。
3. `mode:'no-cors'` なのでブラウザからGASの `{ok:true}` を読めない。通信例外も無視。
4. 完了結果が表示されている間、処理の繰り返しで `completedAt` を再計算していた。

したがって、**保存先にないのにクライアントが送信したつもりになる**経路が存在した。これだけで今回の0件の原因が確定したわけではない。

## 実装した安全対策（PR #33）

- 専用GAS宛に限定し、第2章（診断本体）のGASには変更なし。
- URLがない場合は「送信済み」とせず `UNCONFIGURED` を保持。外部通信を発生させない。
- `no-cors` の通信がブラウザで完了しても **`OPAQUE_UNVERIFIED`**（GAS受信確認ではない）として保存。
- 送信メタデータは `sessionId / attempts / state / lastAttemptMs` のみ。回答や金額は再送キューに保持しない。
- 送信上限4回。通信失敗は5分後、opaque送信は24時間後に、**ユーザーがページを再度利用・表示している場合のみ**再試行。
- GASは既存の `session_id` で結果をupsertするため、同一セッションの再送で母集団分母が増えない。
- 完了日時を初回完了で固定し、再表示や再試行によって `durationMs` が増えることを防止。
- 計測の `sourceUrl` はルートURLと `utm_source` 以外のクエリ・フラグメントを送らず、トークン・追跡IDの混入を避ける。

注意：この修正でもサーバー確認はできない。ユーザーが戻って来なければ遅延再試行も発生しない。大規模公開前にGASの受信件数とサーバーのエラーログを突き合わせ、必要なら観測可能な別送信方式を検討する。

## 管理者が手動で走らせる「実出現率」監査

既存の `MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs` に `auditMoneyPersonalityPrevalenceV1()` を追加した。

- GASスクリプトエディタの管理者用関数。**公開GET/POSTから実行できない**。
- 既存の `①セッション` と `④結果` を読み取るのみ。Sheetの新設・書込・タブ構成変更なし。
- `PUBLIC_ADAPTIVE` だけ選ぶ。cognitive・debug・プレビュー・localhost・QA ID・不正分類・孤立結果・匿名ID不一致を除外。
- 同一ブラウザIDに複数完了がある場合は、**最初の有効な完了を1件だけ数える**。再診断の揺らぎは母集団頻度に混ぜない。
- 8 JOB、4 STYLE、32 TYPE、明示的な `utm_source` 別件数・比率・Wilson 95%区間を計算。
- `publication.ready` はコード上**常にfalse**。N=5000を超えても自動公開しない。
- `utm_source` 不明は `unspecified`。安易に「ダイレクト流入」と判定しない。
- 統計の母集団は「同じ匿名ブラウザIDによる有効初回完了」であり、人間1人の完全な本人認証ではない。

## デプロイ・受信の実機確認が必要なこと

1. GitHub Pagesに展開されたHidden Previewのrevisionを確認し、`VITE_MONEY_PERSONALITY_GAS_URL` が実際のビルド時に埋め込まれているか確認（シークレット値はログ/画面に表示しない）。
2. 当該Google Sheetに紐づく専用GASプロジェクトを管理者が確認し、バージョン `MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0` のWebアプリとして公開済みか、送信先が家計診断用でないか確認。
3. 今回の新しい専用GASファイルを、**既存のGoogle Apps Script側にも反映して再デプロイする必要がある**。GitHubに置いただけではGAS実稼働は変わらない。
4. 同意を得たQAセッションを `debug=1` で1件送信し、実際に `①セッション` と `④結果` に同じ `session_id` で保存されることを確認。テスト後の集計からは除外される。
5. 同じセッションを再送し、行が増えずにupsertされるかを確認。
6. ネットワーク・受信失敗でも「画面は成功したように見える」という制約を明確にし、エラー率・遅延・離脱の別計測を設計。
7. プロダクションで匿名IDの重複と流入ソースの構成を確認し、認知Pilot→実測Pilotの順に集計する。集計Nが小さい段階のランキング・上位1%バッジは不可。
8. 公開時は期間・N・集計対象・観測方法・プライバシー説明を付ける。MBTIの分布は正解分布として移植しない。

## 禁止事項

- 「ユーザーの1%未満」「日本人に珍しい」などの希少性を現時点で表示。
- 仮想1万人・4万人の結果を人口頻度として掲載。
- 第2章V1 FROZENの分析・改善額・銀行／カード／金額の保存ロジック変更。
- GASのスクリプトURL・クライアント識別子・機密パラメータをドキュメントに貼る。

## QA

`npm run qa:money-delivery`／`npm run qa:money-real-prevalence`／`node qa-money-personality-backend-separation-v1.mjs`。
実GASへの受信成功・本番での遅延や再試行は**この単体QAでは検証できない**。

## 2026-10-09 接続実験の確定結果

専用GAS検証を独立した GitHub Actions ワークフローに実装し、固定の QA セッションで `doGet` と同一セッションの `doPost` 2回を行う設計とした。実行条件：健全な専用GAS接続先が GitHub Actions から利用できる場合に限る。実データと秘密のURLはログへ出さない。

- [疎通実験（接続前段階で停止）](https://github.com/mudagiri/mudagii/actions/runs/37867689064)
- 検証済みログ結果：`endpointConfigured:false`、`blocker:SECRET_NOT_CONFIGURED`。
- この記録は**当該PRワークフロー環境の変数が空**であることを示す。リポジトリや環境シークレットに登録自体がないことまでは証明しない。
- 接続URLが空のため GET/POST は**実行していない**。実Google Sheetに新たなテストデータは保存していない。
- [第1章／通信リトライ／実分布集計／Release Gate のオフラインQA（PASS）](https://github.com/mudagiri/mudagii/actions/runs/37867947401)

### 無接続のままHidden Previewを公開させない保護

2つのGitHub Pages公開ワークフローに、専用GAS URLの有無と `script.google.com/macros/s/.../exec` 形式の確認を追加。URLが利用できない場合、**ビルド／プレビュー公開を停止**する。URL本文・シークレット値はログに出さない。現時点で保護はPRのコード上だけであり、本番ワークフローへの反映は未実施。

### 実行可能な復旧チェック

1. **GAS Webアプリ**：専用Google Sheetに紐づく Apps Script を開き、`MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs` の `doGet` / `doPost` を確認。Webアプリで最新の版が公開されているか管理者が検査する。
2. **GitHub secret scope**：GitHubリポジトリ `Settings → Secrets and variables → Actions` で `VITE_MONEY_PERSONALITY_GAS_URL` の登録先を確認。Environment専用シークレットの場合、**ビルドジョブでそのEnvironmentが選ばれているか**も合わせて確認する。
3. 接続先に本物の家計診断GASを設定しないこと。健康確認は `backend:money_personality` と `gas_version:MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0` を要求。
4. 修復後、疎通実験を再実行し、返却の `health:true, post1:true, post2:true` を確認。
5. Google Sheetの `①セッション` と `④結果` に、固定QAセッションが**各1行だけ**存在することを確認する。受信後の集計では `debugMode:true` により除外。
6. 実GASの内容更新・Webアプリ再デプロイ、接続先の再設定はこのPRでは実施していない。

### スケール上の残課題

専用GASの既存 `savePayload_` は各回答を単位行で `upsertByKey_` し、毎回 `TextFinder` で既存行を検索する。数千人から1万人規模の診断では、記録行数に比例して遅延やGAS実行制限の問題が起きうる。**まず1件の実到達確認が必要**。その後、回答のバッチ書き込み・上限・タイムアウト監査を独立した非破壊的QAとして実施する。
