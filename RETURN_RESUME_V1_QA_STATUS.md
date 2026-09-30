# RESULT / RETURN-RESUME V1 QA STATUS
Date: 2026-09-30
Status: CODE-LEVEL PASS / browser-device verification pending

## Code-level acceptance
- [x] Completed result stored separately from journey draft.
- [x] Completed result wins over unfinished draft on bootstrap.
- [x] Completed result restores same diagnosisId.
- [x] Restore emits result_restored instead of diagnosis_started.
- [x] Explicit restart clears resume state and creates a new diagnosisId.
- [x] Mid PROFILE checkpoint supported.
- [x] Mid Scan checkpoint supported.
- [x] Mid Appraisal checkpoint supported.
- [x] Mid Type checkpoint supported.
- [x] Dynamic Scan/Appraisal index is clamped on restore.
- [x] Corrupt JSON rejected safely.
- [x] Old schema rejected safely.
- [x] Unstable animation/battle scenes are not persisted as draft checkpoints.
- [x] Share payload URL contains ref + type only; no financial/profile values.
- [x] Native share AbortError does not emit share_completed.
- [x] LINE/share call persistence guard before external navigation.
- [x] journey_resume_offered / journey_resumed / journey_restarted / result_restored semantics added.

## Still requires real browser/device verification
1. Complete -> reload -> same Result/type/diagnosisId.
2. Complete -> LINE -> browser return -> same Result.
3. Complete -> native share -> return -> same Result.
4. Native share cancel -> same Result and no share_completed.
5. PROFILE/Scan/Appraisal/Type reload -> resume choice -> exact stable boundary.
6. Resume -> complete -> one coherent diagnosisId.
7. Explicit restart -> old result/draft does not reappear.
8. Production GAS/persistence still receives normal diagnosis/lead/event writes.

Do not mark RETURN_RESUME_V1 FROZEN until browser/device checks above pass.
