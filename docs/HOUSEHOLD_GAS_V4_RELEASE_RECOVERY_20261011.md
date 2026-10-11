# ムダギリ診断｜家計GAS V4 接続復旧・限定公開ゲート
2026-10-11 / 統合デザインRC / 現在の本番書き込み禁止

## 現在地（実測）
- 第1章専用GAS: GETの専用バックエンド／バージョン確認PASS。
- 第2章GAS: 設定されている`VITE_MUDAGIRI_GAS_URL`はHTTP GET可能だが、`ok + version` の旧V2型応答。想定する `schema_version=MUDAGIRI_DATA_ASSET_V1` と `gas_version=MUDAGIRI_GAS_V4_0` が返らずブロック。
- 既存Google Drive接続で確認できたのは `ムダギリ診断_ANALYTICS_V1` と `ムダギリ診断_MONEY_PERSONALITY_PILOT_DB_V1`。**どちらもV4家計データ資産の正本とみなさない**。V4正本スプレッドシートのURL/IDが不明。
- Webフロント `GasPersistenceV3` は `fetch(mode:'no-cors')` を使用し応答内容を読めない。送信試行成功 ≠ GAS受信成功 ≠ Sheet保存。自動QAのプレビューも明示的にGAS OFF。
- LINEは第1章・第2章で `https://lin.ee/ZeLu7i6` を使うが、クリックは「面談予約完了」ではない。

## 作業順（失敗したら次に進まない）
1. **接続先スプレッドシートを特定**。名称だけで旧分析DBを流用しない。正本テンプレート `MUDAGIRI_DATA_ASSET_V1_FINAL_JP.xlsx` をGoogleスプレッドシートに変換済みか確認。なければ原本から専用Sheetを作る（別DBと混ぜない）。Drive側の正本URLを控える。
2. そのSheetから［拡張機能 → Apps Script］を開き、Code.gsの全文をリポジトリ `MUDAGIRI_GAS_CODE_V4.gs` と一致させる。**旧V2コードとの同居不可**（`doGet`、`doPost`、`CFG` の二重定義回避）。
3. エディタで `setupMudagiriDataAssetV1` を所有者として実行し権限承認。少なくとも日本語の6タブと `_診断_raw` `_支出_raw` `_イベント_raw` `_面談_raw` `_品質_raw` `_設定` を検証。`_設定` の`gas_version`は `MUDAGIRI_GAS_V4_0`。
4. ［デプロイ → デプロイを管理］で既存の該当ウェブアプリを**新しいバージョン**に更新（正しいSheetに紐付く場合）。別の旧Sheetに紐付いたアプリならこのSheetから**新規ウェブアプリ**としてデプロイ。実行ユーザーは本人、アクセスはWebアプリに必要な範囲で設定。スプレッドシート自体は非公開。
5. `/exec` URLをブラウザで開き、`{"ok":true,"schema_version":"MUDAGIRI_DATA_ASSET_V1","gas_version":"MUDAGIRI_GAS_V4_0"}` が返ることを確認。接続先変更時はGitHub Actionsの `VITE_MUDAGIRI_GAS_URL` Secretまたは対象環境の変数を正しいURLへ更新。**公開リポジトリのソースやログにURLを直書きしない**。
6. Actions `Read-only GAS Launch Health` が**householdとpersonality両方 PASS**になるまで公開しない。これはGETのみで書き込み検証ではない。
7. GASが正しいことを確認してから同意済みの社内テスト1件を、**GAS有効の隔離環境**で完走。診断IDだけローカルに控える。シート `⑥データ保管庫` の1件、`_診断_raw` の1件、`_支出_raw` のカテゴリ12行を同じ診断IDで照合。イベント・LINE引継ぎ・品質判定・端末復帰も確認する。`no-cors` の成功だけではPASSにしない。*試行後の不要なテストデータは記録・確認してから削除*。
8. LINEで相談希望→日程確定までテスト。`LINEクリック`／`LINE遷移`／`appointment_booked` を異なるイベントとして検証。`appointment_booked` は予約が本当に確定した場合だけ、CRM/LINEの運用または `recordConversion` で記録。ユーザー行動だけで予約完了イベントを捏造しない。
9. Android/iPhone実機で第1章SSR→共有→第2章12カテゴリ→戦果→相談→再訪を完走。個人情報・家計金額が共有カードに含まれないことを確認。
10. **すべてPASS後に** 統合版(PR #42)、RC(PR #41)、V3.2(PR #40)を安全に統合して限定公開。旧PRの順次マージに伴う競合・Actionsを再確認。公開前の `main` と本番画面は変えない。

## GitHub用診断コマンド
```sh
node scripts/qa-gas-v4-contract.mjs
node scripts/launch-rc-backend-health.mjs
```
後者は環境変数 `MUDAGIRI_HOUSEHOLD_GAS_URL` と `MUDAGIRI_PERSONALITY_GAS_URL` がある環境で実行。URL値はログに出さない。

## 未解決ブロッカー／次に必要な1情報
**V4を紐付ける正本家計データ資産GoogleスプレッドシートURL（またはそのID）**。現在確認できる2つの既存DBは用途が違う。新規作成済みのSheetが別のGoogleアカウントにあれば、その所有者がGASをデプロイする必要がある。

## ローンチ基準
- 数値の正確性、12カテゴリ、CONFIRMED意味論、未確定上限の条件表示を維持。
- 新しい演出追加を停止し、保存・匿名化・予約計測の受信確認を優先。
- 5〜8人限定公開は本番GASのPOST/保存とLINE予約計測が確認できた後。デザイン評価点で無期限に延期しない。
