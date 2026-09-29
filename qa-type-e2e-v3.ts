import {TYPE_CONTENT_V31} from './type-content-v3.1';
import {TYPE_QUESTIONS_V31,scoreTypeAnswersV31,type RawAnswerV31,type TypeAnswersV31,type TypeCodeV31} from './type-questionnaire-v3.1';
import {buildResultViewModelV3} from './result-view-model-v3';

const CODES:TypeCodeV31[]=['FPA','FPU','FIA','FIU','VPA','VPU','VIA','VIU'];
const answersFor=(want:TypeCodeV31):TypeAnswersV31=>{
 const ans:TypeAnswersV31={};
 // Exhaustive search over 2^8 choice patterns at strength=2 is deterministic and tiny.
 for(let mask=0;mask<256;mask++){
  const x:TypeAnswersV31={};
  TYPE_QUESTIONS_V31.forEach((q,i)=>x[q.id]={choice:(mask>>i)&1?'b':'a',strength:2});
  if(scoreTypeAnswersV31(x).code===want)return x;
 }
 throw new Error('TYPE_UNREACHABLE:'+want);
};
for(const code of CODES){
 const ans=answersFor(code);
 const scored=scoreTypeAnswersV31(ans);
 if(scored.code!==code)throw new Error(`TYPE_CODE_FAIL:${code}:${scored.code}`);
 const c=TYPE_CONTENT_V31[code];
 if(!c?.name||!c.catchphrase||!c.strength||!c.blindSpot||!c.shareHook)throw new Error('TYPE_CONTENT_INCOMPLETE:'+code);
 const profile={prefecture:'東京都',age:34,household:'single',householdSize:1,workStyle:'会社員',housingType:'賃貸',monthlyTakeHome:350000};
 const vm=buildResultViewModelV3({diagnosisId:'qa-'+code,toneMode:'serious',profile,type:{code,name:c.name,description:c.summary,catchphrase:c.catchphrase,strengthLabel:c.strength,blindSpot:c.blindSpot,shareHook:c.shareHook,axes:scored.axes,axisStrength:scored.strength,nearMiddle:scored.nearMiddle},finalCategories:[],monthlyImprovement:0,annualIncomeBand:'500_599'});
 if(vm.type.code!==code||vm.profile?.workStyle!=='会社員'||vm.type.axisStrength?.fv!==scored.strength.fv)throw new Error('TYPE_RESULT_PROPAGATION_FAIL:'+code);
}
let near=0;
for(let mask=0;mask<256;mask++){
 const ans:TypeAnswersV31={};
 TYPE_QUESTIONS_V31.forEach((q,i)=>ans[q.id]={choice:(mask>>i)&1?'b':'a',strength:1});
 const s=scoreTypeAnswersV31(ans);
 if(s.nearMiddle.fv||s.nearMiddle.pi||s.nearMiddle.au)near++;
 for(const v of Object.values(s.strength))if(v<0||v>100)throw new Error('TYPE_STRENGTH_RANGE_FAIL');
}
if(!near)throw new Error('TYPE_NEAR_MIDDLE_UNTESTED');
console.log('Money type E2E QA PASS',{reachable:CODES.length,nearMiddlePatterns:near});
