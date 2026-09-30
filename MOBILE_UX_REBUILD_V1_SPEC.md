# MOBILE UX / UI REBUILD V1
Status: REQUIRED BEFORE RESULT V4
Date: 2026-09-30

## 0. Why this exists
Real Android Chrome regression observed in PROFILE:
- Mudagiri character overlaps the question title.
- Dense fixed-height composition forces content collisions.
- Taps feel delayed / unreliable.
- Decorative/absolute layers create unnecessary hit-test risk.
The fix is NOT a local Q4 patch. Audit Opening -> Mode -> PROFILE -> Scan -> Type -> Appraisal -> Battle -> Result as one mobile interaction system.

## 1. Product priority
Interaction clarity > diagnosis trust > RPG delight > decorative density.
Never preserve an animation or fixed-screen composition at the cost of tap response, readable copy or completion rate.

## 2. Responsive shell
Baseline remains 390x844, but 375-430px width and real mobile browser visual viewports are mandatory.
Do not assume 100dvh equals usable content height while browser chrome / keyboard is present.

Use:
- outer RPG stage/background
- safe-area aware top progress
- non-interactive character/effects layer
- interactive content layer
- bottom navigation only when it does not cover content

### Conditional scrolling
Opening may remain fixed when it fits.
All question scenes MUST be allowed to become vertically scrollable when content does not fit.
Preferred model:
- background remains visually stable
- content/card owns overflow-y:auto
- no body horizontal scroll
- preserve a one-scene feeling
- never shrink essential text/buttons just to avoid scrolling
- bottom CTA must not cover the last answer
- add scroll-padding-bottom for safe area/CTA

## 3. Four-layer contract
L0 background
L1 characters / effects / decoration
L2 copy / information
L3 interactive controls

L0/L1 must use pointer-events:none unless intentionally interactive.
L3 owns all taps.
No invisible decorative box may overlap L3 hit areas.
Define explicit z-index tokens; do not solve individual collisions with arbitrary escalating z-index values.

## 4. Character collision rules
Characters may support the scene, never cover:
- question number
- question title
- helper copy
- inputs
- answer buttons
- primary CTA
- back navigation

Reserve a character zone. On short viewports:
1. reduce character size,
2. move character into reserved non-content space,
3. crop decorative portion,
4. hide nonessential character if necessary.
Never overlap text as the fallback.

Speech bubble and character are one decorative group and must have bounded layout ownership.

## 5. Tap responsiveness contract
Target: visible pressed/selected feedback on the same frame / effectively immediate (<100ms perceived).
- touch-action: manipulation on interactive controls.
- minimum target 48x48 CSS px; preferred answer row 52-56px.
- no deliberate delay before showing selection feedback.
- remove unnecessary 140ms/timeout navigation delays.
- if a short transition is retained, selection feedback occurs immediately and navigation/animation runs concurrently.
- do not lock the whole scene before feedback is painted.
- prevent double-submit with idempotent handler/state, not a dead-feeling global overlay.
- no 300ms legacy click behavior assumptions.
- buttons use native button semantics.
- pressed state must be visually obvious.
- keyboard focus-visible retained.

For one-tap choice screens:
tap -> immediate selected state -> advance immediately or next animation frame.
Do not require a second tap unless the product explicitly needs confirmation.

For money/text inputs:
input -> explicit Next remains acceptable; Enter/Done should submit when valid.

## 6. Screen-by-screen rebuild

### Opening
Keep cinematic fixed hero if it fits.
One dominant CTA.
CTA always above safe area and unobstructed.
No invisible monster/character layer may intercept CTA.

### Mode Select
Cards large enough for thumb.
Immediate selection feedback.
Do not wait on decorative reaction before advancing; reaction may animate concurrently.

### PROFILE
Highest priority regression area.
- Q1/Q2/Q6 input/select: copy + input + CTA in normal document flow.
- Q3/Q3+/Q4/Q5/Q7 one-tap choices: no fixed CTA needed after selection.
- character sits outside question text column.
- helper copy may wrap naturally.
- choice grids collapse from 2/3 columns to fewer columns if labels become cramped.
- if vertical fit fails, card scrolls.
- progress stays visible without stealing taps.

### Scan
Amount input remains the only initial task.
Enemy reveal must not delay the next actionable state unnecessarily.
Prefetch may improve visual loading but must not block input.
Numeric keypad / visual viewport must not hide CTA.

### Type Quiz
Virality-critical; prioritize rhythm.
Two-choice answers should feel instant.
VS separator must never overlap either answer.
Tap feedback immediate; next question transition may animate after state commit.
Keep progress honest.

### Appraisal
Question complexity varies; scroll is allowed by default.
Do not compress long evidence questions into tiny controls.
Primary action follows content flow or uses a safe sticky footer with reserved bottom padding.

### Battle
Animation is reward, not a gate.
Skip/continue affordance when animation exceeds a brief moment.
Priority-check enemy uses normal/check semantics, confirmed saving alone uses defeated semantics.

### Result
Scroll is expected.
Follow RESULT_V4_SPEC.md.
No sticky element may cover evidence/share/LINE controls.

## 7. Motion
Respect prefers-reduced-motion.
Avoid input blocking during decorative transitions.
Animations should normally use transform/opacity, not layout-thrashing properties.
No animation may be required to finish before a valid tap can register unless it prevents an actual duplicate mutation.

## 8. Performance / tap perception
Audit:
- large PNG decode near interaction
- synchronous heavy calculations in click handlers
- unnecessary rerenders caused by unstable callbacks
- timers around state transitions
- overlays with pointer events
- double event handlers
- loading states without immediate feedback

Diagnosis calculation may run after immediate UI acknowledgement where semantics permit.

## 9. Viewport QA matrix
Mandatory manual/browser emulation:
- 375x667 short viewport
- 390x844 canonical
- 412x915 common Android
- 430x932 large phone
- Android Chrome with browser bars visible
- iOS Safari safe areas
- numeric keyboard open on amount inputs
- text scaling 100% and at least 120% sanity check

At each viewport:
- no copy/character/control collision
- no clipped required action
- no horizontal scroll
- last answer reachable
- back control reachable
- tap target >=48px
- immediate visual feedback
- scroll, if present, is obvious/natural

## 10. Automated/static QA
Add mobile UX regression checks where practical:
- decorative classes pointer-events:none
- interactive targets not nested under pointer-events:none
- no fixed bottom CTA without reserved content padding
- PROFILE one-tap choices have no artificial timeout gate
- Result remains scrollable
Visual screenshot regression is recommended for canonical viewport states.

## 11. Three-lens audit
Behavioral economics:
- remove interaction friction and false waiting
- preserve truthful progress
- progressive disclosure rather than compressed density

Psychology:
- every tap must acknowledge the user immediately
- no uncertainty whether a tap registered
- characters feel supportive, not obstructive
- scrolling is preferable to cramped/overlapped information

Marketing:
- completion rate outranks decorative fixed-screen purity
- Type quiz rhythm must be especially fast
- preserve share/result excitement after a frictionless journey

## 12. Acceptance definition
Do not call the UI rebuild complete until every journey screen passes the viewport matrix and a real-device-like Android Chrome pass.
The observed PROFILE overlap is a release blocker, not cosmetic polish.
