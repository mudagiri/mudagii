import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2,
 OFFICIAL_2024_ORIGINAL_50MAN_SHA_V2,
 OFFICIAL_2024_ORIGINAL_50MAN_CODES_V2,
} from './official-2024-50man-aligned-worker-v2';
import {relatedOfficial50manItems2024} from './chapter2-official-related-2024-middle-single-v1';
import {VERIFIED_2024_JOINT_BURDEN_CELLS_V1,
 resolve2024MultiWorkerPeerBurdenV1,resolve2024SingleWorkerPeerBurdenV1}
 from './age-income-joint-burden-gate-v1';

assert.equal(OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2.length,79);
assert.equal(OFFICIAL_2024_ORIGINAL_50MAN_SHA_V2.multi.length,64);
assert.equal(OFFICIAL_2024_ORIGINAL_50MAN_SHA_V2.single.length,64);
assert.equal(OFFICIAL_2024_ORIGINAL_50MAN_CODES_V2.length,15);
assert.equal(VERIFIED_2024_JOINT_BURDEN_CELLS_V1.length,79);
const row=(household:string,age:string,gross:string)=>
 OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2.find(x=>x[0]===household&&x[1].startsWith(age)&&x[2]===gross);
assert.equal(row('multi','30～39','400～450万円')?.[5],67858);
assert.equal(row('single','30～39','400～450万円')?.[5],40265);
assert.equal(row('multi','30～39','500～550万円')?.[3],160);
assert.equal(row('multi','30～39','500～550万円')?.[5],70844);
assert.equal(row('multi','30～39','550～600万円')?.[3],170);
assert.equal(row('multi','30～39','550～600万円')?.[5],72595);
assert.equal(row('single','30～39','500～550万円')?.[5],51309);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(35,'500_599','food',true).ratePctLow,18);
assert.equal(resolve2024MultiWorkerPeerBurdenV1(35,'500_599','food',true).ratePctHigh,19.5);
assert.equal(resolve2024SingleWorkerPeerBurdenV1(35,'500_599','food').ratePctLow,12.2);
assert.equal(resolve2024SingleWorkerPeerBurdenV1(35,'500_599','food').ratePctHigh,15.9);
assert.equal(resolve2024SingleWorkerPeerBurdenV1(25,'500_599','food').available,false,
 'Original single under30 published 550-600 class is not n>=50');

// Minimum n applies to EACH original published 50万円 class.
const args={household:'multi' as const,headAge:35,grossBand:'500_599',
 headAgeConfirmed:true,headWorkerConfirmed:true};
const multi=relatedOfficial50manItems2024(args);
assert.equal(multi.available,true);
if(!multi.available)throw new Error('MIDDLE_REFERENCE_UNEXPECTED_UNAVAILABLE');
assert.equal(multi.sourceRows,2);
assert.equal(multi.minCellSample,160);
assert.equal(new Set(multi.items.map(x=>x.category)).size,7);
assert.equal(multi.items.length,11);
assert.deepEqual(multi.sourceIncomeBands,['500～550万円','550～600万円']);
const communication=multi.items.find(x=>x.code==='21010703_通信')!;
assert.equal(communication.monthlyMeanLowYen,10703);
assert.equal(communication.monthlyMeanHighYen,11793);
assert.equal(communication.ratePctLow,2.92);
assert.equal(communication.ratePctHigh,2.94);
assert.equal(multi.savingEligible,false);
const s=relatedOfficial50manItems2024({...args,household:'single',grossBand:'400_499'});
assert.equal(s.available,true);
if(!s.available)throw new Error('SINGLE_REFERENCE_UNEXPECTED_UNAVAILABLE');
assert.equal(s.sourceRows,2);
assert.equal(s.minCellSample,80);
assert.equal(new Set(s.items.map(x=>x.category)).size,6);
assert.equal(s.items.find(x=>x.code==='21010703_通信')?.ratePctLow,2.74);
assert.equal(s.items.find(x=>x.code==='21010703_通信')?.ratePctHigh,3.07);
assert.equal(s.items.some(x=>x.category==='childEducation'),false);
const gateCases=[
 relatedOfficial50manItems2024({...args,headAgeConfirmed:false}),
 relatedOfficial50manItems2024({...args,headWorkerConfirmed:false}),
 relatedOfficial50manItems2024({...args,headAge:25}),
 relatedOfficial50manItems2024({...args,grossBand:'unknown'}),
 relatedOfficial50manItems2024({...args,grossBand:'1000plus'}),
 relatedOfficial50manItems2024({...args,household:'single',grossBand:'600plus'}),
 relatedOfficial50manItems2024({...args,household:'single',headAge:75,grossBand:'400_499'}),
 relatedOfficial50manItems2024({...args,household:'single',headAge:25,grossBand:'500_599'}),
];
for(const r of gateCases)assert.equal(r.available,false,'Missing or low-sample cells fail closed');
const ui=fs.readFileSync('ResultScreenChapter2V32.tsx','utf8');
assert.ok(ui.includes('data-peer-related-range-category={x.category}'));
assert.ok(ui.includes('本人との差額・削減額には反映しません'));
for(const path of ['benchmark-router-v4.ts','mudagiri-diagnosis-v2.ts','result-view-model-v5.ts']){
 const body=fs.readFileSync(path,'utf8');
 assert.ok(!body.includes('chapter2-official-related-2024-middle-single-v1'),
  'No model/related reference enters frozen diagnosis/saving computation');
}
console.log('CHAPTER2_OFFICIAL_2024_50MAN_CORRECTED_AND_RELATED_7_COHORT_QA_PASS');
