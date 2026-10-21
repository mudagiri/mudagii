# 第2章 2024年公式原本7関連カテゴリ｜隔離プレビュー公開記録
日付：2026-10-21

## 対象
- 隔離版：`https://mudagiri.github.io/mudagii/pilot/chapter2-v32/`
- 対象開発ブランチ：`release/chapter12-latest-rpg-ui-first-20261016`
- PR: https://github.com/mudagiri/mudagii/pull/80
- マージSHA：`ab5c23dde3fa2a681e39e9a695d76db59917c274`
- 採録された公式原表：総務省2024年全国家計構造調査、第1-29-1表（二人以上勤労者世帯×世帯主年齢×額面年収帯×公表費目）、e-Stat `0004039867`

## 変更内容
- 公開元の原本Excel 2本をSHA-256で検証するGitHub QAを設置。
- 公式同条件の3カテゴリ（食料・光熱水道・家事雑貨/家事用消耗品）を維持したまま、高所得の原本標本n>=50セルの関連7カテゴリに公式**公表費目率**の数値と範囲注意を追加。
- 通信・車・娯楽交際・美容服飾・住居・保険・教育は**診断カテゴリと完全同一範囲の平均ではなく、各公式費目の参考率**。率の大小・支出差額はムダ・見直し候補額・確定改善額に算入禁止。
- 追加7カテゴリの公式率を表示するには、年収1000万円以上の詳細区分選択、本人年齢＝世帯主年齢確認、勤労者世帯確認のすべてが必要。単身や低標本の高所得区分へ流用しない。
- サブスク・自己投資は契約/用途監査を維持。

## QA
- 原本ファイルのダウンロード・検証・サンプル数/公表セル値検査：GitHub Actions `Chapter 2 Original 2024 e-Stat Source Inspection`（緑）。
- 第1章→第2章 Chrome／iPhone WebKit 、高所得関連7カテゴリの表示/非表示/罫線・横溢れ：`Latest Chapter 1 × Chapter 2 V3.2 UI First Gate` （UI job緑）。
- 第1章/第3章、診断ロジックV1 FROZEN、GAS、LINE、共有金額はコード変更なし。Production GAS Configurationジョブは既存の秘密変数未設定で別途未解決。

## release boundary
この `main` 変更は**文書だけ**。既存GitHub Pages Production `/` のアプリコードを開発ブランチで上書きしない。既存Pages配信後のRestore Isolated Previewsが完了し、`pilot/chapter2-v32/REVISION_SHA.txt` が上記SHAと一致した場合だけ隔離プレビューを更新済みと判断する。

第2章全体はまだ100%完成ではない。残りは単身・年収500〜999万円等の7関連カテゴリ拡張、正本12カテゴリ所有と対象範囲監査、4視点UX、実機iOS及び本番GAS公開ゲート。
