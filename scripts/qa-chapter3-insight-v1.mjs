import {evaluateChapter3} from './chapter3-insight-engine-v1.mjs';
const goals=["home","family","travel","invest","challenge","safety","retirement","undecided"];
let tests=0; const errors=[];
function check(ok,label){tests++;if(!ok)errors.push(label)}
for(const goal of goals){
  const common={anonymousUserId:'u',chapter1:{anonymousUserId:'u',sessionId:'s',jobCode:'INM',primaryStyle:'ENJOY'},chapter2:{anonymousUserId:'u',diagnosisId:'d',selectedGoal:goal,confirmedA:0,cUpper:12000,protectedCategories:['food']}};
  const inputs=[{}, {desiredFuture:'希望',when:'5年後',costKnown:false},{desiredFuture:'希望',when:'5年後',planReviewed:'yes'},{desiredFuture:'希望',when:'5年後',preserve:'今の暮らし',costKnown:true,preparationKnown:true}];
  const kinds=goal==='undecided'?['GOAL_OPEN','GOAL_OPEN','GOAL_OPEN','GOAL_OPEN']:['DETAIL_MISSING','COST_UNKNOWN','PREPARED_SELF_REPORT','VALUE_BRIDGE'];
  inputs.forEach((chapter3,i)=>{const r=evaluateChapter3({...common,chapter3:{goal,...chapter3}});check(r.kind===kinds[i],goal+' status '+i);check(r.adventurer?.jobCode==='INM',goal+' job '+i);check(r.financial?.confirmedA===0&&r.financial.cUpper===12000&&r.financial.neverAdd,goal+' money '+i);check(r.math===null,goal+' no automatic math '+i);check(r.optionalConsultation.required===false,goal+' no forced consult '+i)});
}
let r=evaluateChapter3({anonymousUserId:'u',chapter1:{anonymousUserId:'x',sessionId:'s',jobCode:'INM',primaryStyle:'ENJOY'},chapter2:{anonymousUserId:'x',diagnosisId:'d',selectedGoal:'home',cUpper:9000},chapter3:{}});check(r.kind==='NEED_GOAL'&&r.adventurer===null&&r.financial===null&&r.audit.identityMismatchDropped,'identity');
r=evaluateChapter3({anonymousUserId:'u',chapter3:{goal:'travel',optionalMath:{requested:true,targetYen:400000,earmarkedYen:40000,monthsUntil:12}}});check(r.math.monthlyYen===30000&&r.math.isAffordabilityAssessment===false,'math');
for(const months of [0,12.1,-1,1201]){r=evaluateChapter3({anonymousUserId:'u',chapter3:{goal:'travel',optionalMath:{requested:true,targetYen:400000,earmarkedYen:0,monthsUntil:months}}});check(r.math.status==='need_conditions','invalid months '+months)}
r=evaluateChapter3({anonymousUserId:'u',chapter3:{goal:'travel',when:'来年',explicitQuestion:'いくら必要？'}});check(r.kind==='SELF_DEFINED_QUESTION','question');
r=evaluateChapter3({anonymousUserId:'u',chapter1:{anonymousUserId:'u',sessionId:'s',jobCode:'INVALID',primaryStyle:'ENJOY'},chapter3:{goal:'invest'}});check(r.adventurer===null,'invalid job');
r=evaluateChapter3({anonymousUserId:'u',chapter2:{anonymousUserId:'u',diagnosisId:'d',selectedGoal:'home',confirmedA:5000,cUpper:10000},chapter3:{goal:'retirement'}});check(r.goal==='retirement'&&r.financial.confirmedA===5000&&r.financial.cUpper===10000,'override and separate values');
r=evaluateChapter3({anonymousUserId:'u',chapter3:{goal:'home',optionalMath:{requested:true,targetYen:250000,earmarkedYen:300000,monthsUntil:12}}});check(r.math.monthlyYen===0,'already earmarked');
if(errors.length){console.error(JSON.stringify({status:'FAIL',tests,errors},null,2));process.exitCode=1}else console.log(JSON.stringify({status:'PASS',tests,scenarios:32,note:'isolated prototype only; no real-user validation'}));
