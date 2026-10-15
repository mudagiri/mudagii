import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {__resolverV2Audit} from './comparable-resolver-v2';
import {categoryDiagnosis} from './mudagiri-diagnosis-v2';

/** Preservation-only regression for 1,000 untruncated rows recovered from
 * MUDAGIRI_FINAL_100CASE_VALIDATION_V2_0_FROZEN.xlsx / 1200_RESULTS.
 * The workbook source indexes 0..1199 but the available index truncates at
 * 999. DO NOT claim a complete 1200-row or 100-profile replay.
 */
const file='audit/FROZEN100_V2_0_SOURCE_1200_RESULTS_FIRST1000.csv';
const source=readFileSync(file,'utf8');
function csvRows(input:string):string[][] {
 const result:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<input.length;i++){
  const c=input[i];
  if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){
   if(c==='\r'&&input[i+1]==='\n')i++;
   row.push(cell);if(row.some(x=>x.length))result.push(row);
   row=[];cell='';
  }else cell+=c;
 }
 if(quoted)throw new Error('UNBALANCED_CSV');
 if(cell.length||row.length){row.push(cell);result.push(row)}
 return result;
}
const rows=csvRows(source);
assert.deepEqual(rows.shift(),['index','ID','ケース','カテゴリ','実支出','benchmark','状態','理由','confirmed_saving']);
assert.equal(rows.length,1000);
const names=['住居費','通信費','光熱費','保険','サブスク','食費','日用品','娯楽','美容・服飾','車関連費','教育費','自己投資費'] as const;
const allowed=new Set<string>(names);
const byCase=new Map<number,Set<string>>();
const categoryCounts=new Map<string,Record<string,number>>();
const confirmedExceptions:{id:number;category:string;amount:number;status:string;reason:string}[]=[];
const validStats=['NORMAL','CHECK','DETAIL','AUDIT','CONFIRMED'];
const categoriesWithoutReference=new Set(['住居費','通信費','保険','サブスク','美容・服飾','車関連費','自己投資費']);
const expectedRefs:Record<string,number[]>={
 '光熱費':[8291,13299,15380,...__resolverV2Audit.MULTI.energy],
 '食費':[41992,47405,44364,...__resolverV2Audit.MULTI.food],
 '日用品':[3409,3174,2593,...__resolverV2Audit.MULTI.daily],
 // Old frozen 100-case compares ENTIRE education/recreation grouping in
 // multiperson households. Later contract's fun MONTHLY CORE is different.
 '娯楽':[24242,23453,17041,28411,29433,36710,35859,36390],
 '教育費':[15387,28945,30550,145126,45204,130030,49746,98272]
};
for(let idx=0;idx<rows.length;idx++){
 const c=rows[idx];
 assert.equal(c.length,9,'nine historic source columns: '+idx);
 assert.equal(Number(c[0]),idx,'original row index must be preserved');
 const id=Number(c[1]);assert.ok(Number.isInteger(id)&&id>=1&&id<=84);
 const name=c[3];assert.ok(allowed.has(name));
 assert.ok(validStats.includes(c[6]),'historical state label');
 const amount=Number(c[4]);assert.ok(Number.isFinite(amount)&&amount>=0);
 const seen=byCase.get(id)??new Set<string>();
 assert.ok(!seen.has(name),'no duplicate historical category: '+id+':'+name);
 seen.add(name);byCase.set(id,seen);
 const counts=categoryCounts.get(name)??{};
 counts[c[6]]=(counts[c[6]]??0)+1;categoryCounts.set(name,counts);
 if(categoriesWithoutReference.has(name))assert.equal(c[5],'','no fabricated source benchmark for '+name);
 else if(c[5]!=='')assert.ok(expectedRefs[name]?.includes(Number(c[5])),'source benchmark must match a documented 2025 official series: '+id+':'+name+':'+c[5]);
 if(c[8]!==''){
  const val=Number(c[8]);assert.ok(Number.isFinite(val)&&val>=0,'parse confirmed_saving');
  if(val>0)confirmedExceptions.push({id,category:name,amount:val,status:c[6],reason:c[7]});
 }
 // Screening differences are not CONFIRMED savings; there is no valid
 // inference from a positive comparison gap alone.
 if(c[5]!==''&&Number(c[4])>Number(c[5]))assert.notEqual(c[6],'CONFIRMED','benchmark excess alone never confirms a saving');
}
assert.equal(byCase.size,84);
for(let i=1;i<=83;i++)assert.equal(byCase.get(i)?.size,12,'full historical profile '+i);
assert.deepEqual([...byCase.get(84)!],names.slice(0,4),'partial 84th source profile');
assert.equal(categoryCounts.get('住居費')?.NORMAL,80);
assert.equal(categoryCounts.get('住居費')?.DETAIL,4);
assert.equal(categoryCounts.get('光熱費')?.CHECK,48);
assert.equal(categoryCounts.get('食費')?.CHECK,39);
assert.equal(categoryCounts.get('娯楽')?.CHECK,41);
assert.deepEqual(confirmedExceptions.map(x=>[x.id,x.category,x.amount]),[
 [56,'サブスク',1800],[58,'自己投資費',3000],[71,'サブスク',1800],[73,'自己投資費',3000]
]);
for(const v of confirmedExceptions){
 assert.equal(v.status,'AUDIT','conditional legacy saving is not a CONFIRMED state');
 assert.ok(v.reason.includes('可能なら'),'historical saving was conditional');
}
const nonConfirmed=categoryDiagnosis({category:'sub',actual:1800,comparable:null,unusedAmount:1800,cancellationConfirmed:false});
assert.equal(nonConfirmed.confirmedSaving,null);
const confirmed=categoryDiagnosis({category:'sub',actual:1800,comparable:null,unusedAmount:1800,cancellationConfirmed:true});
assert.equal(confirmed.confirmedSaving,1800);
assert.ok(__resolverV2Audit.MULTI.fun.every((value:number,i:number)=>value<[28411,29433,36710,35859,36390][i]),
 'current entertainment item-mapped core is smaller than old category total');
console.log('FROZEN100_SOURCE1000_QA_PASS',JSON.stringify({
 preserved:rows.length,fullCases:83,partialCase:84,remainingUnretrieved:200,
 historicalPositiveConditionalSavings:confirmedExceptions.length,
 oldScope:'whole recreation',currentScope:'recreation monthly core',
 actualPersonInputs:'NOT_AVAILABLE',fullHistoricalReplay:false
}));
