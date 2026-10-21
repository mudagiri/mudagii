# ムダギリ診断｜第2章 2024年同年代×世帯×年収データ原表修正・隔離プレビュー公開記録

2026-10-21

- ソースPR: https://github.com/mudagiri/mudagii/pull/82
- リリースブランチ: `release/chapter12-latest-rpg-ui-first-20261016`
- 新プレビュー対象SHA: `5f083a11233d7786b036192d9adf0f993e46ee75`
- 表示URL（**隔離のみ**）: https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

## 変更
2024年総務省「全国家計構造調査」e-Stat表1-29-1の公式元Excel二本で判明した**年収50万円区分と旧集計額の列ずれ**を修正。金額や平均可処分所得の原表セルを組み替え、既存の食費・光熱・日用品の年齢×年収比較を修正した。

同じ正本（元原表SHA二本＋所得見出し自動照合）から中所得・単身世帯の関連7分類（単身の教育を除く6分類）の参考費目率を抽出。年収帯が100/200万円幅の場合は原表50万円階級で確認した実測率の最小～最大とし、合成した単一の公式平均は作らない。年齢・世帯・額面年収・世帯主雇用状況・概数n>=50のゲートを維持する。

**入口プロフィールの額面年収の主設問化は次工程**。2024年数値訂正と表示は第2章のFROZEN判定ロジック・確定改善額・未確定上限・GAS・公式LINE・第1章/第3章へ変更を加えない。

## テスト
- Actions `Generate original 2024 income-aligned table`: SHAチェック＆原本所得列からの生成PASS。
- `Latest Chapter 1 × Chapter 2 V3.2 UI First Gate`: original joint scope, 7 related categories, browser integration Chromium + iPhone WebKit、high/mid/single synthetic QA = success。
- 専用 `Production GAS Configuration`: 既存本番Secret未設定でFAIL（こちらは依然公開GO条件外）。本番ルートのアプリは編集しない。
- ライブ確認は公開後に `pilot/chapter2-v32/REVISION_SHA.txt` が上記コミットと一致するか、1章と3章の孤立プレビューも残るか確認。

## 運用注意
元の統計費目と診断12カテゴリは完全一致しない。本人比率との差は節約見込みではない。相違の詳細はリリースブランチの `docs/CHAPTER2_2024_50MAN_ORIGINAL_ALIGNMENT_FIX_20261021.md` と Issue #76 を参照。

This main-branch commit is **documentation only**. It triggers the existing Pages root build, followed by Restore Isolated Previews. **Never replace `main` app code with the chapter2 release branch.**
