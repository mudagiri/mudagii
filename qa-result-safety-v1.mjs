import fs from 'node:fs';
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');
const a=result.indexOf('async function makeTypeShareFile'),b=result.indexOf('export default function ResultScreenV4');
if(a<0||b<=a)throw new Error('RESULT_SAFETY_QA_FAIL:share builder missing');
const image=result.slice(a,b);
const c=result.indexOf('async function share()'),d=result.indexOf(' return <>',c);
if(c<0||d<=c)throw new Error('RESULT_SAFETY_QA_FAIL:share function missing');
const share=result.slice(c,d);
const sensitive=/(vm\.profile|prefecture|monthlyTakeHome|annualIncome|rawExpenses|benchmarkSummary|improvement)/;
const checks=[
 ['active result before render',app.indexOf('writeActiveResultV1(')>=0&&app.indexOf('writeActiveResultV1(')<app.indexOf('setResult(vm);')],
 ['draft cleared on completion',app.includes('clearJourneyDraftV1();')],
 ['result restored on return',app.includes("emit('result_restored',{source:'reload_or_return'})")],
 ['external navigation guarded',app.includes("throw new Error('active result missing before external navigation')")],
 ['share guard before navigator',share.indexOf('onBeforeExternal?.();')>=0&&share.indexOf('onBeforeExternal?.();')<share.indexOf('navigator.share')],
 ['share URL limited to ref and type',share.includes("searchParams.set('ref','share')")&&share.includes("searchParams.set('type',vm.type.code)")&&!/searchParams\.set\([^)]*(prefecture|income|amount|saving|improvement)/i.test(share)],
 ['share image excludes sensitive fields',!sensitive.test(image)],
 ['share text excludes sensitive fields',!sensitive.test(share)],
 ['share analytics type only',result.includes("onEvent?.('share_clicked',{typeCode:vm.type.code})")]
];
for(const [name,ok] of checks){if(!ok)throw new Error('RESULT_SAFETY_QA_FAIL:'+name);console.log('PASS',name)}
console.log('RESULT_SAFETY_QA_PASS',checks.length);
