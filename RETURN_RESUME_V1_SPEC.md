# RETURN / RESUME V1 — Implementation Specification

Status: IMPLEMENTATION SPEC / pending
Date: 2026-09-30

## Goal
LINE/share/browser round trips must not erase the user's completed diagnosis. Interrupted diagnoses should be resumable without corrupting a completed Result.

## 1. Two separate persistence objects
Never use one blob for both draft and completed Result.

### A. Active journey draft
Storage key: `mudagiri_journey_draft_v1`
Purpose: resume an unfinished diagnosis.
Minimum shape:
- schemaVersion: `MUDAGIRI_JOURNEY_DRAFT_V1`
- diagnosisId
- anonymousUserId
- updatedAt
- toneMode
- scene
- profile flow + profile indices
- annualIncomeBand
- scanIndex / rawExpenses / scanTouched
- appraisalIndex / appraisalAnswers
- typeIndex / typeAnswers
- battle progress only if safe to restore
- methodology/resolver/type versions

### B. Completed result
Storage key: `mudagiri_active_result_v1`
Purpose: restore the exact completed Result after reload or external navigation.
Store the canonical completed diagnosis snapshot/input sufficient to rebuild Result VM deterministically. Prefer storing the canonical diagnosis snapshot and rebuilding VM with current compatible code rather than persisting React UI state.

Minimum:
- schemaVersion: `MUDAGIRI_ACTIVE_RESULT_V1`
- diagnosisId
- anonymousUserId
- completedAt
- compatible versions
- completed diagnosis snapshot / finalJudgements / Type inputs required to rebuild Result

## 2. Startup decision
On app bootstrap:
1. Read completed result.
2. If schema/version compatible and complete -> restore Result immediately.
3. Else read journey draft.
4. If compatible and meaningful progress exists -> show a compact resume choice: `続きから再開` / `最初から`.
5. Else start Opening normally.

A valid completed Result always wins over an unfinished draft for the same diagnosis.

## 3. External round trips
Before opening LINE or invoking share:
- ensure completed Result has already been persisted synchronously to localStorage
- do not clear active result
- do not issue a new diagnosisId on page mount if a restorable active result exists

On return/reload:
- rebuild the same Result
- preserve diagnosisId
- scroll to top of Result unless a safe result-scroll restoration is explicitly implemented
- emit `result_restored` once per restoration session
- do not emit a new `diagnosis_started`
- avoid treating restoration alone as a new diagnosis completion

Native share cancel:
- remain on Result
- do not mark share_completed
- do not clear state

LINE click:
- persist first, then navigate
- existing `line_clicked` remains a click event; returning is not a second line click.

## 4. Explicit restart
Only the explicit Result action `診断をやり直す` or resume-choice `最初から` may intentionally reset.
Reset sequence:
1. clear journey draft
2. clear active result
3. create a NEW diagnosisId
4. return to Opening
5. preserve anonymousUserId and acquisition identity as appropriate

Never silently restart because of visibilitychange, pageshow, popstate, reload or external-app return.

## 5. Draft checkpoint policy
Write after meaningful user state transitions, not on every render:
- tone mode chosen
- each profile answer
- income band chosen
- each scan answer
- each appraisal answer
- each Type answer
- safe scene transitions

Debounce text/numeric input if saving during typing; final answer/Next action must force a checkpoint.

Do not persist animation timers or transient reveal phases. Resume to the stable input/scene boundary.

## 6. Compatibility
Draft/result must carry schema and core methodology versions.
If incompatible:
- never attempt partial silent migration unless an explicit migration exists
- keep analytics storage separate
- discard/ignore incompatible draft safely
- for incompatible completed Result, offer `診断結果を更新するため再診断` rather than displaying potentially wrong calculations

## 7. Storage / privacy
Local storage contains financial inputs. Do not expose them in URL/query/hash or share payload.
Do not copy draft/result data into analytics events.
Provide an explicit restart/reset path.
Server/GAS persistence remains separate from local resume behavior.

## 8. Analytics semantics
Add:
- `journey_resume_offered` {scene}
- `journey_resumed` {scene}
- `journey_restarted` {from:'draft'|'result'}
- `result_restored` {source:'reload_or_return'}

Do not include amounts, prefecture, income, Type answers or appraisal answers in these events.

## 9. QA acceptance matrix
Must pass:
1. Complete -> reload -> same Type/result/diagnosisId.
2. Complete -> LINE -> browser return -> same Result.
3. Complete -> native share -> return -> same Result.
4. Cancel native share -> Result unchanged; no share_completed.
5. Mid PROFILE -> reload -> resume offer -> exact stable question.
6. Mid Scan -> reload -> resume offer -> prior answers retained.
7. Mid Appraisal -> reload -> resume offer -> prior answers retained.
8. Mid Type -> reload -> resume offer -> prior answers retained.
9. Resume -> finish -> one coherent diagnosisId.
10. Explicit restart -> new diagnosisId, old draft/result not restored.
11. Corrupt JSON -> app opens safely.
12. Old schema -> safe re-diagnosis path.
13. Restoring Result does not emit diagnosis_started.
14. Financial values never appear in URL/share.
15. Existing diagnosis/result persistence and GAS sending remain functional.

## 10. Implementation boundary
Likely touch:
- `MudagiriAppV2.tsx`
- `RpgBlock1.tsx`
- new `resume-state-v1.ts`
- Result V4 restart/LINE/share actions
- new `qa-resume-v1.ts`

Do not change benchmark resolver, diagnosis math, Type scoring or encounter rules to implement resume.
