/* Chapter 2 V3.2: preserve V3.1 art, refocus the quest on explicitly uncertain possibilities. */
export const V32CSS = `
.c2v32-rpg .c2v31-hero{min-height:380px!important;padding-bottom:26px!important}
.c2v32-rpg .c2v32-hero-teaser{position:relative;z-index:4;display:grid;gap:4px;text-align:center;margin:7px auto 8px;max-width:370px;padding:12px 12px 11px;border:2px solid #ebcd76;border-radius:12px;background:linear-gradient(135deg,rgba(12,30,40,.97),rgba(39,37,47,.94));box-shadow:inset 0 0 0 1px rgba(255,244,194,.2),0 7px 15px rgba(0,0,0,.34),0 0 18px rgba(232,182,83,.17)}
.c2v32-rpg .c2v32-hero-teaser span{font-size:16px;line-height:1.45;color:#fff0c4;font-weight:900}
.c2v32-rpg .c2v32-hero-teaser strong{font-size:clamp(27px,8.2vw,39px);line-height:1.25;color:#ffe08c;letter-spacing:-.05em;font-variant-numeric:tabular-nums;text-shadow:0 2px 4px #071525;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-hero-teaser small{font-size:12px;line-height:1.5;color:#e5e7db;font-weight:700}
.c2v32-rpg .c2v32-treasure-lead{position:relative;margin:14px 12px 12px;padding:19px 12px 14px;overflow:hidden;border:2px solid rgba(244,201,104,.8);border-radius:15px;background:linear-gradient(160deg,rgba(5,33,44,.90),rgba(12,29,44,.94)),url('./assets/mudagiri/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp') center/cover;box-shadow:inset 0 0 0 1px rgba(240,213,137,.15),0 10px 22px rgba(0,0,0,.27)}
.c2v32-rpg .c2v32-treasure-lead>h2{color:#ffecae;font-size:clamp(22px,5.7vw,28px);line-height:1.35;margin:9px 0 10px;text-shadow:0 2px 6px rgba(0,0,0,.8)}
.c2v32-rpg .c2v32-treasure-lead .c2v31-treasure-unknown{margin:0;background:radial-gradient(circle at 25% 75%,rgba(98,100,190,.3),transparent 62%),linear-gradient(140deg,rgba(8,20,46,.88),rgba(29,24,53,.90))}
.c2v32-rpg .c2v32-treasure-lead .c2v31-unknown-details strong{font-size:clamp(25px,7.4vw,38px);color:#fff0a6}
.c2v32-rpg .c2v31-future{margin-top:13px;border-width:3px;box-shadow:inset 0 0 0 2px rgba(255,228,143,.16),0 8px 30px rgba(244,189,70,.1),0 12px 20px rgba(0,0,0,.24)}
.c2v32-rpg .c2v31-future .c2v31-ten-details strong{font-size:clamp(36px,10vw,52px)}
.c2v32-rpg .c2v31-battle-report{margin-top:12px;box-shadow:0 9px 20px rgba(0,0,0,.19)}
.c2v32-rpg .c2v31-reward-confirmed{padding:8px 12px;margin-top:13px;background:linear-gradient(120deg,#efe1bd,#f9f3dc);border-color:#bea16b}
.c2v32-rpg .c2v31-reward-confirmed::before{display:none}
.c2v32-rpg .c2v31-confirmed-heading{font-size:13px;background:#71634b;border-color:#b7a375;color:#fff7db;box-shadow:none;padding:3px 8px}
.c2v32-rpg .c2v31-confirmed-content{min-height:52px;justify-content:flex-start;gap:11px}
.c2v32-rpg .c2v31-coin-art{width:50px;max-width:50px;flex:0 0 50px}
.c2v32-rpg .c2v31-confirmed-amount{justify-content:flex-start}
.c2v32-rpg .c2v31-confirmed-amount span{font-size:13px}
.c2v32-rpg .c2v31-confirmed-amount strong{font-size:clamp(22px,6vw,28px);color:#513b25;text-shadow:none}
.c2v32-rpg .c2v31-confirmed-caption{font-size:12px;margin:0;background:none;color:#66583d;border:0;padding:0;text-align:left}
@media(max-width:375px){
 .c2v32-rpg .c2v31-hero{min-height:376px!important;padding-bottom:22px!important}
 .c2v32-rpg .c2v32-hero-teaser{margin-inline:3px;padding-inline:8px}
 .c2v32-rpg .c2v32-hero-teaser strong{font-size:clamp(26px,8.1vw,34px)}
 .c2v32-rpg .c2v32-treasure-lead{margin-inline:9px;padding-inline:10px}
}
@media(prefers-reduced-motion:reduce){.c2v32-rpg *{animation:none!important;transition:none!important}}
`;
