/**
 * Chapter 1 -> 2 unified result V2.0, presentation only.
 * C1 reference: MUDAGIRI QUEST LOG, JOB holo reveal, chapter-themed
 * parchment insights, friendly Mudagiri companion.
 * C2 retains the financial truth of cUpper vs confirmedA.
 */
export const V20BRIDGECSS = `
/* Carry C1's quest-log stage grammar into the same dark guild space. */
.c2v32-rpg .c2v20-hero{padding-top:11px!important;overflow:hidden}
.c2v32-rpg .c2v20-quest-log{
 position:relative;z-index:5;max-width:412px;margin:0 auto 12px;
 padding:10px 11px;border:1px solid rgba(214,182,117,.84);border-radius:13px;
 color:#f9edd4;background:linear-gradient(120deg,rgba(5,29,42,.94),rgba(13,54,57,.88));
 box-shadow:inset 0 0 0 1px rgba(241,216,142,.10),0 5px 17px rgba(0,0,0,.24);
 text-align:left;
}
.c2v32-rpg .c2v20-quest-log-eyebrow{
 display:block;font-size:12px;font-weight:900;line-height:1.5;letter-spacing:.08em;color:#f5d88a
}
.c2v32-rpg .c2v20-quest-stages{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:5px}
.c2v32-rpg .c2v20-quest-stages>span:not(.c2v20-quest-arrow){
 display:flex;flex:1 1 0;flex-direction:column;gap:2px;min-width:0;
 padding:7px 8px;border:1px solid rgba(225,199,137,.42);border-radius:9px;
 font-size:12px;line-height:1.4;color:#dde6e5;
}
.c2v32-rpg .c2v20-quest-stages .is-complete{background:rgba(10,56,49,.50);border-color:rgba(139,213,178,.57)!important}
.c2v32-rpg .c2v20-quest-stages .is-current{
 color:#ffe9af;border-color:#f5d680!important;background:rgba(166,120,31,.20);
}
.c2v32-rpg .c2v20-quest-stages b{font-size:14px;color:#fff1ca;font-weight:900}
.c2v32-rpg .c2v20-quest-stages small{font-size:12px;color:#f8dfa0;font-weight:800}
.c2v32-rpg .c2v20-quest-arrow{font-size:24px;color:#f2ce78}
.c2v32-rpg .c2v20-quest-stages .is-unlinked{border-style:dashed!important;opacity:.83}
.c2v32-rpg .c2v20-quest-stages .is-unlinked small{color:#d2dfe1}
/* C1's JOB card becomes the same adventurer who won the household battle.
   The visual is compact, so it doesn't introduce another stand-alone card. */
.c2v32-rpg .c2v31-hero .c2v20-hero-job{
 position:relative;z-index:4;display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;
 gap:8px;width:100%;max-width:375px;min-height:110px;
 margin:10px auto 5px;padding:9px 12px;
 border:1.5px solid color-mix(in srgb,var(--c2-job-accent,#eed08f) 73%,#fff4cc);
 border-radius:16px;
 background:
  radial-gradient(circle at 14% 39%,color-mix(in srgb,var(--c2-job-accent,#ffe28c) 24%,transparent),transparent 57%),
  linear-gradient(113deg,rgba(9,31,43,.83),rgba(6,31,45,.9) 64%,rgba(20,41,43,.87));
 box-shadow:0 7px 20px rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,249,223,.08);
 overflow:hidden;text-align:left;
}
.c2v32-rpg .c2v31-hero .c2v20-hero-job::before{
 content:'';display:block;position:absolute;inset:0 0 0 0;pointer-events:none;
 background:linear-gradient(109deg,transparent 12%,rgba(255,255,255,.06) 31%,transparent 44%);z-index:0;
}
.c2v32-rpg .c2v20-job-portrait{position:relative;z-index:1;align-self:center;display:grid;place-items:center;
 width:87px;height:91px;border-radius:13px;
 background:radial-gradient(ellipse at 50% 63%,color-mix(in srgb,var(--c2-job-accent,#ffdd88) 22%,transparent),rgba(5,24,38,.07) 75%);
}
.c2v32-rpg .c2v20-job-portrait>img{width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;
 filter:drop-shadow(0 5px 5px rgba(0,0,0,.6)) drop-shadow(0 0 8px color-mix(in srgb,var(--c2-job-accent,#ffda88) 18%,transparent))}
.c2v32-rpg .c2v20-job-identity{position:relative;z-index:1;min-width:0;display:grid;justify-items:start;gap:3px}
.c2v32-rpg .c2v20-job-identity>span{display:block;font-size:12px;color:#f1dcaf;font-weight:900;line-height:1.35}
.c2v32-rpg .c2v20-job-identity>strong{
 display:block;font-size:clamp(18px,5.4vw,23px);font-weight:950;line-height:1.3;color:#fff7d9;
 text-shadow:0 2px 5px rgba(0,0,0,.64);overflow-wrap:anywhere;word-break:keep-all;
}
.c2v32-rpg .c2v20-job-style{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.c2v32-rpg .c2v20-job-style>b{
 display:inline-block;border:1px solid color-mix(in srgb,var(--c2-style-accent,#eedca8) 55%,#fff);
 background:color-mix(in srgb,var(--c2-style-accent,#eedca8) 16%,rgba(3,26,38,.84));
 color:#fff5df;border-radius:999px;padding:4px 8px;font-size:12px;line-height:1.4;
}
.c2v32-rpg .c2v20-job-style>small{font-size:12px;line-height:1.5;color:#e0ebe5;font-weight:750}
/* C1 and C2 Mudagiri dialogue retain a single friendly paper grammar.
   C2's longer explanation remains readable, while the result hero stays compact. */
.c2v32-rpg .c2v31-hero-stage{margin-top:5px!important;min-height:88px!important}
.c2v32-rpg .c2v31-hero .c2v31-dialogue{
 border-color:#e3c891!important;border-radius:15px 15px 15px 4px;
 box-shadow:0 5px 14px rgba(0,0,0,.23);
}
.c2v32-rpg .c2v31-hero .c2v31-dialogue p{font-size:14px!important;line-height:1.6!important}
.c2v32-rpg .c2v31-hero .c2v31-hero-mascot{max-width:105px!important;width:28%!important}
.c2v32-rpg .c2v31-hero .c2v31-quest-crest{opacity:.72}
.c2v32-rpg .c2v31-hero .c2v31-quest-title{margin-top:1px!important;margin-bottom:0!important}
/* Convert only the evidence area to C1's pale parchment, not the whole page.
   One parchment island gives the report readable contrast without new chrome. */
.c2v32-rpg .c2v32-candidate-breakdown{
 margin-top:16px;padding:15px 12px 12px!important;
 border:1px solid rgba(220,187,121,.52)!important;border-radius:14px!important;
 background:linear-gradient(160deg,#fffdf8,#f1e9db)!important;color:#262b2b;
}
.c2v32-rpg .c2v32-breakdown-title span{color:#274b50!important}
.c2v32-rpg .c2v32-breakdown-title small{color:#52635e!important}
.c2v32-rpg .c2v32-breakdown-intro{color:#263a3a!important}
.c2v32-rpg .c2v32-breakdown-intro strong{color:#76502a!important}
.c2v32-rpg .c2v32-breakdown-entry{
 border:0!important;border-bottom:1px solid rgba(105,115,111,.26)!important;
 border-radius:0!important;background:transparent!important;box-shadow:none!important;padding:12px 2px 14px!important;
}
.c2v32-rpg .c2v32-breakdown-entry:last-child{border-bottom:0!important;padding-bottom:4px!important}
.c2v32-rpg .c2v32-breakdown-name strong{color:#213c46!important}
.c2v32-rpg .c2v32-breakdown-name small{color:#596563!important}
.c2v32-rpg .c2v32-breakdown-amount strong{color:#70512a!important;text-shadow:none!important}
.c2v32-rpg .c2v32-breakdown-amount small{color:#645e52!important}
.c2v32-rpg .c2v32-breakdown-basis{
 color:#383f3b!important;background:rgba(212,206,186,.36)!important;padding:8px 7px!important;
}
.c2v32-rpg .c2v32-breakdown-basis b{color:#25575a!important}
.c2v32-rpg .c2v32-breakdown-basis small{color:#5a605d!important}
.c2v32-rpg .c2v32-breakdown-reason,.c2v32-rpg .c2v32-breakdown-action{
 color:#293a3d!important;background:transparent!important;
}
.c2v32-rpg .c2v32-breakdown-reason b{color:#694621!important}
.c2v32-rpg .c2v32-breakdown-action{border-top:1px solid rgba(120,139,127,.22)!important}
.c2v32-rpg .c2v32-breakdown-action b{color:#255d54!important}
.c2v32-rpg .c2v32-breakdown-footnote{color:#56615b!important}
.c2v32-rpg .c2v32-first-action{border-left-color:#f2dca5!important}
/* Shared visual rhythm: muted in between scenes, still one dominant gold CTA. */
.c2v32-rpg .c2v32-mudagiri-talk{border-color:#e3c891!important}
.c2v32-rpg .c2v31-nextgate .c2v2-primary{box-shadow:0 5px 0 #916221,0 9px 18px rgba(0,0,0,.35)!important}
@media(max-width:350px){
 .c2v32-rpg .c2v20-hero{padding:8px 9px 10px!important}
 .c2v32-rpg .c2v20-quest-log{padding:8px 7px;margin-bottom:9px}
 .c2v32-rpg .c2v20-quest-stages>span:not(.c2v20-quest-arrow){padding:6px 5px;font-size:11px}
 .c2v32-rpg .c2v20-quest-stages b{font-size:13px}
 .c2v32-rpg .c2v31-hero .c2v20-hero-job{grid-template-columns:68px minmax(0,1fr);gap:6px;min-height:92px;padding:7px 8px}
 .c2v32-rpg .c2v20-job-portrait{width:66px;height:77px}
 .c2v32-rpg .c2v20-job-identity>strong{font-size:18px}
 .c2v32-rpg .c2v20-job-style{gap:4px}
 .c2v32-rpg .c2v20-job-style>small{font-size:11px}
 .c2v32-rpg .c2v32-candidate-breakdown{padding-inline:9px!important}
 .c2v32-rpg .c2v32-breakdown-amount{max-width:49%}
 .c2v32-rpg .c2v32-breakdown-amount strong{font-size:16px!important}
}

/* Gate A (V2.0.3) — money must remain complete and readable at 320–430px.
   The 10-year amount is full-width; the decorative chest is no longer a flex sibling
   allowed to steal digits. No numeric calculations or thresholds are changed. */
.c2v32-rpg .c2v31-future .c2v31-reward-ten{
 display:block;position:relative;min-height:144px;padding:14px 12px 15px;
}
.c2v32-rpg .c2v31-future .c2v31-ten-details{display:block;width:100%;max-width:100%}
.c2v32-rpg .c2v31-future .c2v31-ten-details>strong{
 display:block;position:relative;z-index:3;
 font-size:clamp(21px,6.85vw,30px)!important;
 white-space:nowrap;overflow-wrap:normal;word-break:normal;
 font-variant-numeric:tabular-nums;letter-spacing:-.065em;line-height:1.25;
 max-width:100%;
}
.c2v32-rpg .c2v31-future .c2v31-ten-chest{
 position:absolute;bottom:7px;right:8px;width:71px;max-width:23%;height:auto;
 flex:none;z-index:1;pointer-events:none;
}
.c2v32-rpg .c2v31-future .c2v31-ten-qualifier{
 display:block;max-width:100%;padding-right:76px;font-size:13px;line-height:1.5;
}
/* Treasure count is one short complete phrase rather than a large stacked word. */
.c2v32-rpg .c2v31-unknown-details>strong{
 word-break:keep-all;overflow-wrap:normal;white-space:nowrap;
 font-size:clamp(17px,5.4vw,23px)!important;line-height:1.35;
}
/* Base V3.1 reserved 175–193px for a big gold trophy. V3.2 made the actual
   content compact but accidentally retained that huge minimum, leaving blank space. */
.c2v32-rpg .c2v31-reward-confirmed{
 min-height:0!important;height:auto;padding:16px 12px 13px!important;
 display:flex;flex-direction:column;align-items:stretch;gap:6px;
}
.c2v32-rpg .c2v31-confirmed-heading{margin:-19px auto 0!important}
.c2v32-rpg .c2v31-confirmed-content{
 min-height:57px!important;justify-content:flex-start;align-items:center;gap:10px;
}
.c2v32-rpg .c2v31-confirmed-caption{
 display:block;position:relative;margin:0!important;padding:0!important;
 border:0!important;background:none!important;
 font-size:13px!important;line-height:1.5!important;
 color:#4f493e!important;text-align:left!important;
}
@media(max-width:350px){
 .c2v32-rpg .c2v31-future .c2v31-ten-details>strong{font-size:21px!important;letter-spacing:-.07em}
 .c2v32-rpg .c2v31-future .c2v31-ten-chest{max-width:22%;width:55px}
 .c2v32-rpg .c2v31-future .c2v31-ten-qualifier{padding-right:59px}
 .c2v32-rpg .c2v31-unknown-details>strong{font-size:17px!important}
}

@media(prefers-reduced-motion:reduce){
 .c2v32-rpg .c2v20-hero-job::before{background:none}
}
`;
