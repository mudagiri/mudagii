# 第2章：比較条件の確認・変更統合｜隔離プレビュー公開管理

2026-10-22

- 機能PR: https://github.com/mudagiri/mudagii/pull/87
- release branch: `release/chapter12-latest-rpg-ui-first-20261016`
- Chapter 2 source SHA: `b8f02242d35dccf0088f2419cb63275dba8d477d`
- target isolated URL: https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

## 完了変更
- 入口の年収・年齢・世帯区分を、結果の「今回の比較条件」に一箇所で表示。
- 単身の年収再質問は廃止。編集欄は初期閉で、利用者の任意操作時だけ開く。
- 二人以上世帯の年収500万円未満〜1,000万円以上の大枠編集と、必要な1,000万円以上の詳細年収帯を一つの「比較条件を変更」に統合。元の年収値は自動引継ぎで選択済み。公式交差セルを勝手に補完・推計しない。
- 所得帯の変更は**画面の参考率だけ**。ProfileV4保存、V1 FROZEN engine、確定改善額、未確定上限、GAS/LINE、SNSシェア額、第1章/第3章には影響しない。
- 世帯主年齢の一致／雇用状況／標本概数n>=50は維持。全国の関連公表費目とアプリの12カテゴリは異なることを明示。

## QA / リリース条件
- Chrome + iPhone WebKit の第1章→第2章通し、単身入居時の年収自動反映、編集時の比較カード更新、変更時の参考表示のみの更新、年収1000万円以上の明細選択と低標本除外、320/390/430px表示QA。
- PR #87の `latest-ui` 成功と孤立プレビューの静的ビルドを確認する。
- **mainは文書のみ変更**：本番トップページアプリコードに第2章release branchを混入させない。
- 既存のGitHub Pages production build → Restore Isolated Previews が通過したのち、`pilot/chapter2-v32/REVISION_SHA.txt` を上記SHAと照合する。
- 実機iPhone QA・本番GASシークレット未設定・年収回答による離脱率等は残課題（Issue #76）。
