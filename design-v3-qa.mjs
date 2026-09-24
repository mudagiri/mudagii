import fs from 'node:fs';
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const result=fs.readFileSync(new URL('./ResultScreenV2.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
const checks=[
 ['app shell',app.includes('mudagiri-shell')],
 ['command menu',app.includes('rpg-command')&&app.includes('is-selected')],
 ['rpg dialogue',app.includes('rpg-dialogue')],
 ['hard primary',app.includes('rpg-primary')],
 ['pixel mascot rendering',app.includes('image-pixelated')],
 ['result shell',result.includes('mudagiri-shell')],
 ['no app rounded-3xl',!app.includes('rounded-3xl')],
 ['no result rounded-3xl',!result.includes('rounded-3xl')],
 ['no gradient',!app.includes('gradient')&&!result.includes('gradient')],
 ['design tokens',css.includes('--mg-yellow')&&css.includes('.rpg-window')],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`${pass}/${checks.length} PASS`); if(pass!==checks.length)process.exit(1);
