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
console.log('RESOLVER_V2_QA_PASS');
