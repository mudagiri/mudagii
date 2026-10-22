# 第2章額面年収の主導線化｜隔離プレビュー配信記録

更新日：2026-10-22

- ソースPR [#84](https://github.com/mudagiri/mudagii/pull/84)
- 第2章開発ブランチ `release/chapter12-latest-rpg-ui-first-20261016`、正本SHA `eacb072b253fae07d2d3f63a4a83ed43e86200ed`
- 検証対象GitHub Pages隔離プレビュー： https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

## 変更
- プロフィール内の額面年間収入を任意折りたたみから独立したRPG主導線へ変更。「住居 → 額面年収 → 月手取り」。診断スコープに一致する場合にのみ質問する。
- 単身：本人400万円未満/400〜499/500〜599/600万円以上/不明または回答拒否。家計全体：500万円未満/500〜599/600〜699/700〜799/800〜999/1,000万円以上/不明または回答拒否。
- 不明回答でも診断継続。単身400万円未満は2024年の現在確認済み同条件参照セルが存在しないため架空の同条件率を出さない。
- 引き継ぐのはProfileV4に既存の年収帯。年収1,000万円以上の詳細確認は結果で必要な場合だけ。世帯主年齢・勤労者・概数標本n>=50の公式統計ゲートは無変更。
- 月手取りと診断V1 FROZEN、確定改善額、未確定上限、GAS、LINE、共有額、第1章・第3章のコードは変更なし。

## 受け入れQA
- ソースPR latest-ui: SUCCESS（2026-10-22、GitHub Actions run 39742151469）。新年収ステップ→月手取り→診断→リザルト値引継ぎ、Chrome + iPhone WebKit実ブラウザ、320/390/430pxの結果横溢れ、年収1000万円超の3費目と追加7カテゴリの正常動作。
- 専用 Production GAS Configuration の既存Secrets不足によるFAILは本件とは独立。公式LINE/GAS本番GO状態を偽らない。

## 公開
このmainコミットは**文書だけ**を追加し、既存GitHub PagesのビルドとRestore Isolated Previewsをトリガーする。**mainのアプリはreleaseブランチ版で上書きしない**。公開後は `pilot/chapter2-v32/REVISION_SHA.txt` の内容が `eacb072b253fae07d2d3f63a4a83ed43e86200ed` に一致して初めて更新済みと判断する。

残課題：入口質問追加の実際の離脱率・回答率・面談予約CVの実測、実機iPhoneの目視、GAS本番設定。参照Issue #76。
