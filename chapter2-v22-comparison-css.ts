/**
 * Chapter2 V2.2: always-visible evidence-first 12-category comparison ledger.
 * Presentation only. No invented AUDIT averages or sum-of-benchmark "saving".
 */
export const V22COMPARISONCSS = `
.c2v32-rpg .c2v22-ledger-title{
 margin:10px 0 6px;color:#ffebbd;font-size:clamp(19px,5.2vw,23px);
 line-height:1.36;font-weight:950;
}
.c2v32-rpg .c2v22-ledger-intro{
 margin:0 0 13px;font-size:14px;line-height:1.7;color:#e1eae2;
}
.c2v32-rpg .c2v22-comparison-ledger{
 display:grid;gap:0;margin:8px 0 11px;padding:0 12px;
 background:linear-gradient(155deg,#fffaf0,#f2eee2);
 border:1.5px solid #dbbc80;border-radius:14px;color:#203c3c;
 box-shadow:0 7px 19px rgba(0,0,0,.19);
}
.c2v32-rpg .c2v22-comparison-row{
 min-width:0;padding:12px 0 11px;border-bottom:1px solid #d6d0be;
}
.c2v32-rpg .c2v22-comparison-row:last-child{border-bottom:0}
.c2v32-rpg .c2v22-comparison-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.c2v32-rpg .c2v22-comparison-head strong{
 font-size:16px;line-height:1.4;color:#1e3c43;font-weight:950;
}
.c2v32-rpg .c2v22-comparison-head span{
 background:#e7e5d8;border:1px solid #c9c5ad;border-radius:30px;
 padding:3px 7px;color:#39524c;font-weight:850;font-size:12px;line-height:1.4;white-space:nowrap;
}
.c2v32-rpg .c2v22-comparison-values{
 display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px;min-width:0;
}
.c2v32-rpg .c2v22-comparison-values>span{
 min-width:0;display:flex;flex-direction:column;gap:2px;
 background:#ece9de;border-radius:8px;padding:7px 8px;
}
.c2v32-rpg .c2v22-comparison-values>span:nth-child(2){background:#e4ede8}
.c2v32-rpg .c2v22-comparison-values small{
 color:#506159;font-size:12px;line-height:1.5;font-weight:800;
}
.c2v32-rpg .c2v22-comparison-values b{
 color:#213a41;font-size:clamp(13px,3.6vw,17px);font-weight:950;
 line-height:1.42;white-space:nowrap;letter-spacing:-.035em;font-variant-numeric:tabular-nums;
}
.c2v32-rpg .c2v22-comparison-values>span:nth-child(2) b{color:#20534c}
.c2v32-rpg .c2v22-comparison-source{
 display:block;margin:7px 1px 0;color:#42524f;font-size:13px;line-height:1.6;
 overflow-wrap:anywhere;
}
.c2v32-rpg .c2v22-comparison-source p{margin:3px 0;line-height:1.6;font-size:13px}
.c2v32-rpg .c2v22-comparison-source b{color:#2f5b5a}
.c2v32-rpg .c2v22-comparison-source.is-unavailable{color:#656660}
.c2v32-rpg .c2v22-comparison-review{
 display:grid;gap:4px;padding:8px;margin:8px 0 0;border-left:3px solid #92702b;
 border-radius:5px;background:#f2e5c8;color:#3b402f;line-height:1.55;font-size:13px;
}
.c2v32-rpg .c2v22-comparison-review b{font-size:13px;color:#6b4b21}
.c2v32-rpg .c2v22-comparison-review span{font-size:13px;color:#404d46}
.c2v32-rpg .c2v22-ledger-footnote{
 margin:8px 0 12px;color:#cfe0db;font-size:13px;line-height:1.68;
}
.c2v32-rpg .c2v31-encyclopedia [data-optional="enemy-atlas"]{
 margin-top:8px;border-top:1px solid rgba(210,189,139,.42);padding-top:9px;
}
@media(max-width:350px){
 .c2v32-rpg .c2v22-comparison-ledger{padding:0 8px}
 .c2v32-rpg .c2v22-comparison-values{gap:5px}
 .c2v32-rpg .c2v22-comparison-values>span{padding:6px 6px}
 .c2v32-rpg .c2v22-comparison-values b{font-size:12px;letter-spacing:-.05em}
 .c2v32-rpg .c2v22-comparison-head strong{font-size:15px}
}
`;
