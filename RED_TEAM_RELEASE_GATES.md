# Release gates — fail closed
Do not call the service production-ready until all are true:
- [ ] GitHub Actions `npm run build` passes.
- [ ] Commit generated `package-lock.json`; workflow changed from `npm install` to `npm ci`.
- [ ] `VITE_MUDAGIRI_OPERATOR_NAME` and `VITE_MUDAGIRI_CONTACT` are real values, not placeholders.
- [ ] GAS `/exec` POST creates a row in Diagnoses_V2.
- [ ] Events_V2 records diagnosis_started, diagnosis_completed, result_viewed, line_clicked.
- [ ] future_goal_selected updates Diagnoses_V2.future_goal.
- [ ] Android and iPhone complete the full diagnosis without layout/input failure.
- [ ] LINE link opens the intended official account.
- [ ] Share card defaults to hiding money.
- [ ] No UI calls transformed benchmarks “official average”, “prefectural average”, or equivalent.
- [ ] If appointment conversion is enabled, post-LINE booking URL + completion signal/webhook are tested.

## Non-blocking archival improvement
- [ ] Optional: attach exact source workbook cell addresses to every transformed benchmark for future third-party audit. Model/source lineage and stress validation were already recovered; this is not a launch blocker.

## Non-blocking
- 運営者名 / 問い合わせ先は現行V1の公開ブロッカーではない。後から追加可能。
