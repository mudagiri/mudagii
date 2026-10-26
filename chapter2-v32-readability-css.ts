/**
 * Chapter 2 V3.2 legibility repair.
 *
 * Must load AFTER V22COMPARISONCSS. The comparison atlas uses parchment,
 * so dark-game text inherited into its nested labels creates light-on-light.
 * Establish one explicit light "reading surface" inside the atlas, solid
 * text/panel pairings, and ink that passes >=4.5:1 body contrast.
 *
 * The guild backdrop, mascot, RPG lighting and job palette are untouched.
 */
export const V32READABILITYCSS = `
/* RPG scenery stays dark, but never place a data paragraph directly on scenery. */
.c2v32-rpg .c2v31-encyclopedia{
 background-color:#0b2936;
 background-image:linear-gradient(160deg,rgba(8,33,44,.98),rgba(8,34,43,.97))!important;
 border-color:#bca16b;
 color:#f5f7ed;
}
.c2v32-rpg .c2v31-encyclopedia>.c2v22-ledger-intro{
 color:#edf4ef!important;font-size:14px;line-height:1.68;
}
.c2v32-rpg .c2v22-comparison-ledger{
 background-color:#f5eee1;
 background-image:linear-gradient(156deg,#fff9ed,#f1ecdf);
 border:2px solid #b99456;
 color:#20363a;
 box-shadow:0 8px 23px rgba(0,0,0,.24);
}
.c2v32-rpg .c2v22-comparison-row{color:#20363a;border-bottom-color:#c7bca7}
.c2v32-rpg .c2v22-comparison-head .c2v23-comparison-identity strong{color:#182f37}
.c2v32-rpg .c2v22-comparison-head .c2v23-comparison-identity small{color:#3a4a49}
.c2v32-rpg .c2v22-comparison-head .c2v23-comparison-status{background:#e2e9df;color:#173d3d;border-color:#9bab97}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span{
 background:#f0ece1;
 border:1px solid #c6bfae;
 color:#20383d;
 padding:10px 9px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span:nth-child(2){
 background:#e4eee8;
 border-color:#aac7b9;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span>small{
 color:#334f51;font-size:13px!important;font-weight:800;line-height:1.5;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span>b{
 color:#132f38!important;font-size:clamp(16px,4.55vw,20px);font-weight:950;
 letter-spacing:-.035em;white-space:normal;overflow-wrap:anywhere;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span:nth-child(2)>b{
 color:#12463e!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values .c2v32-inline-percent{
 color:#274345!important;border-top:1px solid #b3bbaa;display:block;
 margin-top:7px;padding-top:7px;font-size:13px!important;
 font-weight:750;line-height:1.55!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values .c2v32-inline-percent b{
 color:#17463e!important;font-size:17px;letter-spacing:0;font-weight:950;
}
/* Distinct official-income reference, still on the same light reading surface. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-income-inline{
 background:#fff3d8;border:1.5px solid #ae8a43;border-radius:10px;
 padding:11px 12px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-income-inline small{
 color:#4a442f!important;font-size:13px!important;line-height:1.6!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-income-inline b{
 color:#66420e!important;font-weight:950;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-income-inline>small b{
 color:#4e390f!important;
}
/* Narrative statements: warm/pale panel and genuine dark reading ink. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-comparison-story{
 background:#e7f0ed;color:#193a40!important;border-left:4px solid #336f67;
 font-size:14px!important;line-height:1.65!important;padding:10px 11px!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-comparison-story>b{
 color:#11534a!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-income-story{
 background:#fbefda;color:#3c3527!important;border-left-color:#af813d;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-income-story>b{
 color:#694315!important;
}
/* Published burden ratio: forest parchment rather than three competing dark cards. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card{
 background:#e4f1eb;color:#173a3b;border:1.5px solid #7aab99;
 box-shadow:inset 0 1px 0 #fff8;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-head>span{
 color:#244343;font-size:13px!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-head>span strong{
 color:#123e42!important;font-size:15px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-head>strong{
 color:#0c4944!important;font-size:clamp(23px,6.1vw,30px);
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-comparison>div{
 background:#fffdf6;border:1.5px solid #a5c6b8;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-comparison small{
 color:#385353!important;font-size:13px!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-comparison b{
 color:#124740!important;font-size:clamp(20px,5.4vw,24px);
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card>p{
 color:#244346!important;font-size:14px!important;
 line-height:1.68!important;padding:0;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card>small{
 color:#365451!important;font-size:13px!important;line-height:1.67!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card .c2v32-worker-rate-overlap{
 background:#fef1d3;color:#493610!important;border:1px solid #c7a363;
 padding:10px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-overlap b{
 color:#64400c!important;
}
/* Fallback two-reference clue uses warm parchment with dark ink too. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-dual-reference-clue{
 background:#fff0d7;border:1.5px solid #b28d4a;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-dual-reference-clue strong{
 color:#66410e!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-dual-reference-clue small{
 color:#4c432e!important;font-size:13px!important;
}
/* Criteria, citations and explanatory footnotes must NEVER inherit RPG-white. */
.c2v32-rpg .c2v22-comparison-ledger .c2v22-comparison-source{
 color:#263f40!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-context-brief{
 color:#263f40!important;font-size:14px!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-context-brief b{
 color:#115147!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-evidence-toggle{
 color:#124b45!important;font-size:14px;min-height:44px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-comparison-evidence{
 background:#edf5ef;border-color:#a7c5b4;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-comparison-evidence p{
 color:#2a4444!important;font-size:13px!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v22-comparison-review{
 background:#fbead0;color:#3c3529;border-left-color:#a57832;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v22-comparison-review span{
 color:#3d463e!important;
}
.c2v32-rpg .c2v31-encyclopedia>.c2v22-ledger-footnote{
 color:#e6f0e9!important;font-size:13px!important;font-weight:650;
 line-height:1.7!important;background:#153845;
 border:1px solid #638382;border-radius:9px;
 padding:11px 12px;margin:11px 0 12px;
}
/* Deep quest panels retain their distinct dark theme but gain opaque text bases. */
.c2v32-rpg .c2v32-statistical-buffer{
 background:#102e3d;border:2px solid #c8a769;color:#f5f8ef;
 box-shadow:inset 0 0 0 1px #d8ead019,0 9px 16px #0003;
}
.c2v32-rpg .c2v32-statistical-buffer>strong{
 color:#fff4c9!important;
}
.c2v32-rpg .c2v32-statistical-buffer .c2v32-statistical-gap{
 color:#f0f5f0!important;
}
.c2v32-rpg .c2v32-statistical-buffer>small{
 color:#e0eee9!important;font-size:13px!important;line-height:1.65;
}
.c2v32-rpg .c2v32-statistical-gap-items span{
 background:#0b2934;color:#eef5eb;border-color:#7f9c94;
 font-size:13px;padding:8px 9px;
}
.c2v32-rpg .c2v32-statistical-gap-items small{
 color:#dfebdf;font-size:12px;line-height:1.55;
}
.c2v32-rpg .c2v32-statistical-buffer button{
 color:#fff3d6;background:#184a4d;border-color:#c5b481;font-size:15px;
}
.c2v32-rpg .c2v32-income-burden--compact{
 background:#0f3240;border:1.5px solid #8bb8b0;
}
.c2v32-rpg .c2v32-income-burden--compact>p{
 color:#f0f6f0!important;font-size:14px!important;line-height:1.7!important;
}
.c2v32-rpg .c2v32-income-burden--compact>small{
 color:#e3eddc!important;font-size:13px!important;
}
.c2v32-rpg .c2v32-income-food-context--merged{
 background:#0f3240;border:1.5px solid #b7ab78;
}
.c2v32-rpg .c2v32-income-food-context--merged>p{
 color:#edf5ef!important;font-size:14px!important;line-height:1.68!important;
}
.c2v32-rpg .c2v32-income-food-context--merged .c2v32-income-food-note,
.c2v32-rpg .c2v32-income-food-context--merged .c2v32-income-scope-warning{
 color:#ffe3ad!important;
}
.c2v32-rpg .c2v32-income-food-context--merged .c2v32-worker-sample-warning{
 background:#fff0d5;color:#523916!important;
 border:1px solid #d3ae68;border-left:4px solid #b17d36;
 padding:10px 11px;
}
.c2v32-rpg .c2v32-income-food-context--merged .c2v32-worker-source-inline{
 color:#ecf4e6!important;font-size:13px!important;
}
.c2v32-rpg .c2v32-income-food-sources summary{
 color:#fff2c8!important;font-size:14px;
}
.c2v32-rpg .c2v32-income-food-sources p{
 color:#ebf2ef!important;font-size:13px!important;
}
/* Confirmed coin pouch uses cream; explicitly pin DARK text on this surface. */
.c2v32-rpg .c2v31-reward-confirmed .c2v31-confirmed-amount span{
 color:#4a4132!important;font-size:13px;
}
.c2v32-rpg .c2v31-reward-confirmed .c2v31-confirmed-caption{
 color:#51452e!important;font-size:13px;
}
@media(max-width:350px){
 .c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span{padding:8px 6px}
 .c2v32-rpg .c2v22-comparison-ledger .c2v32-merged-values>span>b{font-size:16px}
 .c2v32-rpg .c2v22-comparison-ledger .c2v32-inline-percent{font-size:12px!important}
}
@media(prefers-reduced-motion:reduce){
 .c2v32-rpg .c2v32-statistical-buffer,
 .c2v32-rpg .c2v22-comparison-ledger{transition:none!important}
}

/* Income-only observation is an optional secondary reference, not an
   age-matched peer number. Readable but never a savings CTA. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--income-only{
 background:#eff5ee;border:1px solid #b9c9bd;padding:0 10px 9px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--income-only summary{
 display:flex;align-items:center;min-height:48px;padding:8px 1px;
 font-size:14px;font-weight:800;line-height:1.55;color:#25463e;
 cursor:pointer;touch-action:manipulation;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--income-only summary:focus-visible{
 outline:3px solid #136a5b;outline-offset:2px;border-radius:5px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--income-only[open]{
 border-color:#7caba0;
}

/* Verified 2024 cross-tab — visually primary, unlike 2025 income-only details. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income{
 background:#dcf0e5;border:2px solid #4e917b;border-radius:12px;
 padding:12px 11px;color:#163b35;box-shadow:0 2px 0 #e6f7ee inset;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income .c2v32-worker-rate-head>span>strong{
 font-size:15px;color:#17463b!important;display:block;line-height:1.4;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income .c2v32-worker-rate-head>span>small{
 font-size:12px!important;color:#31574c;line-height:1.6;display:block;margin-top:3px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income .c2v32-worker-rate-head>strong{
 color:#15543f!important;font-variant-numeric:tabular-nums;
 font-size:clamp(20px,5.9vw,28px);line-height:1.45;white-space:normal;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income .c2v32-worker-rate-comparison{
 margin:9px 0;grid-template-columns:repeat(2,minmax(0,1fr));
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income .c2v32-worker-rate-comparison>div{
 border:1px solid #98b8a5;background:#fffaf0;padding:8px 7px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income .c2v32-worker-rate-comparison b{
 font-size:clamp(18px,4.7vw,22px)!important;color:#154539!important;
 overflow-wrap:anywhere;line-height:1.4;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>p{
 color:#1b413e!important;font-size:14px!important;line-height:1.7!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>small{
 color:#36534c!important;font-size:12px!important;line-height:1.7!important;
}

/* Head-of-household age verification is optional, never hidden in RPG scenery. */
.c2v32-rpg .c2v32-peer-age-confirm{
 background:#fff7e9;border:1.5px solid #bb9858;border-radius:12px;
 margin:12px 0 14px;padding:12px 13px;color:#203b3c;
 box-shadow:0 5px 12px rgba(0,0,0,.12);
}
.c2v32-rpg .c2v32-peer-age-confirm>label{
 display:flex;align-items:center;gap:12px;min-height:49px;cursor:pointer;
}
.c2v32-rpg .c2v32-peer-age-confirm input{
 flex:0 0 auto;width:24px;height:24px;accent-color:#0b6959;
}
.c2v32-rpg .c2v32-peer-age-confirm label span{display:block;min-width:0;}
.c2v32-rpg .c2v32-peer-age-confirm label strong{
 display:block;color:#153f3c;font-size:15px;line-height:1.55;font-weight:900;
}
.c2v32-rpg .c2v32-peer-age-confirm label small{
 display:block;color:#3f514c!important;font-size:13px!important;line-height:1.65;
}
.c2v32-rpg .c2v32-peer-age-confirm>p{
 color:#3c504b!important;margin:7px 0 0;font-size:13px!important;line-height:1.68!important;
}
.c2v32-rpg .c2v32-peer-age-confirm input:focus-visible{
 outline:3px solid #078976;outline-offset:3px;
}

/* Progressive disclosure: the source match is acknowledged at the selection,
 * not only after scrolling through all twelve expense categories. */
.c2v32-rpg .c2v32-high-income-match-status{
 color:#f5f2dd!important;font-size:14px!important;line-height:1.65!important;
 border-top:1px solid #688b88;padding:10px 0 0;margin:10px 0 2px;
 font-weight:650;
}
.c2v32-rpg .c2v32-income-food-single-optin summary:focus-visible,
.c2v32-rpg .c2v32-income-food-single-optin select:focus-visible{
 outline:3px solid #b1e8e0;outline-offset:3px;
}

/* Peer cohort, never a user's own-income-scaled synthetic average. */
.c2v32-rpg .c2v32-peer-guide{
 margin:12px 0;padding:14px 13px;border:1.5px solid #9cbdad;
 border-radius:12px;background:#12393e;color:#f5f5e8;
}
.c2v32-rpg .c2v32-peer-guide>strong{
 display:block;color:#ffdf90;font-size:16px;line-height:1.55;font-weight:900;
}
.c2v32-rpg .c2v32-peer-guide>p{
 font-size:14px!important;line-height:1.7!important;color:#eef5ef!important;
 margin:8px 0!important;
}
.c2v32-rpg .c2v32-peer-guide>p strong{color:#fff0b6}
.c2v32-rpg .c2v32-peer-guide>small{
 display:block;font-size:12px!important;line-height:1.65!important;color:#d3e5dd!important;
}
.c2v32-rpg .c2v32-income-food-single-optin[open]{
 border-color:#c5b46c;box-shadow:0 0 0 1px rgba(197,180,108,.15);
}
.c2v32-rpg .c2v32-merged-values>span>small{overflow-wrap:anywhere}

/* Optional scope limitations: collapse by default to keep the reward-first UX. */
.c2v32-rpg .c2v32-peer-coverage-audit{
 background:#15323a;border:1px solid #658d84;border-radius:12px;
 color:#f2f4ed;margin:10px 0 16px;padding:7px 12px;
}
.c2v32-rpg .c2v32-peer-coverage-audit summary{
 min-height:44px;display:flex;align-items:center;color:#ffe3a0!important;
 font-size:14px!important;line-height:1.55!important;font-weight:850;
 cursor:pointer;list-style:revert;
}
.c2v32-rpg .c2v32-peer-coverage-audit>p,
.c2v32-rpg .c2v32-peer-coverage-audit>small{
 display:block;color:#e3f0e9!important;line-height:1.65!important;font-size:13px!important;
}
.c2v32-rpg .c2v32-peer-coverage-audit ul{
 padding:0;margin:12px 0;list-style:none;display:grid;gap:8px;
}
.c2v32-rpg .c2v32-peer-coverage-audit li{
 padding:10px 11px;background:#edf3ee;border-radius:9px;color:#193b34;
}
.c2v32-rpg .c2v32-peer-coverage-audit li strong{
 color:#17392e;display:block;font-size:14px;line-height:1.5;margin-bottom:3px;
}
.c2v32-rpg .c2v32-peer-coverage-audit li span{
 color:#29453e;display:block;font-size:13px;line-height:1.6;overflow-wrap:anywhere;
}
.c2v32-rpg .c2v32-peer-coverage-audit summary:focus-visible{
 outline:3px solid #b1e8e0;outline-offset:3px;
}
.c2v32-rpg [data-section^="PEER_SCOPE_CAVEAT_"]{
 display:block;color:#36534c!important;font-size:12px!important;line-height:1.65!important;
 margin-top:7px;overflow-wrap:anywhere;
}

/* Same income step, optional cohort refinement: no extra mandatory question. */
.pre-profile-v4 .pre-annual-peer-optin{
 margin:18px 0 8px;padding:14px 13px;background:#173d46;
 border:1px solid #c6aa72;border-radius:12px;color:#f5f6ed;
}
.pre-profile-v4 .pre-annual-peer-optin strong{
 display:block;color:#ffe3a3;font-size:16px;line-height:1.5;
}
.pre-profile-v4 .pre-annual-peer-optin p,
.pre-profile-v4 .pre-annual-peer-optin small{
 display:block;color:#e4f0ee;font-size:13px;line-height:1.65;margin:8px 0;
}
.pre-profile-v4 .pre-annual-peer-optin select{
 width:100%;min-height:48px;background:#fff;color:#1e3330;
 border:2px solid #d1b77a;border-radius:10px;font-size:16px;
}
.pre-profile-v4 .pre-annual-peer-optin select:focus-visible{
 outline:3px solid #ffdf8e;outline-offset:2px;
}
/* A comparison gap, never a green savings banner. */
.c2v32-rpg .c2v32-peer-gap-card{
 margin:9px 0 10px;border:1px solid #aec2b5;background:#f4f7ee;
 border-radius:11px;padding:12px 13px;color:#193c33;
}
.c2v32-rpg .c2v32-peer-gap-card>span{
 display:block;color:#334e43;font-weight:850;font-size:13px;line-height:1.55;
}
.c2v32-rpg .c2v32-peer-gap-card>strong{
 display:block;color:#0d4650;font-size:19px;line-height:1.5;font-weight:950;
 font-variant-numeric:tabular-nums;margin:3px 0;
}
.c2v32-rpg .c2v32-peer-gap-card>p{
 font-size:14px!important;line-height:1.7!important;
 color:#1c4039!important;margin:4px 0 8px;
}
.c2v32-rpg .c2v32-peer-gap-card>p b{
 font-variant-numeric:tabular-nums;font-weight:950;
 color:#0f5361;font-size:17px;
}
.c2v32-rpg .c2v32-peer-gap-card>small{
 display:block;font-size:12px!important;line-height:1.65!important;
 color:#496159!important;
}

/* One major candidate is expanded; the other candidates are condensed. */
.c2v32-rpg .c2v32-more-candidates{
 border:1px solid #879d8f;border-radius:11px;margin:9px 0;
 background:#18363c;color:#fff0c6;padding:7px 10px;
}
.c2v32-rpg .c2v32-more-candidates summary{
 cursor:pointer;min-height:44px;display:flex;align-items:center;
 font-size:14px;line-height:1.5;font-weight:850;color:#ffde98;
}
.c2v32-rpg .c2v32-more-candidates summary:focus-visible{
 outline:3px solid #a7e6df;outline-offset:3px;
}
.c2v32-rpg .c2v32-more-candidate{
 display:flex;align-items:center;gap:9px;margin:7px 0;
 padding:10px 8px;background:#ecf2eb;border-radius:9px;color:#17392f;
}
.c2v32-rpg .c2v32-more-candidate img{
 width:42px;height:42px;object-fit:contain;flex:0 0 42px;
}
.c2v32-rpg .c2v32-more-candidate>div{flex:1;min-width:0}
.c2v32-rpg .c2v32-more-candidate>div strong{
 display:block;color:#15352d;font-size:14px;line-height:1.5;
}
.c2v32-rpg .c2v32-more-candidate>div small{
 display:block;color:#395549;font-size:12px;line-height:1.55;
}
.c2v32-rpg .c2v32-more-candidate>span{
 flex:0 0 auto;color:#14544b;font-weight:850;font-size:14px;
 font-variant-numeric:tabular-nums;
}
.c2v32-rpg .c2v32-more-candidate>span small{
 display:block;color:#466157;text-align:right;font-size:11px;
}

/* Matched benchmark is printed ONCE in the main value pair. Source is optional. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-peer-evidence{
 background:#edf4ed;border:1px solid #99b3a6;box-shadow:none;
 margin:8px 0 7px;padding:5px 11px;border-radius:10px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-peer-evidence>summary{
 display:flex;align-items:center;min-height:44px;
 font-size:13px;line-height:1.55;font-weight:800;
 color:#17594c;cursor:pointer;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-peer-evidence>summary:focus-visible{
 outline:3px solid #136a5b;outline-offset:2px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-peer-evidence[open]{
 border-color:#528a79;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-peer-evidence-body{
 border-top:1px solid #b4c9bd;padding-top:5px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-peer-evidence-body p{
 margin:7px 0;font-size:12px!important;line-height:1.7!important;
 color:#28483d!important;overflow-wrap:anywhere;
}

/* One collapsed explanation for the 2024 matched and 2025 income-only methods. */
.c2v32-rpg .c2v32-income-method-detail{
 padding:7px 12px;margin:12px 0;border:1px solid #789e91;
 border-radius:11px;background:#183940;color:#f4f7f2;
}
.c2v32-rpg .c2v32-income-method-detail>summary{
 display:flex;align-items:center;min-height:44px;cursor:pointer;
 font-size:14px;font-weight:900;line-height:1.55;color:#ffe19c;
}
.c2v32-rpg .c2v32-income-method-detail>summary:focus-visible{
 outline:3px solid #a7e6df;outline-offset:2px;
}
.c2v32-rpg .c2v32-income-method-detail[open]{
 padding-bottom:13px;
}

/* One compact action per category; all secondary statistical narratives
   remain discoverable rather than cluttering the result. */
.c2v32-rpg .c2v32-auxiliary-comparisons{
 border:1px solid #b8c9bb;border-radius:10px;margin:8px 0;
 padding:4px 10px;background:#f2f6f2;color:#23493b;
}
.c2v32-rpg .c2v32-auxiliary-comparisons>summary{
 display:flex;align-items:center;cursor:pointer;min-height:44px;
 color:#1c574b;font-weight:850;font-size:13px;line-height:1.5;
}
.c2v32-rpg .c2v32-auxiliary-comparisons>summary:focus-visible{
 outline:3px solid #146b5c;outline-offset:2px;
}
.c2v32-rpg .c2v32-auxiliary-comparisons p{
 font-size:13px!important;line-height:1.7!important;
 color:#26453b!important;margin:5px 0 9px!important;
}
.c2v32-rpg .c2v32-single-next-action{
 display:grid;gap:4px;margin:10px 0 0;padding:10px 11px;
 border:1px solid #c0aa67;border-radius:10px;
 background:#fcf7e8;color:#52431f;
}
.c2v32-rpg .c2v32-single-next-action>span{
 font-size:13px;line-height:1.55;color:#564321;
}
.c2v32-rpg .c2v32-single-next-action>span b{
 font-size:15px;font-weight:900;color:#644012;
 font-variant-numeric:tabular-nums;
}
.c2v32-rpg .c2v32-single-next-action>small{
 font-size:13px;line-height:1.6;color:#4c4331;
}

.c2v32-rpg .c2v32-action-evidence{
 margin-top:5px;border-top:1px solid #d4c59f;padding-top:4px;
}
.c2v32-rpg .c2v32-action-evidence>summary{
 cursor:pointer;display:flex;align-items:center;min-height:44px;
 color:#604d28;font-size:13px;font-weight:850;line-height:1.5;
}
.c2v32-rpg .c2v32-action-evidence>summary:focus-visible{
 outline:3px solid #76602d;outline-offset:2px;
}
.c2v32-rpg .c2v32-action-evidence>p{
 font-size:13px!important;line-height:1.7!important;
 color:#50432a!important;margin:3px 0 6px!important;
}

/* Same-cohort comparison: three figures are a single decision unit.
   Always neutral, never a green "saving" or treasure reward. */
.c2v32-rpg .c2v32-peer-gap-card--three-way{
 border:2px solid #638e86;background:#f0f6ee;
 padding:13px 12px;color:#173d37;
}
.c2v32-rpg .c2v32-peer-gap-heading{
 display:block;color:#144e42;font-size:15px;font-weight:950;line-height:1.5;
 margin-bottom:9px;
}
/* One visible expense alongside the validated peer comparison; no duplicate legacy values. */
.c2v32-rpg .c2v32-peer-own-amount{
 display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;
 gap:4px 8px;margin:0 0 10px!important;padding:8px 9px;
 border-radius:8px;background:#e4eee5;color:#20493b!important;
 font-size:14px!important;font-weight:800;line-height:1.55!important;
}
.c2v32-rpg .c2v32-peer-own-amount b{
 color:#163d36;font-size:17px;font-weight:950;
 font-variant-numeric:tabular-nums;
}
.c2v32-rpg .c2v32-peer-3way{
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
 gap:8px;margin:0 0 10px;
}
.c2v32-rpg .c2v32-peer-metric{
 min-width:0;display:flex;flex-direction:column;gap:4px;
 background:#fffdf7;border:1px solid #b8cbbd;border-radius:9px;
 padding:10px 8px;
}
.c2v32-rpg .c2v32-peer-metric>span{
 color:#32544a;font-size:14px;line-height:1.5;font-weight:850;
}
.c2v32-rpg .c2v32-peer-metric>strong{
 font-size:clamp(19px,5vw,24px);line-height:1.28;
 font-weight:950;font-variant-numeric:tabular-nums;color:#174a44;
 overflow-wrap:anywhere;
}
.c2v32-rpg .c2v32-peer-metric>small{
 margin-top:auto;color:#52695d;font-size:13px;line-height:1.55;
}
.c2v32-rpg .c2v32-peer-metric--difference{
 grid-column:1/-1;border-color:#c4a96a;background:#fff8e6;
}
.c2v32-rpg .c2v32-peer-metric--difference>strong{
 font-size:clamp(21px,5.5vw,26px);color:#59491d;
}
.c2v32-rpg .c2v32-peer-gap-translation{
 display:flex;align-items:flex-start;flex-direction:column;gap:4px;
 font-size:13px!important;line-height:1.6!important;margin:0 0 8px!important;
}
.c2v32-rpg .c2v32-peer-gap-translation>strong{
 font-weight:900;
}
.c2v32-rpg .c2v32-peer-gap-translation>b{
 font-size:clamp(17px,4.8vw,21px);line-height:1.45;
 font-variant-numeric:tabular-nums;overflow-wrap:anywhere;
}
.c2v32-rpg .c2v32-peer-gap-disclaimer{
 display:block;color:#3e574e!important;font-size:13px!important;line-height:1.7!important;
}
.c2v32-rpg .c2v32-peer-scope-unmatched{
 margin:8px 0;padding:9px 11px;border-left:3px solid #8a8870;
 font-size:13px;line-height:1.65;color:#334e47;
 background:#edf1e9;
}
@media(max-width:350px){
 .c2v32-rpg .c2v32-peer-3way{grid-template-columns:minmax(0,1fr)}
}

/* Four-lens disclosure audit: show the official source applicability once.
   Do NOT imply seven related categories have directly comparable averages. */
.c2v32-rpg .c2v32-coverage-legend{
 display:grid;gap:5px;margin:12px 0 3px;padding:11px 12px;
 background:#eef5eb;color:#1d4239;border:1.5px solid #a5bca9;
 border-radius:10px;
}
.c2v32-rpg .c2v32-coverage-legend>strong{
 font-size:15px;line-height:1.5;font-weight:950;color:#153d34;
}
.c2v32-rpg .c2v32-coverage-legend>span{
 display:block;font-size:13px;line-height:1.6;font-weight:750;
 color:#29483f;padding-left:10px;border-left:3px solid #a2b3a8;
 overflow-wrap:anywhere;
}
.c2v32-rpg .c2v32-coverage-legend>small{
 display:block;font-size:12px!important;line-height:1.65!important;
 color:#385349!important;margin-top:4px;
}
/* High-income reference had seven long OPEN related-fee cards by default.
   Make high/middle/single equally concise and keep a real public source
   number visible without falsely calling it the diagnosis-category mean. */
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>summary{
 display:flex;flex-wrap:wrap;align-items:center;column-gap:5px;row-gap:3px;
 min-height:52px;padding:8px 4px;
 color:#164d3f!important;font-size:13px!important;line-height:1.55!important;
 font-weight:850!important;cursor:pointer;touch-action:manipulation;
 overflow-wrap:anywhere;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>summary b{
 color:#12493c!important;font-size:clamp(14px,4vw,16px)!important;
 font-weight:950!important;font-variant-numeric:tabular-nums;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>summary small{
 color:#38584d!important;font-size:12px!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-related-open-hint{
 margin-left:auto;white-space:nowrap;color:#23604d!important;
 font-size:12px!important;font-weight:950!important;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income[open] .c2v32-related-open-hint{opacity:.8}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>summary:focus-visible{
 outline:3px solid #146b5b;outline-offset:2px;border-radius:6px;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v32-related-public-detail:not([open]){
 padding-top:0;padding-bottom:0;
}
@media(max-width:350px){
 .c2v32-rpg .c2v32-coverage-legend{padding:9px 8px}
 .c2v32-rpg .c2v22-comparison-ledger .c2v32-worker-rate-card--age-income>summary{
  font-size:12px!important;line-height:1.5!important;
 }
}

/* V3.2 lean result: one 3/7/2 legend, clear conditions, optional source detail. */
.c2v32-rpg .c2v32-peer-guide--compact{padding:9px 11px;margin:8px 0 10px;border-width:1px}
.c2v32-rpg .c2v32-peer-guide--compact>strong{font-size:15px;line-height:1.5}
.c2v32-rpg .c2v32-peer-guide--compact>p{
 font-size:13px!important;line-height:1.55!important;margin:5px 0!important;
}
.c2v32-rpg .c2v32-peer-guide--compact>p b{color:#fff0c0;font-weight:850}
.c2v32-rpg .c2v32-peer-guide .c2v32-coverage-legend{
 background:transparent;color:#e4f4ef;border:0;border-top:1px solid #647e74;
 padding:2px 0 0;margin:7px 0 0;border-radius:0;display:block;
}
.c2v32-rpg .c2v32-coverage-legend>summary{
 cursor:pointer;display:flex;align-items:center;min-height:44px;font-size:13px;
 color:#ffdf99!important;font-weight:850;line-height:1.55;touch-action:manipulation;
}
.c2v32-rpg .c2v32-coverage-legend>summary:focus-visible{outline:3px solid #a3ebda;outline-offset:2px}
.c2v32-rpg .c2v32-coverage-legend>p,
.c2v32-rpg .c2v32-coverage-legend>small{
 color:#e1ebe7!important;font-size:13px!important;line-height:1.65!important;
 padding:0;margin:6px 0!important;
}
.c2v32-rpg .c2v32-peer-condition-caption{display:block;color:#d2e7e2!important;font-size:12px!important;margin-top:3px}
.c2v32-rpg .c2v32-income-food-single-optin .c2v32-edit-note{font-size:12px!important;line-height:1.55!important}
.c2v32-rpg .c2v32-income-burden--compact{padding:9px 10px!important;margin:8px 0!important}
.c2v32-rpg .c2v32-income-burden--compact .c2v32-income-burden-head{gap:4px}
.c2v32-rpg .c2v32-income-burden--compact>p{
 font-size:12px!important;line-height:1.6!important;margin:5px 0!important;
}
.c2v32-rpg .c2v32-peer-age-confirm{margin:6px 0!important;padding:8px 10px!important}
.c2v32-rpg .c2v32-peer-age-confirm>label{min-height:44px!important;gap:9px!important}
.c2v32-rpg .c2v32-peer-age-confirm>p{font-size:12px!important;margin:1px 0 0!important}
.c2v32-rpg .c2v32-peer-gap-card--three-way{padding:10px 9px;margin:5px 0 7px}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-gap-heading{
 margin-bottom:6px!important;font-size:14px!important;
}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-own-amount{
 padding:5px 8px!important;margin:0 0 6px!important;font-size:13px!important;
}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-3way{
 gap:5px;margin-bottom:6px;
}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-metric{
 padding:7px 7px;gap:2px;
}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-metric>span{font-size:12px!important}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-metric>strong{font-size:clamp(17px,4.8vw,22px)!important}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-metric--difference{
 display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:3px 8px;
 padding:7px 9px;
}
.c2v32-rpg .c2v32-peer-gap-card--three-way .c2v32-peer-metric--difference>small{
 flex:0 0 100%;margin:0;font-size:12px!important;line-height:1.5;
}
.c2v32-rpg .c2v32-peer-gap-method{border-top:1px solid #cad4cb;margin-top:8px}
.c2v32-rpg .c2v32-peer-gap-method>summary{
 min-height:44px;display:flex;align-items:center;cursor:pointer;
 color:#255a4f!important;font-size:13px!important;font-weight:850!important;line-height:1.5!important;
}
.c2v32-rpg .c2v32-peer-gap-method>summary:focus-visible{outline:3px solid #27806d;outline-offset:2px}
.c2v32-rpg .c2v32-peer-gap-method .c2v32-peer-gap-translation{
 display:grid;gap:4px;background:#f2eee0;border-radius:8px;
 padding:9px;color:#264f44!important;font-size:13px!important;
}
.c2v32-rpg .c2v32-peer-gap-method .c2v32-peer-gap-translation b{
 color:#274e42;font-size:clamp(18px,5vw,22px);
}
.c2v32-rpg .c2v32-peer-gap-method .c2v32-peer-gap-disclaimer{
 color:#3d554d!important;font-size:13px!important;line-height:1.7!important;
}
.c2v32-rpg .c2v32-candidate-method,
.c2v32-rpg .c2v32-future-method,
.c2v32-rpg .c2v32-cover-summary-details{
 margin:6px 0;border-top:1px solid rgba(178,161,116,.45);padding-top:2px;
}
.c2v32-rpg .c2v32-candidate-method>summary,
.c2v32-rpg .c2v32-future-method>summary,
.c2v32-rpg .c2v32-cover-summary-details>summary{
 display:flex;min-height:44px;align-items:center;cursor:pointer;
 color:#f0d797;font-size:13px;line-height:1.6;font-weight:900;
}
.c2v32-rpg .c2v32-cover-summary-details>summary{color:#c0e9de}
.c2v32-rpg .c2v32-candidate-method>summary:focus-visible,
.c2v32-rpg .c2v32-future-method>summary:focus-visible,
.c2v32-rpg .c2v32-cover-summary-details>summary:focus-visible{
 outline:3px solid #a0e3d5;outline-offset:2px;
}
.c2v32-rpg .c2v32-candidate-method .c2v32-breakdown-basis,
.c2v32-rpg .c2v32-candidate-method .c2v32-breakdown-reason{
 font-size:13px!important;line-height:1.65!important;
}
.c2v32-rpg .c2v32-candidate-method>small{display:block;color:#dfe7e1!important;font-size:12px!important}
.c2v32-rpg .c2v32-future-method .c2v3-future-footnote{margin-top:4px!important}
.c2v32-rpg .c2v32-cover-summary-details .c2v32-cover-caution{font-size:13px!important;margin:5px 0!important}
@media(max-width:350px){
 .c2v32-rpg .c2v32-peer-guide--compact{padding:8px}
 .c2v32-rpg .c2v32-peer-gap-card--three-way{padding:8px 6px}
}

/* Category progressive disclosure: four relevant cards first, eight on demand.
   Preserve all twelve data rows in DOM but use the browser's hidden semantics. */
.c2v32-rpg .c2v32-comparison-preview-note{
 margin:9px 0 8px!important;font-size:13px!important;line-height:1.6!important;
 color:#f6e8be!important;font-weight:850;
}
.c2v32-rpg .c2v22-comparison-ledger .c2v22-comparison-row[hidden]{
 display:none!important;
}
.c2v32-rpg .c2v32-expand-rest{
 display:flex;align-items:center;justify-content:center;
 width:100%;min-height:52px;margin:12px 0;padding:10px 11px;
 border:1.5px solid #caa66b;border-radius:10px;
 background:linear-gradient(125deg,#164941,#20434b);color:#fff2bd;
 font-size:15px;font-weight:950;line-height:1.5;cursor:pointer;touch-action:manipulation;
}
.c2v32-rpg .c2v32-expand-rest:focus-visible{outline:3px solid #0e968e;outline-offset:2px}

/* Compact 12-category battleboard near treasure: the full picture is visible
   before the long evidence cards; every status is from frozen V5, no new amounts. */
.c2v32-rpg .c2v32-battleboard{
 margin:12px 0 4px;padding:11px 10px 10px;
 border:1.5px solid #d4bd7d;border-radius:12px;
 background:linear-gradient(145deg,rgba(10,48,52,.98),rgba(17,42,51,.98));
 color:#fff3d2;
}
.c2v32-rpg .c2v32-battleboard>strong{
 display:block;font-size:17px;line-height:1.45;
 color:#ffedbc;font-weight:950;margin:0 0 4px;
}
.c2v32-rpg .c2v32-battleboard>p{
 font-size:13px!important;line-height:1.55!important;
 color:#e9efdf!important;margin:0 0 10px!important;
}
.c2v32-rpg .c2v32-battleboard-grid{
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;
}
.c2v32-rpg .c2v32-battleboard-item{
 display:grid;align-content:center;min-width:0;min-height:56px;
 padding:7px 8px;border-radius:8px;border:1px solid #738f85;
 background:#eff2e8;color:#203b39;text-align:left;
 cursor:pointer;touch-action:manipulation;
}
.c2v32-rpg .c2v32-battleboard-item strong{
 font-size:13px!important;line-height:1.35;color:#1e4140;
 font-weight:950;overflow-wrap:anywhere;
}
.c2v32-rpg .c2v32-battleboard-item small{
 display:block;font-size:12px!important;line-height:1.45!important;
 font-weight:800;color:#466050;
}
.c2v32-rpg .c2v32-battleboard-item:focus-visible{
 outline:3px solid #ffe6a2;outline-offset:2px;
}
.c2v32-rpg .c2v32-battleboard>small{
 display:block;color:#e7eddc!important;font-size:12px!important;
 line-height:1.65!important;margin:8px 1px 0;
}
@media(max-width:350px){
 .c2v32-rpg .c2v32-battleboard-grid{gap:5px}
 .c2v32-rpg .c2v32-battleboard-item{padding:6px 5px;min-height:55px}
 .c2v32-rpg .c2v32-battleboard-item strong{font-size:12px!important}
}

/* The single atlas is now ONE compact list of all twelve categories,
   positioned directly after the actionable treasure. Detailed methodology
   is per-category opt-in instead of hiding eight categories altogether. */
.c2v32-rpg .c2v32-category-accordion{
 display:block;margin:7px 0;border:1.5px solid #aec4b9;
 border-radius:12px;padding:0 9px 7px;background:#f5f7ed;
 overflow:visible;
}
.c2v32-rpg .c2v32-category-accordion>.c2v32-category-summary{
 display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;
 min-height:62px;cursor:pointer;padding:8px 2px 3px;
 list-style:none;touch-action:manipulation;
}
.c2v32-rpg .c2v32-category-accordion>.c2v32-category-summary::-webkit-details-marker{display:none}
.c2v32-rpg .c2v32-category-accordion>.c2v32-category-summary:focus-visible{
 outline:3px solid #197765;outline-offset:3px;border-radius:8px;
}
.c2v32-rpg .c2v32-category-summary .c2v23-comparison-enemy{
 width:45px!important;height:45px!important;max-width:45px!important;min-width:45px!important;
 object-fit:contain;flex:0 0 45px;
}
.c2v32-rpg .c2v32-category-summary .c2v23-comparison-identity{flex:1 1 130px;min-width:98px}
.c2v32-rpg .c2v32-category-summary .c2v23-comparison-identity>strong{
 font-size:16px!important;line-height:1.45!important;color:#193e36!important;
}
.c2v32-rpg .c2v32-category-summary .c2v23-comparison-identity>small{font-size:12px!important}
.c2v32-rpg .c2v32-category-summary .c2v23-comparison-status{
 font-size:12px!important;flex:0 0 auto;
}
.c2v32-rpg .c2v32-category-quick-metrics{
 order:5;flex:1 1 100%;display:flex;flex-wrap:wrap;align-items:center;
 gap:4px 11px;margin:0 0 2px 53px;
}
.c2v32-rpg .c2v32-category-quick-metrics>span{
 color:#36534a!important;font-size:12px!important;line-height:1.5;font-weight:800;
}
.c2v32-rpg .c2v32-category-quick-own{
 color:#153c34!important;font-size:16px!important;font-weight:950!important;
 font-variant-numeric:tabular-nums;
}
.c2v32-rpg .c2v32-category-quick-metrics>.c2v32-category-quick-peer{
 color:#176452!important;font-size:12px!important;font-weight:900!important;
}
.c2v32-rpg .c2v32-category-quick-candidate{
 flex:1 1 100%;color:#6c480a;font-size:12px!important;font-weight:950;
}
.c2v32-rpg .c2v32-category-arrow{
 order:4;flex:0 0 16px;margin-left:auto;color:#234d43;
 font-size:17px!important;line-height:1;transition:transform .18s ease;
}
.c2v32-rpg .c2v32-category-accordion[open]>.c2v32-category-summary{
 border-bottom:1px solid #bed0c0;padding-bottom:10px;margin-bottom:8px;
}
.c2v32-rpg .c2v32-category-accordion[open]>.c2v32-category-summary .c2v32-category-arrow{
 transform:rotate(180deg);
}
.c2v32-rpg .c2v32-reference-signals{
 background:#153b40;border:1.5px solid #bba46e;border-radius:12px;
 padding:12px;margin:8px 0;color:#f4f1e2;
}
.c2v32-rpg .c2v32-reference-signals>strong{display:block;color:#ffdfa2;font-size:15px;font-weight:900}
.c2v32-rpg .c2v32-reference-signals>p{color:#e8f1ec;font-size:13px!important;line-height:1.65!important;margin:7px 0!important}
.c2v32-rpg .c2v32-reference-signals details{
 border-top:1px solid #637f78;padding:3px 0;margin:5px 0;
}
.c2v32-rpg .c2v32-reference-signals summary{
 display:flex;align-items:center;flex-wrap:wrap;justify-content:space-between;gap:4px;
 min-height:44px;cursor:pointer;font-size:13px!important;line-height:1.55!important;color:#fef0c2!important;
}
.c2v32-rpg .c2v32-reference-signals summary:focus-visible{outline:3px solid #c6eadf;outline-offset:2px}
.c2v32-rpg .c2v32-reference-signals p,
.c2v32-rpg .c2v32-reference-signals small{
 color:#e6f0ee!important;font-size:13px!important;line-height:1.65!important;
}
.c2v32-rpg .c2v32-reference-signals small{display:block;font-size:12px!important}
@media(max-width:350px){
 .c2v32-rpg .c2v32-category-accordion{padding:0 5px 6px}
 .c2v32-rpg .c2v32-category-quick-metrics{margin-left:48px;gap:3px 7px}
 .c2v32-rpg .c2v32-category-summary .c2v23-comparison-enemy{width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important}
}
@media(prefers-reduced-motion:reduce){
 .c2v32-rpg .c2v32-category-arrow{transition:none}
}
`;
