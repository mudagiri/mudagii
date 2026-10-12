/**
 * Chapter 2 V1.9 — Quiet RPG scenery / clear reading hierarchy.
 * Presentation only. Frozen diagnosis engines, thresholds, result meaning and
 * persistence are unchanged. Keep critical candidate evidence inline.
 */
export const V19SCENECSS = `
/* One continuous guild landscape rather than a pile of equally ornate panels. */
.c2v32-rpg{background:#051823;--scene-gold:#edd18b;--scene-line:rgba(226,202,147,.32);--scene-quiet:#c9dfdc}
.c2v32-rpg .c2v31-page{
 background:linear-gradient(180deg,rgba(4,23,30,.62),rgba(2,22,31,.73) 22%,rgba(3,26,31,.76) 55%,rgba(3,21,31,.9) 100%),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp') center top/100% auto repeat-y;
 padding-bottom:54px;
}
.c2v32-rpg .c2v31-page::before{
 inset:365px 0 0;z-index:-1;opacity:.46;
 background:linear-gradient(180deg,rgba(2,26,37,.18),rgba(4,24,34,.74) 75%),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp') center top/100% 920px repeat-y;
 filter:none;
}
.c2v32-rpg .c2v31-page::after{content:'';pointer-events:none;position:absolute;inset:370px 7px 0;z-index:-1;border-left:1px solid rgba(247,205,117,.09);border-right:1px solid rgba(247,205,117,.09)}
/* The opening is a cinematic reward scene; the monthly number is the anchor. */
.c2v32-rpg .c2v31-hero{
 background:linear-gradient(180deg,rgba(1,19,28,.06) 0%,rgba(2,20,30,.19) 34%,rgba(1,16,24,.82) 90%,#071d27 100%),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp') center 27%/cover no-repeat;
 border-bottom:0;box-shadow:0 14px 30px rgba(0,0,0,.2);
}
.c2v32-rpg .c2v32-chapter-label{border:0;background:rgba(4,25,35,.72);box-shadow:none;font-size:12px;letter-spacing:.01em}
.c2v32-rpg .c2v32-hero-teaser{background:linear-gradient(145deg,rgba(8,34,43,.9),rgba(9,30,42,.91));border:1px solid rgba(247,212,133,.62);border-radius:16px;box-shadow:0 10px 28px #0005,inset 0 1px rgba(255,246,202,.09);padding:14px 12px 13px}
.c2v32-rpg .c2v32-hero-teaser strong{color:#ffdf84;font-size:clamp(28px,8.2vw,38px);text-shadow:0 2px 14px #0009}
.c2v32-rpg .c2v32-hero-teaser small{font-size:13px;line-height:1.6;color:#e0e9e6}
.c2v32-rpg .c2v32-reward-jump{background:rgba(3,30,40,.88)!important;border:1px solid #e8c884!important;border-radius:12px;box-shadow:0 4px 12px #0005;min-height:48px}
/* The treasure is one coherent parchment/ledger, not four nested golden cards. */
.c2v32-rpg .c2v32-treasure-lead{
 margin:18px 12px 15px;padding:18px 15px 16px;border:1px solid rgba(219,192,127,.62);border-radius:20px;
 background:linear-gradient(165deg,rgba(5,38,48,.88),rgba(5,28,39,.93)),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp') center/cover;
 box-shadow:0 12px 32px #0004,inset 0 1px rgba(255,242,202,.09);
}
.c2v32-rpg .c2v32-treasure-lead>h2{font-size:clamp(22px,5.7vw,27px);margin:4px 0 14px}
.c2v32-rpg .c2v32-treasure-lead .c2v31-treasure-unknown{
 padding:9px 11px;margin:0;border:1px solid rgba(183,174,207,.54);border-radius:12px;
 background:linear-gradient(120deg,rgba(10,33,50,.85),rgba(25,30,52,.79));box-shadow:none;
}
.c2v32-rpg .c2v31-unknown-heading>span{background:rgba(101,75,143,.43);border:1px solid rgba(192,180,223,.6);box-shadow:none}
.c2v32-rpg .c2v31-unknown-layout{min-height:88px}
.c2v32-rpg .c2v31-chest-art{max-height:110px}
.c2v32-rpg .c2v31-unknown-details strong{font-size:clamp(21px,6.6vw,30px)!important;color:#f5e9c9!important;text-shadow:none}
.c2v32-rpg .c2v32-candidate-breakdown{margin:15px 0 0;padding:13px 0 2px;background:none;border:0;border-top:1px solid var(--scene-line);border-radius:0;box-shadow:none}
.c2v32-rpg .c2v32-breakdown-title{padding:0 0 10px;border-bottom:0}
.c2v32-rpg .c2v32-breakdown-title span{font-size:17px}
.c2v32-rpg .c2v32-breakdown-intro{font-size:14px!important;margin:2px 0 12px!important}
.c2v32-rpg .c2v32-breakdown-entries{gap:10px}
.c2v32-rpg .c2v32-breakdown-entry{border:1px solid rgba(155,197,187,.29);background:rgba(8,34,46,.74);padding:12px 11px;border-radius:12px;box-shadow:none}
.c2v32-rpg .c2v32-breakdown-name strong{font-size:16px}
.c2v32-rpg .c2v32-breakdown-name small,.c2v32-rpg .c2v32-breakdown-amount small{font-size:13px!important}
.c2v32-rpg .c2v32-breakdown-basis{font-size:13px!important;background:rgba(8,26,34,.52)}
.c2v32-rpg .c2v32-breakdown-reason,.c2v32-rpg .c2v32-breakdown-action{font-size:14px!important;line-height:1.66!important}
.c2v32-rpg .c2v32-breakdown-footnote{font-size:13px!important;color:#cbdfd9!important}
.c2v32-rpg .c2v32-first-action{background:rgba(9,48,51,.66);border:0;border-left:3px solid #94d7c1;box-shadow:none;border-radius:4px 9px 9px 4px;margin-top:14px}
.c2v32-rpg .c2v32-first-action--compact>p{font-size:14px!important}
/* Only the ten-year hypothetical receives the grand gold treatment. */
.c2v32-rpg .c2v31-future{
 margin:22px 12px 18px;padding:20px 16px 18px;border:1px solid rgba(225,196,130,.65);border-radius:21px;
 background:linear-gradient(160deg,rgba(5,35,44,.91),rgba(8,32,42,.94)),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp') center/cover;
 box-shadow:0 12px 29px rgba(0,0,0,.27);
}
.c2v32-rpg .c2v31-reward-mini>div{background:rgba(10,40,47,.8);border:1px solid rgba(220,187,110,.42);box-shadow:none}
.c2v32-rpg .c2v32-future-condition{background:none;border:0;padding:0;font-size:16px!important}
.c2v32-rpg .c2v32-future-condition span{background:none;color:#ffe39d;text-decoration:underline;text-underline-offset:3px}
.c2v32-rpg .c2v31-reward-ten{border:2px solid rgba(255,233,169,.92);box-shadow:0 10px 25px #0005,inset 0 2px rgba(255,255,229,.24)}
.c2v32-rpg .c2v31-future .c2v3-future-footnote{font-size:13px!important}
/* Let the adventurer record and battle summary read as one supporting report. */
.c2v32-rpg .c2v31-job-card{border:1px solid rgba(216,186,129,.43);background:rgba(7,34,42,.84);box-shadow:none;border-radius:15px;padding:12px 13px}
.c2v32-rpg .c2v31-battle-report.c2v2-card{border:1px solid rgba(215,190,133,.41);background:rgba(6,33,42,.88);box-shadow:none;border-radius:16px;padding:17px 14px}
.c2v32-rpg .c2v31-counts>div{background:rgba(12,46,53,.67);border:1px solid rgba(145,181,180,.23);box-shadow:none}
.c2v32-rpg .c2v32-enemy-encounters{border:0;border-top:1px solid rgba(212,182,125,.32);border-radius:0;background:none;padding:14px 0 0}
.c2v32-rpg .c2v32-enemy-preview{background:rgba(6,30,39,.57);border:1px solid rgba(156,173,166,.24)}
.c2v32-rpg .c2v31-reward-confirmed{border:1px solid #d0b882;border-radius:13px;box-shadow:none}
/* Companion appears at transitions, not between every card. */
.c2v32-rpg .c2v32-mudagiri-beat{margin:24px 18px 22px;grid-template-columns:79px minmax(0,1fr);gap:12px}
.c2v32-rpg .c2v32-mudagiri-beat>img{width:79px;height:94px;filter:drop-shadow(0 7px 8px #0009)}
.c2v32-rpg .c2v32-mudagiri-talk{border:1px solid #e8d2a1;box-shadow:0 7px 20px #0005;border-radius:16px 16px 16px 5px;padding:12px 14px}
.c2v32-rpg .c2v32-mudagiri-talk>p{font-size:15px!important;line-height:1.66!important}
/* Protection is a clear guild notice, not another oversized treasure tile. */
.c2v32-rpg .c2v32-cover-awareness{border:1px solid rgba(128,196,179,.48);background:rgba(6,39,47,.87);border-radius:16px;box-shadow:none;margin:18px 12px;padding:16px}
.c2v32-rpg .c2v32-cover-reasons{gap:0;margin:14px 0 12px;border-top:1px solid rgba(152,198,188,.29)}
.c2v32-rpg .c2v32-cover-reasons>div{border:0;border-bottom:1px solid rgba(152,198,188,.29);border-radius:0;background:none;padding:11px 1px;grid-template-columns:90px minmax(0,1fr)}
.c2v32-rpg .c2v32-cover-reasons strong,.c2v32-rpg .c2v32-cover-reasons span{font-size:14px;line-height:1.58}
.c2v32-rpg .c2v32-cover-next{background:rgba(9,51,53,.64);border-left:3px solid #a2d9c6}
/* One luminous next-quest decision. Everything after is lower-contrast exploration. */
.c2v32-rpg .c2v31-nextgate.c2v2-card{
 margin:27px 12px 20px;border:2px solid rgba(241,209,130,.79);border-radius:20px;padding:24px 18px;
 background:linear-gradient(150deg,rgba(1,22,34,.79),rgba(2,30,36,.64)),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp') center 45%/cover;
 box-shadow:0 14px 34px #0008,inset 0 1px rgba(255,245,211,.13);
}
.c2v32-rpg .c2v31-nextgate .c2v2-primary{border-radius:13px;min-height:60px;font-size:17px}
.c2v32-rpg .c2v31-followup.c2v2-card,.c2v32-rpg .c2v31-encyclopedia.c2v2-card,.c2v32-rpg .c2v31-goals.c2v2-card,.c2v32-rpg .c2v31-sharing.c2v2-card{
 border:1px solid rgba(168,192,177,.25);background:rgba(5,31,41,.82);border-radius:15px;box-shadow:none;margin:15px 12px;padding:16px 14px;
}
.c2v32-rpg .c2v31-followup h2,.c2v32-rpg .c2v31-encyclopedia h2,.c2v32-rpg .c2v31-goals h2,.c2v32-rpg .c2v31-sharing h2{font-size:20px!important}
.c2v32-rpg .c2v31-section-heading{gap:4px 9px}
.c2v32-rpg .c2v31-section-heading>span{color:#d8c392;font-size:13px;letter-spacing:.02em}
.c2v32-rpg .c2v31-section-heading>small{color:#cedbd5;font-size:13px}
.c2v32-rpg .c2v31-job-card::before,.c2v32-rpg .c2v31-job-card::after,.c2v32-rpg .c2v31-battle-report::before,.c2v32-rpg .c2v31-future::before{display:none}
/* Optional exploration has one obvious, accessible trigger; the full gallery stays in the DOM. */
.c2v32-rpg .c2v32-optional-detail>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:50px;cursor:pointer;color:#f5e1ae;font-size:15px;font-weight:900;touch-action:manipulation}
.c2v32-rpg .c2v32-optional-detail>summary::-webkit-details-marker{display:none}
.c2v32-rpg .c2v32-optional-detail>summary::after{content:'＋';font-size:22px;line-height:1}
.c2v32-rpg .c2v32-optional-detail[open]>summary::after{content:'−'}
.c2v32-rpg .c2v32-optional-detail>summary:focus-visible{outline:3px solid #9ad9de;outline-offset:3px;border-radius:8px}
.c2v32-rpg .c2v32-optional-detail[open]>summary{border-bottom:1px solid rgba(213,191,139,.36);margin-bottom:12px}
.c2v32-rpg .c2v32-enemy-grid{margin:10px 0 15px}
.c2v32-rpg .c2v32-enemy-record{background:rgba(13,45,53,.73);border:1px solid rgba(174,191,173,.28)}
.c2v32-rpg .c2v31-sharing .c2v2-share-primary{min-height:54px;background:rgba(190,215,217,.93);border:0;color:#193340;box-shadow:none}
@media(max-width:350px){
 .c2v32-rpg .c2v32-treasure-lead,.c2v32-rpg .c2v31-future{margin-inline:9px;padding-inline:10px}
 .c2v32-rpg .c2v32-cover-reasons>div{grid-template-columns:77px minmax(0,1fr);gap:5px}
 .c2v32-rpg .c2v32-cover-reasons strong,.c2v32-rpg .c2v32-cover-reasons span{font-size:13px}
 .c2v32-rpg .c2v32-mudagiri-beat{grid-template-columns:64px minmax(0,1fr);gap:8px;margin-inline:10px}
 .c2v32-rpg .c2v32-mudagiri-beat>img{width:64px;height:80px}
}
@media(prefers-reduced-motion:reduce){.c2v32-rpg *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
`;
