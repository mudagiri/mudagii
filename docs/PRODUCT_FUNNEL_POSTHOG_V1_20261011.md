# ムダギリ診断｜PostHog匿名ファネル実装・計測契約 V1

更新日: 2026-10-11 / PR #39 （本番未公開）

## 対象と境界
第1章（お金の性格診断）と第2章V3.1（家計診断）で発生した **ブラウザで確認できる操作イベントのみ** を追跡する。個別の家計金額・名前・連絡先・住所・回答原文・診断ID・GAS送信データは PostHog に送らない。

- 実装: `src/product-funnel-analytics-v1.ts`
- 許可リスト外のイベント名と任意プロパティは破棄。
- 匿名識別子: 当該ブラウザタブ内のランダムセッションID（sessionStorage）、個人プロファイルは作成しない設定。
- ホスト: 設定した PostHog 公式 `https://us.i.posthog.com` または `https://eu.i.posthog.com` のみ。
- 自動収集、セッションリプレイ、画面入力取得、フォーム・クレジットカード情報収集のコードは導入しない。
- `VITE_MUDAGIRI_ANALYTICS_ENABLED=1`、`VITE_POSTHOG_PROJECT_KEY=phc_...`、`VITE_POSTHOG_HOST=https://<region>.i.posthog.com` の3設定が全て揃うまで送信しない。
- `/pilot/` 以下は原則計測しない。実際のパイロット計測を許可する際だけ `VITE_MUDAGIRI_ANALYTICS_ALLOW_PILOT=1` を設定し、テスト／本番プロジェクトを必ず分離する。
- **利用者の明示的な計測同意が必須**。 `localStorage['mudagiri_analytics_consent_v1']==='granted'` の場合だけ送信する。未設定・拒否・Storage拒否はすべてOFF。許可以前の行動は遡って送信しない。UIは `src/ProductAnalyticsConsentV1.tsx` に実装済み。ただし同意UIと実際のPostHog送信はそれぞれ明示的な環境設定が必要で、実データの取り込みはまだ開始していない。
- 送信bodyを専用の純粋関数で構築し、金額、診断ID、回答、メール等の任意属性を混入させない。JavaScript組込みのプロトタイプキーもイベントとして認めない。
- アプリ側の保存・復帰と従来のGAS送信処理には介入しない。送信失敗はUXをブロックしない。

## ブラウザ計測イベント

| イベント | トリガー | 意味 |
|---|---|---|
| `mudagiri_chapter1_started` | 第1章開始 | 初回開始 |
| `mudagiri_chapter1_completed` | 第1章結果表示 | 結果を見たセッション（構成比算出の分母） |
| `mudagiri_chapter1_share_attempted` | 第1章共有開始 | 共有操作の試行 |
| `mudagiri_chapter1_bonus_preview_opened` | 攻略ガイド案内表示 | 特典案内を開いた |
| `mudagiri_chapter1_line_outbound_clicked` | 公式LINEへ遷移操作 | 友だち追加済みではない |
| `mudagiri_chapter1_household_cta_clicked` | 第2章へ進む | 第2章への意向 |
| `mudagiri_chapter2_started` | 第2章開始 | 家計診断開始 |
| `mudagiri_chapter2_completed` | 第2章診断結果生成 | 家計診断完了 |
| `mudagiri_chapter2_share_attempted` | 第2章シェア操作 | 投稿・送信の成功とは限らない |
| `mudagiri_chapter2_share_exported` | 保存またはOS共有シートから復帰 | 実際の投稿数ではない |
| `mudagiri_chapter2_consultation_modal_opened` | 相談案内表示 | 相談への関心 |
| `mudagiri_chapter2_line_outbound_clicked` | 第2章からLINEへ遷移操作 | 予約完了ではない |

## 絶対にブラウザ側では発行しないCV
1. **公式LINE友だち追加完了**: LINE公式アカウント側の webhook / 管理システムイベントでのみ確認する。
2. **攻略ガイド受取完了**: 配信システムの実際の受取／配布確認記録でのみ確認する。
3. **面談予約完了**: 予約システムの予約確定イベントをサーバー側で記録する。キャンセル／重複予約は除外。
4. **有効面談実施**: 面談管理側の結果確定で計測する。

これらのサーバー側イベントと第1/2章の匿名セッションを結びつけるには、ユーザーに事前に説明した上で **ワンタイム計測コード** をLINE側で受け渡す方式を別途設計する。生の診断IDや家計データをURLに含めない。単なる `line_clicked` を予約完了として流用しない。

## ダッシュボード（受信イベントを確認した後に作成）
- 第1章開始→第1章完了（完了率）
- 第1章完了→特典案内→公式LINE遷移
- 第1章完了→第2章進行→第2章完了
- 第2章完了→相談案内表示→LINE遷移
- シェア試行→共有シート復帰／画像保存、およびUTM別流入
- LINE友だち追加・特典受取・面談予約完了（※サーバー確認ができてから）
- 少数サンプル時にCV率を実績として断定しない

## 残作業
- PostHogの対象プロジェクト・データ保存地域・公開プロジェクトキーを確認し、Vite環境変数をGitHub Actionsの対象ビルドに限定注入（プレビューは無効のまま）。
- 同意UIは「同意する／同意しない／後で閉じる」、いつでも再表示できる「計測設定」と撤回操作を実装。今後は実ユーザーの文言・読了理解とiPhone/Android実機の見え方を検証する。
- 同意UI専用のレビュー環境 `/pilot/chapter2-v31-consent/` を構築（PostHogキー空・GAS空・pilot計測禁止）。ここでの同意操作では分析データは送信されない。
- 専用CIで、320/390pxの表示、拒否時送信0件、明示同意後の匿名イベント1件（ネットワークをPlaywrightで完全遮断し擬似送信）、撤回後の送信停止と匿名セッション削除をChrome/WebKitで検証する。
- LINE公式アカウント側からの友だち追加／配布イベントの受け口と予約システム連携。
- iPhone Safari / Android Chrome 実機確認とPostHogライブイベント確認。
- 本番デプロイは承認されるまで行わない。
