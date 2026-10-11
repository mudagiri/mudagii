/* Chapter 2 V3.2: preserve V3.1 art, refocus the quest on explicitly uncertain possibilities. */
export const V32CSS = `
.c2v32-rpg .c2v32-chapter-label{position:relative;z-index:4;display:block;max-width:350px;margin:0 auto 6px;padding:6px 7px;border:1px solid rgba(242,208,139,.75);border-radius:8px;background:rgba(3,31,42,.89);font-size:12px;font-weight:900;line-height:1.4;color:#f2e9d4;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.c2v32-rpg .c2v32-chapter-label span{color:#f8d682}
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
/* The next check feels like an actionable quest reward, not an extra CTA. */
.c2v32-rpg .c2v32-first-action{position:relative;margin:11px 0 0;padding:13px 14px;background:linear-gradient(130deg,rgba(11,45,53,.93),rgba(30,38,55,.96));border:1px solid #d4b878;border-left:5px solid #eac76d;border-radius:10px;color:#fff3d6}
.c2v32-rpg .c2v32-primary-enemy{display:flex;align-items:center;gap:10px;margin:7px 0;padding:7px 8px;border:1px solid rgba(239,204,119,.32);border-radius:8px;background:rgba(1,20,35,.48)}
.c2v32-rpg .c2v32-primary-enemy>img{width:76px;height:80px;object-fit:contain;flex:0 0 76px;image-rendering:pixelated}
.c2v32-rpg .c2v32-primary-enemy>div{min-width:0;display:grid;gap:3px}
.c2v32-rpg .c2v32-primary-enemy strong{font-size:20px;color:#ffedb8;font-weight:950;line-height:1.35;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-primary-enemy small{font-size:13px;line-height:1.45;color:#e0e9e2}
.c2v32-rpg .c2v32-first-action>span{display:block;font-size:14px;color:#f4db9c;font-weight:950;line-height:1.5}
.c2v32-rpg .c2v32-first-action>strong{display:block;font-size:20px;line-height:1.4;margin:4px 0;color:#ffedb8;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-first-action>p{margin:4px 0 7px!important;color:#e9f3f0!important;font-size:15px!important;line-height:1.6!important}
.c2v32-rpg .c2v32-first-action>small{display:block;color:#d9e6e3;font-size:13px;font-weight:700;line-height:1.5}
.c2v32-rpg .c2v32-future-condition{margin:0 0 13px!important;padding:9px 11px;border-radius:9px;border:1px solid rgba(255,226,151,.58);background:rgba(5,22,30,.86);font-size:16px!important;font-weight:900;color:#ffeac2!important;line-height:1.55!important}
.c2v32-rpg .c2v32-future-condition span{color:#fff;background:rgba(154,54,36,.86);padding:2px 4px;border-radius:3px}
.c2v32-rpg .c2v32-future-condition small{display:block;color:#e4e9e2!important;font-size:13px;font-weight:750;line-height:1.5}
.c2v32-rpg .c2v31-chest-art{filter:drop-shadow(0 5px 11px rgba(214,164,72,.29))}
/* Chapter 1 speech pattern, painted as parchment over Chapter 2's guild. */
.c2v32-rpg .c2v32-mudagiri-beat{display:grid;grid-template-columns:68px minmax(0,1fr);align-items:end;gap:9px;margin:12px 14px 15px;padding:0;min-width:0}
.c2v32-rpg .c2v32-mudagiri-beat>img{width:68px;height:76px;object-fit:contain;object-position:center bottom;image-rendering:pixelated;display:block;filter:drop-shadow(0 4px 5px rgba(0,0,0,.35))}
.c2v32-rpg .c2v32-mudagiri-talk{position:relative;min-width:0;padding:10px 12px;border:1.5px solid #e9d8ac;border-radius:13px 13px 13px 4px;background:linear-gradient(150deg,#fffdf6,#f6ead4);color:#2d2a22;box-shadow:0 3px 8px rgba(0,0,0,.22)}
.c2v32-rpg .c2v32-mudagiri-talk::before{content:"";position:absolute;left:-7px;bottom:12px;width:11px;height:11px;background:#fcf7e9;border-bottom:1.5px solid #e9d8ac;border-left:1.5px solid #e9d8ac;transform:rotate(45deg)}
.c2v32-rpg .c2v32-mudagiri-talk>small{display:block;color:#846332;font-size:12px!important;line-height:1.4;font-weight:850}
.c2v32-rpg .c2v32-mudagiri-talk>p{margin:3px 0 0!important;color:#2c291f!important;font-size:15px!important;line-height:1.55!important;font-weight:750;overflow-wrap:anywhere}
.c2v32-rpg .c2v31-followup .c2v32-mudagiri-beat{margin:16px 0 0}
.c2v32-rpg .c2v32-enemy-encounters{margin:15px 0 12px;padding:11px 10px;border:1px solid rgba(234,197,123,.66);border-radius:11px;background:rgba(7,27,36,.78)}
.c2v32-rpg .c2v32-enemy-encounters>h3{font-size:16px;color:#ffe9b5;margin:0 0 10px;line-height:1.4}
.c2v32-rpg .c2v32-enemy-preview-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.c2v32-rpg .c2v32-enemy-preview{display:flex;flex-direction:column;align-items:center;min-width:0;padding:8px 5px 10px;border:1px solid rgba(237,202,128,.54);border-radius:9px;background:linear-gradient(180deg,rgba(21,54,67,.92),rgba(6,29,44,.94));text-align:center}
.c2v32-rpg .c2v32-enemy-preview>img{width:100%;max-width:84px;height:82px;object-fit:contain;image-rendering:pixelated}
.c2v32-rpg .c2v32-enemy-preview>strong{font-size:13px;color:#ffedc3;font-weight:950;line-height:1.45;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-enemy-preview>small{display:block;font-size:12px!important;line-height:1.4;color:#d7e4e4!important;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-enemy-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0 14px}
.c2v32-rpg .c2v32-enemy-record{margin:0;border:1px solid #8c9d83;border-radius:12px;background:linear-gradient(145deg,rgba(9,42,50,.98),rgba(10,30,41,.95));min-width:0;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(243,209,137,.1)}
.c2v32-rpg .c2v32-enemy-record.is-expanded{grid-column:1/-1;border-color:#e4bc67;box-shadow:inset 0 0 0 1px rgba(248,222,157,.24)}
.c2v32-rpg .c2v32-enemy-tile{min-height:180px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;justify-content:flex-start;padding:11px 7px 10px;background:transparent}
.c2v32-rpg .c2v32-enemy-tile>img,.c2v32-rpg .c2v32-enemy-tile>.c2v2-enemy-icon{width:100%;max-width:98px;height:98px;object-fit:contain;image-rendering:pixelated;flex:0 0 98px}
.c2v32-rpg .c2v32-enemy-tile .c2v2-enemy-text{display:grid;justify-items:center;gap:4px}
.c2v32-rpg .c2v32-enemy-tile .c2v2-enemy-text>b{color:#ffdfa0;font-size:16px;line-height:1.4;font-weight:950;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-enemy-tile .c2v2-enemy-text>small{color:#d5e7e9;font-size:13px!important;line-height:1.4}
.c2v32-rpg .c2v32-enemy-tile .c2v2-enemy-text>span{color:#fee7a6;font-size:12px;line-height:1.5}
.c2v32-rpg .c2v32-enemy-record.is-expanded .c2v32-enemy-tile{min-height:92px;display:flex;flex-direction:row;justify-content:flex-start;text-align:left;gap:12px}
.c2v32-rpg .c2v32-enemy-record.is-expanded .c2v32-enemy-tile>img{flex:0 0 72px;width:72px;height:72px}
.c2v32-rpg .c2v32-enemy-record.is-expanded .c2v32-enemy-tile .c2v2-enemy-text{justify-items:start}
.c2v32-rpg .c2v32-enemy-record .c2v2-detail{padding:13px 12px}
.c2v32-rpg .c2v32-enemy-record .c2v2-detail p{font-size:14px!important;line-height:1.65!important}
@media(max-width:350px){.c2v32-rpg .c2v32-mudagiri-beat{grid-template-columns:57px minmax(0,1fr);gap:8px;margin-inline:10px}.c2v32-rpg .c2v32-mudagiri-beat>img{width:57px;height:69px}.c2v32-rpg .c2v32-mudagiri-talk{padding:9px 10px}.c2v32-rpg .c2v32-enemy-grid{gap:7px}.c2v32-rpg .c2v32-enemy-tile>img{height:78px;flex-basis:78px}.c2v32-rpg .c2v32-enemy-tile{min-height:171px;padding:9px 4px}}

@media(max-width:375px){
 .c2v32-rpg .c2v31-hero{min-height:376px!important;padding-bottom:22px!important}
 .c2v32-rpg .c2v32-hero-teaser{margin-inline:3px;padding-inline:8px}
 .c2v32-rpg .c2v32-hero-teaser strong{font-size:clamp(26px,8.1vw,34px)}
 .c2v32-rpg .c2v32-treasure-lead{margin-inline:9px;padding-inline:10px}
}
@media(prefers-reduced-motion:reduce){.c2v32-rpg *{animation:none!important;transition:none!important}}
`;
