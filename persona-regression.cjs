
const d=require('./_model_build/mudagiri-diagnosis-v2.js');
const c=require('./_model_build/comparable-resolver-v1.js');
const cats=['rent','mobile','energy','insurance','sub','car','food','daily','fun','beautyFashion','childEducation','selfDevelopment'];

function run(p){
 const comp=c.resolveComparableV1({household:p.household,age:p.age,annualIncome:p.income*12,prefecture:p.prefecture,expenses:p.expenses,educationStage:p.educationStage});
 const knownTotal=cats.reduce((s,k)=>s+(p.unknown?.[k]?0:(p.expenses[k]||0)),0);
 const input={
  monthlyTakeHomeIncome:p.income, monthlySavingInvestment:p.saving,
  freeCashFlow:p.income-knownTotal-p.saving, emergencyMonths:p.emergency,
  categories:cats.map(category=>({category,actual:p.expenses[category]||0,comparable:comp[category]??null,
    satisfaction:p.sat?.[category],unusedAmount:category==='sub'?(p.subUnused||0):undefined}))
 };
 return {comp,out:d.runDiagnosisV2(input),freeCashFlow:input.freeCashFlow};
}
const base={rent:0,mobile:0,energy:0,insurance:0,sub:0,car:0,food:0,daily:0,fun:0,beautyFashion:0,childEducation:0,selfDevelopment:0};
const personas=[
 {name:'single_low_improvement_high_sat',household:'single',age:29,income:420000,saving:90000,emergency:6,prefecture:'東京都',
  expenses:{...base,rent:105000,mobile:4200,energy:9000,sub:1200,food:50000,daily:3000,fun:18000,beautyFashion:12000},
  sat:{food:'verySatisfied',fun:'verySatisfied',beautyFashion:'verySatisfied'},subUnused:0},
 {name:'single_actionable',household:'single',age:34,income:500000,saving:70000,emergency:3,prefecture:'東京都',
  expenses:{...base,rent:120000,mobile:11000,energy:17000,sub:9000,food:70000,daily:6000,fun:35000,beautyFashion:18000},
  sat:{food:'inertia',fun:'satisfied',beautyFashion:'satisfied'},subUnused:5000},
 {name:'family_needs_review',household:'multi',age:38,income:700000,saving:100000,emergency:4,prefecture:'東京都',
  expenses:{...base,rent:180000,mobile:9000,energy:25000,insurance:45000,sub:5000,car:20000,food:110000,daily:9000,fun:30000,beautyFashion:15000,childEducation:60000,selfDevelopment:10000},
  sat:{food:'satisfied',fun:'verySatisfied',beautyFashion:'satisfied'},subUnused:1000},
 {name:'high_income_no_fake_waste',household:'multi',age:46,income:1500000,saving:400000,emergency:12,prefecture:'東京都',
  expenses:{...base,rent:300000,mobile:9000,energy:30000,insurance:80000,sub:6000,car:25000,food:145000,daily:9000,fun:80000,beautyFashion:45000,selfDevelopment:50000},
  sat:{food:'verySatisfied',fun:'verySatisfied',beautyFashion:'verySatisfied'},subUnused:0},
 {name:'unknown_stale_value',household:'single',age:31,income:450000,saving:50000,emergency:3,prefecture:'東京都',
  expenses:{...base,rent:110000,mobile:10000,energy:15000,insurance:99999,sub:4000,food:60000,daily:4000,fun:20000,beautyFashion:10000},
  unknown:{insurance:true},sat:{food:'satisfied',fun:'satisfied',beautyFashion:'satisfied'},subUnused:0}
];
let rows=[];
for(const p of personas){
 const r=run(p), o=r.out;
 rows.push({name:p.name,monthly:o.improvement.monthly,fiveYear:o.improvement.fiveYear,battle:o.battle.score,
   needs:o.needsReview.map(x=>x.category),enemies:o.enemies.map(x=>x.category),fcf:r.freeCashFlow});
 if(o.improvement.fiveYear!==o.improvement.monthly*60) throw Error('fiveYear mismatch '+p.name);
 if(o.needsReview.some(x=>x.reducible!==0)) throw Error('needs review reducible '+p.name);
}
const unknown=rows.find(x=>x.name==='unknown_stale_value');
const p=personas.find(x=>x.name==='unknown_stale_value');
const expected=p.income-cats.reduce((s,k)=>s+(p.unknown?.[k]?0:(p.expenses[k]||0)),0)-p.saving;
if(unknown.fcf!==expected) throw Error('unknown FCF mismatch');
console.log(JSON.stringify(rows,null,2));
