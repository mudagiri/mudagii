import {coverageAwarenessFor} from './coverage-awareness-v1.mjs';
let n=0;const fails=[];
function ok(condition,name){n++;if(!condition)fails.push(name)}
const row=(purpose,review,amount=11000,extra={})=>({category:'insurance',known:true,applicability:'applicable',amount,appraisal:{insurancePurpose:purpose,insuranceLastReview:review},...extra});
const inspect=(x)=>coverageAwarenessFor([{category:'mobile'},x]);
ok(inspect(row('clear',undefined))?.show===false,'fully informed exempt even without recent review (questionnaire skips recency)');
ok(inspect(row('clear','over3y'))?.show===false,'fully aware exempt independent of review age');
ok(inspect(row('mostly','within1y'))?.show===false,'recent review exempt even if mostly aware');
ok(inspect(row('unclear','within1y'))?.show===false,'recent review excluded by explicit policy');
ok(inspect(row('unclear','over3y'))?.show===true,'unclear and old review flagged');
ok(inspect(row('unclear','never'))?.reason==='UNCLEAR_PURPOSE','unknown purpose prioritized');
ok(inspect(row('unclear','unknown'))?.next.includes('保険証券'),'unknown content directs to document');
ok(inspect(row('mostly','1to3y'))?.reason==='PARTIAL_KNOWLEDGE','partially aware nudged');
ok(inspect(row('mostly','unknown'))?.show===true,'no recent review proof nudged');
ok(inspect(row('mostly','never'))?.show===true,'never reviewed nudged');
ok(inspect(row(undefined,'over3y'))?.reason==='REVIEW_OLD_OR_NEVER','old review prompts verification');
ok(inspect(row(undefined,'never'))?.reason==='REVIEW_OLD_OR_NEVER','never reviewed prompts verification');
ok(inspect(row(undefined,'unknown'))?.reason==='CURRENT_STATUS_UNKNOWN','unknown status politely prompts');
ok(inspect(row(undefined,undefined))?.show===true,'unanswered insured respondent not silently exempt');
ok(inspect(row(undefined,undefined,0))?.reason==='NO_PREMIUM_RECORDED','zero premium gets neutral coverage check');
ok(inspect(row('unclear','never',0))?.reason==='NO_PREMIUM_RECORDED','zero premium does not invent an insurance contract');
ok(inspect(row(undefined,undefined,null,{known:false}))?.show===true,'unknown monthly amount prompts nonfinancial check');
ok(inspect(row(undefined,undefined,null,{known:false,applicability:'na'}))?.reason==='CATEGORY_NOT_APPLICABLE','NA does not imply product need');
ok(inspect(row('clear',undefined,0))?.show===false,'explicit coverage understanding exemption even when zero premium');
ok(inspect(row('mostly','within1y',0))?.show===false,'recent review exemption applies to zero premium');
ok(coverageAwarenessFor(null)===null,'missing rows never fabricates');
ok(coverageAwarenessFor([])===null,'missing insurance row never fabricates');
ok(coverageAwarenessFor([row('unclear','never'),row('unclear','never')])===null,'duplicate insurance rows rejected');
for(const kind of ['DRIVE','ENJOY','SECURE','OPTIMIZE']){
 const result=inspect({...row('unclear','never'),jobStyle:kind});
 ok(result?.show===true,'awareness independent of money STYLE '+kind);
 ok(result?.personalityMatch===null&&result?.moneyImpact===null,'no fake personality match or savings '+kind);
 ok(result?.productRecommendation===null&&result?.requiresConsultation===false,'no product push or forced consultation '+kind);
 ok(result?.shareAllowed===false,'no private coverage info in share '+kind);
}
const all=[row('unclear','never'),row(undefined,'unknown',0),row('mostly','1to3y')];
for(const data of all){
 const r=inspect(data);
 ok(!JSON.stringify(r).includes('節約できる金額'),'not a saving statement');
 ok(!JSON.stringify(r).includes('保障が不足'),'no invented inadequacy');
}
if(fails.length){console.error(JSON.stringify({status:'FAIL',checks:n,fails},null,2));process.exitCode=1}
else console.log(JSON.stringify({status:'PASS',checks:n,scope:'coverage awareness only; frozen savings and underwriting unchanged'}));
