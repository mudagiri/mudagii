import assert from 'node:assert/strict';
import {CATS,CHAPTER3_HANDOFF_VERSION,validateHandoff,planNextAction} from '../chapter3-v2/decision-core.mjs';
import {buildResultNarrative} from '../chapter3-v2/result-narrative.mjs';

let passed=0;
const ok=(x,msg)=>{passed++;assert.ok(x,msg);};
function fixture(goal='home'){
  const rows=CATS.map(category=>({category,v5Status:'ok',known:true,aAmount:0,cUpper:0}));
  return {version:CHAPTER3_HANDOFF_VERSION,anonymousUserId:'synthetic-user',chapter1:{
    anonymousUserId:'synthetic-user',sessionId:'synthetic-session',completedAt:'2026-10-20T00:00:00.000Z',jobCode:'IDP',primaryStyle:'ENJOY'
   },chapter2:{anonymousUserId:'synthetic-user',diagnosisId:'synthetic-diagnosis',
    vmVersion:'MUDAGIRI_RESULT_VM_V5_2',goal,rows,potential:{confirmedA:0,cUpper:0}}};
}
function row(f,category,status,a=0,c=0){
 const r=f.chapter2.rows.find(x=>x.category===category);
 Object.assign(r,{v5Status:status,aAmount:a,cUpper:c});
 f.chapter2.potential.confirmedA=f.chapter2.rows.reduce((sum,x)=>sum+x.aAmount,0);
 f.chapter2.potential.cUpper=f.chapter2.rows.reduce((sum,x)=>sum+x.cUpper,0);
 return f;
}
const narrative=(f,answers)=>{
 const v=validateHandoff(f,'synthetic-user');assert.ok(v.ok,'valid fixture');
 const plan=planNextAction(v,answers);assert.ok(plan.ok,'valid plan');
 const copy=buildResultNarrative(plan,v,answers);assert.ok(copy.ok,'copy can render');
 return {copy,plan};
};
const noHousingEvidence=narrative(fixture('home'),{horizon:'near'});
ok(noHousingEvidence.copy.headline.includes('住まい'),'housing without C2 review still has domain-specific title');
ok(noHousingEvidence.copy.chapter2Evidence===null,'unknown housing status does not invent C2 evidence');
ok(noHousingEvidence.copy.limitedEvidence===true,'limited housing data is labeled exploratory');
const housing=row(fixture('home'),'rent','inspect',0,3500);
const home=narrative(housing,{horizon:'near'});
ok(home.plan.actionId==='housing_contract','C2 housing review controls choice');
ok(home.copy.headline.includes('家賃を下げるより先に'),'housing fresh insight');
ok(home.copy.chapter2Evidence?.includes('住居費'),'housing C2 evidence shown');
ok(home.copy.todayAction.includes('契約'),'housing actionable check');
const protect=narrative(row(fixture('home'),'rent','protect'),{horizon:'near'});
ok(protect.copy.headline!==home.copy.headline,'housing protect changes insight not only boilerplate');
ok(protect.copy.chapter2Evidence?.includes('守る'),'housing protect properly grounded');
const long=narrative(housing,{horizon:'far'});
ok(long.copy.headline!==home.copy.headline,'horizon changes first-view headline');
const challenge=narrative(row(fixture('challenge'),'mobile','inspect',0,1250.3),{horizon:'near'});
ok(challenge.copy.headline.includes('元手じゃない'),'C candidate never cash');
ok(challenge.copy.chapter2Evidence?.includes('未確定'),'unconfirmed evidence label');
const education=narrative(row(fixture('family'),'childEducation','protect'),{horizon:'near'});
ok(education.copy.headline.includes('教育費'),'education protect relationship');
const retirement=narrative(row(fixture('retirement'),'fun','protect'),{horizon:'far'});
ok(retirement.copy.headline.includes('老後'),'retirement protect enjoyment');
const incomeBase=fixture('undecided');
const income=[];
for(const [detail,word] of [['outsideDemand','頼まれた'],['atWork','昇給'],['learningTime','学び']]){
 const c=narrative(incomeBase,{horizon:'near',goal:'income',detail});income.push(c.copy.headline);
 ok(c.copy.headline.includes(word),'income route '+detail+' has specific insight');
 ok(c.copy.limitedEvidence===true,'income without linked evidence discloses limited basis');
}
ok(new Set(income).size===3,'income paths distinct');
const investBase=fixture('invest');
const invest=[];
for(const detail of ['plannedExpense','noPlannedExpense','unknown']){
 const c=narrative(investBase,{horizon:'near',detail});invest.push(c.copy.headline);
 ok(Boolean(c.copy.uncertainty),'investment route discloses missing finances');
 ok(c.copy.noProductSuitability===true,'no suitability label');
}
ok(new Set(invest).size===3,'near-term liquidity choices yield separate insight');
const timeBase=fixture('undecided');
const time=[];
for(const [detail,id,word] of [['work','work_time','仕事'],['home','home_time','家のこと'],['move','move_time','移動時間']]){
 const n=narrative(timeBase,{horizon:'near',goal:'time',detail});time.push(n.copy.todayAction);
 ok(n.plan.actionId===id,'time route '+detail+' uses unique action ID');
 ok(n.copy.headline.includes(word),'time route '+detail+' delivers actual distinct insight');
}
ok(new Set(time).size===3,'three time usage answers yield unique steps');
for(const [goal,horizon,match] of [['challenge','near','挑戦'],['family','near','家族'],['retirement','far','老後'],['travel','near','楽しみ'],['safety','near','保障']]){
  const n=narrative(fixture(goal),{horizon});
  ok(n.copy.headline.includes(match),'goal-specific fallback for '+goal);
  ok(n.copy.chapter2Evidence===null,'unconfirmed C2 never faked for '+goal);
}
const unknown=narrative(fixture('undecided'),{horizon:'unknown'});
ok(unknown.copy.limitedEvidence===true,'unknown goal is honest about limited evidence');
ok(!unknown.copy.chapter2Evidence,'unknown goal does not fake chapter2 evidence');
const v=validateHandoff(fixture(),'synthetic-user');
const faked={ok:true,actionId:'housing_contract',firstStep:'mock',goal:'home',reasonTags:[],evidenceStrength:'limited',consultTopic:'test'};
const invalid=buildResultNarrative(faked,v,{horizon:'near'});
ok(!invalid.ok&&invalid.error==='MISSING_REQUIRED_CHAPTER2_EVIDENCE','faked C2 claim rejected');
ok(!JSON.stringify(home.copy).includes('3500'),'C2 C numeric amount not copied to result');
console.log('CHAPTER3_V2_NARRATIVE_QA_PASS',JSON.stringify({passed,failed:0,fixture:'synthetic'}));
