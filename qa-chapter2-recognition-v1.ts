import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {chapter2RecognitionV1} from './chapter2-recognition-v1';
import {CATEGORY_IDS} from './scripts/chapter12-answercheck-experiment-v1.mjs';
import ResultScreenChapter2V32 from './ResultScreenChapter2V32';

type Row={
 category:string;label:string;known:boolean;applicability:string;
 amount:number;v5Status:string;cUpper:number;aAmount:number;
 appraisal:Record<string,unknown>;
};
const make=():Row[]=>CATEGORY_IDS.map(category=>({
 category,label:category,known:true,applicability:'applicable',
 amount:18000,v5Status:'inspect',cUpper:0,aAmount:0,appraisal:{}
}));
const patch=(data:Row[],category:string,p:Partial<Row>)=>{
 const r=data.find(x=>x.category===category);
 assert.ok(r,'unknown category '+category);
 Object.assign(r,p);
};
assert.equal(chapter2RecognitionV1(make()),null,'never infer personality from amount alone');
assert.equal(chapter2RecognitionV1(make().slice(1)),null,'no invented story for partial diagnosis');
assert.equal(chapter2RecognitionV1([...make().slice(0,11),make()[0]]),null,'duplicate category invalidates story');
{
 const d=make();
 patch(d,'fun',{v5Status:'protect',appraisal:{satisfaction:'verySatisfied'}});
 const result=chapter2RecognitionV1(d)!;
 assert.equal(result.kind,'protected_only');
 assert.equal(result.protectCategory,'fun');
 assert.match(result.line,/娯楽・趣味/);
 assert.doesNotMatch(result.line,/あなたは浪費家|未来型|直感型|節約済み|¥/);
 assert.equal(result.shareAllowed,false,'self-reported findings must not go into share card');
 patch(d,'fun',{known:false});
 assert.equal(chapter2RecognitionV1(d),null,'unknown spending cannot claim a preference-based story');
 patch(d,'fun',{known:true,applicability:'na'});
 assert.equal(chapter2RecognitionV1(d),null,'N/A is not a scored insight');
 patch(d,'fun',{applicability:'applicable',amount:0});
 assert.equal(chapter2RecognitionV1(d),null,'zero amount is not a protected monthly spend');
}
{
 const d=make();
 patch(d,'selfDevelopment',{amount:12000,v5Status:'protect',appraisal:{selfDevelopmentValue:'purpose'}});
 patch(d,'mobile',{amount:9000,v5Status:'optimize',cUpper:3000});
 const result=chapter2RecognitionV1(d)!;
 assert.equal(result.kind,'protected_and_candidate');
 assert.equal(result.protectCategory,'selfDevelopment');
 assert.equal(result.reviewCategory,'mobile');
 assert.match(result.line,/自己投資/);
 assert.match(result.line,/通信費/);
 assert.match(result.line,/まだ節約できた金額じゃない/);
 patch(d,'selfDevelopment',{appraisal:{selfDevelopmentValue:'unclear'}});
 assert.equal(chapter2RecognitionV1(d),null,'status protect alone cannot invent personal values');
}
{
 const d=make();
 patch(d,'rent',{amount:100000,v5Status:'protect',appraisal:{rentPreference:'protect'}});
 patch(d,'sub',{amount:5500,v5Status:'cut',aAmount:2000,
  appraisal:{subUnusedAmount:2000,subCancellationConfirmed:true}});
 const result=chapter2RecognitionV1(d)!;
 assert.equal(result.kind,'protected_and_confirmed_contract');
 assert.deepEqual(result.evidenceCodes,['SELF_REPORTED_VALUE','PROTECTED_V5','UNUSED_CANCELLABLE_SELF_REPORT']);
 assert.match(result.line,/住まい/);
 assert.match(result.line,/未使用・解約可能と答えた契約/);
 assert.doesNotMatch(result.line,/解約済み|既に減った|貯蓄済み|¥/);
 patch(d,'sub',{appraisal:{subUnusedAmount:2000,subCancellationConfirmed:false}});
 assert.equal(chapter2RecognitionV1(d)?.kind,'protected_only','not confirmed means no confirmed saving story');
 patch(d,'rent',{appraisal:{rentPreference:'burdenHigh'},v5Status:'inspect'});
 assert.equal(chapter2RecognitionV1(d),null,'no preference and no valid unused contract means no personal recognition');
}
{
 const d=make();
 patch(d,'sub',{amount:6000,v5Status:'cut',aAmount:1200,
  appraisal:{subUnusedAmount:1200,subCancellationConfirmed:true}});
 const result=chapter2RecognitionV1(d)!;
 assert.equal(result.kind,'confirmed_unused_contract');
 assert.equal(result.protectCategory,undefined);
 assert.match(result.line,/まだ節約済みではない/);
 patch(d,'sub',{aAmount:2400});
 assert.equal(chapter2RecognitionV1(d),null,'confirmed opportunity above declared unused amount is invalid');
}
{
 const d=make();
 patch(d,'food',{amount:70000,v5Status:'protect',appraisal:{satisfaction:'satisfied'}});
 patch(d,'daily',{amount:20000,v5Status:'inspect',cUpper:4500});
 const result=chapter2RecognitionV1(d)!;
 const vm={version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'synthetic-recognition',
  v5Counts:{cut:0,optimize:0,protect:1,inspect:11,ok:0,na:0},
  rows:d,potential:{confirmedA:0,cUpper:4500},
  firstQuest:null,consultRoute:null};
 const html=renderToStaticMarkup(React.createElement(ResultScreenChapter2V32,{vm}));
 assert.match(html,/「食費」は満足して守りたいと答えた/);
 assert.match(html,/「日用品」の内訳から確かめよう/);
 assert.match(html,/data-observation-kind="protected_and_candidate"/);
 assert.ok(!html.includes('今までのあなたは衝動買い'),'copy does not invent personality or purchases');
 assert.equal(result.shareAllowed,false);
}
console.log('CHAPTER2_RECOGNITION_QA_PASS: explicit protect/candidate/contract/unknown/NA/invalid and SSR narrative');
