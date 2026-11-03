import fs from 'node:fs';

const file=process.argv[2];
if(!file)throw new Error('Usage: node scripts/prepare-money-personality-preview-og.mjs <built-preview-index.html>');
const canonical='https://mudagiri.github.io/mudagii/pilot/money-type/';
const title='お金の性格診断｜ムダギリ診断（32タイプ）';
const description='30問から、お金の使い方のクセを32タイプのJOBカードで発見。無料で診断して、友だちとタイプを比べよう。';
const image=canonical+'assets/brand/ogp-1200x630.jpg'; // Replace with chapter-specific artwork before public launch.
let html=fs.readFileSync(file,'utf8');

function replaceOne(pattern,replacement,name){
  const matches=html.match(new RegExp(pattern.source,'g'))||[];
  if(matches.length!==1)throw new Error('Expected exactly one '+name+' element, found '+matches.length);
  html=html.replace(pattern,replacement);
}
replaceOne(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${description}"/>`,'description');
replaceOne(/<meta property="og:title" content="[^"]*"\s*\/>/,`<meta property="og:title" content="${title}"/>`,'og:title');
replaceOne(/<meta property="og:description" content="[^"]*"\s*\/>/,`<meta property="og:description" content="${description}"/>`,'og:description');
replaceOne(/<meta property="og:image" content="[^"]*"\s*\/>/,`<meta property="og:image" content="${image}"/>`,'og:image');
replaceOne(/<title>[^<]*<\/title>/,`<title>${title}</title>`,'title');
if(!html.includes('property="og:url"'))html=html.replace('<meta property="og:type" content="website"/>',`<meta property="og:type" content="website"/><meta property="og:url" content="${canonical}"/>`);
if(!html.includes('name="twitter:title"'))html=html.replace('<meta name="twitter:card" content="summary_large_image"/>',`<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${title}"/><meta name="twitter:description" content="${description}"/>`);
fs.writeFileSync(file,html);
console.log(JSON.stringify({ok:true,previewOnly:true,title,canonical,ogImage:image}));
