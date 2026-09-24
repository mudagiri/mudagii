# 3-mode E2E QA

Modes:
- gentle = やさしめ斬り
- serious = 本気斬り (recommended/default)
- hell = 地獄斬り

Hard invariant:
For identical financial/profile/type/satisfaction inputs, changing only tone mode MUST NOT change:
- comparable values
- type code
- needsReview
- protected/cut bucket membership
- monthly/yearly/5-year improvement
- Battle Score

Mode MAY change only presentation/copy/mascot/animation emphasis.

Current runtime path:
intro selection -> toneMode state -> BattleSequenceV2 -> ResultScreenV2 -> LINE copy context.
`diagnosis_started` and `diagnosis_completed` record the selected mode. Diagnosis facts now also persist toneMode for analytics.

Adversarial cases to verify in browser:
1. Single, low improvement, high satisfaction: no mode may manufacture a scary waste claim.
2. Single, unused subscription + high mobile: all three modes return identical yen results.
3. Couple/children, insurance + education: all three modes keep needs-review, never auto-cut.
4. High-income household: hell mode may be harsher in wording but cannot inflate reducible.
5. Unknown expense: unknown amount is excluded from free-cash-flow arithmetic; no stale entered amount may penalize resilience.
6. Switch gentle -> hell -> serious before start: final persisted mode must be serious.
7. Back navigation must not reset selected mode.
