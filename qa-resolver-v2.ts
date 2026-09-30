import {resolveComparableV2,educationBenchmarkV2,__resolverV2Audit} from './comparable-resolver-v2';

const eq=(a:unknown,b:unknown,m:string)=>{if(a!==b)throw new Error(m+': '+String(a)+' !== '+String(b))};
const ok=(x:unknown,m:string)=>{if(!x)throw new Error(m)};

// Canonical single-person official values.
let r=resolveComparableV2({household:'single',age:30,prefecture:'東京都',month:2,housingType:'賃貸'});
eq(r.energy?.value,8291,'single energy <=34');
eq(r.food?.value,41992,'single food <=34');
eq(r.daily?.value,3409,'single daily <=34');
eq(r.fun?.value,24242,'single entertainment <=34');
eq(r.beautyFashion?.value,11747,'single beauty fallback');

// Multi uses household-size official base; utility additionally uses official region/month model.
r=resolveComparableV2({household:'multi',householdSize:4,age:40,prefecture:'東京都',month:2,housingType:'賃貸'});
eq(r.food?.value,103384,'4-person food');
eq(r.daily?.value,7469,'4-person daily');
eq(r.fun?.value,11067,'4-person entertainment core');
eq(r.energy?.confidence,'MODEL','multi utility model flag');
eq(r.energy?.value,Math.round(25942*0.9689537157757496*1.2985757210518276),'multi utility model');

// Housing distribution is private-rent only.
eq(r.rent?.value,99065,'Tokyo private rent actual-payment reference');
eq(r.rent?.meta?.p75Band,'110,000～120,000円未満','Tokyo rent P75 band');
r=resolveComparableV2({household:'multi',householdSize:4,age:40,prefecture:'東京都',month:2,housingType:'持ち家（ローンあり）'});
eq(r.rent?.value,null,'owned housing must not use private-rent benchmark');

// Education stacks each child; benchmark gap is never interpreted here as saving.
eq(educationBenchmarkV2([{stage:'publicElementary'},{stage:'privateJuniorHigh'}]),160580,'education child stack');

// Audit-only categories remain null.
eq(r.mobile?.value,null,'communication uses direct bands, not fake mean');
eq(r.insurance?.value,null,'insurance audit only');
eq(r.sub?.value,null,'subscription audit only');
eq(r.car?.value,null,'car structural audit only');
eq(r.selfDevelopment?.value,null,'self-development audit only');

eq(Object.keys(__resolverV2Audit.H).length,47,'housing must contain 47 prefectures');
ok(__resolverV2Audit.MONTH.length===12,'utility must contain 12 month indices');

// Income correction: only multi-person ¥5m+; single remains unchanged.
const baseMulti=resolveComparableV2({household:'multi',householdSize:4,age:40,annualIncome:0,prefecture:'東京都',month:2,housingType:'賃貸'});
const incMulti=resolveComparableV2({household:'multi',householdSize:4,age:40,annualIncome:8_000_000,prefecture:'東京都',month:2,housingType:'賃貸'});
ok(incMulti.food?.value!==baseMulti.food?.value,'multi 8m income must affect food comparable');
ok(incMulti.daily?.value!==baseMulti.daily?.value,'multi 8m income must affect daily comparable');
const baseSingle=resolveComparableV2({household:'single',age:30,annualIncome:0,prefecture:'東京都',month:2,housingType:'賃貸'});
const incSingle=resolveComparableV2({household:'single',age:30,annualIncome:8_000_000,prefecture:'東京都',month:2,housingType:'賃貸'});
eq(incSingle.food?.value,baseSingle.food?.value,'single income correction must stay disabled');

// Boundary regression: exact ages must switch only at 35 and 60.
const age34=resolveComparableV2({household:'single',age:34,prefecture:'東京都',month:2,housingType:'賃貸'});
const age35=resolveComparableV2({household:'single',age:35,prefecture:'東京都',month:2,housingType:'賃貸'});
const age59=resolveComparableV2({household:'single',age:59,prefecture:'東京都',month:2,housingType:'賃貸'});
const age60=resolveComparableV2({household:'single',age:60,prefecture:'東京都',month:2,housingType:'賃貸'});
eq(age34.food?.value,41992,'age 34 must stay <=34 bucket');
ok(age35.food?.value!==age34.food?.value,'age 35 must enter 35-59 bucket');
eq(age59.food?.value,age35.food?.value,'age 59 must stay 35-59 bucket');
ok(age60.food?.value!==age59.food?.value,'age 60 must enter 60+ bucket');

// Income boundary: under ¥5m must remain neutral; ¥5m+ may apply only to intended multi categories.
const inc499=resolveComparableV2({household:'multi',householdSize:4,age:40,annualIncome:4_999_999,prefecture:'東京都',month:2,housingType:'賃貸'});
const inc500=resolveComparableV2({household:'multi',householdSize:4,age:40,annualIncome:5_000_000,prefecture:'東京都',month:2,housingType:'賃貸'});
for(const c of ['energy','food','daily','fun'] as const)eq(inc499[c]?.value,baseMulti[c]?.value,'under 5m must stay neutral: '+c);
for(const c of ['rent','mobile','insurance','sub','car','selfDevelopment'] as const)eq(inc500[c]?.value,baseMulti[c]?.value,'income must not affect '+c);

// Region/month isolation: only utility should move among core household-size comparables.
const tokyoFeb=resolveComparableV2({household:'multi',householdSize:4,age:40,prefecture:'東京都',month:2,housingType:'賃貸'});
const osakaAug=resolveComparableV2({household:'multi',householdSize:4,age:40,prefecture:'大阪府',month:8,housingType:'賃貸'});
ok(tokyoFeb.energy?.value!==osakaAug.energy?.value,'region/month must affect energy');
for(const c of ['food','daily','fun'] as const)eq(tokyoFeb[c]?.value,osakaAug[c]?.value,'region/month must not affect '+c);

// Same inputs must be deterministic.
const detArgs={household:'multi' as const,householdSize:3,age:41,annualIncome:7_000_000,prefecture:'神奈川県',month:11,housingType:'賃貸'};
eq(JSON.stringify(resolveComparableV2(detArgs)),JSON.stringify(resolveComparableV2(detArgs)),'resolver must be deterministic');

console.log('RESOLVER_V2_QA_PASS');
