import fs from 'node:fs';

const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');

const early=result.indexOf('className="rv3-line-early"');
const share=result.indexOf('className="rv3-early-share"');
const bottom=result.indexOf('className="rv3-next rv3-save"');

const checks=[
 ['early LINE CTA exists',early>=0],
 ['early CTA is before share and book',early>=0&&share>early],
 ['bottom LINE CTA remains',bottom>share],
 ['CTA view events are placement-specific',result.includes("'line_cta_viewed',{placement:'after_next_quest'")&&result.includes("'line_cta_viewed',{placement:'result_bottom'")],
 ['CTA click events are placement-specific',result.includes("lineHandoff('after_next_quest')")&&result.includes("lineHandoff('result_bottom')")&&result.includes("onEvent?.('line_clicked',{placement,typeCode:vm.type.code")],
 ['LINE CTA copy is save-first, not forced consultation',result.includes('無料でLINEに保存する')&&result.includes('登録しただけで相談予約にはなりません')],
 ['book open is tracked',result.includes("'result_book_opened'")],
 ['lead stores CTA placement',app.includes('ctaPlacement:ctx?.placement??null')],
 ['analytics CTA events contain no raw financial fields',(()=>{
   const lines=result.split('\n').filter(x=>x.includes("'line_cta_viewed'")||x.includes("'line_clicked'"));
   return lines.length>=3&&lines.every(x=>!/(amount|income|saving|expense|takeHome|benchmark|monthlyImprovement)/i.test(x));
 })()],
];
for(const [name,ok] of checks){if(!ok)throw new Error('RESULT_CV_V1_QA_FAIL:'+name);console.log('PASS',name)}
console.log('RESULT_CV_V1_QA_PASS',checks.length);
