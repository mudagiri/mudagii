# Chapter 2 V3.2 isolated preview: single gross income tiers and all-twelve battleboard

Date: 2026-10-23. UI fix PR #94: https://github.com/mudagiri/mudagii/pull/94
Isolated preview source branch: `release/chapter12-latest-rpg-ui-first-20261016`
Approved release commit SHA: `7a78f84b2325e6005eec5b5e5bcca02257e5ebe5`
Preview: https://mudagiri.github.io/mudagii/pilot/chapter2-v32/

This docs-only main commit triggers existing GitHub Pages → Restore Isolated Previews. Main production app source, Chapter1 and Chapter3 preview source are unchanged.

Changes to review on smartphone:
- Single-person annual gross: under400 / 400–499 / 500–599 / 600–699 / 700–799 / 800–999 / 1000+ / decline. Previously all 600+ was collapsed. Old saved broad answers remain readable.
- Do not invent same-age-and-income data when original 2024 reference cells are unsupported. Do not rebrand a 2025 coarse-income figure as a different narrower interval.
- Beneath reward and priority candidate, a compact, always-visible 12-category battleboard gives the full picture and navigates to expanded detail while retaining frozen scoring.
- Distinguish *statistical burden-rate difference* from verified savings and unconfirmed review ceiling. Statistically higher than matched cohort may merit further questions but is NOT automatically reducible cash.
- Browser Chrome and iPhone WebKit Chapter1→Chapter2 integration, 320/390/430 width, high-income comparison and no invented rates: run `39954400366` latest-ui PASS and isolated build PASS. Dedicated production GAS configuration remains independently FAIL due missing secrets and must not be misrepresented.

Release gate: Check exact HTTP200 response from `pilot/chapter2-v32/REVISION_SHA.txt` equals `7a78f84b2325e6005eec5b5e5bcca02257e5ebe5`; confirm Chapter1 and Chapter3 hashes remain unchanged and production root HTTP200. Final iPhone real-device exploratory testing, booking CV and production GAS are still HOLD.
