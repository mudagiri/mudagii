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
// GitHub Pages user-site is served from the origin root. A single shared
// /assets directory is enough when deep HTML routes specify <base href="/">.
const deepHtml=source.replace(/<head([^>]*)>/i,'<head$1><base href="/">');
assert.notEqual(deepHtml,source,'Cannot add stable root base to Vite HTML');
await mkdir(join(target,'pilot/chapter2-v32/pilot/money-type'),{recursive:true});
await writeFile(join(target,'pilot/chapter2-v32/index.html'),deepHtml,'utf8');
await writeFile(join(target,'pilot/chapter2-v32/pilot/money-type/index.html'),deepHtml,'utf8');
const entry="<!doctype html><html lang=\"ja\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>ムダギリ診断・第3章V2｜隔離プレビュー</title><style>body{background:#0b1727;color:#f7edd0;font:16px/1.8 system-ui,sans-serif;margin:0;padding:24px}main{max-width:600px;margin:6vh auto;background:#152c40;border:1px solid #84734b;border-radius:17px;padding:24px}h1{font-size:clamp(22px,6vw,32px);line-height:1.4}a{display:block;background:#edc76d;color:#1b2030;font-weight:800;text-decoration:none;border-radius:10px;padding:12px 15px;margin-top:18px;text-align:center}small{display:block;color:#b8cddd;margin-top:15px}</style></head><body><main><p>CHAPTER III · ISOLATED PILOT</p><h1>⚔️ ムダギリ診断<br>未来の航路 V2</h1><p>第1章のお金の性格診断から第2章の家計クエストを経て、第3章の未来の作戦書まで、ひと続きで確認できる試作です。</p><p>このプレビューでは家計データを外部GAS・分析サービスに送信しません。実際の家計情報や個人情報を入力せず、架空の数字で確認してください。</p><a href=\"./pilot/chapter2-v32/pilot/money-type/\">第1章から試す →</a><a href=\"./pilot/chapter2-v32/\">第2章から試す →</a><small>開発確認用・本番未反映。相談ボタンは確認用モーダルのみで予約は確定しません。金融商品の適合性を判定しません。</small></main></body></html>";
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
 'All deep HTML routes use root-relative /assets with <base href="/">; no 3x asset duplication.',
 'A project Pages site under /repo-name/ requires explicit source routing fixes.',
 'Open /chapter3-v2-preview.html on the separate site. Use synthetic inputs.',
 'A GitHub artifact ZIP by itself is NOT a live URL.',
].join('\n'),'utf8');
console.log('CHAPTER3_V2_GITHUB_PAGES_BUNDLE_PASS',JSON.stringify({
 pagesRoot:target,hasLanding:true,c1:'pilot/chapter2-v32/pilot/money-type/',
 c2:'pilot/chapter2-v32/',sharedAssets:true,deployed:false
}));
