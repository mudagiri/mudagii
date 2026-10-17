import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const dir="public/pilot/chapter3-v11";
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
const css=fs.readFileSync(path.join(dir,"result.css"),"utf8");
const js=fs.readFileSync(path.join(dir,"result.mjs"),"utf8");
const engine=fs.readFileSync(path.join(dir,"engine.mjs"),"utf8");
const original=fs.readFileSync("scripts/chapter3-three-forces-v11.mjs","utf8");
let tests=0;
const check=(cond,msg)=>{assert.ok(cond,msg);tests++;};
check(engine===original,"pilot result engine must exactly match source");
check(html.includes('<main id="chapter3-result-root"'),"static entry root");
check(html.includes('name="robots" content="noindex,nofollow"'),"noindex");
check(js.includes('evaluateChapter3(makeInput(x))'),"result uses tested decision engine");
check(js.includes('8結果パターンを切替'),"8 scenario interactive picker");
check(js.includes("cases.map"),"all cases in selector");
for(const key of ["household","short_active","short","no_goal","earning","existing","borrowing","start"])
 check(js.includes('id:"'+key+'"'),"missing case "+key);
for(const asset of [
 "public/assets/jobs/v1/JOB_01_FDM_elephant.webp",
 "public/assets/mudagiri/poses/v1/MUDAGIRI_POSE_23_RESULT.webp",
 "public/assets/mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp",
 "public/assets/brand/favicon-32.png"
 ])check(fs.existsSync(asset),"official asset missing: "+asset);
check(css.includes("@media(max-width:355px)"),"small mobile media");
check(css.includes("@media(prefers-reduced-motion:reduce)"),"reduced motion");
for(const word of ["家計の戦果","3つの力の現在地","なぜ今、これを考える？","借入できるかの判定","ここからは、自分で選べる"])
 check(js.includes(word),"required copy: "+word);
check(js.includes("この画面は隔離デモ"),"no real referral");
check(js.includes("送信しません"),"no outbound");
check(!/<script[^>]+src=["']https?:/i.test(html),"no external scripts");
check(!/(fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage\.setItem)/.test(js),"no backend or personal data storage");
check(!/\bhttps?:\/\//.test(js),"no external URLs in result");
console.log("Chapter3 result static PASS",tests,"checks");
