import fs from 'node:fs';
const app=fs.readFileSync('MudagiriAppV2.tsx','utf8');
const result=fs.readFileSync('ResultScreenV2.tsx','utf8');
const checks=[
 ['3-mode retained',app.includes('今日、どこまで斬られますか？')&&app.includes('TONE_MODES')],
 ['self relevance hook',app.includes('収入はあるのに、思ったほどお金が残らない')],
 ['family segmentation',app.includes('夫婦・パートナー')&&app.includes('子どもあり')],
 ['income reason disclosure',app.includes('収入の多さを評価するためではありません')],
 ['mid-flow reward',app.includes('敵影を検知。だが、まだ斬らない。')],
 ['future goal immediately after improvement',result.indexOf('この改善余地、何に変えたい？')>result.indexOf('見つかった推定改善余地') && result.indexOf('この改善余地、何に変えたい？')<result.indexOf('似た世帯との比較')],
 ['protected spend before comparison',result.indexOf('今回、斬らなかったもの')<result.indexOf('似た世帯との比較')],
 ['comparison explicitly not waste',result.includes('この差額を、そのままムダとは判定していません')],
 ['LINE before share',result.indexOf('LINEに討伐リストを保存する')<result.indexOf('結果カードをシェア')],
 ['LINE action framing',result.includes('次は「何からやるか」です。')&&result.includes('あなた専用の討伐リスト')],
 ['unresolved framed as appraisal',result.includes('まだ要鑑定')],
 ['family-specific goals',result.includes("familyProfile==='children'")&&result.includes('家族旅行')&&result.includes('教育・子ども')],
 ['goal contextualizes LINE',result.includes('あなたが選んだ')&&result.includes('討伐順を整理します')],
];
let fail=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(!ok) fail++;}
console.log(`\n${checks.length-fail}/${checks.length} PASS`); process.exitCode=fail?1:0;
