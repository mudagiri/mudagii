# ムダギリ診断｜LINE・面談予約の検証済みCV接続契約 V1

状態：設計完了／プロバイダー側Webhook接続は未完了／本番未公開
更新：2026-10-11

## 目的と判断基準
最終CVは **ライフプラン相談の予約確定**。ブラウザ内のCTAクリック、LINE外部遷移、友だち追加、仮予約のいずれも「予約確定」として加算しない。

## イベントと信頼できる発生源

| 事象 | 正しい発生源 | 分析イベント案 | 集計単位 |
|---|---|---|---|
| LINEへの遷移操作 | 診断ブラウザ | mudagiri_chapter2_line_outbound_clicked | 匿名セッション |
| 友だち追加・ブロック解除 | LINE公式アカウントの署名付きWebhook | mudagiri_line_follow_verified | LINE webhook event IDで重複排除 |
| 特典の配信成功 | 配信システムの送信成功ログ | mudagiri_line_guide_delivery_verified | 配信ジョブID+特典ID |
| 予約確定 | 実際に使う予約システムの署名付きWebhook | mudagiri_consultation_booking_confirmed | 予約ID |
| 予約キャンセル | 同じ予約システムの署名付きWebhook | mudagiri_consultation_booking_cancelled | 予約ID |
| 面談実施 | 面談管理の完了ステータス | mudagiri_consultation_held_verified | 面談ID |

## 計測連結（個人の家計情報は送らない）
1. 第1章・第2章で匿名の計測セッションIDを使い、家計の入力値／診断IDは分析へ送らない。
2. LINE遷移の前に計測専用の一回限りのランダムコードをサーバーで生成し、期限付き・一度限り・用途限定で保存する。
3. LINE内で専用コードを受信したことを署名付きWebhookで確認できた場合だけ、**利用者に目的を説明し同意を取得した連結**を行う。LINEのユーザーIDは保護されたサーバーに保持し、PostHogイベントへ送らない。
4. 予約確定をサーバー側から検証したら同じ匿名計測キーで confirmed イベントを発行する。取消・重複・期限切れは明示的に除外／別イベント処理する。
5. LINE公式アカウントの通常友だち追加URL `https://lin.ee/ol9c2rJ` だけでは診断セッションを確実に引き継げない。コード連結を実装しない段階では「LINEクリック → 予約確定」の個人別ファネルを成立したとみなさない。

## Webhook APIの安全要件
- 公開Webサーバーを用意する。GitHub Pagesは静的ホスティングなのでWebhookを受信できない。
- LINEから受ける署名はプロバイダー仕様に従って **raw bodyで検証**し、検証前にビジネス処理や計測送信をしない。
- 予約システム側のリクエストも正規の署名検証・リプレイ防止・予約IDによる冪等化を実装する。
- LINE公式のチャネルシークレット／予約システムWebhookシークレットをGitHubのソースやVITE変数に配置しない。サーバー側環境設定にのみ保持する。
- ファネル計測には個別の家計結果、回答、電話番号、メール、LINEの生IDを含めない。
- リダイレクトの成功とWebhookの受信、連結可能性、予約完了は別々に監査する。

## 導入前に確定が必要な外部情報
- 現行LINE公式アカウントで Messaging API / webhook が利用できるかと、実際の特典配信の方式
- 面談予約の実サービス（Calendly / Google Calendar / LINE自動応答 / CRM等）
- 公開サーバーの実行環境（Cloud Run / Cloudflare Workers / GAS WebAppなど）とセキュリティ・保管ポリシー
- 利用者の計測同意UI・同意撤回と匿名トークン保存の運用

**上記が決まる前に、予約完了イベントをブラウザ側で捏造・代用してはならない。**
