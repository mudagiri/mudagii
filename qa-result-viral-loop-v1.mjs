import fs from 'node:fs';
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');

const checks=[
 ['8-type content is used in Result',result.includes("TYPE_CONTENT_V31")&&result.includes("TYPE_ORDER_V31")],
 ['all eight type codes are in gallery order',["FPA","FPU","FIA","FIU","VPA","VPU","VIA","VIU"].every(x=>result.includes("'"+x+"'"))],
 ['friend quest exists',result.includes('FRIEND QUEST')&&result.includes('友達は何タイプ？')],
 ['eight-type gallery is collapsible',result.includes('className="rv3-type-gallery"')&&result.includes('8タイプ全部を見る')],
 ['current type is visibly marked',result.includes("mine=code===vm.type.code")&&result.includes("mine&&<span>あなた</span>")],
 ['friend invite CTA uses challenge share',result.includes("友達にも診断させる ▶")&&result.includes("nativeShare('challenge')")],
 ['challenge share is analytics-distinct',result.includes("'instagram'|'threads'|'other'|'challenge'")],
 ['share card leads with unlocked identity',result.includes("x.fillText('MONEY TYPE UNLOCKED'")&&result.includes("x.fillText('TYPE '+vm.type.code")],
 ['share card foregrounds strength',result.includes("x.fillText('YOUR STRENGTH'")&&result.includes("vm.type.strengthLabel")],
 ['share card ends with social comparison prompt',result.includes("x.fillText('友達は何タイプ？'")],
 ['share card privacy statement includes location',result.includes('収入・支出金額・都道府県は画像に含まれません')],
 ['friend loop has no financial fields',(()=>{
   const a=result.indexOf('className="rv3-viral-loop"');
   const b=result.indexOf('className="rv3-next rv3-save"',a);
   const block=result.slice(a,b);
   return a>=0&&b>a&&!/(monthlyTakeHome|comparisonDifference|confirmedSaving|improvement|income|expense)/.test(block);
 })()],
];
for(const [name,ok] of checks){if(!ok)throw new Error('RESULT_VIRAL_LOOP_V1_QA_FAIL:'+name);console.log('PASS',name)}
console.log('RESULT_VIRAL_LOOP_V1_QA_PASS',checks.length);
