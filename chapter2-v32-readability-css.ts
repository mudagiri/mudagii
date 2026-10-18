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
`;
