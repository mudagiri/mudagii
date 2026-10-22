# 第2章V3.2「12カテゴリ比較」4視点監査｜隔離プレビュー公開台帳

2026-10-23

- 実装・QA：PR #89 https://github.com/mudagiri/mudagii/pull/89
- 第2章リリース正本 `release/chapter12-latest-rpg-ui-first-20261016`
- 今回の第2章source SHA：`f1e0dcbaebed43db38c988ec597682b88ef68ce7`
- 隔離プレビュー：https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

### 変更
- 12カテゴリで公表費目の利用可否を透明化。条件がそろえば直接参考になる公表3費目、7カテゴリの**似ているが範囲の異なる公表費目**、単独公式費目なし2カテゴリを明確に区別。
- 二人以上の世帯を「同世帯」＝家族人数完全一致と読ませないよう、単身／二人以上の**世帯区分**と明示。
- 高額所得の関連7カテゴリについて、デフォルト展開の詳細資料を折りたたみへ変更。中所得/単身も同じ表示規則で、先頭の関連公表費目の平均負担率のみコンパクト表示。**診断カテゴリと同一の平均ではない**と毎カードに表示。
- 値そのもの、出典原本、最低標本数、年齢・勤労者ゲート、FROZEN家計診断、確定改善額、参考上限、GAS、LINE、シェア金額、JOB/STYLE/第3章は変更なし。

### QA
- PR #89 head `90275e39e6f09ded9e07f8586400e87e6f3a441a` の GitHub Actions `Latest Chapter1 × Chapter2 V3.2 UI First Gate` run `39840444120`： latest-ui SUCCESS / isolated preview build SUCCESS。Chrome + iPhone WebKit、2024年公式交差セル、合致しない年収・標本数の非表示、関連費目の初期閉・展開後の出典、320/390/430px横幅溢れなしを検証。
- 既存の専用本番GASシークレット不足のみ独立したFAIL。今回のPRでGAS設定を偽って解消扱いしない。
- 4視点のヒューリスティック評価と未実測KPI：releaseブランチ `docs/CHAPTER2_RESULT_FOUR_LENS_AUDIT_20261023.md`。実機iPhoneと予約CVの検証が終わるまで完成100点は保留。

### デプロイ境界
このmainへのPRは**文書1ファイルのみ**を追加。GitHub Pages→Restore Isolated Previewsで最新の第2章を再ビルドするための安全なトリガー。本番rootのアプリコード・第1章・第3章のコードは触らない。

公開成功の証拠：`pilot/chapter2-v32/REVISION_SHA.txt` が `f1e0dcbaebed43db38c988ec597682b88ef68ce7` と完全一致すること。同期プレビューと本番rootのHTTP200も確認すること。
