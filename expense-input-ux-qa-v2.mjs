import fs from 'node:fs';
const s=fs.readFileSync(new URL('./MudagiriAppV2.tsx', import.meta.url),'utf8');
const checks=[
 ['expense substep state',s.includes('expenseGroupIndex')],
 ['3 block progress',s.includes("{expenseGroupIndex+1} / 3")],
 ['only active group rendered',s.includes('expenseGroups[expenseGroupIndex][1].map')],
 ['zero is valid',s.includes('0円のままでOK')],
 ['remaining item count',s.includes('あと ${expenseGroups.slice')],
 ['final scan CTA',s.includes('12項目をスキャンする')],
 ['back navigation',s.includes('前の項目に戻る')],
 ['education detail only when relevant',s.includes('expenseGroupIndex===2&&expenses.childEducation>0')],
 ['values preserved in expense map',s.includes("setExpenses(x=>({...x,[c]:n}))")],
 ['three semantic groups remain',s.includes("['固定費'")&&s.includes("['暮らし'")&&s.includes("['楽しみ・未来'")],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`\n${pass}/${checks.length} PASS`); if(pass!==checks.length) process.exit(1);
