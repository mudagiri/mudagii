# MUDAGIRI pre-publish QA

## PASS
- TYPE_MODEL_V3_1_8 active; legacy 16-type runtime references removed/isolated.
- 65,536 effective V3.1 answer patterns exhaustively checked previously; all 8 types reachable.
- New V2 persistence stores 3 axes only (FV/PI/AU), strengths, near-middle flags, and raw type answers.
- 12 enemies x 3 states = 36 production state assets present.
- 11 canonical silver-axe mascot assets present.
- 6 brand assets present.
- Literal runtime asset references resolve; root `/assets/` references removed.
- Official LINE URL wired: https://lin.ee/ZeLu7i6.
- Share amount privacy defaults ON.
- Appointment CTA is conditional on VITE_MUDAGIRI_APPOINTMENT_URL.
- GAS V2 creates Diagnoses_V2 / Events_V2 / Meta and does not delete old sheets.
- LINE callback type mismatch found during TypeScript audit and fixed; click context now reaches persistence.
- `lucide-react` dependency removed; small UI icons use native text/emoji to reduce dependency surface.

## EXTERNAL / NOT CLAIMED AS PASS
- Full Vite production build: package download is unavailable/timing out in this execution environment. Global TypeScript audit was used to expose local source errors, but React/Vite modules are not installed here.
- Live GAS -> Google Sheets write requires deployed GAS URL.
- GitHub Pages runtime requires repository deployment.
- LINE acquisition requires real-device click-through.
- Appointment conversion requires a real appointment URL/webhook; no URL has been invented.
