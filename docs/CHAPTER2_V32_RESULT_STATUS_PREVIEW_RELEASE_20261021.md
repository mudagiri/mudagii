# 第2章 V3.2｜判定状況・共有画像の表示是正（隔離プレビュー公開記録）
更新日：2026-10-21

## 公開対象と範囲
- `release/chapter12-latest-rpg-ui-first-20261016` のマージコミット：`4aa0ad7b18dcc73c754c5bd18f0b1b08abf136c5`（PR #73）。
- 対象：`https://mudagiri.github.io/mudagii/pilot/chapter2-v32/`（隔離プレビューのみ）。
- 既存 `main` 本番root / 第1章 / 第3章 / GAS の設定と診断コアは変更しない。この文書は公開記録であり、`main` のアプリコード変更は含めない。

## 修正理由
架空の単身・支出未把握ケースのブラウザ実操作で、`見極める10件・対象外2件` でも「12カテゴリ鑑定完了」と表示された。操作の完走は、12費目それぞれの改善余地が鑑定済みであるという意味ではない。

## 実装
- 第2章BATTLE REPORTのラベルは「12カテゴリの判定状況」。
- 共有画像の「12カテゴリ鑑定完了」を「12カテゴリをチェック」に統一（第1章JOBあり／なし）。
- 回帰テスト追加。第2章公式負担率の同条件比較、未確定候補、CONFIRMED改善額、LINE相談の意味論は不変。
- 第2章統合リリースブランチへのPRでもUIゲートを起動するよう、既存QA workflowのPRトリガーを追加。

## QA
- GitHub Actions run `39484779146`（マージ前の同一変更内容）：`latest-ui` SUCCESS、`Isolated V3.2 preview build` SUCCESS、`Existing Pilot Chapter 1 GAS Health` SUCCESS。
- 同Runの`Production GAS Configuration` FAILは既知・独立の本番設定課題。隔離ビルドではGAS送信無効。総合本番リリース合格と混同しない。
- Chrome / WebKitの第1章→第2章統合試験、320/390/430pxの確認、公式高所得帯3カテゴリの操作QAが含まれる。人の実機iPhone目視は別の残ゲート。

## 公開確認（必須）
1. 本番rootを維持する既存 Pages deploy → isolated preview restore workflow の順に実行する。
2. `/pilot/chapter2-v32/REVISION_SHA.txt` が `4aa0ad7b18dcc73c754c5bd18f0b1b08abf136c5` とHTTP 200で一致すること。
3. 第1章・第3章のpreview、rootが変更されていないことを検証する。
4. GAS本番設定と実機iPhone目視をクリアするまでは正式rootにV3.2を適用しない。
