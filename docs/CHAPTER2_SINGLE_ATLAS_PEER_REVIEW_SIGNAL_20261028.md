# 第2章 V3.2｜重複した公式比較サインを12カテゴリAtlasに統合

2026-10-28

- 実装PR: https://github.com/mudagiri/mudagii/pull/100
- 実装先: `release/chapter12-latest-rpg-ui-first-20261016`
- 第2章ソース正本 SHA: `de9b7c086baea2d1968c73d66c18e0b6fe9f6397`
- 隔離プレビュー: https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

## 改善の理由

最新12カテゴリ一体型の結果画面で、公式2024年の同年代×単身/二人以上×年収帯の比較による追加確認項目を「PEER_REVIEW_SIGNALS」という別リストとして**12カテゴリ一覧の直前に重複表示**していた。

公式データを検証したカテゴリの1行に `data-peer-review-signal` を添える方式へ移し、重複リストを削除。厳格な元表参照・標本条件・世帯主年齢・勤労者ステータス・診断と公式費目の金額範囲のゲートは同じ。別の「改善可能金額」を生成しない。

1. 上部に別リストを作らず、12カテゴリの各行に**「参考率より高め · 内訳を確認」**を示す（条件成立時のみ）。
2. 本人負担率・公表参考率・差のpt、説明、円換算、出典は**当該カテゴリをタップして展開**した後に表示する。数値・引用表は変更しない。
3. 公式交差参照の未対応・欠損・低標本・世帯主未確認ではサイン自体を非表示にする。確認撤回で速やかに消す。
4. `confirmedA`・`cUpper`、判定状態、2024年統計原本、Chapter1 JOB/STYLE、Chapter3、GAS、LINEと共有金額は変更しない。

## QAと公開条件

- [x] 第2章 PR #100 browser QA run `40640957627`: `latest-ui SUCCESS`、Chrome/ iPhone WebKit第1章→第2章完走、Chrome/WebKit高所得帯の負担率差サインと同一母集団ゲート、確認撤回、320/390/430pxの幅、外部送信なしを検査。
- [x] Isolated V3.2 preview static build SUCCESS。
- [ ] 本番ページの回帰・Visual SmokeがPASS。
- [ ] Pagesへ配信後のRestore Isolated Previews runで `REVISION_SHA.txt` が正本SHAと一致し、他の章が保持されること。
- [ ] 実機iPhoneと実測完走率・LINE面談予約完了率、本番GAS設定は残課題。自動QAの成功だけでUX100点や本番GOと判断しない。

**この変更は本番rootのアプリコードに適用しない。mainにはこのdocsファイルのみ追加し、既存のPages→隔離プレビュー復元ワークフローを安全に起動する。**
