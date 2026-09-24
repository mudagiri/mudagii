import {resolveComparableV1,__frozenComparableAudit} from './comparable-resolver-v1';
function ok(v:boolean,m:string){if(!v)throw new Error(m)}
const a=resolveComparableV1({household:'multi',age:35,annualIncome:5_000_000});
const b=resolveComparableV1({household:'multi',age:35,annualIncome:10_000_000});
const c=resolveComparableV1({household:'multi',age:35,annualIncome:15_000_000});
const d=resolveComparableV1({household:'multi',age:35,annualIncome:30_000_000});
ok(a.food!>0,'base'); ok(b.food!>=a.food!,'income monotonic food'); ok(c.food!>=b.food!,'income monotonic high'); ok(d.food===c.food,'1500+ clamp');
ok((__frozenComparableAudit.frozenFactors.food.at(-1)??0)<=1.20,'food cap');
ok((__frozenComparableAudit.frozenFactors.fun.at(-1)??0)<=1.45,'fun cap');
const s1=resolveComparableV1({household:'single',age:30,annualIncome:5_000_000});
const s2=resolveComparableV1({household:'single',age:30,annualIncome:20_000_000});
ok(s1.food===s2.food,'single no unsafe income extrapolation');
ok(a.rent===null&&a.insurance===null,'null categories');
console.log('Comparable Resolver V1 frozen-table tests: PASS (8 assertions)');
