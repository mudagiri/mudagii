import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PEER_2024_OFFICIAL_ADJACENT_SOURCE,relatedOfficialExpenseItems2024} from './chapter2-official-related-2024-high-v1';
import {VERIFIED_2024_HIGH_MULTI_WORKER_CELLS_V1} from './age-income-joint-burden-gate-v1';

const args={household:'multi' as const,headAge:45,gross:'1500plus' as const,
 headAgeConfirmed:true,headWorkerConfirmed:true};
const forty=relatedOfficialExpenseItems2024(args);
assert.equal(forty.available,true);
if(!forty.available)throw Error('UNEXPECTED_MISSING_OFFICIAL_CELL');
assert.equal(forty.n,200);
assert.equal(forty.disposableYen,965121);
assert.equal(forty.items.length,11);
assert.equal(new Set(forty.items.map(x=>x.category)).size,7);
assert.equal(forty.savingEligible,false);
const get=(code:string)=>forty.items.find(x=>x.code===code)!;
assert.equal(get('21010703_通信').averageMonthlyExpenseYen,15948);
assert.equal(get('21010703_通信').officialRelatedRatePct,1.65);
assert.equal(get('210107023_自動車等維持').averageMonthlyExpenseYen,22970);
assert.equal(get('21010702_自動車等関係費').averageMonthlyExpenseYen,37587);
assert.equal(get('210108_教育').averageMonthlyExpenseYen,44405);
assert.equal(get('210108_教育').officialRelatedRatePct,4.6);
assert.equal(get('23000002_保険料').averageMonthlyExpenseYen,32191);
assert.equal(get('21010201_家賃地代').officialRelatedRatePct,2.01);
assert.ok(forty.items.every(i=>i.scope.length>14&&i.officialRelatedRatePct>=0));
assert.equal(PEER_2024_OFFICIAL_ADJACENT_SOURCE.year,2024);
assert.equal(PEER_2024_OFFICIAL_ADJACENT_SOURCE.productionSavingEligible,false);
assert.equal(PEER_2024_OFFICIAL_ADJACENT_SOURCE.workbookSha256.length,64);

for(const high of VERIFIED_2024_HIGH_MULTI_WORKER_CELLS_V1){
 const age=high.ageBand.startsWith('30')?35:high.ageBand.startsWith('40')?45:
  high.ageBand.startsWith('50')?55:high.ageBand.startsWith('60')?65:75;
 const income=high.grossAnnualIncomeBand.includes('1000～1250')?'1000_1249':
  high.grossAnnualIncomeBand.includes('1250～1500')?'1250_1499':'1500plus';
 const res=relatedOfficialExpenseItems2024({
  ...args,headAge:age,gross:income as typeof args.gross,
 });
 assert.equal(res.available,true,'Only n>=50 and published official high grouped rows');
 if(res.available)assert.equal(res.disposableYen,high.averageMonthlyDisposableYen);
}
const unavailable=[
 relatedOfficialExpenseItems2024({...args,household:'single' as const}),
 relatedOfficialExpenseItems2024({...args,headAgeConfirmed:false}),
 relatedOfficialExpenseItems2024({...args,headWorkerConfirmed:false}),
 relatedOfficialExpenseItems2024({...args,gross:null}),
 relatedOfficialExpenseItems2024({...args,headAge:35,gross:'1500plus'}),
 relatedOfficialExpenseItems2024({...args,headAge:25}),
 relatedOfficialExpenseItems2024({...args,headAge:75,gross:'1250_1499'}),
];
assert.ok(unavailable.every(r=>r.available===false&&r.items.length===0&&r.savingEligible===false),
 'Invalid/low-n cohorts never render an unrelated official average');
const ui=fs.readFileSync('ResultScreenChapter2V32.tsx','utf8');
assert.ok(ui.includes('data-peer-related-rate-category={x.category}'));
assert.ok(ui.includes("item.officialRelatedRatePct.toFixed(2)"));
assert.ok(ui.includes('本人との割合差・削減額・見直し候補額は計算しません'));
for(const file of ['benchmark-router-v4.ts','mudagiri-diagnosis-v2.ts','result-view-model-v5.ts']){
 assert.ok(!fs.readFileSync(file,'utf8').includes('chapter2-official-related-2024-high-v1'),
 'New source must not enter diagnosis benchmark, cUpper or confirmedA');
}
console.log('CHAPTER2_2024_OFFICIAL_RELATED_HIGH_INCOME_QA_PASS');
