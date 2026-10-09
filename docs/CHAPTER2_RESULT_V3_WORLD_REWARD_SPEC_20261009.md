# 第2章リザルト V3 — 既存背景 × RPG戦果報酬

更新日: 2026-10-09 / 状態: CANDIDATE（未公開）

## 原則
第1章の公式JOB画像、ギルド背景、ムダギリくんポーズを再利用する。黒いダッシュボード背景への置換はしない。第2章V1診断ロジック、12カテゴリ、benchmark、Battle、Resume、GASは変更禁止。

## 採用アセット
- Hero: `assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp`
- 案内役: `assets/mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp`
- JOB: `job-character-assets-v1.ts` の公式8JOB画像。匿名ID一致の第1章handoff時のみ表示
- 相談: `assets/mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp`
- 詳細: 既存12体の敵画像を使用

## 画面順
1. ギルドで「家計クエスト完全クリア！」とムダギリくん
2. JOB画像つき「引き継いだ冒険者」（新しい称号は獲得しない）
3. 深緑半透明のギルド戦果報告。確定改善と未確定の調査余地を明確に区別
4. 1年・5年・10年の「未来の戦利品」を常時表示。10年最大／金色のフレーム
5. 明るい門の背景でライフプラン相談案内
6. 最優先の1アクション→敵図鑑→目指す未来→共有

## 金額の意味
`vm.potential.confirmedA` のみを使う。
1年 = 月額×12、5年 = 月額×60、10年 = 月額×120。単純累計で将来の保証や運用益ではない。
`cUpper`は未確定の別枠に残し、年次数字へ掛けたり確定額へ加えたりしない。
`confirmedA=0`の場合はゼロを派手に見せず「確認できる改善額はまだない」と案内。
基準平均との差をムダ額と呼ばない。

## 4視点
- 行動経済学：戦果→未来→次の行動を明確化。アコーディオン内に重要数字を隠さない
- 心理学：JOB画像で自己同一化。ムダギリくんは祝福し、責める表現を避ける
- マーケティング：未来インパクト直後に相談CTA。LINEクリックを面談予約と誤認させない
- バズ理論：既存背景とJOBで共有映え。ただし共有カードには金額・属性・JOBを自動掲載しない

## 完了条件
320/375/390/430px、Chrome/WebKit、JOB8種類、引継ぎなし、confirmed=0と正値、再読込、共有を検証。本文16px前後、注記14px以上、タップ48px以上。`prefers-reduced-motion`を尊重。V3はDraft PRに隔離し、承認前に本番/Hidden Previewを更新しない。
