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

## 2026-10-09 公開サイトを対象にした追加監査（読み取りのみ）

実際のGitHub Pagesの初期画面と公開JavaScriptを取得して検証した。**公開サイトで回答を送信していない。機密URLは公開ログ・レポートに転載していない。**

| 直接検証した対象 | 確認結果 |
|---|---|
| `/mudagii/pilot/money-type/`（クエリなし） | **旧54画面・結果なしの研究Pilotが既定表示** |
| `/mudagii/pilot/money-type/?adaptive=money-type` | 新しい **30問CORE＋必要な追加設問** の第1章が表示 |
| 公開JavaScriptの専用収集処理 | 旧`mudagiri_money_type_public_submitted_v1`あり、新`mudagiri_money_type_submission_health_v1`なし。**Adaptiveの送信処理が空関数に縮退** |
| 公開JavaScript中のGAS URL（値は非掲載） | 参照されるGASのGET応答は `{"ok":true,"version":"MUDAGIRI_SHEET_V3"}`。これは専用性格GASの`backend:money_personality`とは一致しない |
| `/mudagii/pilot/money-type/REVISION_SHA.txt` | **HTTP 404**。公開コードがどのGit SHAに一致するか、この方法では検証できない |

**重要な区別:** バンドル内に見つかったGAS URLは家計診断側のもの。適応診断の専用送信が空関数になっているため、単に「URLが1本ある」だけでは第1章への保存経路があることにはならない。旧54画面の研究Pilotだけは`VITE_MUDAGIRI_GAS_URL`を使おうとする経路が存在し、バックエンド分離原則に反する（家計側が受け付けて保存したという意味ではない）。

### 公開候補コードに追加した対応

1. **既定リンクの修正**：`/pilot/money-type/`を30問Adaptiveで開く。旧54画面研究版は`?mode=legacy-pilot`等、明示ルートだけにする。家計診断ルート`/`は変更しない。
2. **旧Pilotの保存先分離**：旧54画面も専用の`VITE_MONEY_PERSONALITY_GAS_URL`へ変更し、同じ`anonymousUserId`を付与。専用GAS側のみ`ALL_54`を許可（結果タブへは登録しない）。家計GASへの性格Payload送信経路を撤去。
3. **公開前にサーバー種別検証**：`scripts/check-money-personality-gas-health.mjs`でGETし、`backend:money_personality`かつ期待する専用GASバージョンかつ家計DB分離フラグがある場合のみ次へ。
4. **ビルド後の実物検証**：`scripts/verify-money-personality-build.mjs`で専用URLがビルド済みJSに実際に含まれるか、送信処理が縮退していないか、家計GASとURLが同一でないかを確認。これらの値はログへ非出力。
5. **公開後の版一致検証**：2つのPages公開ワークフローでGitから実際にcheckoutしたSHAを捕捉し、公開後の`REVISION_SHA.txt`と一致しない場合はActionsを失敗させる。
6. **疎通テストの副作用制限**：デフォルトは管理者手動実行の**GETだけ**。Google Sheetへ固定QA行を試験送信するには`debug_upsert`を明示選択し、専用GAS健康確認を通過する必要がある。

### 残る外部依存と運用上の注意

- 上記改善はPR #33の**Draftコードのみ**。現在のGitHub Pages、Apps Script本番、GitHub Secretsの設定を変更したという意味ではない。
- 実行時に環境変数がない問題は依然として外部設定ブロッカーで、設定場所（repository secret / environment secret / 権限制限）は未判別。
- `VITE_*`環境変数に埋めたURLは最終的にブラウザへ公開される。**URLを秘密の認証トークンとして扱ってはいけない**。公開GASへの回答偽装・自動送信・スパム対策は実測の採用判定時に追加監査する。
- `REVISION_SHA.txt`の404は新しいデプロイで再確認すべき。ブラウザ表示があるだけでは、修正を公開できた証明にならない。
