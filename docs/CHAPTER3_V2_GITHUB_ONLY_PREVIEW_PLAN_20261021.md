# ムダギリ診断 第3章V2｜GitHub専用プレビュー運用（2026-10-21）

**決定：Vercelを使用せず、GitHub（PR・Actions・Pages）を基盤とする。**

## 現在地と結論

- 第1章→第2章→第3章の統合試作は [PR #77](https://github.com/mudagiri/mudagii/pull/77) に実装済み。第3章内容・4視点監査は [PR #70](https://github.com/mudagiri/mudagii/pull/70) に保持。
- 現在のGitHub Actionsにはビルド、動的反証81件、静的保護チェック30件、Chrome相当Chromium＋iPhone相当WebKitの全章通しQAがある。
- **既存のGitHub Pages本番公開を上書きしない。現時点で第3章の新しいライブURLは発行していない。** GitHub Actionsで出力するZIPは公開サイトではない。
- GitHub-onlyのPages用静的ZIP（HTML・画像・JS一式）をActionsで出せる。全章の素材は1セットだけ置き、ファイル量を約3分の1に減らした。

## GitHubで扱う構成

| 用途 | 場所 | 意味 |
|---|---|---|
| 既存の第1・第2章本番 | mudagiri/mudagii / main / deploy-pages.yml | 本番保護。今は変更しない |
| 第3章の設計 | PR #70 | 行動経済学・心理学・マーケティング・バズ理論の品質設計 |
| 第3章のコード | PR #77（Draft） | 第2章からの入口、JOB・STYLE・12カテゴリ引継ぎ、RPG試作 |
| 操作の実ブラウザQA | qa-chapter3-v2-browser-e2e.yml | Chromium/WebKit、320〜430px、個別ルート、戻る・相談 |
| GitHub Pages用の完成素材 | package-chapter3-v2-github-pages.mjs と ActionsのZIP | 公開前の静的パッケージ。**公開自体は行わない** |

## 静的パッケージの構造

- 入口：/chapter3-v2-preview.html
- 第1章：/pilot/chapter2-v32/pilot/money-type/
- 第2章：/pilot/chapter2-v32/
- 画像・CSS・JS：/assets/ に1セットのみ
- 深いルートのHTMLには base href="/" を指定し、全章で静的ファイルを共有
- 隔離試作ではGAS・PostHog送信と外部LINE遷移・予約を無効化。架空の入力での確認を前提とする

**注意：静的パッケージはGitHub Pagesのユーザーサイトルート（/）想定。** 一般的なプロジェクトサイトの /repository-name/ 下には、アプリの絶対 /pilot/ ルートを修正せずに配置できない。

## 公開手段の安全性

既存の mudagiri/mudagii は main をGitHub Pagesへ公開するワークフローを持つ。GitHub Pagesは同一リポジトリの別ブランチごとに独立した本番URLを同時発行する仕組みではない。そのまま第3章用のPagesデプロイを走らせると、既存の第1・第2章の公開内容を上書きしかねない。

**新しい閲覧用URLが必要な場合は、独立GitHub Pagesリポジトリを作る方法を推奨。** 例えばユーザーサイト用の mudagiri.github.io を使う場合は、使用状況・アカウント権限を確認してから作成する。現在使えるGitHub接続には新規リポジトリの作成操作がないため、そこはGitHub側の操作か追加権限が必要。作成・公開した事実がない段階で架空のPages URLを提示しない。

## 次のタスク

- **P0：** Github Pages用コンパクト静的バンドルを利用したChromium/WebKit通しQAの再実行を確認。
- **P0：** 独立Pages公開先の用意と本当に開けるスマホ用URLの確認（権限依存）。既存本番は保持。
- **P1：** 実ユーザー5〜8人で新規性・当たっている感・面談テーマの期待一致・シェア魅力の4視点評価（合計100点基準、現時点未採点）。
- **P2：** 背景やイベントの画像は別制作。第2章の公式ドットRPG素材と整合させてから組み込む。

**禁止：** Vercelを前提にすること、作成していないURLを完成と表示すること、本番Pagesを無断で差し替えること、A/C見直し候補を投資資金に変えること。
