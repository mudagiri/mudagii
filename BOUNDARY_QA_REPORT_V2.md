# ムダギリ診断 V2 — Boundary QA Report

## Result
20/20 PASS

## Checked boundaries
- Mobile: 4,000円を境界とし、4,000円以下は自動改善額0。超過部分のみ80%。
- Energy: Comparable 120%までは自動改善額0。120%超過部分のみ60%。
- Daily: Comparable 130%までは自動改善額0。130%超過部分のみ40%。
- Lifestyle: verySatisfied は改善額0を強制。
- NeedsReview: insurance / childEducation / selfDevelopment は自動改善額を作らない。
- Rent: Comparable 125%超または手取り比35%超はレビュー対象にできるが、自動改善額は0。
- 5-year: monthly × 60 の単純算術のみ。
- Income adjustment: multi household 500万円+ は連続補間。所得帯の段差を作らない。
- Single household: 薄い標本からの所得補正を行わない。
- Region: multi household のみ。food は地域差を50%に減衰、energy は地域係数を使用。
- Missing comparable: nullのまま扱い、比較差額や改善額を捏造しない。
- Invalid values: negative/non-finite actual/comparable を拒否。
- BattleScore: 0–100 clamp。negative FCF penalty は連続式。

## Product decision
境界直上で1円単位の推定改善余地が出ることは数学上あり得るが、UI上は小額を敵として強調しない。EnemyPriority と表示側の最小表示ルールでノイズ化を防ぐのが望ましい。

## Remaining pre-V1 checks
1. React production build/typecheck
2. 実ブラウザ mobile viewport QA
3. 主要端末で数値入力・キーボード・戻る操作QA
4. LINE URL / analytics / UTM production wiring
5. 最終文言・法務表現QA
