import fs from 'node:fs';
const src=fs.readFileSync('./RpgBlock1.tsx','utf8');
const checks=[
 ['mobile scope question retained',src.includes("qs.push({category:'mobile',kind:'mobileScope'")],
 ['mobile carrier only after mobile-only scope',src.includes("appraisalAnswers.mobile?.mobileScope==='mobileOnly'")&&src.includes("kind:'mobileCarrier'")],
 ['followup guard exists',src.includes('const spawnsFollowup =')&&src.includes('&& !spawnsFollowup')],
 ['mobile scope can spawn carrier',src.includes("currentItem.kind==='mobileScope'&&answer.mobileScope==='mobileOnly'")],
 ['subscription usage can spawn unused amount',src.includes("currentItem.kind==='subUsage'&&(answer.subUsage==='one'||answer.subUsage==='several')")],
 ['unused amount can spawn cancellation check',src.includes("currentItem.kind==='subUnusedAmount'&&typeof answer.subUnusedAmount==='number'&&answer.subUnusedAmount>0")],
 ['insurance overview can spawn review timing',src.includes("currentItem.kind==='insuranceOverview'&&(answer.insurancePurpose==='mostly'||answer.insurancePurpose==='unclear')")],
 ['beauty sex can spawn satisfaction',src.includes("currentItem.kind==='beautySex'")&&src.includes('beautySexAlreadyAsked')],
];
for(const [name,ok] of checks){if(!ok)throw new Error('APPRAISAL_FLOW_V4_QA_FAIL:'+name);console.log('PASS',name)}
console.log('APPRAISAL_FLOW_V4_QA_PASS',checks.length);
