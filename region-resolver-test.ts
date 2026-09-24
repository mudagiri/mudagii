import {resolveComparableV1,PREFECTURE_REGION} from './comparable-resolver-v1';
let pass=0; function ok(v:boolean,m:string){if(!v)throw new Error(m);pass++}
const base=resolveComparableV1({household:'multi',age:35,annualIncome:6_000_000});
const tokyo=resolveComparableV1({household:'multi',age:35,annualIncome:6_000_000,prefecture:'東京都'});
const hokkaido=resolveComparableV1({household:'multi',age:35,annualIncome:6_000_000,prefecture:'北海道'});
const okinawa=resolveComparableV1({household:'multi',age:35,annualIncome:6_000_000,prefecture:'沖縄県'});
const singleBase=resolveComparableV1({household:'single',age:35,annualIncome:6_000_000});
const singleHokkaido=resolveComparableV1({household:'single',age:35,annualIncome:6_000_000,prefecture:'北海道'});
ok(Object.keys(PREFECTURE_REGION).length===47,'47 prefectures');
ok(hokkaido.energy!>base.energy!,'Hokkaido energy higher');
ok(okinawa.energy!<base.energy!,'Okinawa energy lower');
ok(tokyo.food!>base.food!,'Tokyo weak food adjustment higher');
ok(hokkaido.food!<base.food!,'Hokkaido weak food adjustment lower');
ok(singleBase.energy===singleHokkaido.energy,'single must not reuse multi region factor');
ok(tokyo.mobile===base.mobile,'mobile no region adjustment');
ok(tokyo.daily===base.daily,'daily no region adjustment');
console.log(`REGION TEST PASS ${pass}/8`,{base,tokyo,hokkaido,okinawa});
