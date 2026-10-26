/**
 * Produce a standalone GH Pages user-site root preview bundle. DOES NOT deploy.
 * Never publish this over the production mudagii Pages site.
 */
import assert from 'node:assert/strict';
import {cp,mkdir,readFile,readdir,rm,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';

const dist='dist',target='github-pages-chapter3-v2-bundle';
const source=await readFile(join(dist,'index.html'),'utf8');
assert.match(source,/<html/i,'Compiled Vite app entry required');
assert.match(source,/\.\/assets\//,'Relative Vite assets required for same-origin deep routes');
for(const [key,expected] of Object.entries({
 VITE_CHAPTER2_V32:'1',VITE_CHAPTER3_V2:'1',
 VITE_MUDAGIRI_GAS_URL:'',VITE_MONEY_PERSONALITY_GAS_URL:'',
})){
 assert.equal(process.env[key],expected,'Refusing unsafe preview config: '+key);
}
await rm(target,{force:true,recursive:true});
await mkdir(target,{recursive:true});
await cp(dist,target,{recursive:true});
// The first chapter's frozen UI includes three legacy RPG scene backgrounds as
// CSS url('./assets/...') strings. Those inline styles resolve relative to
// /pilot/chapter2-v32/pilot/money-type/ even with <base href="/">.
// Normalize only the GENERATED standalone Pages bundle to root assets;
// do not modify frozen Chapter 1 sources or the production Pages bundle.
let backgroundPathFixes=0;
const oldBackgroundPrefix='./assets/mudagiri/backgrounds/money-personality/v1/';
const rootBackgroundPrefix='/assets/mudagiri/backgrounds/money-personality/v1/';
for(const filename of await readdir(join(target,'assets'))){
 if(!/\.(?:js|css)$/.test(filename))continue;
 const filenamePath=join(target,'assets',filename);
 const compiled=await readFile(filenamePath,'utf8');
 const found=compiled.split(oldBackgroundPrefix).length-1;
 if(found>0){
  await writeFile(filenamePath,compiled.split(oldBackgroundPrefix).join(rootBackgroundPrefix),'utf8');
  backgroundPathFixes+=found;
 }
}
assert.ok(backgroundPathFixes>=3,'Expected 3 official RPG backgrounds in the preview build; route fix not applied');
console.log('CHAPTER3_V2_BACKGROUND_ROOT_PATH_FIX_PASS',backgroundPathFixes);
// The CSS-in-JS used by the official Chapter 1 story still resolves three
// backgrounds relative to a nested deep-link document in some browsers.
// Provide only those three immutable image aliases at the two HTML depths.
// Do NOT duplicate app JS, other images, diagnosis assets or actual C1 code.
const chapter1BackgroundFiles=[
 'MP_BG_01_GUILD_HALL.webp',
 'MP_BG_02_JOB_UNLOCK.webp',
 'MP_BG_03_NEXT_QUEST.webp',
];
const officialBackgroundRoot=join(target,'assets/mudagiri/backgrounds/money-personality/v1');
let deepBackgroundAliases=0;
for(const route of ['pilot/chapter2-v32','pilot/chapter2-v32/pilot/money-type']){
 const deepBackgroundRoot=join(target,route,'assets/mudagiri/backgrounds/money-personality/v1');
 await mkdir(deepBackgroundRoot,{recursive:true});
 for(const file of chapter1BackgroundFiles){
  await cp(join(officialBackgroundRoot,file),join(deepBackgroundRoot,file));
  deepBackgroundAliases++;
 }
}
assert.equal(deepBackgroundAliases,6,'Three canonical backgrounds must resolve from both nested HTML entry points');
console.log('CHAPTER3_V2_DEEP_BACKGROUND_ALIAS_PASS',deepBackgroundAliases);
// GitHub Pages user-site is served from the origin root. A single shared
// /assets directory is enough when deep HTML routes specify <base href="/">.
const deepHtml=source.replace(/<head([^>]*)>/i,'<head$1><base href="/">');
assert.notEqual(deepHtml,source,'Cannot add stable root base to Vite HTML');
await mkdir(join(target,'pilot/chapter2-v32/pilot/money-type'),{recursive:true});
await writeFile(join(target,'pilot/chapter2-v32/index.html'),deepHtml,'utf8');
await writeFile(join(target,'pilot/chapter2-v32/pilot/money-type/index.html'),deepHtml,'utf8');
const entry="<!doctype html><html lang=\"ja\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>ムダギリ診断・第3章｜再設計単独プレビュー</title><style>body{background:#0b1727;color:#f7edd0;font:16px/1.8 system-ui,sans-serif;margin:0;padding:24px}main{max-width:600px;margin:6vh auto;background:#152c40;border:1px solid #84734b;border-radius:17px;padding:24px}h1{font-size:clamp(22px,6vw,32px);line-height:1.4}a{display:block;background:#edc76d;color:#1b2030;font-weight:800;text-decoration:none;border-radius:10px;padding:12px 15px;margin-top:18px;text-align:center}small{display:block;color:#b8cddd;margin-top:15px}</style></head><body><main><p>CHAPTER III · ISOLATED PILOT</p><h1>⚔️ ムダギリ診断<br>未来攻略クエスト・再設計試作</h1><p>まず第3章だけを試せるように再設計しました。4つの選択から未来の作戦書まで進めます。第1章・第2章の実データ引継ぎは、この単独版ではまだ行いません。</p><p>このプレビューでは家計データを外部GAS・分析サービスに送信しません。実際の家計情報や個人情報を入力せず、架空の数字で確認してください。</p><a href=\"./?chapter3solo=1\">⚔ 第3章だけを直接遊ぶ →</a><a href=\"./pilot/chapter2-v32/pilot/money-type/\">第1章から試す →</a><a href=\"./pilot/chapter2-v32/\">第2章から試す →</a><small>未完成の試作です。回答の組み合わせで結果は変わりますが、あなたの財務状況は測定していません。相談ボタンは確認用で予約は確定しません。</small></main></body></html>";
await writeFile(join(target,'chapter3-v2-preview.html'),entry,'utf8');
await writeFile(join(target,'.nojekyll'),'','utf8');
for(const p of ['index.html','chapter3-v2-preview.html','pilot/chapter2-v32/index.html',
 'pilot/chapter2-v32/pilot/money-type/index.html','assets']){
 await stat(join(target,p));
}
const jsfiles=(await readdir(join(target,'assets'))).filter(x=>x.endsWith('.js'));
assert.ok(jsfiles.length>0,'Missing compiled JS');
for(const f of jsfiles){
 const js=await readFile(join(target,'assets',f),'utf8');
 assert.ok(!/script\.google\.com\/macros\/s\/[^"']+\/exec/.test(js),'Forbidden GAS URL in bundle');
}
await writeFile(join(target,'CHAPTER3_V2_PREVIEW_NOTES.txt'),[
 'GitHub-only isolated preview bundle. THIS DOES NOT DEPLOY.',
 'Created from PR #77. Do not overwrite the existing mudagii Pages site.',
 'Designed for a separate GitHub Pages user-site root repository, with URL path /.',
 'Compiled JS stays shared at root /assets; only the three immutable Chapter1 scene backgrounds have deep-route aliases.',
 'A project Pages site under /repo-name/ requires explicit source routing fixes.',
 'Open /chapter3-v2-preview.html or /?chapter3solo=1 for a direct Chapter3 result.',
 'A GitHub artifact ZIP by itself is NOT a live URL.',
].join('\n'),'utf8');
console.log('CHAPTER3_V2_GITHUB_PAGES_BUNDLE_PASS',JSON.stringify({
 pagesRoot:target,hasLanding:true,c1:'pilot/chapter2-v32/pilot/money-type/',
 c2:'pilot/chapter2-v32/',sharedAssets:true,deployed:false
}));
