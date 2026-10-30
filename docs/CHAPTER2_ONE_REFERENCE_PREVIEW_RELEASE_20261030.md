# 第2章 V3.2｜比較を1つに絞るUI改修・隔離プレビュー公開記録（2026-10-30）

- 機能PR: https://github.com/mudagiri/mudagii/pull/102
- source: `release/chapter12-latest-rpg-ui-first-20261016`
- latest source SHA: `d518a45cbe1e0b416fa5bcc8666f365e84794c9d`
- isolated preview URL: https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

変更の目的：利用者に「比較は3種類あります」と複数の統計区分を解説するのではなく、最初に各カテゴリの本人支出・判定・根拠となる**主たる目安を1つだけ**見せる。

- 一覧の先頭から公式3費目・関連7・該当なし2という統計分類の見出しを除き、統計の対象差は「比較のルール・出典を見る（任意）」に移動。
- 関連公表費目（高所得・中所得・単身）の数値を折りたたみの**見出しから除外**し、開いた人だけが原表の参考率と費目範囲を見られる。
- 2025年の年収帯だけの独立した参考額は、2024年の同条件参考やアプリの判定目安と混同しないよう別条件の詳細に格納。
- 別母集団の参考値は「採用していない別条件の目安」であると明示。出典の値は捨てず、12カテゴリの診断コア・確定改善額・候補上限に一切加えない。
- JOB/STYLE、第1章・第3章、GAS、LINE、申込導線、本番トップのコードは変更なし。

QA: PR #102 Chrome/iPhone WebKit 第1章→第2章回帰、統計交差セルの欠損保護、公式参考率・個人差・節約額の分離、320/390/430幅検証、high income 1000+再選択の保護を実施。latest-ui PASS (workflow run 40982879546)。本番GAS Secret不足による既存の別job失敗は未解消のまま。

mainへのPRは**公開トリガー用のこの文書だけ**を追加。本番production rootアプリソースは変更せず、GitHub Pages Restore Isolated Previewsで第2章releaseのみを静的サイトへ反映する。完了後に `pilot/chapter2-v32/REVISION_SHA.txt` と上記SHAの完全一致を確認する。iPhone実機評価、ユーザーテスト、予約CV計測は未完了。
