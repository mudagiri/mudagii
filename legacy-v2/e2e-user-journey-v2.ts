import {buildResultPayloadV2, TypeCode} from './result-payload-v2';
import {scoreTypeAnswers, AnswerValue} from './type-questionnaire-v2';
import {selectBattleEncounters} from './battle-encounter-v2';
import {FULL_LINE_REPORT} from './line-report-full-v2';
import type {Category, Satisfaction} from './mudagiri-diagnosis-v2';

const ALL:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
const refs:Record<Category,number|null>={mobile:5600,energy:13300,sub:null,car:14100,food:51200,daily:2620,fun:5520,beautyFashion:9840,rent:null,insurance:null,childEducation:null,selfDevelopment:null};
type Spec={name:string,income:number,saving:number,emergency:number,expenses:Partial<Record<Category,number>>,sat?:Partial<Record<Category,Satisfaction>>,unusedSub?:number,answers?:Record<string,AnswerValue>};
function make(s:Spec){
 const ex=Object.fromEntries(ALL.map(c=>[c,s.expenses[c]??0])) as Record<Category,number>;
 const categories=ALL.map(category=>({category,actual:ex[category],comparable:refs[category],satisfaction:s.sat?.[category],unusedAmount:category==='sub'?s.unusedSub:undefined}));
 const spent=Object.values(ex).reduce((a,b)=>a+b,0);
 const ans=s.answers??{Q1:-2,Q2:-1,Q3:-1,Q4:-2,Q5:-1,Q6:-1,Q7:-1,Q8:1};
 const t=scoreTypeAnswers(ans);
 const type={code:t.code as TypeCode,name:'',description:'',axes:t.axes};
 const payload=buildResultPayloadV2({monthlyTakeHomeIncome:s.income,monthlySavingInvestment:s.saving,freeCashFlow:s.income-spent-s.saving,emergencyMonths:s.emergency,categories,type,globalSatisfaction:3});
 const encounters=selectBattleEncounters(payload,ex,refs,3);
 return {payload,encounters,ex};
}
function ok(v:any,msg:string){if(!v) throw new Error(msg)}
const cases:Spec[]=[
 {name:'high-income-high-spend-high-satisfaction',income:1200000,saving:300000,emergency:12,expenses:{mobile:5000,energy:18000,sub:5000,car:70000,food:180000,daily:12000,fun:150000,beautyFashion:100000,rent:250000,insurance:40000,selfDevelopment:30000},sat:{food:'verySatisfied',fun:'verySatisfied',beautyFashion:'verySatisfied'},unusedSub:0},
 {name:'high-income-zero-saving',income:1000000,saving:0,emergency:2,expenses:{mobile:6000,energy:15000,sub:5000,car:40000,food:150000,daily:10000,fun:100000,beautyFashion:70000,rent:250000,insurance:30000},sat:{food:'verySatisfied',fun:'verySatisfied',beautyFashion:'verySatisfied'}},
 {name:'fixed-cost-waste',income:600000,saving:100000,emergency:6,expenses:{mobile:18000,energy:30000,sub:14000,car:20000,food:60000,daily:5000,fun:30000,beautyFashion:15000,rent:120000},sat:{food:'satisfied',fun:'satisfied',beautyFashion:'satisfied'},unusedSub:10000},
 {name:'low-spend-high-saving',income:500000,saving:150000,emergency:12,expenses:{mobile:3500,energy:9000,sub:1000,food:40000,daily:2000,fun:5000,beautyFashion:5000,rent:80000},sat:{food:'verySatisfied',fun:'verySatisfied',beautyFashion:'verySatisfied'}},
 {name:'insurance-high',income:600000,saving:80000,emergency:6,expenses:{mobile:4000,energy:12000,food:60000,rent:120000,insurance:80000},sat:{food:'satisfied'}},
 {name:'education-high',income:700000,saving:80000,emergency:6,expenses:{mobile:5000,energy:16000,food:80000,rent:150000,childEducation:150000},sat:{food:'satisfied'}},
 {name:'lifestyle-high-but-loved',income:800000,saving:100000,emergency:6,expenses:{mobile:5000,energy:15000,food:200000,fun:150000,beautyFashion:100000,rent:160000},sat:{food:'verySatisfied',fun:'verySatisfied',beautyFashion:'verySatisfied'}},
 {name:'negative-fcf',income:500000,saving:80000,emergency:3,expenses:{mobile:12000,energy:25000,sub:10000,car:50000,food:120000,daily:15000,fun:80000,beautyFashion:50000,rent:180000},sat:{food:'inertia',fun:'waste',beautyFashion:'inertia'},unusedSub:5000},
 {name:'zero-emergency',income:600000,saving:120000,emergency:0,expenses:{mobile:5000,energy:13000,food:70000,rent:130000},sat:{food:'satisfied'}},
 {name:'missing-references',income:600000,saving:100000,emergency:6,expenses:{sub:9000,rent:160000,insurance:30000,selfDevelopment:50000},unusedSub:4000},
];
for(const s of cases){
 const {payload,encounters}=make(s);
 ok(payload.improvement.fiveYear===payload.improvement.monthly*60,`${s.name}: 5y invariant`);
 ok(encounters.length<=3,`${s.name}: encounter max`);
 ok(payload.needsReview.every((x:any)=>!payload.buckets.cut.some((y:any)=>y.category===x.category)),`${s.name}: review not cut`);
 ok(payload.improvement.monthly===payload.buckets.cut.reduce((a:number,b:any)=>a+b.monthlyImprovement,0),`${s.name}: cut sum mismatch`);
 ok([...payload.buckets.cut,...payload.buckets.protected,...payload.buckets.unreviewed,...payload.buckets.clear].length===12,`${s.name}: buckets != 12`);
 ok(new Set([...payload.buckets.cut,...payload.buckets.protected,...payload.buckets.unreviewed,...payload.buckets.clear].map((x:any)=>x.category)).size===12,`${s.name}: bucket overlap`);
 console.log(`PASS ${s.name} | score=${payload.battle.score} | monthly=${payload.improvement.monthly} | cut=${payload.buckets.cut.length} protected=${payload.buckets.protected.length} review=${payload.buckets.unreviewed.length} encounters=${encounters.map(x=>x.state+':'+x.category).join(',')}`);
}
const loved=make(cases.find(x=>x.name==='lifestyle-high-but-loved')!).payload;
ok(['food','fun','beautyFashion'].every(c=>loved.buckets.protected.some((x:any)=>x.category===c)), 'loved lifestyle must be protected');
const low=make(cases.find(x=>x.name==='low-spend-high-saving')!);
ok(low.payload.buckets.protected.length===0 && low.encounters.length===0,'low spend must not invent protected encounters');
const ins=make(cases.find(x=>x.name==='insurance-high')!).payload;
ok(ins.needsReview.some((x:any)=>x.category==='insurance') && !ins.buckets.cut.some((x:any)=>x.category==='insurance'),'insurance guardrail');
const edu=make(cases.find(x=>x.name==='education-high')!).payload;
ok(edu.needsReview.some((x:any)=>x.category==='childEducation') && !edu.buckets.cut.some((x:any)=>x.category==='childEducation'),'education guardrail');
const neg=make(cases.find(x=>x.name==='negative-fcf')!).payload;
ok(neg.battle.penalty>0,'negative fcf penalty');
const zero=make(cases.find(x=>x.name==='zero-emergency')!).payload;
ok(zero.battle.components.resilience===0 && zero.battle.penalty>=5,'zero emergency penalty');
ok(ALL.every(c=>FULL_LINE_REPORT[c] && FULL_LINE_REPORT[c].headline && FULL_LINE_REPORT[c].firstAction),'all 12 line reports');
console.log('PASS cross-scenario assertions');
