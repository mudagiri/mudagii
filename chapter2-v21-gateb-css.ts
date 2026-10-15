/**
 * Chapter 1 -> 2 unified RESULT V2.1 Gate B presentation.
 * Preserve original art, JOB ID, calculation, labels and evidence.
 * This visual pass trims duplicate scene decorations and changes the
 * top-level action to reading evidence before hypothetical futures.
 */
export const V21GATEBCSS = `
/* The JOB and its buddy are the protagonist, not three competing trophies. */
.c2v32-rpg .c2v20-hero{padding:8px 12px 16px!important}
.c2v32-rpg .c2v20-quest-log{
 margin-bottom:8px!important;padding:7px 9px!important;
 box-shadow:0 3px 11px rgba(0,0,0,.17)!important;
}
.c2v32-rpg .c2v20-quest-stages{margin-top:3px!important;gap:5px!important}
.c2v32-rpg .c2v20-quest-stages>span:not(.c2v20-quest-arrow){
 padding:5px 7px!important;gap:0!important;line-height:1.3!important;
}
.c2v32-rpg .c2v20-quest-stages b{font-size:13px!important}
.c2v32-rpg .c2v20-quest-stages small{font-size:11px!important}
.c2v32-rpg .c2v31-hero-kicker{
 font-size:13px!important;letter-spacing:.11em;line-height:1.3;padding:0 0 3px!important;
}
.c2v32-rpg .c2v31-quest-title{
 margin:3px auto 7px!important;line-height:1.08!important;
}
.c2v32-rpg .c2v31-quest-title span{
 font-size:clamp(22px,6.2vw,29px)!important;padding:5px 15px 6px!important;
}
.c2v32-rpg .c2v31-quest-title em{
 font-size:clamp(32px,8.7vw,42px)!important;margin-top:4px!important;
}
.c2v32-rpg .c2v31-hero .c2v20-hero-job{
 max-width:370px!important;min-height:88px!important;
 margin:6px auto 5px!important;padding:7px 10px!important;
 grid-template-columns:70px minmax(0,1fr)!important;gap:9px!important;
}
.c2v32-rpg .c2v20-job-portrait{width:68px!important;height:72px!important}
.c2v32-rpg .c2v20-job-identity{gap:2px}
.c2v32-rpg .c2v20-job-identity>strong{
 font-size:clamp(18px,5vw,22px)!important;line-height:1.26!important;
}
.c2v32-rpg .c2v20-job-identity>span,.c2v32-rpg .c2v20-job-style>small{
 font-size:12px!important;line-height:1.4!important;
}
.c2v32-rpg .c2v20-job-style>b{font-size:12px!important;padding:3px 7px!important}
.c2v32-rpg .c2v31-hero-stage{min-height:70px!important;margin-top:3px!important;align-items:center!important}
.c2v32-rpg .c2v31-hero .c2v31-dialogue{padding:8px 10px!important;margin-bottom:0!important}
.c2v32-rpg .c2v31-hero .c2v31-dialogue strong{margin-bottom:2px!important;font-size:12px!important}
.c2v32-rpg .c2v31-hero .c2v31-dialogue p{font-size:13px!important;line-height:1.5!important;letter-spacing:0!important}
.c2v32-rpg .c2v31-hero .c2v31-hero-mascot{max-width:85px!important;width:24%!important}
.c2v32-rpg .c2v32-hero-teaser{margin:6px auto 7px!important;padding:10px 12px!important}
.c2v32-rpg .c2v32-hero-teaser strong{font-size:clamp(27px,7.8vw,36px)!important;line-height:1.23!important}
.c2v32-rpg .c2v32-hero-teaser small{font-size:13px!important;line-height:1.48!important}
/* Prime user for verified reasons, not a jump to ten years of hypothetical gains. */
.c2v32-rpg .c2v21-evidence-jump{
 max-width:360px!important;min-height:47px!important;
 font-size:14px!important;line-height:1.45!important;
 border-color:rgba(211,224,200,.7)!important;
 color:#f5f4da!important;
 background:linear-gradient(115deg,rgba(7,53,50,.96),rgba(22,64,63,.94))!important;
 box-shadow:0 3px 9px rgba(0,0,0,.23)!important;
}
.c2v32-rpg .c2v32-candidate-breakdown,.c2v32-rpg .c2v32-treasure-lead{
 scroll-margin-top:12px;
}
/* Future is a conditional projection, never the earned main prize. */
.c2v32-rpg .c2v31-future{
 border:1px solid rgba(180,181,150,.66)!important;
 box-shadow:0 6px 17px rgba(0,0,0,.17)!important;
}
.c2v32-rpg .c2v31-future h2{font-size:clamp(23px,6.5vw,27px)!important;margin-bottom:8px!important}
.c2v32-rpg .c2v32-future-condition{
 padding:8px 9px!important;
 border:1px solid rgba(164,190,173,.25)!important;
 border-left:3px solid #cbd6a0!important;
 border-radius:7px!important;
 background:rgba(6,36,43,.8)!important;
 font-size:15px!important;line-height:1.55!important;
}
.c2v32-rpg .c2v32-future-condition small{
 display:block;font-size:13px!important;line-height:1.5!important;
 margin-top:3px;color:#fff0c6!important;
}
.c2v32-rpg .c2v31-future .c2v31-reward-ten{
 background:linear-gradient(125deg,#e4dcb9,#f4e8c5 57%,#d7caa0)!important;
 border:1px solid #e9dcb2!important;
 box-shadow:inset 0 1px rgba(255,255,230,.6),0 5px 14px rgba(0,0,0,.16)!important;
 color:#3e3929!important;
}
.c2v32-rpg .c2v31-future .c2v31-ten-details>strong{
 color:#5c3829!important;text-shadow:none!important;
 font-size:clamp(21px,6.8vw,29px)!important;
}
.c2v32-rpg .c2v31-future .c2v31-ten-details span{color:#493b28!important}
.c2v32-rpg .c2v31-future .c2v31-ten-qualifier{color:#514735!important}
/* Emphasize interpretation and non-guarantee even when compared to gold. */
.c2v32-rpg .c2v31-future .c2v3-future-footnote{
 font-size:13px!important;line-height:1.65!important;
}
@media(max-width:350px){
 .c2v32-rpg .c2v20-hero{padding-inline:8px!important}
 .c2v32-rpg .c2v20-quest-log{padding:6px 7px!important}
 .c2v32-rpg .c2v20-quest-stages>span:not(.c2v20-quest-arrow){padding:4px 5px!important}
 .c2v32-rpg .c2v31-hero .c2v20-hero-job{grid-template-columns:60px minmax(0,1fr)!important}
 .c2v32-rpg .c2v20-job-portrait{width:60px!important;height:66px!important}
 .c2v32-rpg .c2v31-future .c2v31-ten-details>strong{font-size:21px!important}
}
@media(prefers-reduced-motion:reduce){
 .c2v32-rpg .c2v21-evidence-jump{transition:none!important}
}
`;
