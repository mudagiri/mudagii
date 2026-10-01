import fs from 'node:fs';
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');

const clear=result.indexOf('className="rv3-clear"');
const type=result.indexOf('className="rv3-title rv3-type-card"');
const social=result.indexOf('className="rv3-social-share"');
const benchmark=result.indexOf('className="rv3-benchmark"');
const verdict=result.indexOf('className="rv3-verdict');
const next=result.indexOf('className="rv3-next"');

const checks=[
 ['type result is before benchmark',clear>=0&&type>clear&&social>type&&benchmark>social],
 ['benchmark remains before verdict and next quest',benchmark>=0&&verdict>benchmark&&next>verdict],
 ['1 5 10 year horizons are shown',result.includes('<span>1年なら</span>')&&result.includes('<span>5年なら</span>')&&result.includes('<span>10年なら</span>')],
 ['horizon copy says simple accumulation not savings',result.includes('単純累計。削減可能額ではありません')],
 ['largest benchmark row is preselected',result.includes('いちばん差が大きかった項目')&&result.includes('topBenchmarkRow')],
 ['remaining comparisons use clear disclosure',result.includes('ほかの比較項目も見る')&&result.includes('otherBenchmarkRows.length')],
 ['different comparison scopes are not merged',result.includes('比較単位が違う支出は合算しません')],
 ['X share button exists',result.includes("onClick={shareX}")&&result.includes("platform:'x'")&&result.includes('twitter.com/intent/tweet')],
 ['Instagram share button exists',result.includes("nativeShare('instagram')")&&result.includes('Instagram')],
 ['Threads share button exists',result.includes("nativeShare('threads')")&&result.includes('Threads')],
 ['friend LINE share uses LINE share screen',result.includes('shareLineFriend')&&result.includes('https://line.me/R/share?text=')],
 ['native other share remains',result.includes("nativeShare('other')")],
 ['share payload contains no financial amounts',(()=>{
   const start=result.indexOf(" async function nativeShare");
   const end=result.indexOf(" function lineHandoff",start);
   const block=result.slice(start,end);
   return start>=0&&end>start&&!/(monthlyTakeHome|comparisonDifference|confirmedSaving|improvement|income|expense)/.test(block);
 })()],
];
for(const [name,ok] of checks){if(!ok)throw new Error('RESULT_EXPERIENCE_V2_QA_FAIL:'+name);console.log('PASS',name)}
console.log('RESULT_EXPERIENCE_V2_QA_PASS',checks.length);
