import fs from 'node:fs';
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');

const a=result.indexOf('async function makeTypeShareFile'),b=result.indexOf('export default function ResultScreenV4');
if(a<0||b<=a)throw new Error('RESULT_SAFETY_QA_FAIL:share builder missing');
const image=result.slice(a,b);

const c=result.indexOf(" async function nativeShare("),d=result.indexOf(" function lineHandoff(",c);
if(c<0||d<=c)throw new Error('RESULT_SAFETY_QA_FAIL:platform share functions missing');
const share=result.slice(c,d);

const sensitive=/(vm\.profile|prefecture|monthlyTakeHome|annualIncome|rawExpenses|benchmarkSummary|improvement)/;
const directGuards=[
 ['native',share.indexOf(" async function nativeShare"),share.indexOf("navigator.share")],
 ['x',share.indexOf(" function shareX"),share.indexOf("window.open('https:\/\/twitter.com\/intent\/tweet")],
 ['line',share.indexOf(" function shareLineFriend"),share.indexOf("window.location.href='https:\/\/line.me\/R\/share")],
];
const guarded=directGuards.every(([_,start,end])=>{
 if(typeof start!=='number'||typeof end!=='number'||start<0||end<=start)return false;
 const block=share.slice(start,end);
 return block.includes('onBeforeExternal?.();');
});

const checks=[
 ['active result before completion render',(()=>{const complete=app.indexOf('const complete=async');const write=app.indexOf('writeActiveResultV1(',complete);const render=app.indexOf('setResult(vm);',complete);return complete>=0&&write>=0&&render>=0&&write<render})()],
 ['draft cleared on completion',app.includes('clearJourneyDraftV1();')],
 ['result restored on return',app.includes("emit('result_restored',{source:'reload_or_return'})")],
 ['external navigation guarded',app.includes("throw new Error('active result missing before external navigation')")],
 ['all share exits guarded',guarded],
 ['share URL limited to ref type and source',share.includes("searchParams.set('ref','share')")&&share.includes("searchParams.set('type',vm.type.code)")&&share.includes("searchParams.set('src',")&&!/searchParams\.set\([^)]*(prefecture|income|amount|saving|improvement)/i.test(share)],
 ['share image excludes sensitive fields',!sensitive.test(image)],
 ['share text excludes sensitive fields',!sensitive.test(share)],
 ['share analytics contain type and platform only',share.includes("onEvent?.('share_clicked',{typeCode:vm.type.code,platform")&&!/(monthlyTakeHome|comparisonDifference|confirmedSaving|improvement|income|expense)/.test(share)],
 ['diagnosis analytics excludes financial amounts',(()=>{const line=app.split('\n').find(x=>x.includes("emit('diagnosis_completed'"))??'';return line.length>0&&!/(income|amount|expense|saving|improvement|benchmark|takeHome)/i.test(line)})()]
];
for(const [name,ok] of checks){if(!ok)throw new Error('RESULT_SAFETY_QA_FAIL:'+name);console.log('PASS',name)}
console.log('RESULT_SAFETY_QA_PASS',checks.length);
