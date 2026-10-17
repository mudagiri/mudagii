/* Chapter 2 V3.2: preserve V3.1 art, refocus the quest on explicitly uncertain possibilities. */
export const V32CSS = `
.c2v32-rpg .c2v32-chapter-label{position:relative;z-index:4;display:block;max-width:350px;margin:0 auto 6px;padding:6px 7px;border:1px solid rgba(242,208,139,.75);border-radius:8px;background:rgba(3,31,42,.89);font-size:12px;font-weight:900;line-height:1.4;color:#f2e9d4;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.c2v32-rpg .c2v32-chapter-label span{color:#f8d682}
.c2v32-rpg .c2v31-hero{min-height:380px!important;padding-bottom:26px!important}
.c2v32-rpg .c2v32-hero-teaser{position:relative;z-index:4;display:grid;gap:4px;text-align:center;margin:7px auto 8px;max-width:370px;padding:12px 12px 11px;border:2px solid #ebcd76;border-radius:12px;background:linear-gradient(135deg,rgba(12,30,40,.97),rgba(39,37,47,.94));box-shadow:inset 0 0 0 1px rgba(255,244,194,.2),0 7px 15px rgba(0,0,0,.34),0 0 18px rgba(232,182,83,.17)}
.c2v32-rpg .c2v32-hero-teaser span{font-size:16px;line-height:1.45;color:#fff0c4;font-weight:900}
.c2v32-rpg .c2v32-hero-teaser strong{font-size:clamp(27px,8.2vw,39px);line-height:1.25;color:#ffe08c;letter-spacing:-.05em;font-variant-numeric:tabular-nums;text-shadow:0 2px 4px #071525;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-hero-teaser small{font-size:12px;line-height:1.5;color:#e5e7db;font-weight:700}
.c2v32-rpg .c2v32-reward-jump{position:relative;z-index:5;display:block;width:calc(100% - 28px);max-width:360px;min-height:44px;margin:9px auto 1px;padding:9px 11px!important;color:#fff1bc!important;background:linear-gradient(115deg,#263e42,#705025 72%,#3b3729)!important;border:2px solid #f6cf76!important;border-radius:9px;box-shadow:0 0 0 2px #ffe6a61c,0 4px 12px #0009,0 0 13px #f6cd5540;font-size:14px!important;font-weight:950!important;line-height:1.5;cursor:pointer;touch-action:manipulation}
.c2v32-rpg .c2v32-reward-jump:focus-visible{outline:3px solid #a5f8ef;outline-offset:3px}
.c2v32-rpg .c2v31-future{scroll-margin-top:15px}

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
/* Four-lens result: visible all candidate sources and their factual verification path, no tapping. */
.c2v32-rpg .c2v32-candidate-breakdown{margin:10px 0 0;padding:12px 10px 10px;border:1px solid #e0c47d;border-radius:11px;background:linear-gradient(154deg,rgba(5,40,48,.97),rgba(6,27,42,.96));box-shadow:inset 0 0 0 1px rgba(255,233,155,.12)}
.c2v32-rpg .c2v32-breakdown-title{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:2px 0 8px;border-bottom:1px solid rgba(237,198,122,.4)}
.c2v32-rpg .c2v32-breakdown-title span{font-size:16px;color:#ffebba;font-weight:950;line-height:1.45}
.c2v32-rpg .c2v32-breakdown-title small{font-size:12px!important;color:#e1efe8;font-weight:750}
.c2v32-rpg .c2v32-breakdown-intro{font-size:13px!important;line-height:1.6!important;margin:8px 0 11px!important;color:#f7f7ec!important}
.c2v32-rpg .c2v32-breakdown-intro strong{color:#ffe2a3}
.c2v32-rpg .c2v32-breakdown-entries{display:grid;gap:8px}
.c2v32-rpg .c2v32-breakdown-entry{border:1px solid rgba(188,202,182,.56);border-radius:10px;background:linear-gradient(135deg,rgba(16,54,63,.95),rgba(8,33,49,.94));padding:10px 9px;color:#f6f6f0;min-width:0}
.c2v32-rpg .c2v32-breakdown-entry-head{display:flex;align-items:center;gap:7px;min-width:0}
.c2v32-rpg .c2v32-breakdown-entry-head img,.c2v32-rpg .c2v32-breakdown-icon{width:49px;height:54px;flex:0 0 49px;object-fit:contain;image-rendering:pixelated}
.c2v32-rpg .c2v32-breakdown-name{flex:1;min-width:0;display:grid;gap:1px}
.c2v32-rpg .c2v32-breakdown-name strong{font-size:15px;line-height:1.4;color:#fff1c4;font-weight:950}
.c2v32-rpg .c2v32-breakdown-name small{font-size:12px!important;color:#dce9e7;line-height:1.35;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-breakdown-amount{text-align:right;flex:0 0 auto;max-width:53%;display:grid;justify-items:end}
.c2v32-rpg .c2v32-breakdown-amount strong{font-size:clamp(17px,4.75vw,21px);color:#ffe3a2;font-weight:950;font-variant-numeric:tabular-nums;line-height:1.35;white-space:nowrap}
.c2v32-rpg .c2v32-breakdown-amount small{font-size:12px!important;line-height:1.35;color:#dce9e5}

.c2v32-rpg .c2v32-breakdown-basis{font-size:12px!important;line-height:1.55!important;margin:6px 0 0!important;padding:7px 8px;border-radius:6px;color:#f0f4e9!important;background:rgba(6,26,38,.6);overflow-wrap:anywhere}
.c2v32-rpg .c2v32-breakdown-basis b{color:#baf4e5}
.c2v32-rpg .c2v32-breakdown-basis small{font-size:11px!important;line-height:1.5!important;color:#d6e9de!important}
.c2v32-rpg .c2v32-breakdown-reason,.c2v32-rpg .c2v32-breakdown-action{font-size:13px!important;line-height:1.6!important;margin:7px 0 0!important;color:#f0f3ea!important}
.c2v32-rpg .c2v32-breakdown-reason b{color:#f5daa2}
.c2v32-rpg .c2v32-breakdown-action{padding:7px 7px 2px;border-top:1px solid rgba(211,228,223,.23)}
.c2v32-rpg .c2v32-breakdown-action b{color:#aae8dc}
.c2v32-rpg .c2v32-breakdown-footnote{font-size:12px!important;line-height:1.65!important;margin:9px 0 0!important;color:#dce7e1!important}
.c2v32-rpg .c2v32-first-action--compact{padding:8px 10px;margin-top:8px}
.c2v32-rpg .c2v32-first-action--compact>p{font-size:13px!important;margin:3px 0!important}
.c2v32-rpg .c2v32-first-action--compact>small{font-size:12px}
@media(max-width:350px){.c2v32-rpg .c2v32-candidate-breakdown{padding:9px 7px}.c2v32-rpg .c2v32-breakdown-entry{padding:9px 6px}.c2v32-rpg .c2v32-breakdown-entry-head img,.c2v32-rpg .c2v32-breakdown-icon{width:38px;flex-basis:38px}.c2v32-rpg .c2v32-breakdown-amount{max-width:55%}.c2v32-rpg .c2v32-breakdown-amount strong{font-size:16px}}
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

/* Universal coverage awareness: editorial guidance, never a calculated saving. */
.c2v32-rpg .c2v32-cover-awareness{margin:13px 12px 14px;padding:13px 12px 10px;background:linear-gradient(145deg,rgba(11,43,53,.97),rgba(8,35,50,.99));border:1px solid rgba(122,195,189,.75);border-radius:14px;box-shadow:0 6px 15px rgba(0,0,0,.22)}
.c2v32-rpg .c2v32-cover-eyebrow{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 9px;font-size:12px;color:#b9f3e4;font-weight:900}
.c2v32-rpg .c2v32-cover-eyebrow small{font-size:11px!important;color:#e0eae8!important;font-weight:700}
.c2v32-rpg .c2v32-cover-content{display:flex;align-items:flex-start;gap:9px}
.c2v32-rpg .c2v32-cover-content img{width:52px;flex:0 0 52px;height:65px;object-fit:contain;image-rendering:pixelated}
.c2v32-rpg .c2v32-cover-content>div{flex:1;min-width:0}
.c2v32-rpg .c2v32-cover-content h2{font-size:clamp(17px,4.8vw,20px);line-height:1.45;margin:0 0 6px;color:#fff1bb;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-cover-content p{font-size:13px!important;line-height:1.62!important;margin:0!important;color:#eef3ed!important}
.c2v32-rpg .c2v32-cover-next{display:flex;gap:7px;align-items:flex-start;background:rgba(12,55,61,.9);border-left:3px solid #9edecf;border-radius:6px;padding:10px;margin-top:9px}
.c2v32-rpg .c2v32-cover-next span{flex:0 0 80px;color:#b9f4e7;font-size:12px;font-weight:900;line-height:1.55}
.c2v32-rpg .c2v32-cover-next strong{font-size:13px;line-height:1.55;color:#fff6d9}

.c2v32-rpg .c2v32-cover-reasons{display:grid;gap:7px;margin:11px 0 8px}
.c2v32-rpg .c2v32-cover-reasons>div{display:grid;grid-template-columns:84px minmax(0,1fr);align-items:start;gap:8px;padding:8px 9px;border-radius:8px;background:rgba(28,66,71,.64);border:1px solid rgba(156,211,204,.32)}
.c2v32-rpg .c2v32-cover-reasons strong{font-size:12px;line-height:1.6;color:#b8f7e3}
.c2v32-rpg .c2v32-cover-reasons span{font-size:12px;line-height:1.6;color:#eff4ed;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-cover-caution{font-size:12px!important;line-height:1.6!important;color:#f9dca3!important;margin:8px 0!important}
.c2v32-rpg .c2v32-cover-consult{margin:12px 0 5px;display:grid;gap:6px}
.c2v32-rpg .c2v32-cover-consult-button{width:100%;min-height:54px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border:2px solid #ffe8ac;border-radius:10px;background:linear-gradient(115deg,#f5da94,#f1be64);box-shadow:0 3px 11px rgba(0,0,0,.25);color:#122c37;font-size:15px;font-weight:950;line-height:1.35;text-align:left;cursor:pointer;touch-action:manipulation}
.c2v32-rpg .c2v32-cover-consult-button:focus-visible{outline:3px solid #b3f4ea;outline-offset:2px}
.c2v32-rpg .c2v32-cover-consult small{font-size:12px;line-height:1.55;color:#dbe8e3}
.c2v32-rpg .c2v32-cover-pilot-feedback{font-size:12px!important;line-height:1.5!important;color:#e9f7e4!important;margin:0!important}
@media(max-width:350px){.c2v32-rpg .c2v32-cover-reasons>div{grid-template-columns:72px minmax(0,1fr);gap:5px;padding:7px 5px}.c2v32-rpg .c2v32-cover-consult-button{font-size:14px}}
.c2v32-rpg .c2v32-cover-why{margin-top:4px}
.c2v32-rpg .c2v32-cover-why summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-size:12px;font-weight:850;color:#d9f1ee;padding:9px 4px;touch-action:manipulation}
.c2v32-rpg .c2v32-cover-why summary:focus-visible{outline:3px solid #abf0e2;outline-offset:2px}
.c2v32-rpg .c2v32-cover-why p{font-size:12px!important;line-height:1.67!important;color:#d5eee7!important;margin:5px 0!important}
@media(max-width:350px){.c2v32-rpg .c2v32-cover-awareness{margin-inline:9px;padding-inline:9px}.c2v32-rpg .c2v32-cover-content img{width:42px;height:54px;flex-basis:42px}.c2v32-rpg .c2v32-cover-next span{flex-basis:67px}}

/* Matched-scope take-home burden lens: participant data only, never an official average. */
.c2v32-rpg .c2v32-income-burden{margin:13px 0 15px;padding:14px 12px;border:1px solid #a5c9b5;border-radius:13px;background:linear-gradient(145deg,#123b3b,#122b39)}
.c2v32-rpg .c2v32-income-burden-head>span{display:block;font-size:12px;color:#f5d78f;font-weight:900}
.c2v32-rpg .c2v32-income-burden-head>strong{display:block;margin:5px 0 12px;font-size:19px;line-height:1.35;color:#fff}
.c2v32-rpg .c2v32-income-burden-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.c2v32-rpg .c2v32-income-burden-grid>div{min-width:0;border:1px solid #4d8582;border-radius:10px;padding:9px 7px;background:#0d2936}
.c2v32-rpg .c2v32-income-burden-grid>div:last-child{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px;border-color:#c0a25f;background:#193d39}
.c2v32-rpg .c2v32-income-burden-grid small{display:block;font-size:12px!important;line-height:1.35!important;color:#d3eae7}
.c2v32-rpg .c2v32-income-burden-grid strong{display:block;margin-top:6px;font-size:clamp(18px,5.7vw,23px);color:#fff0af;font-weight:900;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-income-burden-grid>div:last-child strong{font-size:28px;margin:0}
.c2v32-rpg .c2v32-income-burden>p{font-size:13px!important;color:#e2efec!important;line-height:1.7!important;margin:10px 0 5px!important}
.c2v32-rpg .c2v32-income-burden>small{display:block;font-size:11px!important;line-height:1.6;color:#e1d2a7}
.c2v32-rpg .c2v32-income-burden-unavailable{font-size:12px!important;line-height:1.6!important;border:1px solid #547381;border-radius:10px;background:#0b2938;padding:10px;color:#d6e4e7!important}
.c2v32-rpg .c2v32-category-burden{margin:8px 0 0!important;padding:9px 10px;border-radius:9px;border:1px solid #628a85;background:#102f33;color:#def4ec!important;font-size:13px!important;line-height:1.5!important}
.c2v32-rpg .c2v32-category-burden strong{font-size:17px;color:#fff0b5;font-weight:900}
.c2v32-rpg .c2v32-category-burden small{display:block;margin-top:3px;font-size:11px;color:#bed5d3}
@media(max-width:350px){.c2v32-rpg .c2v32-income-burden-grid strong{font-size:18px}.c2v32-rpg .c2v32-income-burden-grid>div:last-child strong{font-size:23px}}

/* Optional single-person bracket: no new required questions or storage. */
.c2v32-rpg .c2v32-income-food-single-optin{margin:12px 0 12px;border:1px solid #6b8f8d;border-radius:11px;padding:1px 12px 11px;background:#102d36}
.c2v32-rpg .c2v32-income-food-single-optin summary{font-size:14px;font-weight:850;min-height:48px;cursor:pointer;display:flex;align-items:center;color:#f9deb0;touch-action:manipulation}
.c2v32-rpg .c2v32-income-food-single-optin label{display:block;font-size:14px;line-height:1.6;color:#eaf5f4;margin:7px 0}
.c2v32-rpg .c2v32-income-food-single-optin select{width:100%;min-height:48px;padding:10px 11px;border:2px solid #8db9b0;border-radius:8px;background:#e8f2ed;color:#102f37;font-size:16px}
.c2v32-rpg .c2v32-income-food-single-optin select:focus-visible{outline:3px solid #f9dc84;outline-offset:2px}
.c2v32-rpg .c2v32-income-food-single-optin p{font-size:12px!important;line-height:1.6!important;color:#cbdedb!important;margin:7px 0 0!important}
/* FIES 2025 annual-income food table: independent marginal reference, NEVER savings. */
.c2v32-rpg .c2v32-income-food-context{scroll-margin-top:84px;margin:12px 0 17px;padding:15px 12px;border:1px solid #b99f69;border-radius:13px;background:linear-gradient(138deg,#2a323d,#102d3b 65%,#0f3940);box-shadow:0 6px 18px #0003}
.c2v32-rpg .c2v32-income-food-context .c2v2-kicker{font-size:12px;letter-spacing:.04em}
.c2v32-rpg .c2v32-income-food-context h3{font-size:21px;line-height:1.4;color:#ffedb5;margin:6px 0 8px}
.c2v32-rpg .c2v32-income-food-context>p{font-size:14px!important;line-height:1.65!important;margin:7px 0 12px!important;color:#e5f2ec!important}
.c2v32-rpg .c2v32-income-food-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.c2v32-rpg .c2v32-income-food-grid>div{min-width:0;padding:11px 9px;background:#0b2935;border:1px solid #6f8989;border-radius:10px}
.c2v32-rpg .c2v32-income-food-grid>div:last-child{border-color:#d8bc7b;background:#183842}
.c2v32-rpg .c2v32-income-food-grid small{font-size:13px!important;line-height:1.5;color:#d3e1e7;display:block}
.c2v32-rpg .c2v32-income-food-grid strong{font-size:clamp(17px,4.5vw,21px);line-height:1.5;font-weight:900;color:#ffecb0;display:block;overflow-wrap:anywhere;font-variant-numeric:tabular-nums;margin-top:7px}
.c2v32-rpg .c2v32-income-food-context .c2v32-income-food-disclaimer{font-size:13px!important;color:#e8f0e8!important}
.c2v32-rpg .c2v32-income-food-context .c2v32-income-food-note{font-size:13px!important;color:#f3dca7!important}
.c2v32-rpg .c2v32-income-food-sources{margin:10px 0 0;border-top:1px solid #718a86}
.c2v32-rpg .c2v32-income-food-sources summary{cursor:pointer;display:flex;align-items:center;min-height:48px;color:#e6f5ec;font-size:14px;font-weight:850;touch-action:manipulation}
.c2v32-rpg .c2v32-income-food-sources summary:focus-visible,.c2v32-rpg .c2v32-income-food-sources a:focus-visible{outline:3px solid #98f1df;outline-offset:2px}
.c2v32-rpg .c2v32-income-food-sources p{font-size:13px!important;color:#e4ede7!important;line-height:1.7}
.c2v32-rpg .c2v32-income-food-sources a{display:inline-block;padding:10px 0;font-size:14px;color:#ffe19b;text-decoration:underline}
@media(max-width:375px){.c2v32-rpg .c2v32-income-food-grid{grid-template-columns:minmax(0,1fr)}.c2v32-rpg .c2v32-income-food-grid strong{font-size:22px}}

/* V3.3 two-reference comparison — unify money, the same user-denominator rate,
   and the two independent statistical reference descriptions in each atlas row. */
.c2v32-rpg .c2v32-income-burden--compact{padding:12px 13px;margin:10px 0 13px;border-color:#83a9a1}
.c2v32-rpg .c2v32-income-burden--compact .c2v32-income-burden-head>strong{font-size:18px;margin:5px 0 3px}
.c2v32-rpg .c2v32-income-burden--compact>p{font-size:13px!important;line-height:1.6!important;margin:5px 0!important}
.c2v32-rpg .c2v32-income-food-context--merged{padding:12px;margin:10px 0 13px;box-shadow:none;border-color:#78988e;background:#13313d}
.c2v32-rpg .c2v32-income-food-context--merged h3{font-size:18px;margin:6px 0 5px}
.c2v32-rpg .c2v32-income-food-context--merged>p{margin:5px 0!important;font-size:13px!important}
.c2v32-rpg .c2v22-comparison-row{overflow-wrap:anywhere}
.c2v32-rpg .c2v32-merged-values{gap:7px;margin-bottom:5px}
.c2v32-rpg .c2v32-merged-values>span{min-width:0;padding:11px 9px}
.c2v32-rpg .c2v32-merged-values>span>b{font-size:clamp(16px,4.5vw,21px);font-variant-numeric:tabular-nums;line-height:1.4}
.c2v32-rpg .c2v32-merged-values .c2v32-inline-percent{display:block;margin-top:7px;padding-top:7px;border-top:1px solid #71949a;color:#e9f2dc;font-size:12px!important;line-height:1.5!important;font-weight:600}
.c2v32-rpg .c2v32-merged-values .c2v32-inline-percent b{color:#ffe8a1;font-size:15px}
.c2v32-rpg .c2v32-income-inline{padding:10px 11px;margin-top:8px;border:1px solid #c1a66c;border-radius:10px;background:#173b42;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.c2v32-rpg .c2v32-income-inline>div{min-width:0}
.c2v32-rpg .c2v32-income-inline small{display:block;font-size:12px!important;line-height:1.5!important;color:#dce9df}
.c2v32-rpg .c2v32-income-inline b{display:block;color:#ffe6a2;font-size:clamp(17px,4.6vw,21px);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.c2v32-rpg .c2v32-income-inline>small b{display:inline;color:#fff1b8;font-size:15px}
.c2v32-rpg .c2v32-comparison-story{margin:9px 0 5px!important;padding:9px 10px!important;background:#112f38;border-left:3px solid #8eb7b1;border-radius:0 8px 8px 0;color:#eaf4ec!important;font-size:14px!important;line-height:1.55!important}
.c2v32-rpg .c2v32-comparison-story>b{color:#ffdf9f}
.c2v32-rpg .c2v32-income-story{margin-top:5px!important;background:#14333a;border-left-color:#e6c17e}
.c2v32-rpg .c2v32-dual-reference-clue{padding:11px;margin:9px 0;border:1px solid #dbbe79;background:linear-gradient(120deg,#294035,#153640);border-radius:10px}
.c2v32-rpg .c2v32-dual-reference-clue strong{display:block;color:#ffe99e;font-size:16px;line-height:1.5}
.c2v32-rpg .c2v32-dual-reference-clue small{display:block;margin-top:5px;color:#dbead9;font-size:12px!important;line-height:1.6!important}
@media(max-width:375px){
 .c2v32-rpg .c2v32-income-inline{display:block}
 .c2v32-rpg .c2v32-income-inline>small{margin-top:5px}
 .c2v32-rpg .c2v32-merged-values>span>b{font-size:17px}
}

/* Secondary diagnostic clue: statistical overlap is NOT the savings upper. */
.c2v32-rpg .c2v32-statistical-buffer{margin:12px 3px 5px;padding:13px 12px;background:linear-gradient(145deg,#163842,#182e38);border:1px solid #c6a563;border-radius:13px;color:#eff8f2;box-shadow:inset 0 0 0 1px #ffffff12}
.c2v32-rpg .c2v32-statistical-buffer>span{display:block;font-size:12px;color:#ffe3a5;font-weight:900;letter-spacing:.02em}
.c2v32-rpg .c2v32-statistical-buffer>strong{display:block;margin-top:5px;font-size:19px;line-height:1.45}
.c2v32-rpg .c2v32-statistical-buffer .c2v32-statistical-gap{margin:8px 0!important;font-size:14px!important;line-height:1.6!important;color:#edf6ef!important}
.c2v32-rpg .c2v32-statistical-gap b{color:#ffe2a4;font-size:21px;white-space:nowrap}
.c2v32-rpg .c2v32-statistical-gap-items{display:flex;flex-wrap:wrap;gap:6px}
.c2v32-rpg .c2v32-statistical-gap-items span{padding:6px 9px;border:1px solid #668d8e;background:#10313b;border-radius:7px;color:#e3f4ef;font-size:12px}
.c2v32-rpg .c2v32-statistical-gap-items b{font-variant-numeric:tabular-nums;color:#ffe1a6}
.c2v32-rpg .c2v32-statistical-buffer>small{display:block;margin-top:9px;font-size:12px;line-height:1.6;color:#c8deda}
.c2v32-rpg .c2v32-statistical-buffer button{width:100%;min-height:48px;margin-top:10px;border:1px solid #9baeb4;border-radius:9px;background:#163941;color:#f8ecc6;font-size:14px;font-weight:850;cursor:pointer}

.c2v32-rpg .c2v32-income-food-context--merged .c2v32-income-scope-warning{padding:7px 9px;margin:7px 0!important;border-left:3px solid #e2c280;background:#143e41;color:#ffe5b0!important;font-size:12px!important;line-height:1.6!important}
`;
