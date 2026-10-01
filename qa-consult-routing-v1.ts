import {strict as A} from 'node:assert';
import fs from 'node:fs';
import {buildConsultRouteV1} from './consult-route-v1';
import type {ProfileV4} from './mudagiri-profile-v4';
import type {FinalCategoryV4} from './final-judgement-v4';

const baseProfile:ProfileV4={
 diagnosisScope:'personal',householdSize:1,adultCount:1,childCount:0,relationships:[],
 expenseSharing:null,householdContributionMode:null,bundledContributionAmount:null,
 prefecture:'東京都',age:35,housingTenure:'rental',housingSubtype:'private_rental',
 monthlyTakeHome:350000,annualIncomeBand:'unknown'
};
const row=(over:Partial<FinalCategoryV4>):FinalCategoryV4=>({
 category:'insurance',
 record:{category:'insurance',applicability:'applicable',known:true,diagnosisAmount:15000,personalBurden:15000,householdTotal:15000,metadata:{}},
 comparison:{category:'insurance',amount:15000,amountScope:'personal',benchmark:null,difference:null,quality:'none',sourceVersion:null,benchmarkMeta:null,engineComparableAllowed:false},
 engine:null,status:'review',confirmedSaving:0,screeningDelta:null,attentionFlag:true,
 reasonCode:'INSURANCE_CONTENT_REVIEW_REQUIRED',
 appraisal:{insurancePurpose:'unclear',insuranceLastReview:'never'},
 ...over
});

{
 const route=buildConsultRouteV1({profile:baseProfile,finalCategories:[row({})]});
 A.equal(route.primary,'insurance');
 A.equal(route.insuranceReview,true);
 A.equal(route.homeStructureRequired,false);
}
{
 const route=buildConsultRouteV1({profile:baseProfile,finalCategories:[row({status:'protect',attentionFlag:false,reasonCode:'INSURANCE_PURPOSE_UNDERSTOOD',appraisal:{insurancePurpose:'clear',insuranceLastReview:'within1y'}})]});
 A.equal(route.primary,'lifeplan');
 A.equal(route.insuranceReview,false);
}
{
 const owner={...baseProfile,housingTenure:'owned' as const,housingSubtype:'mortgage' as const};
 const route=buildConsultRouteV1({profile:owner,finalCategories:[row({status:'protect',attentionFlag:false,reasonCode:'INSURANCE_PURPOSE_UNDERSTOOD'})]});
 A.equal(route.primary,'lifeplan');
 A.equal(route.homeowner,true);
 A.equal(route.homeStructureRequired,true);
}
{
 const childProfile={...baseProfile,householdSize:3,adultCount:2,childCount:1,relationships:['children'] as any};
 const route=buildConsultRouteV1({profile:childProfile,finalCategories:[row({status:'protect',attentionFlag:false,reasonCode:'INSURANCE_PURPOSE_UNDERSTOOD'})]});
 A.equal(route.primary,'lifeplan');
 A.ok(route.lifeplanSignals.includes('children'));
}

const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const gas=fs.readFileSync('./MUDAGIRI_GAS_CODE_V2.gs','utf8');
const next=result.indexOf('className="rv3-next"');
const consult=result.indexOf('className="rv3-consult-route"');
const earlyLine=result.indexOf('className="rv3-line-early"');
const book=result.indexOf('className="rv3-section rv3-book-shell"');
const viral=result.indexOf('className="rv3-viral-loop"');

const checks=[
 ['consult route is after next quest and before LINE',next>=0&&consult>next&&earlyLine>consult],
 ['friend quest is after core CV and book',viral>book&&book>earlyLine],
 ['owner qualifier exists',result.includes('持ち家の方だけ、もう1つ')&&result.includes('🏠 戸建て')&&result.includes('🏢 マンション等')],
 ['detached activates solar route',result.includes("homeStructure==='detached'")&&result.includes('太陽光・蓄電池も「入れる前提なし」で適性確認')],
 ['solar copy avoids guaranteed savings',result.includes('向き不向きが変わるため、設置ありきではなく')],
 ['consult CTA has dedicated placement',result.includes("lineHandoff('consult_route')")],
 ['lead stores consult route',app.includes("consultPrimary:ctx?.consultPrimary")&&app.includes("solarEligible:ctx?.solarEligible")),
 ['GAS stores consult routing columns',gas.includes("'consult_primary','insurance_review','home_structure','solar_eligible','consult_route_json'")],
 ['consult analytics contain no raw financial values',(()=>{
  const lines=result.split('\n').filter(x=>x.includes('consult_route_clicked')||x.includes('consult_home_structure_selected'));
  return lines.length>=2&&lines.every(x=>!/(income|amount|expense|saving|takeHome|benchmark)/i.test(x));
 })()],
];
for(const [name,ok] of checks){if(!ok)throw new Error('CONSULT_ROUTING_V1_QA_FAIL:'+name);console.log('PASS',name)}
console.log('CONSULT_ROUTING_V1_QA_PASS',checks.length);
