# ムダギリ診断｜第3章V2をGitHub Pagesで独立公開する最短手順

作成：2026-10-22 JST。現行の第1・第2章本番リポジトリ`mudagiri/mudagii`は変更しない。

## 現時点での状態

公開素材一式は GitHub Actions によって生成できる。PR #77はDraft、公開URLは未発行。
`mudagiri`オーナーのGitHub検索で確認できたリポジトリは`mudagiri/mudagii`の1件のみ。**別のGitHub Pagesリポジトリの作成操作は、現在接続されているGitHubツールでは提供されていない**。作成を済ませたように報告しない。

## 実際のライブURLを作る手順（ユーザー操作が必要）

1. GitHubでログインし、**New repository** からオーナー`mudagiri`で公開リポジトリ **`mudagiri.github.io`** を新規作成する（既存所有/使用状況を先に確認）。**Public**、README付きでよい。
2. 作成した`mudagiri.github.io`内に **`.github/workflows/deploy.yml`** を追加。内容はソースPR #77に用意した[テンプレート](https://github.com/mudagiri/mudagii/blob/feat/chapter3-v2-bridge-isolated-20261021/docs/github-pages-chapter3-demo-workflow.yml)を**全文コピー**する。
3. その新しいリポジトリの **Settings → Pages → Build and deployment** で**GitHub Actions**を選ぶ。
4. 新しいリポジトリの **Actions → Chapter3 V2 Independent GitHub Pages Demo → Run workflow** を手動実行する。
5. 成功したらリポジトリのPages画面に表示された実URLを確認し、**`/chapter3-v2-preview.html`** にアクセスする。**URLは今この時点では未生成であり推測値を本番リンクとして伝えない。**

### これが安全な理由

このワークフローは **独立Pagesリポジトリ内だけで** `actions/deploy-pages` を実行する。GitHub Actionsで公開中の`mudagiri/mudagii`本番のPages環境、`main`、`deploy-pages.yml`には書き込みを行わない。

ソース取得は読み取り専用の公開リポジトリ`mudagiri/mudagii`の`feat/chapter3-v2-bridge-isolated-20261021`から行う。作業ディレクトリで`npm ci`→`npm run build`→`scripts/package-chapter3-v2-github-pages.mjs`を実行し、**GAS・PostHog・実LINE遷移を無効化した隔離プレビュー**の`chapter3-v2-preview.html`等を静的公開する。

**本人の実家計情報はデモに入力しない**。架空の数字で操作を確認し、公式LINEで実際の予約は行われない。

### マージ・本番取り込みではない

- 第2章の正式ブランチPR #51も第3章PR #77もDraft。画像や面談CVの正式採択前に`main`へ取り込まない。
- 上のワークフローは**source refがブランチ名**のため、PR #77の更新後に手動再実行すると新しい隔離画面が反映される。安定したQA版だけ使う場合は特定の検証済みSHAで固定する。
- GitHub Pages公開サイトは誰でもアクセスできる可能性があるため、プレビュー用である旨と家計情報を外部送信しない旨を最初に表示する。
- `mudagiri.github.io`が既に別用途で使われていればそのまま上書きしない。別の公開用リポジトリを使う場合、現行アプリの絶対`/pilot/`ルートがプロジェクトサイトの`/<repo>/`配下で動作するかを**変更・検証したうえで**公開する。

## 完成条件

- GitHub Actions独立公開先で`deploy-pages`成功。
- Chromium/WebKitで同じ公開バンドルを使う第1章→第2章→第3章の通しQAが成功。
- 実URLをAndroid/iPhoneで開き、JOB画像、3グループ目的地、時の塔、追加1問、作戦書、相談窓口への復帰を確認。
- 家計・収入・健康情報、分析、予約・LINEなどが意図せず外部送信されない。

**現時点：ソースと手順は完成候補。独立リポジトリ作成・デプロイ・実端末確認は未実施。**
